import type { ReactNode } from "react";

export function FormField({
  label,
  htmlFor,
  error,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground/90">
        {label}
        {optional && <span className="ml-1.5 text-xs font-normal text-muted">optional</span>}
      </label>
      {children}
      {error && <p className="text-xs text-arsenal-red-bright">{error}</p>}
    </div>
  );
}

export const inputClassName =
  "w-full rounded-lg border border-surface-border bg-background/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/60 outline-none transition-colors focus:border-arsenal-gold";
