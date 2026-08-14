import { redirect } from "next/navigation";
import Link from "next/link";
import { getMemberSession } from "@/lib/supabase/server-session";
import { SignOutButton } from "@/components/sign-out-button";
import { SidebarLink } from "@/components/sidebar-link";
import { SidebarShell } from "@/components/sidebar-shell";
import { GiftIcon, CalendarIcon, TrophyIcon, MapPinIcon, GearIcon, ShieldIcon } from "@/components/icons";

const NAV = [
  { href: "/portal/fan-pass", label: "Fan Pass", icon: <ShieldIcon className="h-4 w-4" /> },
  { href: "/portal/giveaways", label: "Giveaways", icon: <GiftIcon className="h-4 w-4" /> },
  { href: "/portal/predictions", label: "Predictions", icon: <CalendarIcon className="h-4 w-4" /> },
  { href: "/portal/leaderboard", label: "Leaderboard", icon: <TrophyIcon className="h-4 w-4" /> },
  { href: "/portal/watch-parties", label: "Watch Parties", icon: <MapPinIcon className="h-4 w-4" /> },
  { href: "/portal/settings", label: "Settings", icon: <GearIcon className="h-4 w-4" /> },
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const member = await getMemberSession();

  if (!member) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <SidebarShell logo={<Link href="/portal" className="font-display text-xl text-foreground">ANC</Link>}>
        <div>
          <Link href="/portal" className="font-display text-xl text-foreground">
            ANC
          </Link>
          <nav className="mt-8 flex flex-col gap-1">
            {NAV.map((item) => (
              <SidebarLink key={item.href} {...item} />
            ))}
          </nav>
        </div>
        <div className="border-t border-surface-border pt-4 text-xs text-muted">
          <p className="text-foreground/80">{member.fullName}</p>
          <p className="capitalize">{member.activityTier} member</p>
          <div className="mt-2">
            <SignOutButton redirectTo="/login" />
          </div>
        </div>
      </SidebarShell>
      <main className="flex-1 px-6 py-8 sm:px-8">{children}</main>
    </div>
  );
}
