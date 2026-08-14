import { emailSignatureHtml } from "@anc/shared";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Wraps admin-authored plain text in a minimally-branded HTML shell — no rich-text editor, just paragraphs + the shared signature. Keeps the composer dead simple while still feeling on-brand. */
export function renderNewsletterEmailHtml({ subject, bodyText }: { subject: string; bodyText: string }): string {
  const paragraphs = bodyText
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;line-height:1.6;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");

  return `
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px; color: #171717;">
      <div style="font-weight: 700; letter-spacing: 0.05em; color: #DB0007; font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">
        Arsenal Nigeria Community
      </div>
      <h1 style="font-size: 22px; margin: 0 0 20px; color: #023474;">${escapeHtml(subject)}</h1>
      ${paragraphs}
      ${emailSignatureHtml()}
    </div>
  `.trim();
}

/**
 * Sent once, right when an admin approves a pending registration. Tells the
 * member their Fan Pass is live and exactly how to get in — sign-in is
 * magic-link/OTP only (no password), so that's the one thing this email
 * absolutely has to make unambiguous.
 */
export function renderMemberApprovedEmailHtml({ fullName, loginUrl }: { fullName: string; loginUrl: string }): string {
  return `
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px; color: #171717;">
      <div style="font-weight: 700; letter-spacing: 0.05em; color: #DB0007; font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">
        Arsenal Nigeria Community
      </div>
      <h1 style="font-size: 22px; margin: 0 0 20px; color: #023474;">You&rsquo;re approved, ${escapeHtml(fullName.split(" ")[0])}! 🔴⚪</h1>
      <p style="margin:0 0 16px;line-height:1.6;">
        Your ANC Fan Pass is live. You now have full access to the member portal — enter matchday predictions,
        join giveaways, browse watch parties near you, and get in on birthday shoutouts from the crew.
      </p>
      <p style="margin:0 0 24px;line-height:1.6;">
        Sign in anytime with just your email — no password to remember. Enter your email on the sign-in page
        and we&rsquo;ll send you a one-time link.
      </p>
      <a href="${loginUrl}" style="display:inline-block;background:#DB0007;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:9999px;">
        Sign in to your portal
      </a>
      ${emailSignatureHtml()}
    </div>
  `.trim();
}

/** Personalized birthday wish — same minimal shell as the newsletter template, kept as its own function since the copy/occasion differs. */
export function renderBirthdayEmailHtml({ fullName }: { fullName: string }): string {
  return `
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px; color: #171717;">
      <div style="font-weight: 700; letter-spacing: 0.05em; color: #DB0007; font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">
        Arsenal Nigeria Community
      </div>
      <h1 style="font-size: 22px; margin: 0 0 20px; color: #023474;">🎂 Happy Birthday, ${escapeHtml(fullName.split(" ")[0])}!</h1>
      <p style="margin:0 0 16px;line-height:1.6;">
        From all of us at Arsenal Nigeria Community — wishing you a brilliant year ahead, on and off the pitch.
        Come on you Gunners! 🔴⚪
      </p>
      ${emailSignatureHtml()}
    </div>
  `.trim();
}
