"use server";

import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/server-session";
import { watchPartySubmissionSchema } from "@anc/shared";

/**
 * RLS-scoped session client — the insert only succeeds because of
 * watch_parties_insert_member, which requires activity_tier = 'active' and
 * always lands the row as 'pending'. Non-active members get a clean RLS
 * denial here, not a silent success.
 */
export async function submitWatchParty(formData: FormData) {
  const parsed = watchPartySubmissionSchema.safeParse({
    matchId: String(formData.get("matchId") ?? "") || undefined,
    state: String(formData.get("state") ?? ""),
    city: String(formData.get("city") ?? ""),
    venueName: String(formData.get("venueName") ?? ""),
    address: String(formData.get("address") ?? "") || undefined,
    mapLink: String(formData.get("mapLink") ?? "") || undefined,
    contactName: String(formData.get("contactName") ?? "") || undefined,
    contactWhatsapp: String(formData.get("contactWhatsapp") ?? "") || undefined,
    isRecurring: formData.get("isRecurring") === "on",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid listing");
  const input = parsed.data;

  const supabase = await createSessionClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not signed in");

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id")
    .eq("auth_user_id", userData.user.id)
    .single();
  if (memberError || !member) throw new Error("No matching member record");

  const { error } = await supabase.from("watch_parties").insert({
    match_id: input.matchId ?? null,
    state: input.state,
    city: input.city,
    venue_name: input.venueName,
    address: input.address ?? null,
    map_link: input.mapLink ?? null,
    contact_name: input.contactName ?? null,
    contact_whatsapp: input.contactWhatsapp ?? null,
    is_recurring: input.isRecurring,
    submitted_by: "member",
    submitted_by_member_id: member.id,
    status: "pending",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/portal/watch-parties");
}
