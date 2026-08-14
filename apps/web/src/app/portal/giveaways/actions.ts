"use server";

import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/server-session";

/**
 * Deliberately uses the RLS-scoped session client, not the service-role
 * client — this insert only succeeds because of the giveaway_entries_insert_own
 * policy (packages/../supabase migration), which is the point: members act
 * within their own permissions, not through a privileged backdoor.
 */
export async function enterGiveaway(formData: FormData) {
  const giveawayId = String(formData.get("giveawayId"));
  const supabase = await createSessionClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not signed in");

  const { data: giveaway, error: giveawayError } = await supabase
    .from("giveaways")
    .select("status, eligibility_tiers, entry_opens_at, entry_closes_at")
    .eq("id", giveawayId)
    .single();
  if (giveawayError || !giveaway) throw new Error("Giveaway not found");
  if (giveaway.status !== "open") throw new Error("This giveaway is not open for entries");
  const now = new Date();
  if (giveaway.entry_opens_at && new Date(giveaway.entry_opens_at) > now) {
    throw new Error("Entries haven't opened yet for this giveaway");
  }
  if (giveaway.entry_closes_at && new Date(giveaway.entry_closes_at) < now) {
    throw new Error("Entries are closed for this giveaway");
  }

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id, activity_tier")
    .eq("auth_user_id", userData.user.id)
    .single();
  if (memberError || !member) throw new Error("No matching member record");
  if (!giveaway.eligibility_tiers.includes(member.activity_tier)) {
    throw new Error("You're not eligible for this giveaway");
  }

  const { error } = await supabase.from("giveaway_entries").insert({
    giveaway_id: giveawayId,
    member_id: member.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/portal/giveaways");
}
