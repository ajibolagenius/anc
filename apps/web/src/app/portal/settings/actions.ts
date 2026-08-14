"use server";

import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/server-session";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function updateMyProfile(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await createSessionClient();
  const { data: userData } = await session.auth.getUser();
  if (!userData.user) throw new Error("Not signed in");

  const { data: member } = await session
    .from("members")
    .select("id")
    .eq("auth_user_id", userData.user.id)
    .single();
  if (!member) throw new Error("No matching member record");

  const jerseySize = (formData.get("jerseySize") as string) || null;
  const favoritePlayerCurrent = (formData.get("favoritePlayerCurrent") as string) || null;
  const favoritePlayerAlltime = (formData.get("favoritePlayerAlltime") as string) || null;
  const stateOfResidence = formData.get("stateOfResidence") as string;

  const { error } = await session
    .from("members")
    .update({
      jersey_size: jerseySize,
      favorite_player_current: favoritePlayerCurrent,
      favorite_player_alltime: favoritePlayerAlltime,
      state_of_residence: stateOfResidence,
    })
    .eq("id", member.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/portal/settings");
  revalidatePath("/portal");
  return { success: true };
}

/**
 * NDPR-driven self-service deletion (PRD §9). Anonymizes PII in place rather
 * than hard-deleting the row — predictions/giveaway_winners reference
 * member_id, and the community's history (who won what, past scores) should
 * stay accurate even once the person behind it asks to be forgotten. The
 * auth.users row IS actually deleted, which cascades members.auth_user_id to
 * null via its "on delete set null" FK, so the account can never sign in
 * again.
 */
export async function deleteMyAccount(): Promise<void> {
  const session = await createSessionClient();
  const { data: userData } = await session.auth.getUser();
  if (!userData.user) throw new Error("Not signed in");

  const { data: member, error: memberError } = await session
    .from("members")
    .select("id")
    .eq("auth_user_id", userData.user.id)
    .single();
  if (memberError || !member) throw new Error("No matching member record");

  const supabase = createServiceRoleClient();

  const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userData.user.id);
  if (deleteAuthError) throw new Error(deleteAuthError.message);

  const { error: anonymizeError } = await supabase
    .from("members")
    .update({
      full_name: "Deleted Member",
      whatsapp_number: `deleted-${member.id}`,
      email: `deleted-${member.id}@deleted.anc.local`,
      birthday_day: 1,
      birthday_month: 1,
      state_of_origin: null,
      state_of_residence: "N/A",
      favorite_player_current: null,
      favorite_player_alltime: null,
      jersey_size: null,
      self_reported_tier: null,
      registration_status: "suspended",
    })
    .eq("id", member.id);
  if (anonymizeError) throw new Error(anonymizeError.message);
}
