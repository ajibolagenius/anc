"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { inputClassName } from "@/components/form-field";

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
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-6 py-24">
      <h1 className="font-display text-4xl text-foreground">Member sign-in</h1>
      <p className="mt-2 text-center text-sm text-muted">
        Use the email you registered your Fan Pass with.
      </p>

      {status === "sent" ? (
        <p className="mt-6 text-center text-sm text-muted">
          Check <span className="text-foreground">{email}</span> for a sign-in link.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex w-full flex-col gap-4">
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
  );
}
