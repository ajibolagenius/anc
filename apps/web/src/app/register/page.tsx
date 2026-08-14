"use client";

import { useActionState } from "react";
import Link from "next/link";
import { JERSEY_SIZES, NIGERIAN_STATES } from "@anc/shared";
import { FormField, inputClassName } from "@/components/form-field";
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
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="font-display text-4xl text-foreground">Welcome to ANC 🔴</h1>
        <p className="mt-4 text-muted">{state.message}</p>
        <Link
          href="/"
          className="mt-8 rounded-full border border-surface-border px-6 py-3 text-sm text-foreground transition-colors hover:border-arsenal-gold"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 sm:px-10">
      <Link href="/" className="text-sm text-muted hover:text-foreground">
        &larr; Back
      </Link>

      <h1 className="mt-6 font-display text-5xl text-foreground">Get your Fan Pass</h1>
      <p className="mt-3 max-w-lg text-sm text-muted">
        Register once — an admin reviews new members, then you'll get your ANC
        number, birthday shoutouts, and access to giveaways and predictions.
      </p>

      {state.status === "error" && state.message && (
        <p className="mt-6 rounded-lg border border-arsenal-red/40 bg-arsenal-red/10 px-4 py-3 text-sm text-arsenal-red-bright">
          {state.message}
        </p>
      )}

      <form action={formAction} className="mt-8 flex flex-col gap-6">
        {/* Honeypot — hidden from real users via CSS, not display:none (some bots skip those) */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label htmlFor="company_website">Company website</label>
          <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <FormField label="Full name" htmlFor="fullName" error={state.fieldErrors?.fullName}>
          <input id="fullName" name="fullName" required className={inputClassName} placeholder="Chidi Okafor" />
        </FormField>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="WhatsApp number" htmlFor="whatsappNumber" error={state.fieldErrors?.whatsappNumber}>
            <input
              id="whatsappNumber"
              name="whatsappNumber"
              required
              className={inputClassName}
              placeholder="+234 801 234 5678"
            />
          </FormField>
          <FormField label="Email" htmlFor="email" error={state.fieldErrors?.email}>
            <input id="email" name="email" type="email" required className={inputClassName} placeholder="you@example.com" />
          </FormField>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="Birthday — day" htmlFor="birthdayDay" error={state.fieldErrors?.birthdayDay}>
            <select id="birthdayDay" name="birthdayDay" required defaultValue="" className={inputClassName}>
              <option value="" disabled>Day</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Birthday — month" htmlFor="birthdayMonth" error={state.fieldErrors?.birthdayMonth}>
            <select id="birthdayMonth" name="birthdayMonth" required defaultValue="" className={inputClassName}>
              <option value="" disabled>Month</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="State of residence" htmlFor="stateOfResidence" error={state.fieldErrors?.stateOfResidence}>
            <select id="stateOfResidence" name="stateOfResidence" required defaultValue="" className={inputClassName}>
              <option value="" disabled>Select a state</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </FormField>
          <FormField label="State of origin" htmlFor="stateOfOrigin" optional>
            <select id="stateOfOrigin" name="stateOfOrigin" defaultValue="" className={inputClassName}>
              <option value="">Select a state</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="Favorite current player" htmlFor="favoritePlayerCurrent" optional>
            <input id="favoritePlayerCurrent" name="favoritePlayerCurrent" className={inputClassName} placeholder="Bukayo Saka" />
          </FormField>
          <FormField label="Favorite all-time player" htmlFor="favoritePlayerAlltime" optional>
            <input id="favoritePlayerAlltime" name="favoritePlayerAlltime" className={inputClassName} placeholder="Thierry Henry" />
          </FormField>
        </div>

        <FormField label="Jersey size" htmlFor="jerseySize" optional>
          <select id="jerseySize" name="jerseySize" defaultValue="" className={inputClassName}>
            <option value="">For giveaway readiness — pick one</option>
            {JERSEY_SIZES.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </FormField>

        <FormField label="How active are you in the group?" htmlFor="selfReportedTier" optional>
          <select id="selfReportedTier" name="selfReportedTier" defaultValue="" className={inputClassName}>
            <option value="">Prefer not to say</option>
            <option value="active">Very active</option>
            <option value="semi_active">Semi-active</option>
            <option value="inactive">Mostly a lurker</option>
          </select>
        </FormField>

        <label htmlFor="consentGiven" className="flex items-start gap-3 text-sm text-muted">
          <input
            id="consentGiven"
            name="consentGiven"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-surface-border bg-background"
          />
          <span>
            I consent to ANC storing my details above to manage my membership,
            send me birthday wishes, and run giveaways, per the{" "}
            <a href="/privacy" target="_blank" rel="noreferrer" className="text-foreground underline hover:text-arsenal-gold">
              privacy notice
            </a>
            . I can delete this data at any time from my member portal.
          </span>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-full bg-arsenal-red px-7 py-3.5 text-base font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
        >
          {pending ? "Submitting…" : "Register"}
        </button>
      </form>
    </div>
  );
}
