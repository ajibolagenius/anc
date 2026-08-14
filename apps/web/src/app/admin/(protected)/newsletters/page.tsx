import Link from "next/link";
import { PlusIcon } from "@phosphor-icons/react/ssr";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { newsletterStatusTone } from "@/components/ui/status";

export default async function NewslettersPage() {
  const supabase = createServiceRoleClient();
  const { data: newsletters, error } = await supabase
    .from("newsletters")
    .select("id, subject, status, created_at, sent_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-foreground sm:text-4xl">NEWSLETTERS</h1>
          <p className="mt-1 text-sm text-muted">
            Send announcements, updates, and digests to approved members with live preview.
          </p>
        </div>

        <Link
          href="/admin/newsletters/new"
          className="flex h-10 items-center gap-2 rounded-full bg-arsenal-red px-5 text-xs font-bold text-white transition-colors hover:bg-arsenal-red-bright"
        >
          <PlusIcon className="h-4 w-4" />
          <span>New Newsletter</span>
        </Link>
      </div>

      {error && <p className="mt-6 text-xs text-arsenal-red-bright">{error.message}</p>}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-surface-border bg-surface shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-[11px] font-bold uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3.5">Subject</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Created</th>
              <th className="px-5 py-3.5 text-right">Sent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {newsletters?.map((n) => (
              <tr key={n.id} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-5 py-3.5 font-semibold text-foreground">
                  <Link href={`/admin/newsletters/${n.id}`} className="hover:text-arsenal-gold">
                    {n.subject}
                  </Link>
                </td>
                <td className="px-5 py-3.5">
                  <Badge tone={newsletterStatusTone(n.status as any)}>
                    {n.status.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-xs text-muted">
                  {new Date(n.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                </td>
                <td className="px-5 py-3.5 text-right text-xs text-muted">
                  {n.sent_at
                    ? new Date(n.sent_at).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {newsletters?.length === 0 && (
          <div className="p-10 text-center text-sm text-muted">
            No newsletters created yet. Click &quot;New Newsletter&quot; to draft one!
          </div>
        )}
      </div>
    </div>
  );
}
