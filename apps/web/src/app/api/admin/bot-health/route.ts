import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/supabase/server-session";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const botUrl = process.env.WA_BOT_URL;
  if (!botUrl) {
    return NextResponse.json({ reachable: false, reason: "WA_BOT_URL not configured" });
  }

  try {
    const res = await fetch(`${botUrl}/internal/health`, {
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ reachable: false, reason: `HTTP ${res.status}` });
    }
    const body = await res.json();
    return NextResponse.json({ reachable: true, ...body });
  } catch {
    return NextResponse.json({ reachable: false, reason: "unreachable" });
  }
}
