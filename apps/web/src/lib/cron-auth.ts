import "server-only";

/**
 * Vercel automatically sends `Authorization: Bearer $CRON_SECRET` on requests
 * it triggers once that env var is set on the project — this just verifies
 * the request actually came from Vercel Cron (or a manual curl with the same
 * secret), not from anyone who happens to guess the route path.
 */
export function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}
