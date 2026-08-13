"use client";

import { useEffect, useState } from "react";

type HealthResponse = {
  reachable: boolean;
  connection?: "connecting" | "open" | "close";
  reason?: string;
};

export function BotHealth() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/admin/bot-health", { cache: "no-store" });
        const data = (await res.json()) as HealthResponse;
        if (!cancelled) setHealth(data);
      } catch {
        if (!cancelled) setHealth({ reachable: false });
      }
    }

    poll();
    const interval = setInterval(poll, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const connected = health?.reachable && health.connection === "open";
  const label = !health
    ? "Checking bot…"
    : connected
      ? "Bot connected"
      : health.reachable
        ? "Bot not paired"
        : "Bot offline";

  return (
    <div className="flex items-center gap-2 text-xs text-muted">
      <span
        className={`h-2 w-2 rounded-full ${connected ? "bg-whatsapp-green" : "bg-arsenal-red-bright"}`}
      />
      {label}
    </div>
  );
}
