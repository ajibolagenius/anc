import { ImageResponse } from "next/og";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const contentType = "image/png";

const WIDTH = 1200;
const HEIGHT = 750;

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/**
 * Publicly reachable by design — this is a shareable card members post to
 * WhatsApp Status / X (PRD §4.1), so it can't require a session. What makes
 * that safe: the token is random and expires (fan_pass_links.expires_at,
 * minted by get_or_create_fan_pass_token — see
 * supabase/migrations/20260814060000_fan_pass_link_expiry.sql), so a copied
 * URL goes dead on its own rather than exposing a member's name/state/ANC
 * number indefinitely. Only fields the member is already choosing to make
 * public are ever rendered — never contact info.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const supabase = createServiceRoleClient();
  const { data: link } = await supabase
    .from("fan_pass_links")
    .select("member_id, expires_at")
    .eq("token", token)
    .single();

  if (!link || new Date(link.expires_at) <= new Date()) {
    return new Response("Fan Pass link expired or not found", { status: 404 });
  }

  const { data: member } = await supabase
    .from("members")
    .select("full_name, anc_number, state_of_residence, reviewed_at")
    .eq("id", link.member_id)
    .eq("registration_status", "approved")
    .not("anc_number", "is", null)
    .single();

  if (!member) {
    return new Response("Fan Pass not found", { status: 404 });
  }

  const memberSince = member.reviewed_at
    ? new Date(member.reviewed_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background: "linear-gradient(135deg, #DB0007 0%, #9A0005 55%, #023474 100%)",
          fontFamily: "-apple-system, Helvetica, Arial, sans-serif",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 22, letterSpacing: 4, textTransform: "uppercase", opacity: 0.85 }}>
              Arsenal Nigeria Community
            </div>
            <div style={{ fontSize: 40, fontWeight: 700, marginTop: 6 }}>Gunner Fan Pass</div>
          </div>
          <div style={{ fontSize: 64 }}>🔴⚪</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 160,
              height: 160,
              borderRadius: 9999,
              background: "rgba(255,255,255,0.15)",
              border: "3px solid rgba(255,255,255,0.6)",
              fontSize: 64,
              fontWeight: 700,
            }}
          >
            {initials(member.full_name)}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 52, fontWeight: 700 }}>{member.full_name}</div>
            <div style={{ fontSize: 26, opacity: 0.85, marginTop: 8 }}>{member.state_of_residence}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 20, opacity: 0.7, textTransform: "uppercase", letterSpacing: 2 }}>
              Membership No.
            </div>
            <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: 2, marginTop: 4 }}>{member.anc_number}</div>
          </div>
          {memberSince && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ fontSize: 20, opacity: 0.7, textTransform: "uppercase", letterSpacing: 2 }}>
                Member Since
              </div>
              <div style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}>{memberSince}</div>
            </div>
          )}
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  );
}
