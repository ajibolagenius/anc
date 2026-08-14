import { redirect } from "next/navigation";
import Link from "next/link";
import { getMemberSession } from "@/lib/supabase/server-session";
import { SignOutButton } from "@/components/sign-out-button";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const member = await getMemberSession();

  if (!member) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1">
      <aside className="flex w-56 shrink-0 flex-col justify-between border-r border-surface-border px-5 py-6">
        <div>
          <Link href="/portal" className="font-display text-xl text-foreground">
            ANC
          </Link>
          <nav className="mt-8 flex flex-col gap-1 text-sm">
            <Link
              href="/portal/giveaways"
              className="rounded-lg px-3 py-2 text-foreground/90 transition-colors hover:bg-white/5"
            >
              Giveaways
            </Link>
            <Link
              href="/portal/predictions"
              className="rounded-lg px-3 py-2 text-foreground/90 transition-colors hover:bg-white/5"
            >
              Predictions
            </Link>
            <Link
              href="/portal/leaderboard"
              className="rounded-lg px-3 py-2 text-foreground/90 transition-colors hover:bg-white/5"
            >
              Leaderboard
            </Link>
            <Link
              href="/portal/watch-parties"
              className="rounded-lg px-3 py-2 text-foreground/90 transition-colors hover:bg-white/5"
            >
              Watch Parties
            </Link>
            <Link
              href="/portal/settings"
              className="rounded-lg px-3 py-2 text-foreground/90 transition-colors hover:bg-white/5"
            >
              Settings
            </Link>
          </nav>
        </div>
        <div className="border-t border-surface-border pt-4 text-xs text-muted">
          <p className="text-foreground/80">{member.fullName}</p>
          <p className="capitalize">{member.activityTier} member</p>
          <div className="mt-2">
            <SignOutButton redirectTo="/login" />
          </div>
        </div>
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
