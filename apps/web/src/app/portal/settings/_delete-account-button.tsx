"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { deleteMyAccount } from "./actions";

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded-full border border-arsenal-red-bright px-5 py-2 text-sm text-arsenal-red-bright hover:bg-arsenal-red-bright/10"
      >
        Delete my account
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-arsenal-red-bright">
        This permanently removes your name, WhatsApp number, email, and birthday from ANC, and signs you out for
        good. Past predictions and giveaway wins stay in the record but are no longer linked to you. This can't be
        undone — are you sure?
      </p>
      {error && <p className="text-xs text-arsenal-red-bright">{error}</p>}
      <div className="flex gap-3">
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              try {
                await deleteMyAccount();
                await createClient().auth.signOut();
                router.push("/");
                router.refresh();
              } catch (err) {
                setError((err as Error).message);
              }
            })
          }
          className="rounded-full bg-arsenal-red-bright px-5 py-2 text-sm font-medium text-white hover:scale-[1.02] disabled:opacity-50"
        >
          {pending ? "Deleting…" : "Yes, delete everything"}
        </button>
        <button onClick={() => setConfirming(false)} disabled={pending} className="text-sm text-muted hover:text-foreground">
          Cancel
        </button>
      </div>
    </div>
  );
}
