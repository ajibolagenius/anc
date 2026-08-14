"use server";

import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/server-session";

/** RLS-scoped session client, not service-role — this only succeeds because of the predictions_insert_own policy. */
export async function submitPrediction(formData: FormData) {
  const matchId = String(formData.get("matchId"));
  const predictedHomeScore = Number(formData.get("predictedHomeScore"));
  const predictedAwayScore = Number(formData.get("predictedAwayScore"));
  const predictedFirstScorer = String(formData.get("predictedFirstScorer") ?? "").trim() || null;

  if (!Number.isInteger(predictedHomeScore) || !Number.isInteger(predictedAwayScore)) {
    throw new Error("Enter a valid score prediction");
  }

  const supabase = await createSessionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not signed in");

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("kickoff_at")
    .eq("id", matchId)
    .single();
  if (matchError || !match) throw new Error("Match not found");
  if (new Date(match.kickoff_at) <= new Date()) {
    throw new Error("Predictions are closed for this match");
  }

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id")
    .eq("auth_user_id", userData.user.id)
    .single();
  if (memberError || !member) throw new Error("No matching member record");

  const { error } = await supabase.from("predictions").insert({
    match_id: matchId,
    member_id: member.id,
    predicted_home_score: predictedHomeScore,
    predicted_away_score: predictedAwayScore,
    predicted_first_scorer: predictedFirstScorer,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/portal/predictions");
}
