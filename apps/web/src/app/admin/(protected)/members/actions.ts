"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-guard";
import { logAdminAction } from "@/lib/admin-audit-log";
import { getResendClient } from "@/lib/resend-client";
import { renderMemberApprovedEmailHtml } from "@/lib/email-template";
import { SITE_URL } from "@/lib/site-config";
import { ACTIVITY_TIERS, type ActivityTier } from "@anc/shared";

export async function approveMember(formData: FormData) {
  const admin = await requireAdmin();
  const memberId = String(formData.get("memberId"));
  const tier = String(formData.get("activityTier"));

  if (!ACTIVITY_TIERS.includes(tier as ActivityTier) || tier === "pending") {
    throw new Error("Choose a real activity tier to approve a member");
  }

  const supabase = createServiceRoleClient();
  const { data: member, error } = await supabase
    .from("members")
    .update({
      registration_status: "approved",
      activity_tier: tier,
      reviewed_by: admin.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", memberId)
    .select("full_name, email")
    .single();

  if (error) throw new Error(error.message);
  await logAdminAction({ adminId: admin.userId, action: "member_approved", entityType: "member", entityId: memberId, metadata: { tier } });

  // Best-effort: the approval itself has already succeeded above, so a
  // misconfigured/down email provider should never turn this action into a
  // failure the admin sees — same fail-soft pattern as the birthday job.
  const resend = getResendClient();
  if (resend && member) {
    try {
      const { error: sendError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "ANC <newsletter@arsenalnigeria.community>",
        to: member.email,
        subject: "You're approved — welcome to ANC! 🔴⚪",
        html: renderMemberApprovedEmailHtml({ fullName: member.full_name, loginUrl: `${SITE_URL}/login` }),
      });
      await logAdminAction({
        adminId: admin.userId,
        action: "member_approved_email",
        entityType: "member",
        entityId: memberId,
        metadata: { status: sendError ? "failed" : "sent", error: sendError?.message ?? null },
      });
    } catch (err) {
      await logAdminAction({
        adminId: admin.userId,
        action: "member_approved_email",
        entityType: "member",
        entityId: memberId,
        metadata: { status: "failed", error: (err as Error).message },
      });
    }
  }

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
  await logAdminAction({ adminId: admin.userId, action: "member_rejected", entityType: "member", entityId: memberId });
  revalidatePath("/admin/members");
}
