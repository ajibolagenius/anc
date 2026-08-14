import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/supabase/server-session";
import { SignOutButton } from "@/components/sign-out-button";
import { SidebarLink } from "@/components/sidebar-link";
import { SidebarShell } from "@/components/sidebar-shell";
import { UsersIcon, GiftIcon, MailIcon, CalendarIcon, MapPinIcon, ActivityIcon, ShieldIcon } from "@/components/icons";
import { BotHealth } from "./_components/bot-health";

const NAV = [
  { href: "/admin/members", label: "Members", icon: <UsersIcon className="h-4 w-4" /> },
  { href: "/admin/giveaways", label: "Giveaways", icon: <GiftIcon className="h-4 w-4" /> },
  { href: "/admin/newsletters", label: "Newsletters", icon: <MailIcon className="h-4 w-4" /> },
  { href: "/admin/matches", label: "Matches", icon: <CalendarIcon className="h-4 w-4" /> },
  { href: "/admin/watch-parties", label: "Watch Parties", icon: <MapPinIcon className="h-4 w-4" /> },
  { href: "/admin/automations", label: "Automations", icon: <ActivityIcon className="h-4 w-4" /> },
];

const SUPER_ADMIN_NAV = [
  { href: "/admin/admin-users", label: "Admin Users", icon: <ShieldIcon className="h-4 w-4" /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  const nav = admin.role === "super_admin" ? [...NAV, ...SUPER_ADMIN_NAV] : NAV;

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <SidebarShell logo={<Link href="/admin" className="font-display text-xl text-foreground">ANC Admin</Link>}>
        <div>
          <Link href="/admin" className="font-display text-xl text-foreground">
            ANC Admin
          </Link>
          <nav className="mt-8 flex flex-col gap-1">
            {nav.map((item) => (
              <SidebarLink key={item.href} {...item} />
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-4">
          <BotHealth />
          <div className="border-t border-surface-border pt-4 text-xs text-muted">
            <p className="text-foreground/80">{admin.displayName}</p>
            <p>{admin.email}</p>
            <div className="mt-2">
              <SignOutButton redirectTo="/admin/login" />
            </div>
          </div>
        </div>
      </SidebarShell>
      <main className="flex-1 px-6 py-8 sm:px-8">{children}</main>
    </div>
  );
}
