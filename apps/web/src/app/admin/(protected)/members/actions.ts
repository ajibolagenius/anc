"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/admin-guard";
import { logAdminAction } from "@/lib/admin-audit-log";
import { getResendClient } from "@/lib/resend-client";
import { renderMemberApprovedEmailHtml } from "@/lib/email-template";
import { SITE_URL } from "@/lib/site-config";
import { ACTIVITY_TIERS, STATE_CODES, type ActivityTier, type NigerianState } from "@anc/shared";

export async function approveMember(formData: FormData) {
  const admin = await requireRole("admin");
  const memberId = String(formData.get("memberId"));
  const tier = String(formData.get("activityTier"));

  if (!ACTIVITY_TIERS.includes(tier as ActivityTier) || tier === "pending") {
    throw new Error("Choose a real activity tier to approve a member");
  }

  const supabase = createServiceRoleClient();

  const { data: existing, error: lookupError } = await supabase
    .from("members")
    .select("state_of_residence")
    .eq("id", memberId)
    .single();
  if (lookupError || !existing) throw new Error("Member not found");

  const stateCode = STATE_CODES[existing.state_of_residence as NigerianState];

  // approve_member() atomically flips registration_status/activity_tier AND
  // assigns the member's ANC number (PRD §4.1) in one DB transaction — the
  // admin UI only shows the Approve button for pending members, so a
  // partial failure here would otherwise leave a member approved-but-
  // unnumbered with no way back to pending to retry.
  const { data: result, error } = (await supabase
    .rpc("approve_member", {
      p_member_id: memberId,
      p_activity_tier: tier,
      p_reviewed_by: admin.userId,
      p_state_code: stateCode,
    })
    .single()) as { data: { anc_number: string; full_name: string; email: string } | null; error: { message: string } | null };

  if (error || !result) throw new Error(error?.message ?? "Approval failed");
  await logAdminAction({
    adminId: admin.userId,
    action: "member_approved",
    entityType: "member",
    entityId: memberId,
    metadata: { tier, ancNumber: result.anc_number },
  });

  // Best-effort: the approval itself has already succeeded above, so a
  // misconfigured/down email provider should never turn this action into a
  // failure the admin sees — same fail-soft pattern as the birthday job.
  const resend = getResendClient();
  if (resend) {
    try {
      const { error: sendError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "ANC <newsletter@arsenalnigeria.community>",
        to: result.email,
        subject: "You're approved — welcome to ANC! 🔴⚪",
        html: renderMemberApprovedEmailHtml({
          fullName: result.full_name,
          ancNumber: result.anc_number,
          loginUrl: `${SITE_URL}/login`,
          fanPassUrl: `${SITE_URL}/portal/fan-pass`,
        }),
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
  const admin = await requireRole("admin");
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
