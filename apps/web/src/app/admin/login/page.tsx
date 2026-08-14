"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircleIcon } from "@phosphor-icons/react/ssr";
import { createClient } from "@/lib/supabase/client";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingFooter } from "@/components/marketing-footer";
import { Spinner } from "@/components/ui/spinner";

export default function AdminLoginPage() {
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
      options: { emailRedirectTo: `${window.location.origin}/admin/auth/callback` },
    });

    if (signInError) {
      setStatus("error");
      setError(signInError.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-[400px] rounded-[20px] border border-arsenal-gold bg-surface p-9 text-center shadow-2xl">
          {/* AD Mark */}
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-arsenal-navy font-display text-base text-white">
            AD
          </div>

          <h1 className="mt-4 font-display text-[26px] tracking-wide text-foreground">ADMIN LOGIN</h1>
          <p className="mt-1.5 text-sm text-muted">Platform admin access only.</p>

          {status === "sent" ? (
            <div className="mt-7 flex flex-col items-center gap-2 rounded-xl border border-arsenal-gold/40 bg-arsenal-gold/10 p-4 text-center">
              <CheckCircleIcon weight="fill" className="h-6 w-6 text-arsenal-gold" />
              <p className="text-sm text-foreground">
                Check your email for the sign-in link.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4 text-left">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                  Admin Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@anc.community"
                  className="h-[46px] w-full rounded-[10px] border border-surface-border bg-white/5 px-4 text-sm text-foreground placeholder:text-muted/50 focus:border-arsenal-gold focus:outline-none"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-arsenal-red-bright/30 bg-arsenal-red-bright/10 p-2.5 text-xs text-arsenal-red-bright">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-1 flex h-[46px] w-full items-center justify-center gap-2 rounded-full bg-arsenal-navy text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {status === "sending" ? (
                  <>
                    <Spinner size="sm" />
                    <span>Sending…</span>
                  </>
                ) : (
                  "Send Magic Link"
                )}
              </button>
            </form>
          )}

          <div className="mt-7 border-t border-surface-border pt-5 text-xs text-muted">
            Member?{" "}
            <Link href="/login" className="font-medium text-foreground hover:text-arsenal-gold">
              Log in here
            </Link>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
