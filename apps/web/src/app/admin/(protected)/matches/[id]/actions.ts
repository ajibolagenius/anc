"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-guard";
import { logAdminAction } from "@/lib/admin-audit-log";
import { computePredictionPoints } from "@anc/shared";

export async function enterResult(formData: FormData) {
  const admin = await requireAdmin();

  const matchId = String(formData.get("matchId"));
  const actualHomeScore = Number(formData.get("actualHomeScore"));
  const actualAwayScore = Number(formData.get("actualAwayScore"));
  const actualFirstScorer = String(formData.get("actualFirstScorer") ?? "").trim() || null;

  if (!Number.isInteger(actualHomeScore) || !Number.isInteger(actualAwayScore)) {
    throw new Error("Enter valid scores for both teams");
  }

  const supabase = createServiceRoleClient();

  const { error: matchError } = await supabase
    .from("matches")
    .update({
      actual_home_score: actualHomeScore,
      actual_away_score: actualAwayScore,
      actual_first_scorer: actualFirstScorer,
      status: "completed",
    })
    .eq("id", matchId);
  if (matchError) throw new Error(matchError.message);

  const { data: predictions, error: predictionsError } = await supabase
    .from("predictions")
    .select("id, predicted_home_score, predicted_away_score, predicted_first_scorer")
    .eq("match_id", matchId);
  if (predictionsError) throw new Error(predictionsError.message);

  for (const prediction of predictions ?? []) {
    const points = computePredictionPoints({
      predictedHomeScore: prediction.predicted_home_score,
      predictedAwayScore: prediction.predicted_away_score,
      predictedFirstScorer: prediction.predicted_first_scorer,
      actualHomeScore,
      actualAwayScore,
      actualFirstScorer,
    });

    await supabase.from("predictions").update({ points_awarded: points }).eq("id", prediction.id);
  }

  await logAdminAction({
    adminId: admin.userId,
    action: "match_result_entered",
    entityType: "match",
    entityId: matchId,
    metadata: { actualHomeScore, actualAwayScore, actualFirstScorer, predictionsScored: predictions?.length ?? 0 },
  });
  revalidatePath(`/admin/matches/${matchId}`);
  revalidatePath("/admin/matches");
  revalidatePath("/portal/predictions");
  revalidatePath("/portal/leaderboard");
}
