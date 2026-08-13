import { NextResponse, type NextRequest } from "next/server";
import { createSessionClient } from "@/lib/supabase/server-session";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = await createSessionClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}
