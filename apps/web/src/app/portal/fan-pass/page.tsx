import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/supabase/server-session";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { FanPassView } from "./fan-pass-view";

export default async function FanPassPage() {
  const member = await getMemberSession();
  if (!member) redirect("/login");

  let token: string | null = null;
  if (member.ancNumber) {
    const { data: link } = (await createServiceRoleClient()
      .rpc("get_or_create_fan_pass_token", { p_member_id: member.memberId })
      .single()) as { data: { token: string; expires_at: string } | null };
    token = link?.token ?? null;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-wide text-foreground sm:text-4xl">YOUR FAN PASS</h1>
        <p className="mt-1 text-sm text-muted">
          Your official ANC identity. Choose your preferred card design and share it with the world.
        </p>
      </div>

      {member.ancNumber ? (
        <FanPassView
          member={{
            fullName: member.fullName,
            ancNumber: member.ancNumber,
            stateOfResidence: member.stateOfResidence,
            activityTier: member.activityTier,
            favoritePlayerCurrent: member.favoritePlayerCurrent,
            createdAt: member.createdAt,
            token,
          }}
        />
      ) : (
        <div className="rounded-2xl border border-surface-border bg-surface p-8 text-center text-sm text-muted">
          Your Fan Pass number is currently being generated. Check back shortly!
        </div>
      )}
    </div>
  );
}
