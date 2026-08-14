"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-guard";
import { watchPartySubmissionSchema } from "@anc/shared";

/** Admin-created listings are auto-approved — trust is implicit for admin-authored content. */
export async function createWatchParty(formData: FormData) {
  const admin = await requireAdmin();

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

  const supabase = createServiceRoleClient();
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
    submitted_by: "admin",
    status: "approved",
    approved_by: admin.userId,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/watch-parties");
}

export async function approveWatchParty(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("watch_parties")
    .update({ status: "approved", approved_by: admin.userId })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/watch-parties");
}

export async function rejectWatchParty(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("watch_parties")
    .update({ status: "rejected", approved_by: admin.userId })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/watch-parties");
}
