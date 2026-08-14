import { redirect } from "next/navigation";
import Link from "next/link";
import {
  GiftIcon,
  IdentificationCardIcon,
  MapPinIcon,
  GearSixIcon,
  SoccerBallIcon,
  TrophyIcon,
} from "@phosphor-icons/react/ssr";
import { getMemberSession } from "@/lib/supabase/server-session";
import { SignOutButton } from "@/components/sign-out-button";
import { SidebarLink } from "@/components/sidebar-link";
import { SidebarShell } from "@/components/sidebar-shell";

const NAV = [
  { href: "/portal/fan-pass", label: "Fan Pass", icon: <IdentificationCardIcon className="h-4 w-4" /> },
  { href: "/portal/giveaways", label: "Giveaways", icon: <GiftIcon className="h-4 w-4" /> },
  { href: "/portal/predictions", label: "Predictions", icon: <SoccerBallIcon className="h-4 w-4" /> },
  { href: "/portal/leaderboard", label: "Leaderboard", icon: <TrophyIcon className="h-4 w-4" /> },
  { href: "/portal/watch-parties", label: "Watch Parties", icon: <MapPinIcon className="h-4 w-4" /> },
  { href: "/portal/settings", label: "Settings", icon: <GearSixIcon className="h-4 w-4" /> },
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const member = await getMemberSession();

  if (!member) {
    redirect("/login");
  }

  const logo = (
    <Link href="/portal" className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-arsenal-red font-display text-xs text-white">
        AN
      </span>
      <span className="font-display text-sm tracking-wide text-foreground">ANC PORTAL</span>
    </Link>
  );

  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <SidebarShell logo={logo}>
        <div>
          {logo}
          <nav className="mt-7 flex flex-col gap-1">
            {NAV.map((item) => (
              <SidebarLink key={item.href} {...item} />
            ))}
          </nav>
        </div>
        <div className="border-t border-surface-border pt-4 text-xs">
          <p className="font-bold text-foreground">{member.fullName}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-arsenal-gold">
            {member.ancNumber ?? "Pending No."} · <span className="capitalize">{member.activityTier.replace("_", " ")}</span>
          </p>
          <div className="mt-3">
            <SignOutButton redirectTo="/login" />
          </div>
        </div>
      </SidebarShell>
      <main className="flex-1 px-6 py-9 sm:px-11">{children}</main>
    </div>
  );
}
