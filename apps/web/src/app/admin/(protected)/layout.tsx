import { redirect } from "next/navigation";
import Link from "next/link";
import {
  SquaresFourIcon,
  UsersThreeIcon,
  GiftIcon,
  EnvelopeSimpleIcon,
  SoccerBallIcon,
  MapPinIcon,
  RobotIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react/ssr";
import { getAdminSession } from "@/lib/supabase/server-session";
import { SignOutButton } from "@/components/sign-out-button";
import { SidebarLink } from "@/components/sidebar-link";
import { SidebarShell } from "@/components/sidebar-shell";
import { Badge } from "@/components/ui/badge";
import { adminRoleTone, adminRoleLabel } from "@/components/ui/status";
import { BotHealth } from "./_components/bot-health";

const NAV = [
  { href: "/admin", label: "Overview", icon: <SquaresFourIcon className="h-4 w-4" /> },
  { href: "/admin/members", label: "Members", icon: <UsersThreeIcon className="h-4 w-4" /> },
  { href: "/admin/giveaways", label: "Giveaways", icon: <GiftIcon className="h-4 w-4" /> },
  { href: "/admin/newsletters", label: "Newsletters", icon: <EnvelopeSimpleIcon className="h-4 w-4" /> },
  { href: "/admin/matches", label: "Matches", icon: <SoccerBallIcon className="h-4 w-4" /> },
  { href: "/admin/watch-parties", label: "Watch Parties", icon: <MapPinIcon className="h-4 w-4" /> },
  { href: "/admin/automations", label: "Automations", icon: <RobotIcon className="h-4 w-4" /> },
];

const SUPER_ADMIN_NAV = [
  { href: "/admin/admin-users", label: "Admin Users", icon: <ShieldCheckIcon className="h-4 w-4" /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  const nav = admin.role === "super_admin" ? [...NAV, ...SUPER_ADMIN_NAV] : [...NAV, ...SUPER_ADMIN_NAV];

  const logo = (
    <Link href="/admin" className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-arsenal-navy font-display text-xs text-arsenal-gold border border-arsenal-gold/30">
        AD
      </span>
      <span className="font-display text-sm tracking-wide text-foreground">ANC ADMIN</span>
    </Link>
  );

  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <SidebarShell logo={logo}>
        <div>
          {logo}
          <nav className="mt-7 flex flex-col gap-1">
            {nav.map((item) => (
              <SidebarLink key={item.href} {...item} />
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-t border-surface-border pt-4">
          <BotHealth />
          <div className="text-xs">
            <div className="flex items-center justify-between">
              <p className="font-bold text-foreground">{admin.displayName}</p>
              <Badge tone={adminRoleTone(admin.role)} size="sm">
                {adminRoleLabel(admin.role)}
              </Badge>
            </div>
            <p className="mt-0.5 truncate text-[11px] text-muted">{admin.email}</p>
            <div className="mt-3">
              <SignOutButton redirectTo="/admin/login" />
            </div>
          </div>
        </div>
      </SidebarShell>
      <main className="flex-1 px-6 py-9 sm:px-11">{children}</main>
    </div>
  );
}
