import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, PaperPlaneTiltIcon } from "@phosphor-icons/react/ssr";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/supabase/server-session";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ConfirmSubmitButton } from "@/components/ui/confirm-dialog";
import { newsletterStatusTone } from "@/components/ui/status";
import { sendNewsletter } from "./actions";

export default async function NewsletterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = await getAdminSession();
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

  const canSend = (newsletter.status === "draft" || newsletter.status === "failed") && admin?.role === "super_admin";

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/admin/newsletters"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        All Newsletters
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-foreground sm:text-4xl">
            {newsletter.subject.toUpperCase()}
          </h1>
          <p className="mt-1 text-xs text-muted">
            Audience: {filter.activity_tier ?? "all tiers"}, {filter.state_of_residence ?? "all states"} ·{" "}
            {audienceCount ?? 0} approved member(s) match
          </p>
        </div>

        <Badge tone={newsletterStatusTone(newsletter.status as any)}>
          {newsletter.status.toUpperCase()}
        </Badge>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Left Column: Email Preview */}
        <div>
          <h2 className="mb-3 font-display text-xl tracking-wide text-foreground">EMAIL PREVIEW</h2>
          <div className="overflow-hidden rounded-2xl border border-white/20 bg-white p-6 text-[#14171c] shadow-2xl">
            <div
              className="prose max-w-none text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: newsletter.body_html }}
            />
          </div>
        </div>

        {/* Right Column: Delivery & Send Controls */}
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="mb-3 font-display text-xl tracking-wide text-foreground">DELIVERY STATUS</h2>
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">SENT</p>
                <p className="mt-1 font-display text-2xl text-whatsapp-green">{deliveryCounts.sent ?? 0}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">FAILED</p>
                <p className="mt-1 font-display text-2xl text-arsenal-red-bright">{deliveryCounts.failed ?? 0}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">QUEUED</p>
                <p className="mt-1 font-display text-2xl text-arsenal-gold">{deliveryCounts.queued ?? 0}</p>
              </Card>
            </div>
          </div>

          {canSend && (
            <div className="rounded-2xl border border-surface-border bg-surface p-6">
              <div className="flex items-center gap-2">
                <PaperPlaneTiltIcon className="h-5 w-5 text-arsenal-gold" />
                <h3 className="font-display text-lg text-foreground">SEND TO AUDIENCE</h3>
              </div>
              <p className="mt-1 text-xs text-muted">
                Broadcast this message immediately to {audienceCount ?? 0} matching approved members.
              </p>

              <form action={sendNewsletter} className="mt-4">
                <input type="hidden" name="newsletterId" value={id} />
                <ConfirmSubmitButton
                  kind="send-newsletter"
                  variant="primary"
                  className="h-11 w-full rounded-xl"
                  overrides={{
                    body: `This immediately emails ${audienceCount ?? 0} matched recipients. There is no undo once sending starts.`,
                  }}
                >
                  {newsletter.status === "failed" ? "Retry Send Now" : "Send Newsletter Now"}
                </ConfirmSubmitButton>
              </form>
            </div>
          )}

          {deliveries && deliveries.length > 0 && (
            <div>
              <h2 className="mb-3 font-display text-xl tracking-wide text-foreground">
                DELIVERY RECIPIENTS ({deliveries.length})
              </h2>
              <div className="max-h-72 overflow-y-auto rounded-2xl border border-surface-border bg-surface shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 border-b border-surface-border bg-surface text-[10px] font-bold uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-4 py-2.5">Email</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {deliveries.map((d) => (
                      <tr key={d.id}>
                        <td className="px-4 py-2.5 font-medium text-foreground">{d.email}</td>
                        <td className="px-4 py-2.5">
                          <span
                            className={
                              d.status === "sent"
                                ? "text-whatsapp-green font-semibold"
                                : d.status === "failed"
                                ? "text-arsenal-red-bright font-semibold"
                                : "text-muted"
                            }
                          >
                            {d.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-muted">{d.error ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
