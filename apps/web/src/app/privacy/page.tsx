import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingFooter } from "@/components/marketing-footer";

const SECTIONS = [
  {
    title: "What we collect",
    body: "Name, WhatsApp number, email, birth day & month (no year), state of residence and origin, jersey size, and your favourite current and all-time players.",
  },
  {
    title: "Why we collect it",
    body: "To run the fan registry, Digital Fan Pass, birthday shoutouts, giveaways, matchday predictions, and local watch-party matching.",
  },
  {
    title: "Your consent",
    body: "Given explicitly at registration and revocable at any time from your member portal Settings.",
  },
  {
    title: "Deletion",
    body: "Request deletion at any time — your personal record is fully and permanently removed per our NDPR deletion policy.",
  },
  {
    title: "Contact",
    body: "Reach any admin in the ANC WhatsApp group or via your member portal for any data inquiry or request.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />

      <main className="mx-auto w-full max-w-[720px] flex-1 px-6 py-14 sm:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to home
        </Link>

        <div className="mt-6">
          <h1 className="font-display text-4xl tracking-wide text-foreground sm:text-5xl">PRIVACY NOTICE</h1>
          <p className="mt-1.5 text-sm text-muted">NDPR-aligned · last reviewed Aug 2026</p>
        </div>

        <div className="mt-8 rounded-2xl border border-surface-border bg-surface p-6 sm:p-8">
          <div className="flex flex-col gap-6">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="text-sm font-bold uppercase tracking-[0.04em] text-foreground">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
