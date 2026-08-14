import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendNewsletter } from "./actions";

export default async function NewsletterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: newsletter } = await supabase.from("newsletters").select("*").eq("id", id).single();
  if (!newsletter) notFound();

  const filter = (newsletter.audience_filter ?? {}) as Record<string, string>;
  let audienceQuery = supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("registration_status", "approved");
  if (filter.activity_tier) audienceQuery = audienceQuery.eq("activity_tier", filter.activity_tier);
  if (filter.state_of_residence) audienceQuery = audienceQuery.eq("state_of_residence", filter.state_of_residence);
  const { count: audienceCount } = await audienceQuery;

  const { data: deliveries } = await supabase
    .from("newsletter_deliveries")
    .select("id, email, status, error, sent_at")
    .eq("newsletter_id", id)
    .order("sent_at", { ascending: false });

  const deliveryCounts = (deliveries ?? []).reduce(
    (acc, d) => {
      acc[d.status] = (acc[d.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const canSend = newsletter.status === "draft" || newsletter.status === "failed";

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-display text-3xl text-foreground">{newsletter.subject}</h1>
        <span className="shrink-0 rounded-full border border-surface-border px-3 py-1 text-xs capitalize text-foreground">
          {newsletter.status}
        </span>
      </div>

      <p className="mt-2 text-xs text-muted">
        Audience: {filter.activity_tier ?? "all tiers"}, {filter.state_of_residence ?? "all states"} &middot;{" "}
        {audienceCount ?? 0} approved member(s) match right now
      </p>

      {newsletter.also_post_to_whatsapp && (
        <p className="mt-1 text-xs text-muted">
          Also posts to WhatsApp: <span className="text-foreground/80">{newsletter.whatsapp_summary_text}</span>
        </p>
      )}

      {/* Rendered on a white background deliberately — this previews what the
          email actually looks like in an inbox, not the admin dashboard's dark theme. */}
      <div
        className="mt-6 overflow-hidden rounded-2xl border border-surface-border bg-white"
        dangerouslySetInnerHTML={{ __html: newsletter.body_html }}
      />

      {canSend && (
        <form action={sendNewsletter} className="mt-6">
          <input type="hidden" name="newsletterId" value={id} />
          <button
            type="submit"
            className="rounded-full bg-arsenal-red px-6 py-3 text-sm font-medium text-white hover:scale-[1.02]"
          >
            {newsletter.status === "failed" ? "Retry send" : "Send now"}
          </button>
        </form>
      )}

      {deliveries && deliveries.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl text-foreground">
            Deliveries{" "}
            <span className="text-sm font-normal text-muted">
              ({deliveryCounts.sent ?? 0} sent, {deliveryCounts.failed ?? 0} failed, {deliveryCounts.queued ?? 0} queued)
            </span>
          </h2>
          <div className="mt-3 max-h-96 overflow-y-auto rounded-2xl border border-surface-border">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 border-b border-surface-border bg-background text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id} className="border-b border-surface-border/60 last:border-0">
                    <td className="px-4 py-2 text-foreground">{d.email}</td>
                    <td className="px-4 py-2 capitalize">
                      <span
                        className={
                          d.status === "sent"
                            ? "text-whatsapp-green"
                            : d.status === "failed"
                              ? "text-arsenal-red-bright"
                              : "text-muted"
                        }
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-muted">{d.error ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
