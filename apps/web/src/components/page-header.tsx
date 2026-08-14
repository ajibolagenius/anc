import type { ComponentType } from "react";

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  spotlight = "var(--arsenal-red)",
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  spotlight?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="icon-spotlight hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-arsenal-red/15 sm:inline-flex"
        style={{ ["--spotlight-color" as string]: spotlight }}
      >
        <Icon className="h-5 w-5 text-arsenal-red-bright" />
      </div>
      <div>
        <h1 className="font-display text-3xl text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
