"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-guard";

export async function createGiveaway(formData: FormData) {
  const admin = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const type = String(formData.get("type") ?? "jersey");
  const eligibilityTiers = formData.getAll("eligibilityTiers").map(String);

  if (!title) throw new Error("Title is required");
  if (eligibilityTiers.length === 0) throw new Error("Pick at least one eligible tier");

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("giveaways")
    .insert({
      title,
      description,
      type,
      eligibility_tiers: eligibilityTiers,
      created_by: admin.userId,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("giveaway_audit_log").insert({
    giveaway_id: data.id,
    event_type: "created",
    actor_admin_id: admin.userId,
    metadata: { title, type, eligibilityTiers },
  });

  revalidatePath("/admin/giveaways");
  redirect(`/admin/giveaways/${data.id}`);
}
