import { createSessionClient, getMemberSession } from "@/lib/supabase/server-session";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { ShieldIcon } from "@/components/icons";

export default async function FanPassPage() {
  const member = await getMemberSession();
  const supabase = await createSessionClient();

  const { data } = member
    ? await supabase.from("members").select("anc_number").eq("id", member.memberId).maybeSingle()
    : { data: null };

  const ancNumber = data?.anc_number ?? null;

  // get_or_create_fan_pass_token is service-role-only — it's SECURITY
  // DEFINER and trusts whatever member_id it's given, so it must never be
  // callable with a client-suppliable id (that would let any signed-in
  // member mint a token for someone else's card). member.memberId here
  // came from getMemberSession(), which derives it from the authenticated
  // session server-side, never from client input, so passing it through is
  // safe — same trust pattern as the admin/service-role actions elsewhere.
  let imageUrl: string | null = null;
  if (member && ancNumber) {
    const { data: link } = (await createServiceRoleClient()
      .rpc("get_or_create_fan_pass_token", { p_member_id: member.memberId })
      .single()) as { data: { token: string; expires_at: string } | null };
    if (link) imageUrl = `/api/fan-pass/${link.token}`;
  }

  return (
    <div className="max-w-xl">
      <PageHeader icon={ShieldIcon} title="Your Fan Pass" spotlight="var(--arsenal-red-bright)" />

      {ancNumber && imageUrl ? (
        <>
          <div className="mt-8 overflow-hidden rounded-2xl border border-surface-border">
            {/* eslint-disable-next-line @next/next/no-img-element -- server-rendered PNG at a fixed size, not a next/image-optimizable static asset */}
            <img src={imageUrl} alt={`ANC Fan Pass — ${ancNumber}`} className="w-full" />
          </div>
          <p className="mt-4 text-sm text-muted">
            Membership No. <span className="text-foreground">{ancNumber}</span>. Press and hold the image to save
            it, then share it to your WhatsApp Status or post it on X.
          </p>
        </>
      ) : (
        <div className="mt-8 rounded-2xl border border-surface-border bg-surface/40 p-6 text-sm text-muted">
          Your Fan Pass card is being generated — check back shortly.
        </div>
      )}
    </div>
  );
}
