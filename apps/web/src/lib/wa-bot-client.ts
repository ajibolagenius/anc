import "server-only";
import { withWhatsappSignature } from "@anc/shared";

export type WaBotSendResult = { ok: boolean; error?: string };

/** POSTs to wa-bot's internal API. Always best-effort — a failure here should never block a more reliable channel (email) from completing. */
export async function sendWhatsAppGroupMessage(text: string): Promise<WaBotSendResult> {
  const url = process.env.WA_BOT_URL;
  const key = process.env.WA_BOT_INTERNAL_KEY;
  if (!url || !key) return { ok: false, error: "wa-bot not configured (WA_BOT_URL/WA_BOT_INTERNAL_KEY)" };

  try {
    const res = await fetch(`${url}/internal/send-group-message`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({ text: withWhatsappSignature(text) }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}) as { error?: string; message?: string });
      // `message` carries the specific reason (e.g. "socket is not connected");
      // `error` is just the generic category ("Internal error") — prefer the former.
      return { ok: false, error: body.message ?? body.error ?? `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
