"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { inputClassName } from "@/components/form-field";
import { ChatIcon } from "@/components/icons";

export default function MemberLoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (signInError) {
      setStatus("error");
      setError(signInError.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24">
      <div
        className="pointer-events-none absolute inset-0 -z-10 texture-dots [mask-image:radial-gradient(ellipse_50%_50%_at_50%_30%,black,transparent)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-arsenal-red/15 blur-3xl" aria-hidden />

      <Link href="/" className="mb-8 font-display text-2xl tracking-wide text-foreground">
        ANC
      </Link>

      <div className="w-full max-w-sm rounded-3xl border border-surface-border bg-surface/60 p-8 text-center">
        <div className="icon-spotlight mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-whatsapp-green/15">
          <ChatIcon className="h-6 w-6 text-whatsapp-green" />
        </div>
        <h1 className="mt-5 font-display text-3xl text-foreground">Member sign-in</h1>
        <p className="mt-2 text-sm text-muted">Use the email you registered your Fan Pass with.</p>

        {status === "sent" ? (
          <p className="mt-8 text-sm text-muted">
            Check <span className="text-foreground">{email}</span> for a sign-in link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex w-full flex-col gap-4 text-left">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClassName}
            />
            {error && <p className="text-xs text-arsenal-red-bright">{error}</p>}
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-full bg-arsenal-red px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send magic link"}
            </button>
          </form>
        )}
      </div>

      <p className="mt-6 text-sm text-muted">
        Not a member yet?{" "}
        <Link href="/register" className="text-foreground underline hover:text-arsenal-gold">
          Get your Fan Pass
        </Link>
      </p>
    </div>
  );
}
