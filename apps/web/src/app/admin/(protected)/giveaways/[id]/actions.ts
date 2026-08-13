"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-guard";

/** Unbiased Fisher-Yates shuffle using crypto.randomInt — never Math.random() or `ORDER BY random()` for a draw that needs to be defensible. */
function secureShuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

async function getEligibleMemberIds(
  supabase: ReturnType<typeof createServiceRoleClient>,
  giveawayId: string,
  eligibilityTiers: string[],
  excludeMemberIds: string[],
): Promise<string[]> {
  const { data: entries, error } = await supabase
    .from("giveaway_entries")
    .select("member_id, members!inner(activity_tier, registration_status)")
    .eq("giveaway_id", giveawayId);

  if (error) throw new Error(error.message);

  return (entries ?? [])
    .filter(
      (e) =>
        // @ts-expect-error -- embedded relation typing
        eligibilityTiers.includes(e.members.activity_tier) &&
        // @ts-expect-error -- embedded relation typing
        e.members.registration_status === "approved" &&
        !excludeMemberIds.includes(e.member_id),
    )
    .map((e) => e.member_id);
}

export async function openGiveaway(formData: FormData) {
  const admin = await requireAdmin();
  const giveawayId = String(formData.get("giveawayId"));
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("giveaways")
    .update({ status: "open", entry_opens_at: new Date().toISOString() })
    .eq("id", giveawayId);
  if (error) throw new Error(error.message);

  await supabase.from("giveaway_audit_log").insert({
    giveaway_id: giveawayId,
    event_type: "opened",
    actor_admin_id: admin.userId,
  });
  revalidatePath(`/admin/giveaways/${giveawayId}`);
}

export async function closeGiveaway(formData: FormData) {
  const admin = await requireAdmin();
  const giveawayId = String(formData.get("giveawayId"));
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("giveaways")
    .update({ status: "closed", entry_closes_at: new Date().toISOString() })
    .eq("id", giveawayId);
  if (error) throw new Error(error.message);

  await supabase.from("giveaway_audit_log").insert({
    giveaway_id: giveawayId,
    event_type: "closed",
    actor_admin_id: admin.userId,
  });
  revalidatePath(`/admin/giveaways/${giveawayId}`);
}

export async function markCompleted(formData: FormData) {
  await requireAdmin();
  const giveawayId = String(formData.get("giveawayId"));
  const supabase = createServiceRoleClient();

  const { error } = await supabase.from("giveaways").update({ status: "completed" }).eq("id", giveawayId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/giveaways/${giveawayId}`);
}

export async function drawWinners(formData: FormData) {
  const admin = await requireAdmin();
  const giveawayId = String(formData.get("giveawayId"));
  const count = Math.max(1, Number(formData.get("winnerCount") ?? 1));

  const supabase = createServiceRoleClient();

  const { data: giveaway, error: giveawayError } = await supabase
    .from("giveaways")
    .select("status, eligibility_tiers")
    .eq("id", giveawayId)
    .single();
  if (giveawayError) throw new Error(giveawayError.message);
  if (giveaway.status !== "closed") {
    throw new Error("Close entries before drawing winners");
  }

  const { data: existingWinners, error: winnersError } = await supabase
    .from("giveaway_winners")
    .select("member_id")
    .eq("giveaway_id", giveawayId);
  if (winnersError) throw new Error(winnersError.message);

  const alreadySelected = (existingWinners ?? []).map((w) => w.member_id);
  const eligibleMemberIds = await getEligibleMemberIds(
    supabase,
    giveawayId,
    giveaway.eligibility_tiers,
    alreadySelected,
  );

  if (eligibleMemberIds.length < count) {
    throw new Error(
      `Only ${eligibleMemberIds.length} eligible entrant(s) remain — can't draw ${count} winner(s).`,
    );
  }

  const picked = secureShuffle(eligibleMemberIds).slice(0, count);

  const { error: insertError } = await supabase.from("giveaway_winners").insert(
    picked.map((memberId, index) => ({
      giveaway_id: giveawayId,
      member_id: memberId,
      rank: index + 1,
      selection_method: "random_auto" as const,
      selected_by: admin.userId,
    })),
  );
  if (insertError) throw new Error(insertError.message);

  await supabase.from("giveaway_audit_log").insert({
    giveaway_id: giveawayId,
    event_type: "winner_selected",
    actor_admin_id: admin.userId,
    metadata: { memberIds: picked, count },
  });

  await supabase.from("giveaways").update({ status: "winner_selected" }).eq("id", giveawayId);

  revalidatePath(`/admin/giveaways/${giveawayId}`);
}

export async function disqualifyAndRedraw(formData: FormData) {
  const admin = await requireAdmin();
  const winnerId = String(formData.get("winnerId"));
  const reason = String(formData.get("reason") ?? "").trim() || "Unreachable / ineligible";

  const supabase = createServiceRoleClient();

  const { data: winner, error: winnerError } = await supabase
    .from("giveaway_winners")
    .select("id, giveaway_id, rank, member_id")
    .eq("id", winnerId)
    .single();
  if (winnerError) throw new Error(winnerError.message);

  const { error: disqualifyError } = await supabase
    .from("giveaway_winners")
    .update({ disqualified_at: new Date().toISOString(), disqualified_reason: reason })
    .eq("id", winnerId);
  if (disqualifyError) throw new Error(disqualifyError.message);

  const { data: giveaway, error: giveawayError } = await supabase
    .from("giveaways")
    .select("eligibility_tiers")
    .eq("id", winner.giveaway_id)
    .single();
  if (giveawayError) throw new Error(giveawayError.message);

  const { data: allWinners, error: allWinnersError } = await supabase
    .from("giveaway_winners")
    .select("member_id")
    .eq("giveaway_id", winner.giveaway_id);
  if (allWinnersError) throw new Error(allWinnersError.message);

  const excludeIds = (allWinners ?? []).map((w) => w.member_id);
  const eligibleMemberIds = await getEligibleMemberIds(
    supabase,
    winner.giveaway_id,
    giveaway.eligibility_tiers,
    excludeIds,
  );

  if (eligibleMemberIds.length === 0) {
    throw new Error("No eligible replacement entrants remain for this giveaway.");
  }

  const [replacementMemberId] = secureShuffle(eligibleMemberIds);

  const { error: insertError } = await supabase.from("giveaway_winners").insert({
    giveaway_id: winner.giveaway_id,
    member_id: replacementMemberId,
    rank: winner.rank,
    selection_method: "random_auto",
    selected_by: admin.userId,
    replaces_winner_id: winner.id,
  });
  if (insertError) throw new Error(insertError.message);

  await supabase.from("giveaway_audit_log").insert({
    giveaway_id: winner.giveaway_id,
    event_type: "reopened",
    actor_admin_id: admin.userId,
    metadata: { replacedWinnerId: winner.id, replacementMemberId, rank: winner.rank, reason },
  });

  revalidatePath(`/admin/giveaways/${winner.giveaway_id}`);
}
