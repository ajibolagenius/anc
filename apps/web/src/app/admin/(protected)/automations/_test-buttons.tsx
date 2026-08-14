"use client";

import { useState, useTransition } from "react";
import { testSendBirthdays, testSendNewsDigest } from "./actions";

export function AutomationTestButtons() {
  const [birthdayResult, setBirthdayResult] = useState<unknown>(null);
  const [digestResult, setDigestResult] = useState<unknown>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-6 flex flex-col gap-4 rounded-xl border border-surface-border p-5 max-w-2xl">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => startTransition(async () => setBirthdayResult(await testSendBirthdays()))}
          disabled={pending}
          className="rounded-full bg-arsenal-red px-5 py-2 text-sm font-medium text-white hover:scale-[1.02] disabled:opacity-50"
        >
          Send birthdays now
        </button>
        <button
          onClick={() => startTransition(async () => setDigestResult(await testSendNewsDigest()))}
          disabled={pending}
          className="rounded-full bg-arsenal-navy px-5 py-2 text-sm font-medium text-white hover:scale-[1.02] disabled:opacity-50"
        >
          Send news digest now
        </button>
      </div>
      {birthdayResult ? (
        <pre className="overflow-x-auto rounded-lg bg-background/60 p-3 text-xs text-muted">{JSON.stringify(birthdayResult, null, 2)}</pre>
      ) : null}
      {digestResult ? (
        <pre className="overflow-x-auto rounded-lg bg-background/60 p-3 text-xs text-muted">{JSON.stringify(digestResult, null, 2)}</pre>
      ) : null}
    </div>
  );
}
