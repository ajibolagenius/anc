"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/admin-guard";
import { logAdminAction } from "@/lib/admin-audit-log";
import { renderNewsletterEmailHtml } from "@/lib/email-template";

export async function createNewsletter(formData: FormData) {
  const admin = await requireRole("admin");

  const subject = String(formData.get("subject") ?? "").trim();
  const bodyText = String(formData.get("bodyText") ?? "").trim();
  const tier = String(formData.get("tier") ?? "");
  const state = String(formData.get("state") ?? "");
  const alsoPostToWhatsapp = formData.get("alsoPostToWhatsapp") === "on";
  const whatsappSummaryText = String(formData.get("whatsappSummaryText") ?? "").trim() || null;

  if (!subject || !bodyText) throw new Error("Subject and body are required");

  // registration_status is always forced to 'approved' — never store anything
  // that could target pending/rejected members, regardless of what's picked.
  const audienceFilter: Record<string, string> = { registration_status: "approved" };
  if (tier) audienceFilter.activity_tier = tier;
  if (state) audienceFilter.state_of_residence = state;

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("newsletters")
    .insert({
      subject,
      body_text: bodyText,
      body_html: renderNewsletterEmailHtml({ subject, bodyText }),
      audience_filter: audienceFilter,
      also_post_to_whatsapp: alsoPostToWhatsapp,
      whatsapp_summary_text: whatsappSummaryText,
      created_by: admin.userId,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await logAdminAction({ adminId: admin.userId, action: "newsletter_created", entityType: "newsletter", entityId: data.id, metadata: { subject } });
  revalidatePath("/admin/newsletters");
  redirect(`/admin/newsletters/${data.id}`);
}
