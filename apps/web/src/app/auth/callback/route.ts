import { NextResponse, type NextRequest } from "next/server";
import { createSessionClient } from "@/lib/supabase/server-session";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = await createSessionClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    const user = data.user;

    if (user?.email) {
      // Claim the members row registered under this email, if not already
      // linked — this is what turns "registered" into "can log in."
      const serviceClient = createServiceRoleClient();
      await serviceClient
        .from("members")
        .update({ auth_user_id: user.id })
        .eq("email", user.email.toLowerCase())
        .is("auth_user_id", null);
    }
  }

  return NextResponse.redirect(new URL("/portal", request.url));
}
