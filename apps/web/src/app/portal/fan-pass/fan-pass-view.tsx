"use client";

import { useState } from "react";
import { DownloadSimpleIcon, ShareNetworkIcon, CheckIcon } from "@phosphor-icons/react/ssr";
import { SegmentedPills } from "@/components/ui/segmented-pills";
import { useToast } from "@/components/ui/toast";

export type FanPassMemberData = {
  fullName: string;
  ancNumber: string;
  stateOfResidence: string;
  activityTier: string;
  favoritePlayerCurrent: string | null;
  createdAt: string;
  token: string | null;
};

export function FanPassView({ member }: { member: FanPassMemberData }) {
  const [variant, setVariant] = useState<"id" | "trading" | "ticket">("id");
  const [copied, setCopied] = useState(false);
  const showToast = useToast();

  const initials = member.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const joinYear = new Date(member.createdAt).getFullYear();
  const joinDate = new Date(member.createdAt).toLocaleDateString("en-NG", {
    month: "short",
    year: "numeric",
  });

  const downloadUrl = member.token ? `/api/fan-pass/${member.token}` : null;

  async function handleShare() {
    const shareData = {
      title: `${member.fullName}'s ANC Fan Pass`,
      text: `Check out my official Arsenal Nigeria Community Fan Pass! #${member.ancNumber}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast("Shared successfully!");
      } catch {
        // user cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* 3-tab segmented pill selector */}
      <SegmentedPills
        value={variant}
        onChange={(v) => setVariant(v as "id" | "trading" | "ticket")}
        options={[
          { value: "id", label: "Membership ID" },
          { value: "trading", label: "Trading Card" },
          { value: "ticket", label: "Ticket Stub" },
        ]}
        className="mb-8"
      />

      {/* Card Visual Container */}
      <div className="flex w-full justify-center overflow-x-auto py-2">
        {/* VARIANT 1: Membership ID (Landscape 440x270px) */}
        {variant === "id" && (
          <div className="relative flex h-[270px] w-[440px] flex-col justify-between overflow-hidden rounded-2xl border border-white/15 bg-[#01142e] p-6 shadow-2xl">
            {/* 6px Top accent bar */}
            <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-arsenal-red via-arsenal-gold to-arsenal-red-bright" />

            {/* Header row */}
            <div className="mt-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-arsenal-red text-[10px] font-bold text-white">
                  AN
                </span>
                <span className="font-display text-sm tracking-wider text-foreground">ANC FAN PASS</span>
              </div>
              <span className="text-[10px] font-bold tracking-widest text-arsenal-gold">MEMBER</span>
            </div>

            {/* Body: Avatar + Details */}
            <div className="flex items-center gap-4">
              <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-xl border border-arsenal-gold bg-arsenal-navy font-display text-2xl font-bold text-arsenal-gold shadow-md">
                {initials}
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-display text-2xl tracking-wide text-white">
                  {member.fullName.toUpperCase()}
                </h3>
                <p className="text-xs font-semibold tracking-widest text-arsenal-gold">{member.ancNumber}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-medium text-foreground">
                    {member.stateOfResidence}
                  </span>
                  <span className="rounded bg-arsenal-red/20 px-2 py-0.5 text-[10px] font-medium capitalize text-arsenal-red-bright">
                    {member.activityTier.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer row */}
            <div className="flex items-end justify-between border-t border-white/10 pt-3 text-[11px] text-muted">
              <div>
                <p className="text-[10px] uppercase text-muted/60">Member since</p>
                <p className="font-medium text-foreground">{joinDate}</p>
              </div>

              {/* Decorative barcode */}
              <div className="text-right">
                <div className="flex h-5 items-end justify-end gap-1">
                  {[12, 20, 16, 22, 10, 18, 14, 24, 18, 12, 20].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-sm bg-white/40"
                      style={{ height: `${h}px`, opacity: i % 2 === 0 ? 0.9 : 0.4 }}
                    />
                  ))}
                </div>
                <p className="mt-0.5 text-[9px] uppercase tracking-wider text-muted/60">Scan to verify</p>
              </div>
            </div>
          </div>
        )}

        {/* VARIANT 2: Trading Card (Portrait 300x462px) */}
        {variant === "trading" && (
          <div className="relative flex h-[462px] w-[300px] flex-col justify-between overflow-hidden rounded-2xl border-2 border-arsenal-gold bg-gradient-to-b from-[#0a1f42] via-[#051735] to-[#01142e] p-6 text-center shadow-2xl">
            {/* Top pill badge */}
            <div>
              <span className="inline-block rounded-full bg-arsenal-red px-3.5 py-1 text-[9px] font-bold tracking-[0.15em] text-white uppercase shadow-sm">
                ARSENAL NIGERIA COMMUNITY
              </span>
            </div>

            {/* Avatar */}
            <div className="my-auto flex flex-col items-center">
              <div className="flex h-[104px] w-[104px] items-center justify-center rounded-full border-2 border-arsenal-gold bg-arsenal-navy font-display text-4xl font-bold text-arsenal-gold shadow-xl">
                {initials}
              </div>
              <h3 className="mt-4 font-display text-2xl tracking-wider text-white">
                {member.fullName.toUpperCase()}
              </h3>
              <p className="text-xs font-semibold tracking-widest text-arsenal-gold">{member.ancNumber}</p>
            </div>

            {/* Stats row & favorite */}
            <div>
              <div className="grid grid-cols-3 border-y border-white/10 py-2.5 text-center">
                <div>
                  <p className="font-bold text-white text-xs">{member.stateOfResidence}</p>
                  <p className="text-[9px] uppercase tracking-wider text-muted">CHAPTER</p>
                </div>
                <div className="border-x border-white/10">
                  <p className="font-bold text-white text-xs capitalize">{member.activityTier.replace("_", " ")}</p>
                  <p className="text-[9px] uppercase tracking-wider text-muted">TIER</p>
                </div>
                <div>
                  <p className="font-bold text-white text-xs">{joinYear}</p>
                  <p className="text-[9px] uppercase tracking-wider text-muted">SINCE</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
                <span className="truncate">
                  Favourite: <span className="text-foreground font-semibold">{member.favoritePlayerCurrent || "Saka"}</span>
                </span>
                <span className="shrink-0 text-[10px] font-bold text-arsenal-gold/60">
                  {member.ancNumber.split("-").pop() ? `No. ${member.ancNumber.split("-").pop()}` : ""}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* VARIANT 3: Ticket Stub (Horizontal 460x220px) */}
        {variant === "ticket" && (
          <div className="relative flex h-[220px] w-[460px] overflow-hidden rounded-2xl border border-white/15 shadow-2xl">
            {/* Left Stub Zone */}
            <div className="flex flex-1 flex-col justify-between bg-gradient-to-br from-arsenal-red to-[#700004] p-5 text-white">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">ADMIT ONE</p>
                <h3 className="mt-1 font-display text-2xl tracking-wider text-white">GUNNER FOR LIFE</h3>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-white/20 pt-3">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/70">MEMBER</p>
                  <p className="truncate font-display text-sm tracking-wide text-white">
                    {member.fullName.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/70">CHAPTER</p>
                  <p className="truncate font-display text-sm tracking-wide text-white">
                    {member.stateOfResidence.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/70">SINCE</p>
                  <p className="font-display text-sm tracking-wide text-white">{joinYear}</p>
                </div>
              </div>
            </div>

            {/* Perforated Divider */}
            <div className="relative flex w-4 flex-col items-center justify-between bg-arsenal-navy-deep py-2">
              <div className="-mt-4 h-5 w-5 rounded-full bg-background border border-white/15" />
              <div className="h-full w-px border-r-2 border-dashed border-white/30 my-1" />
              <div className="-mb-4 h-5 w-5 rounded-full bg-background border border-white/15" />
            </div>

            {/* Right Narrow Zone */}
            <div className="flex w-24 flex-col items-center justify-center bg-[#050f24] p-3 text-center">
              <div
                className="font-display text-base tracking-[0.25em] text-arsenal-gold"
                style={{ writingMode: "vertical-rl" }}
              >
                {member.ancNumber}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={handleShare}
          className="flex h-11 items-center gap-2 rounded-full bg-arsenal-red px-6 text-sm font-bold text-white transition-colors hover:bg-arsenal-red-bright"
        >
          {copied ? <CheckIcon className="h-4 w-4" /> : <ShareNetworkIcon className="h-4 w-4" />}
          Share to Status
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`ANC-FanPass-${member.ancNumber}.png`}
            className="flex h-11 items-center gap-2 rounded-full border border-surface-border bg-white/5 px-6 text-sm font-bold text-foreground transition-colors hover:border-arsenal-gold hover:bg-white/10"
          >
            <DownloadSimpleIcon className="h-4 w-4" />
            Download PNG
          </a>
        )}
      </div>
    </div>
  );
}
