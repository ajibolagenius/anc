"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await createClient().auth.signOut();
        router.push(redirectTo);
        router.refresh();
      }}
      className="text-sm text-muted hover:text-foreground"
    >
      Sign out
    </button>
  );
}
