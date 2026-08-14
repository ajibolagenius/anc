import "server-only";
import { todayInLagos } from "@anc/shared";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getResendClient } from "@/lib/resend-client";
import { sendWhatsAppGroupMessage } from "@/lib/wa-bot-client";
import { renderBirthdayEmailHtml } from "@/lib/email-template";

export type BirthdayJobSummary = {
  date: string;
  celebrants: number;
  emailsSent: number;
  emailsFailed: number;
  whatsappSent: boolean;
  whatsappError: string | null;
};

/**
 * Core birthday job — called by the daily cron route AND by the admin
 * "send test birthdays now" button, so both paths share one implementation
 * rather than drifting apart. Idempotent per (member_id, year, channel) via
 * birthday_notifications, so re-running it the same day is always safe.
 */
export async function runBirthdayJob(): Promise<BirthdayJobSummary> {
  const { day, month, year } = todayInLagos();
  const dateLabel = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const supabase = createServiceRoleClient();

  const { data: celebrants, error: celebrantsError } = await supabase
    .from("members")
    .select("id, full_name, email, whatsapp_number")
    .eq("registration_status", "approved")
    .eq("birthday_day", day)
    .eq("birthday_month", month);
  if (celebrantsError) throw new Error(celebrantsError.message);

  if (!celebrants || celebrants.length === 0) {
    return { date: dateLabel, celebrants: 0, emailsSent: 0, emailsFailed: 0, whatsappSent: false, whatsappError: null };
  }

  // Only a *successful* send blocks a retry — a failed attempt (e.g. Resend
  // misconfigured, wa-bot briefly down) should get another shot on the next
  // cron run/test-send rather than being silently skipped for the rest of
  // the year. birthday_notifications rows are upserted below (on the same
  // unique key) so a retry updates the failed row instead of erroring.
  const { data: alreadyNotified } = await supabase
    .from("birthday_notifications")
    .select("member_id, channel")
    .eq("greeted_year", year)
    .eq("status", "sent")
    .in(
      "member_id",
      celebrants.map((c) => c.id),
    );
  const doneEmail = new Set((alreadyNotified ?? []).filter((n) => n.channel === "email").map((n) => n.member_id));
  const doneWhatsapp = new Set((alreadyNotified ?? []).filter((n) => n.channel === "whatsapp").map((n) => n.member_id));

  // --- Email: one personalized send per celebrant, independent of WhatsApp ---
  const resend = getResendClient();
  const fromAddress = process.env.RESEND_FROM_EMAIL ?? "ANC <newsletter@arsenalnigeria.community>";
  let emailsSent = 0;
  let emailsFailed = 0;

  for (const member of celebrants) {
    if (doneEmail.has(member.id)) continue;

    if (!resend) {
      await supabase.from("birthday_notifications").upsert(
        {
          member_id: member.id,
          greeted_year: year,
          channel: "email",
          status: "failed",
          error: "RESEND_API_KEY not configured",
        },
        { onConflict: "member_id,greeted_year,channel" },
      );
      emailsFailed++;
      continue;
    }

    try {
      const { data: sendResult, error: sendError } = await resend.emails.send({
        from: fromAddress,
        to: member.email,
        subject: "Happy Birthday from ANC! 🎂",
        html: renderBirthdayEmailHtml({ fullName: member.full_name }),
      });
      await supabase.from("birthday_notifications").upsert(
        {
          member_id: member.id,
          greeted_year: year,
          channel: "email",
          status: sendError ? "failed" : "sent",
          provider_message_id: sendResult?.id ?? null,
          error: sendError?.message ?? null,
        },
        { onConflict: "member_id,greeted_year,channel" },
      );
      sendError ? emailsFailed++ : emailsSent++;
    } catch (err) {
      await supabase.from("birthday_notifications").upsert(
        {
          member_id: member.id,
          greeted_year: year,
          channel: "email",
          status: "failed",
          error: (err as Error).message,
        },
        { onConflict: "member_id,greeted_year,channel" },
      );
      emailsFailed++;
    }
  }

  // --- WhatsApp: ONE batched, @-mentioning message for everyone due today ---
  const dueForWhatsapp = celebrants.filter((c) => !doneWhatsapp.has(c.id));
  let whatsappSent = false;
  let whatsappError: string | null = null;

  if (dueForWhatsapp.length > 0) {
    const mentionTags = dueForWhatsapp.map((c) => `@${c.whatsapp_number.replace(/^\+/, "")}`);
    const names = dueForWhatsapp.map((c) => c.full_name.split(" ")[0]).join(", ");
    const greeting =
      dueForWhatsapp.length === 1
        ? `🎂 Happy Birthday, ${mentionTags[0]}! Wishing you a brilliant year ahead — Come on you Gunners! 🔴⚪`
        : `🎂 Happy Birthday to our ANC gunners today — ${names}! (${mentionTags.join(" ")}) Wishing you all a brilliant year ahead. 🔴⚪`;

    const result = await sendWhatsAppGroupMessage(
      greeting,
      dueForWhatsapp.map((c) => c.whatsapp_number),
    );
    whatsappSent = result.ok;
    whatsappError = result.error ?? null;

    await supabase.from("wa_bot_message_log").insert({
      purpose: "birthday",
      message_text: greeting,
      status: result.ok ? "sent" : "failed",
      error: result.error ?? null,
    });

    await supabase.from("birthday_notifications").upsert(
      dueForWhatsapp.map((c) => ({
        member_id: c.id,
        greeted_year: year,
        channel: "whatsapp" as const,
        status: result.ok ? ("sent" as const) : ("failed" as const),
        error: result.error ?? null,
      })),
      { onConflict: "member_id,greeted_year,channel" },
    );
  }

  return { date: dateLabel, celebrants: celebrants.length, emailsSent, emailsFailed, whatsappSent, whatsappError };
}
