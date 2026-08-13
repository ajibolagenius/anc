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

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id")
    .eq("auth_user_id", userData.user.id)
    .single();
  if (memberError || !member) throw new Error("No matching member record");

  const { error } = await supabase.from("giveaway_entries").insert({
    giveaway_id: giveawayId,
    member_id: member.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/portal/giveaways");
}
