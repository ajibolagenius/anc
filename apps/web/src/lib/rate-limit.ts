import "server-only";
import { headers } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Best-effort client IP from the proxy chain. X-Forwarded-For is built by
 * prepending each hop's client-observed address and letting every proxy
 * append the next hop, so the *first* entry is whatever the original caller
 * claimed — trivially spoofable by anyone sending their own header — while
 * the *last* entry is the address Vercel's own edge observed directly, which
 * a client cannot override. Always take the last entry, never the first.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) {
    const hops = forwardedFor.split(",").map((hop) => hop.trim());
    const closest = hops[hops.length - 1];
    if (closest) return closest;
  }
  return h.get("x-real-ip") ?? "unknown";
}

/**
 * Atomic fixed-window rate limit check via the check_rate_limit() SQL
 * function (bucketing + increment happen in one statement, so concurrent
 * requests can't race past the limit). Fails open (allows the request) if
 * the check itself errors — a broken rate limiter should never be the
 * reason a legitimate member can't register or sign in.
 */
export async function checkRateLimit(key: string, { windowSeconds, max }: { windowSeconds: number; max: number }): Promise<boolean> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_key: key,
      p_window_seconds: windowSeconds,
      p_max: max,
    });
    if (error) return true;
    return data === true;
  } catch {
    return true;
  }
}
