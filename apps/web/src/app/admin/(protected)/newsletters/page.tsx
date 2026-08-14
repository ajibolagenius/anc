import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/server";

export default async function NewslettersPage() {
  const supabase = createServiceRoleClient();
  const { data: newsletters, error } = await supabase
    .from("newsletters")
    .select("id, subject, status, created_at, sent_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-foreground">Newsletters</h1>
        <Link
          href="/admin/newsletters/new"
          className="rounded-full bg-arsenal-red px-5 py-2.5 text-sm font-medium text-white hover:scale-[1.02]"
        >
          New newsletter
        </Link>
      </div>

      {error && <p className="mt-6 text-sm text-arsenal-red-bright">{error.message}</p>}

      <div className="mt-8 overflow-x-auto rounded-xl border border-surface-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Sent</th>
            </tr>
          </thead>
          <tbody>
            {newsletters?.map((n) => (
              <tr key={n.id} className="border-b border-surface-border/60 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/newsletters/${n.id}`} className="text-foreground hover:text-arsenal-gold">
                    {n.subject}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted capitalize">{n.status}</td>
                <td className="px-4 py-3 text-muted">{new Date(n.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-muted">{n.sent_at ? new Date(n.sent_at).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {newsletters?.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted">No newsletters yet — create the first one.</p>
        )}
      </div>
    </div>
  );
}
