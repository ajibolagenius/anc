"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/admin-guard";
import { logAdminAction } from "@/lib/admin-audit-log";

export async function createMatch(formData: FormData) {
  const admin = await requireRole("admin");

  const opponent = String(formData.get("opponent") ?? "").trim();
  const kickoffAt = String(formData.get("kickoffAt") ?? "");
  const competition = String(formData.get("competition") ?? "").trim() || null;

  if (!opponent) throw new Error("Opponent is required");
  if (!kickoffAt) throw new Error("Kickoff time is required");

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("matches")
    .insert({
      opponent,
      kickoff_at: new Date(kickoffAt).toISOString(),
      competition,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await logAdminAction({ adminId: admin.userId, action: "match_created", entityType: "match", entityId: data.id, metadata: { opponent } });
  revalidatePath("/admin/matches");
  redirect(`/admin/matches/${data.id}`);
}
