import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Vercel automatically sends `Authorization: Bearer $CRON_SECRET` on requests
 * it triggers once that env var is set on the project — this just verifies
 * the request actually came from Vercel Cron (or a manual curl with the same
 * secret), not from anyone who happens to guess the route path.
 *
 * Hashing both sides to a fixed-length digest before comparing avoids a
 * naive `===` (variable-time string comparison) and a length-dependent
 * timing signal on the raw secret.
 */
export function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const expected = createHash("sha256").update(`Bearer ${secret}`).digest();
  const actual = createHash("sha256").update(header).digest();
  return timingSafeEqual(actual, expected);
}
