"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckIcon, ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import { JERSEY_SIZES, NIGERIAN_STATES } from "@anc/shared";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingFooter } from "@/components/marketing-footer";
import { SegmentedPills } from "@/components/ui/segmented-pills";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { registerMember, type RegisterState } from "./actions";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const initialState: RegisterState = { status: "idle" };

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerMember, initialState);

  if (state.status === "success") {
    return (
      <div className="flex min-h-screen flex-col">
        <MarketingHeader />

        <main className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="w-full max-w-[520px] rounded-2xl border border-surface-border bg-surface p-8 sm:p-10 text-center shadow-2xl">
            {/* Green Checkmark */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp-green/15 text-whatsapp-green">
              <CheckIcon weight="bold" className="h-7 w-7" />
            </div>

            <h1 className="mt-5 font-display text-[28px] tracking-wide text-foreground">YOU&apos;RE ON THE LIST</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              An admin reviews new registrations and assigns your activity tier. Once approved, your Digital Fan Pass
              and ANC number are generated automatically.
            </p>

            {/* 3-step timeline */}
            <div className="mt-8 rounded-xl border border-surface-border bg-black/20 p-5 text-left">
              <div className="flex flex-col gap-4 text-sm">
                <div className="flex items-start gap-3.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-arsenal-gold/20 font-display text-xs font-bold text-arsenal-gold">
                    1
                  </span>
                  <span className="text-foreground/90">Admin reviews your registration</span>
                </div>
                <div className="flex items-start gap-3.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-arsenal-gold/20 font-display text-xs font-bold text-arsenal-gold">
                    2
                  </span>
                  <span className="text-foreground/90">You&apos;re approved & assigned an ANC number</span>
                </div>
                <div className="flex items-start gap-3.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-arsenal-gold/20 font-display text-xs font-bold text-arsenal-gold">
                    3
                  </span>
                  <span className="text-foreground/90">Your Fan Pass is ready to share</span>
                </div>
              </div>
            </div>

            <Link
              href="/login"
              className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-arsenal-red text-sm font-bold text-white transition-colors hover:bg-arsenal-red-bright"
            >
              Go to Member Login
            </Link>
          </div>
        </main>

        <MarketingFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />

      <main className="mx-auto w-full max-w-[560px] flex-1 px-6 py-14 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </Link>

        <div className="mt-5">
          <h1 className="font-display text-[38px] tracking-wide text-foreground">JOIN ANC</h1>
          <p className="mt-1 text-sm text-muted">Registration takes about two minutes.</p>
        </div>

        {state.status === "error" && state.message && (
          <p className="mt-6 rounded-xl border border-arsenal-red-bright/40 bg-arsenal-red-bright/10 p-3 text-sm text-arsenal-red-bright">
            {state.message}
          </p>
        )}

        <form action={formAction} className="mt-7 flex flex-col gap-6">
          {/* Honeypot */}
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor="company_website">Company website</label>
            <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          {/* 1. ABOUT YOU */}
          <div className="rounded-2xl border border-surface-border bg-surface p-6 flex flex-col gap-4">
            <h2 className="font-display text-base tracking-wider text-arsenal-gold uppercase">ABOUT YOU</h2>

            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                required
                placeholder="Ifeoluwa Adebayo"
                className="h-[46px] w-full rounded-[10px] border border-surface-border bg-white/5 px-4 text-sm text-foreground placeholder:text-muted/40 focus:border-arsenal-gold focus:outline-none"
              />
              {state.fieldErrors?.fullName && (
                <p className="mt-1 text-xs text-arsenal-red-bright">{state.fieldErrors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="whatsappNumber" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                WhatsApp number
              </label>
              <div className="flex h-[46px] w-full items-center rounded-[10px] border border-surface-border bg-white/5 focus-within:border-arsenal-gold">
                <span className="flex h-full items-center px-3.5 text-sm font-semibold text-muted border-r border-surface-border">
                  +234
                </span>
                <input
                  id="whatsappNumber"
                  name="whatsappNumber"
                  required
                  placeholder="801 234 5678"
                  className="h-full flex-1 bg-transparent px-4 text-sm text-foreground placeholder:text-muted/40 focus:outline-none"
                />
              </div>
              {state.fieldErrors?.whatsappNumber && (
                <p className="mt-1 text-xs text-arsenal-red-bright">{state.fieldErrors.whatsappNumber}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="ife.adebayo@email.com"
                className="h-[46px] w-full rounded-[10px] border border-surface-border bg-white/5 px-4 text-sm text-foreground placeholder:text-muted/40 focus:border-arsenal-gold focus:outline-none"
              />
              {state.fieldErrors?.email && (
                <p className="mt-1 text-xs text-arsenal-red-bright">{state.fieldErrors.email}</p>
              )}
            </div>
          </div>

          {/* 2. NIGERIA */}
          <div className="rounded-2xl border border-surface-border bg-surface p-6 flex flex-col gap-4">
            <h2 className="font-display text-base tracking-wider text-arsenal-gold uppercase">NIGERIA</h2>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Birthday (day & month only)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  id="birthdayDay"
                  name="birthdayDay"
                  required
                  defaultValue=""
                  className="h-[46px] w-full appearance-none rounded-[10px] border border-surface-border bg-white/5 px-4 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
                >
                  <option value="" disabled className="bg-arsenal-navy-deep text-muted">Day</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d} className="bg-arsenal-navy-deep text-foreground">{d}</option>
                  ))}
                </select>
                <select
                  id="birthdayMonth"
                  name="birthdayMonth"
                  required
                  defaultValue=""
                  className="h-[46px] w-full appearance-none rounded-[10px] border border-surface-border bg-white/5 px-4 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
                >
                  <option value="" disabled className="bg-arsenal-navy-deep text-muted">Month</option>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1} className="bg-arsenal-navy-deep text-foreground">{m}</option>
                  ))}
                </select>
              </div>
              {(state.fieldErrors?.birthdayDay || state.fieldErrors?.birthdayMonth) && (
                <p className="mt-1 text-xs text-arsenal-red-bright">Please provide a valid day and month.</p>
              )}
            </div>

            <div>
              <label htmlFor="stateOfResidence" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                State of residence
              </label>
              <select
                id="stateOfResidence"
                name="stateOfResidence"
                required
                defaultValue=""
                className="h-[46px] w-full appearance-none rounded-[10px] border border-surface-border bg-white/5 px-4 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
              >
                <option value="" disabled className="bg-arsenal-navy-deep text-muted">Select state</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s} className="bg-arsenal-navy-deep text-foreground">{s}</option>
                ))}
              </select>
              <p className="mt-1 text-[11.5px] text-muted">Used to match you to watch parties nearby.</p>
              {state.fieldErrors?.stateOfResidence && (
                <p className="mt-1 text-xs text-arsenal-red-bright">{state.fieldErrors.stateOfResidence}</p>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="stateOfOrigin" className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                  State of origin
                </label>
                <span className="text-[11px] text-muted/60">optional</span>
              </div>
              <select
                id="stateOfOrigin"
                name="stateOfOrigin"
                defaultValue=""
                className="h-[46px] w-full appearance-none rounded-[10px] border border-surface-border bg-white/5 px-4 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
              >
                <option value="" className="bg-arsenal-navy-deep text-muted">Select state (optional)</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s} className="bg-arsenal-navy-deep text-foreground">{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. ARSENAL SIDE */}
          <div className="rounded-2xl border border-surface-border bg-surface p-6 flex flex-col gap-4">
            <h2 className="font-display text-base tracking-wider text-arsenal-gold uppercase">ARSENAL SIDE</h2>

            <div>
              <label htmlFor="favoritePlayerCurrent" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Favourite current player
              </label>
              <input
                id="favoritePlayerCurrent"
                name="favoritePlayerCurrent"
                placeholder="Bukayo Saka"
                className="h-[46px] w-full rounded-[10px] border border-surface-border bg-white/5 px-4 text-sm text-foreground placeholder:text-muted/40 focus:border-arsenal-gold focus:outline-none"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="favoritePlayerAlltime" className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                  Favourite all-time player
                </label>
                <span className="text-[11px] text-muted/60">optional</span>
              </div>
              <input
                id="favoritePlayerAlltime"
                name="favoritePlayerAlltime"
                placeholder="e.g. Thierry Henry"
                className="h-[46px] w-full rounded-[10px] border border-surface-border bg-white/5 px-4 text-sm text-foreground placeholder:text-muted/40 focus:border-arsenal-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                Jersey size
              </label>
              <SegmentedPills
                name="jerseySize"
                defaultValue="M"
                options={JERSEY_SIZES.map((size) => ({ value: size, label: size }))}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="selfReportedTier" className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                  Activity in group
                </label>
                <span className="text-[11px] text-muted/60">optional</span>
              </div>
              <select
                id="selfReportedTier"
                name="selfReportedTier"
                defaultValue=""
                className="h-[46px] w-full appearance-none rounded-[10px] border border-surface-border bg-white/5 px-4 text-sm text-foreground focus:border-arsenal-gold focus:outline-none"
              >
                <option value="" className="bg-arsenal-navy-deep text-muted">Prefer not to say</option>
                <option value="active" className="bg-arsenal-navy-deep text-foreground">Very active</option>
                <option value="semi_active" className="bg-arsenal-navy-deep text-foreground">Semi-active</option>
                <option value="inactive" className="bg-arsenal-navy-deep text-foreground">Mostly a lurker</option>
              </select>
            </div>

            <div className="pt-2">
              <Checkbox
                id="consentGiven"
                name="consentGiven"
                required
                label={
                  <span className="text-xs leading-relaxed text-muted">
                    I agree to ANC storing my info per the{" "}
                    <Link href="/privacy" target="_blank" className="text-foreground underline hover:text-arsenal-gold">
                      privacy notice
                    </Link>{" "}
                    (NDPR).
                  </span>
                }
              />
              {state.fieldErrors?.consentGiven && (
                <p className="mt-1 text-xs text-arsenal-red-bright">{state.fieldErrors.consentGiven}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-arsenal-red text-base font-bold text-white transition-colors hover:bg-arsenal-red-bright disabled:opacity-60"
          >
            {pending ? (
              <>
                <Spinner size="sm" />
                <span>Registering…</span>
              </>
            ) : (
              "Register"
            )}
          </button>

          <p className="text-center text-xs text-muted">
            Already a member?{" "}
            <Link href="/login" className="font-medium text-foreground hover:text-arsenal-gold">
              Log in with magic link
            </Link>
          </p>
        </form>
      </main>

      <MarketingFooter />
    </div>
  );
}
