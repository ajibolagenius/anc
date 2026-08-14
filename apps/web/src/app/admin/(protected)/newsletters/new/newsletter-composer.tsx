"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import { ACTIVITY_TIERS, NIGERIAN_STATES } from "@anc/shared";
import { Toggle } from "@/components/ui/toggle";
import { createNewsletter } from "../actions";

export function NewsletterComposer() {
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [alsoPostToWhatsApp, setAlsoPostToWhatsApp] = useState(false);
  const [whatsappSummary, setWhatsappSummary] = useState("");

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/admin/newsletters"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        All Newsletters
      </Link>

      <div className="mt-4">
        <h1 className="font-display text-3xl tracking-wide text-foreground sm:text-4xl">COMPOSE NEWSLETTER</h1>
        <p className="mt-1 text-sm text-muted">
          Draft an announcement for approved members with real-time email preview.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Left Column: Compose Form */}
        <div className="rounded-2xl border border-surface-border bg-surface p-6 sm:p-7 shadow-xl">
          <form action={createNewsletter} className="flex flex-col gap-5">
            <div>
              <label htmlFor="subject" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Subject Line
              </label>
              <input
                id="subject"
                name="subject"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. This Month at ANC — Matchday Screening & Kit Raffles"
                className="h-11 w-full rounded-xl border border-surface-border bg-white/5 px-4 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="tier" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                  Audience Tier
                </label>
                <select
                  id="tier"
                  name="tier"
                  defaultValue=""
                  className="h-11 w-full rounded-xl border border-surface-border bg-white/5 px-3 text-xs text-foreground focus:border-arsenal-gold focus:outline-none"
                >
                  <option value="" className="bg-arsenal-navy-deep text-muted">All approved members</option>
                  {ACTIVITY_TIERS.filter((t) => t !== "pending").map((t) => (
                    <option key={t} value={t} className="bg-arsenal-navy-deep text-foreground">
                      {t.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="state" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                  Audience State
                </label>
                <select
                  id="state"
                  name="state"
                  defaultValue=""
                  className="h-11 w-full rounded-xl border border-surface-border bg-white/5 px-3 text-xs text-foreground focus:border-arsenal-gold focus:outline-none"
                >
                  <option value="" className="bg-arsenal-navy-deep text-muted">All states</option>
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s} className="bg-arsenal-navy-deep text-foreground">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="bodyText" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Body Content (Plain text)
              </label>
              <textarea
                id="bodyText"
                name="bodyText"
                required
                rows={10}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder={"Hey Gunners,\n\nHere's the latest update from the community..."}
                className="w-full rounded-xl border border-surface-border bg-white/5 p-4 text-sm text-foreground focus:border-arsenal-gold focus:outline-none leading-relaxed"
              />
            </div>

            {/* WhatsApp Summary Toggle */}
            <div className="rounded-xl border border-surface-border bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Also post summary to WhatsApp</span>
                <Toggle
                  checked={alsoPostToWhatsApp}
                  onChange={(e) => setAlsoPostToWhatsApp(e.target.checked)}
                />
              </div>
              <input type="hidden" name="alsoPostToWhatsapp" value={alsoPostToWhatsApp ? "on" : "off"} />

              {alsoPostToWhatsApp && (
                <div className="mt-3">
                  <textarea
                    name="whatsappSummaryText"
                    rows={2}
                    value={whatsappSummary}
                    onChange={(e) => setWhatsappSummary(e.target.value)}
                    placeholder="Short 1-2 sentence snippet formatted for WhatsApp broadcast…"
                    className="w-full rounded-lg border border-surface-border bg-white/5 p-3 text-xs text-foreground focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="mt-2 flex items-center gap-3">
              <button
                type="submit"
                className="flex h-11 items-center justify-center rounded-xl bg-arsenal-red px-6 text-sm font-bold text-white transition-colors hover:bg-arsenal-red-bright"
              >
                Save Draft &amp; Preview
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Email Preview */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl tracking-wide text-foreground">LIVE EMAIL PREVIEW</h2>
            <span className="text-[11px] font-bold text-arsenal-gold uppercase tracking-wider">Inbox View</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/20 bg-white p-6 text-[#14171c] shadow-2xl">
            {/* Email Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#db0007] font-display text-xs font-bold text-white">
                  AN
                </span>
                <span className="font-display text-base tracking-wider text-[#db0007]">
                  ARSENAL NIGERIA COMMUNITY
                </span>
              </div>
              <span className="text-[10px] text-gray-400">Newsletter</span>
            </div>

            {/* Email Subject & Meta */}
            <div className="mt-4 border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {subject || "Subject will appear here…"}
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">From: Arsenal Nigeria Community (info@anc.community)</p>
            </div>

            {/* Email Body */}
            <div className="mt-5 min-h-[220px] whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
              {bodyText ? (
                bodyText
              ) : (
                <span className="italic text-gray-400">Type in the form on the left to see live preview…</span>
              )}
            </div>

            {/* Email Footer */}
            <div className="mt-8 border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
              <p className="font-semibold text-gray-700">Arsenal Nigeria Community</p>
              <p className="mt-1 text-[11px] text-gray-400">
                You received this email as an approved member of ANC.
              </p>
              <p className="mt-2 text-[10px] text-gray-400 italic">Built with love by Ajibola Don_Genius</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
