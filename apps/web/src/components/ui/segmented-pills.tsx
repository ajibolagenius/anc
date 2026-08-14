"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export function segmentedPillClass(active: boolean) {
  return cn(
    "inline-flex h-9 flex-shrink-0 items-center justify-center rounded-full px-4 text-[13px] font-semibold transition-colors",
    active
      ? "bg-arsenal-red text-white"
      : "border border-white/15 text-foreground/70 hover:border-arsenal-gold/50 hover:text-foreground",
  );
}

export type SegmentedPillsOption = { value: string; label: string };

/**
 * Controlled/uncontrolled pill group for in-form selection (jersey size,
 * Fan Pass display variant). For URL-driven filters (e.g. watch-party state
 * chips), render plain `<Link>`s styled with `segmentedPillClass` instead —
 * that stays a Server Component and needs no client state.
 */
export function SegmentedPills({
  name,
  options,
  value,
  defaultValue,
  onChange,
  className,
}: {
  name?: string;
  options: SegmentedPillsOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}) {
  const [internal, setInternal] = useState(defaultValue ?? options[0]?.value ?? "");
  const selected = value ?? internal;

  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="radiogroup">
      {name && <input type="hidden" name={name} value={selected} />}
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === selected}
          onClick={() => {
            setInternal(option.value);
            onChange?.(option.value);
          }}
          className={segmentedPillClass(option.value === selected)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
