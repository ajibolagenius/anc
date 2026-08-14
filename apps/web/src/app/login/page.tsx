"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircleIcon } from "@phosphor-icons/react/ssr";
import { createClient } from "@/lib/supabase/client";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingFooter } from "@/components/marketing-footer";
import { Button } from "@/components/ui/button";

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
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-[400px] rounded-[20px] border border-surface-border bg-surface p-9 text-center shadow-2xl">
          {/* AN Mark */}
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-arsenal-red font-display text-base text-white">
            AN
          </div>

          <h1 className="mt-4 font-display text-[26px] tracking-wide text-foreground">MEMBER LOGIN</h1>
          <p className="mt-1.5 text-sm text-muted">We&apos;ll email you a magic sign-in link.</p>

          {status === "sent" ? (
            <div className="mt-7 flex flex-col items-center gap-2 rounded-xl border border-whatsapp-green/40 bg-whatsapp-green/10 p-4 text-center">
              <CheckCircleIcon weight="fill" className="h-6 w-6 text-whatsapp-green" />
              <p className="text-sm text-foreground">
                Check your email — link sent to <span className="font-semibold text-white">{email}</span>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4 text-left">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ife.adebayo@email.com"
                  className="h-[46px] w-full rounded-[10px] border border-surface-border bg-white/5 px-4 text-sm text-foreground placeholder:text-muted/50 focus:border-arsenal-gold focus:outline-none"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-arsenal-red-bright/30 bg-arsenal-red-bright/10 p-2.5 text-xs text-arsenal-red-bright">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                pending={status === "sending"}
                disabled={status === "sending"}
                className="mt-1 h-[46px] w-full rounded-full"
              >
                Send Magic Link
              </Button>
            </form>
          )}

          <div className="mt-7 flex flex-col gap-2 border-t border-surface-border pt-5 text-xs text-muted">
            <div>
              Admin?{" "}
              <Link href="/admin/login" className="font-medium text-foreground hover:text-arsenal-gold">
                Log in here
              </Link>
            </div>
            <div>
              Not a member yet?{" "}
              <Link href="/register" className="font-medium text-foreground hover:text-arsenal-gold">
                Get your Fan Pass
              </Link>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
