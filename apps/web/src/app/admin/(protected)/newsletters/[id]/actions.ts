"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/admin-guard";
import { logAdminAction } from "@/lib/admin-audit-log";
import { getResendClient } from "@/lib/resend-client";
import { sendWhatsAppGroupMessage } from "@/lib/wa-bot-client";

// Mass email/WhatsApp blast to the entire matching membership — irreversible
// once sent, so restricted to super_admin.
export async function sendNewsletter(formData: FormData) {
  const admin = await requireRole("super_admin");
  const newsletterId = String(formData.get("newsletterId"));
  const supabase = createServiceRoleClient();

  const { data: newsletter, error: fetchError } = await supabase
    .from("newsletters")
    .select("*")
    .eq("id", newsletterId)
    .single();
  if (fetchError || !newsletter) throw new Error(fetchError?.message ?? "Newsletter not found");
  if (newsletter.status === "sent" || newsletter.status === "sending") {
    throw new Error("This newsletter was already sent");
  }

  await supabase.from("newsletters").update({ status: "sending" }).eq("id", newsletterId);

  const filter = (newsletter.audience_filter ?? {}) as Record<string, string>;
  let query = supabase.from("members").select("id, email").eq("registration_status", "approved");
  if (filter.activity_tier) query = query.eq("activity_tier", filter.activity_tier);
  if (filter.state_of_residence) query = query.eq("state_of_residence", filter.state_of_residence);
  const { data: recipients, error: recipientsError } = await query;

  if (recipientsError || !recipients || recipients.length === 0) {
    await supabase.from("newsletters").update({ status: "failed" }).eq("id", newsletterId);
    throw new Error(recipientsError?.message ?? "No approved members match this audience filter");
  }

  const { error: queueError } = await supabase.from("newsletter_deliveries").insert(
    recipients.map((r) => ({
      newsletter_id: newsletterId,
      member_id: r.id,
      email: r.email,
      status: "queued" as const,
    })),
  );
  if (queueError) throw new Error(queueError.message);

  const resend = getResendClient();
  const fromAddress = process.env.RESEND_FROM_EMAIL ?? "ANC <newsletter@arsenalnigeria.community>";

  for (const recipient of recipients) {
    if (!resend) {
      await supabase
        .from("newsletter_deliveries")
        .update({ status: "failed", error: "RESEND_API_KEY not configured" })
        .eq("newsletter_id", newsletterId)
        .eq("member_id", recipient.id);
      continue;
    }

    try {
      const { data: sendResult, error: sendError } = await resend.emails.send({
        from: fromAddress,
        to: recipient.email,
        subject: newsletter.subject,
        html: newsletter.body_html,
      });

      await supabase
        .from("newsletter_deliveries")
        .update(
          sendError
            ? { status: "failed", error: sendError.message }
            : { status: "sent", sent_at: new Date().toISOString(), provider_message_id: sendResult?.id ?? null },
        )
        .eq("newsletter_id", newsletterId)
        .eq("member_id", recipient.id);
    } catch (err) {
      await supabase
        .from("newsletter_deliveries")
        .update({ status: "failed", error: (err as Error).message })
        .eq("newsletter_id", newsletterId)
        .eq("member_id", recipient.id);
    }
  }

  if (newsletter.also_post_to_whatsapp && newsletter.whatsapp_summary_text) {
    const result = await sendWhatsAppGroupMessage(newsletter.whatsapp_summary_text);
    await supabase.from("wa_bot_message_log").insert({
      purpose: "newsletter",
      reference_id: newsletterId,
      message_text: newsletter.whatsapp_summary_text,
      status: result.ok ? "sent" : "failed",
      error: result.error ?? null,
    });
  }

  await supabase
    .from("newsletters")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", newsletterId);

  await logAdminAction({
    adminId: admin.userId,
    action: "newsletter_sent",
    entityType: "newsletter",
    entityId: newsletterId,
    metadata: { recipientCount: recipients.length },
  });
  revalidatePath(`/admin/newsletters/${newsletterId}`);
  revalidatePath("/admin/newsletters");
}
