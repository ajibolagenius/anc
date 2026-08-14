import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/supabase/server-session";
import { SignOutButton } from "@/components/sign-out-button";
import { BotHealth } from "./_components/bot-health";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-full flex-1">
      <aside className="flex w-56 shrink-0 flex-col justify-between border-r border-surface-border px-5 py-6">
        <div>
          <Link href="/admin" className="font-display text-xl text-foreground">
            ANC Admin
          </Link>
          <nav className="mt-8 flex flex-col gap-1 text-sm">
            <Link
              href="/admin/members"
              className="rounded-lg px-3 py-2 text-foreground/90 transition-colors hover:bg-white/5"
            >
              Members
            </Link>
            <Link
              href="/admin/giveaways"
              className="rounded-lg px-3 py-2 text-foreground/90 transition-colors hover:bg-white/5"
            >
              Giveaways
            </Link>
            <Link
              href="/admin/newsletters"
              className="rounded-lg px-3 py-2 text-foreground/90 transition-colors hover:bg-white/5"
            >
              Newsletters
            </Link>
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
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
