import { getMemberSession } from "@/lib/supabase/server-session";
import { PageHeader } from "@/components/page-header";
import { GearIcon } from "@/components/icons";
import { DeleteAccountButton } from "./_delete-account-button";

export default async function SettingsPage() {
  const member = await getMemberSession();

  return (
    <div className="max-w-xl">
      <PageHeader icon={GearIcon} title="Settings" spotlight="var(--arsenal-gold)" />

      <div className="mt-8 rounded-2xl border border-surface-border bg-surface/40 p-5 text-sm">
        <p className="text-foreground">{member?.fullName}</p>
        <p className="mt-1 capitalize text-muted">{member?.activityTier} member</p>
      </div>

      <div className="mt-10 rounded-2xl border border-arsenal-red-bright/30 bg-arsenal-red/5 p-5">
        <h2 className="text-sm font-medium text-foreground/90">Danger zone</h2>
        <p className="mt-2 text-sm text-muted">
          Read our <a href="/privacy" className="underline hover:text-foreground">privacy notice</a> for details on
          what we store and why.
        </p>
        <div className="mt-4">
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  );
}
