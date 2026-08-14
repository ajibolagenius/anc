import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/supabase/server-session";
import { SettingsView } from "./settings-view";

export default async function SettingsPage() {
  const member = await getMemberSession();
  if (!member) redirect("/login");

  return (
    <div className="mx-auto max-w-[520px]">
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-wide text-foreground sm:text-4xl">SETTINGS</h1>
        <p className="mt-1 text-sm text-muted">
          Manage your personal information, fan profile, and privacy preferences.
        </p>
      </div>

      <SettingsView
        member={{
          fullName: member.fullName,
          email: member.email,
          whatsappNumber: member.whatsappNumber,
          stateOfResidence: member.stateOfResidence,
          favoritePlayerCurrent: member.favoritePlayerCurrent,
          favoritePlayerAlltime: member.favoritePlayerAlltime,
          jerseySize: member.jerseySize,
          activityTier: member.activityTier,
          createdAt: member.createdAt,
        }}
      />
    </div>
  );
}
