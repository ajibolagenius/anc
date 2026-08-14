import "server-only";
import { Resend } from "resend";

/** Returns null (rather than throwing) when unconfigured, so callers can fail one delivery gracefully instead of crashing the whole send. */
export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}
