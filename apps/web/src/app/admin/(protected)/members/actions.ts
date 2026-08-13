"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/supabase/server-session";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { ACTIVITY_TIERS, type ActivityTier } from "@anc/shared";

async function requireAdmin() {
  const admin = await getAdminSession();
  if (!admin) throw new Error("Not authorized");
  return admin;
}

export async function approveMember(formData: FormData) {
  const admin = await requireAdmin();
  const memberId = String(formData.get("memberId"));
  const tier = String(formData.get("activityTier"));

  if (!ACTIVITY_TIERS.includes(tier as ActivityTier) || tier === "pending") {
    throw new Error("Choose a real activity tier to approve a member");
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("members")
    .update({
      registration_status: "approved",
      activity_tier: tier,
      reviewed_by: admin.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", memberId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/members");
}

export async function rejectMember(formData: FormData) {
  const admin = await requireAdmin();
  const memberId = String(formData.get("memberId"));

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("members")
    .update({
      registration_status: "rejected",
      reviewed_by: admin.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", memberId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/members");
}
