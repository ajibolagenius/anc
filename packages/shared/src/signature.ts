/**
 * ANC is a volunteer, fan-love project. Every automated outbound message
 * (WhatsApp posts, newsletter emails) closes with this signature, appended
 * to the same message — never sent as a separate one. Change the wording
 * here once and every channel picks it up.
 */
const SIGNATURE_LINE = "Built with love by Ajibola Don_Genius";
const SIGNATURE_URL = "https://ajibolagenius.vercel.app";

export function whatsappSignature(): string {
  // Plain-text URLs auto-link in WhatsApp — no markup needed for it to be tappable.
  return `\n\n-------------------------\n${SIGNATURE_LINE}\n${SIGNATURE_URL}`;
}

export function withWhatsappSignature(message: string): string {
  return `${message}${whatsappSignature()}`;
}

export function emailSignatureHtml(): string {
  return `
    <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0 12px;" />
    <p style="font-size:12px;color:#777;margin:0;">
      <a href="${SIGNATURE_URL}" style="color:#777;text-decoration:underline;">${SIGNATURE_LINE}</a>
    </p>
  `.trim();
}
