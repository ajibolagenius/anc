"use client";

import { createContext, useCallback, useContext, useState, type MouseEvent, type ReactNode } from "react";
import { Button, type ButtonProps } from "./button";

export type ConfirmKind =
  | "reject-member"
  | "close-giveaway"
  | "draw-winners"
  | "disqualify"
  | "send-newsletter"
  | "reject-watchparty"
  | "delete-account";

export type ConfirmCopy = {
  title: string;
  body: string;
  confirmLabel: string;
  /** Danger (red-bright) vs. neutral (red) confirm button — per design-spec.md §4.1. */
  danger: boolean;
};

export const CONFIRM_COPY: Record<ConfirmKind, ConfirmCopy> = {
  "reject-member": {
    title: "Reject this member?",
    body: "This applicant will be marked rejected. They can re-register later, but this action itself cannot be undone.",
    confirmLabel: "Reject Member",
    danger: true,
  },
  "close-giveaway": {
    title: "Close entries?",
    body: "No further entries will be accepted for this giveaway. This cannot be reversed.",
    confirmLabel: "Close Entries",
    danger: true,
  },
  "draw-winners": {
    title: "Run the draw?",
    body: "This immediately commits a provably-fair random result, logged to the audit trail.",
    confirmLabel: "Run Draw",
    danger: false,
  },
  disqualify: {
    title: "Disqualify this winner?",
    body: "A replacement will be drawn automatically from remaining eligible entrants. The original row stays in the audit trail.",
    confirmLabel: "Disqualify & Redraw",
    danger: true,
  },
  "send-newsletter": {
    title: "Send newsletter now?",
    body: "This immediately emails every matched recipient. There is no undo once sending starts.",
    confirmLabel: "Send Newsletter",
    danger: true,
  },
  "reject-watchparty": {
    title: "Reject this listing?",
    body: "The submitter will not be notified automatically. This cannot be undone.",
    confirmLabel: "Reject Listing",
    danger: true,
  },
  "delete-account": {
    title: "Delete your account?",
    body: "This permanently removes your registry record, Fan Pass, predictions and giveaway history per our NDPR deletion policy.",
    confirmLabel: "Delete My Data",
    danger: true,
  },
};

type PendingConfirm = { copy: ConfirmCopy; resolve: (result: boolean) => void };

/** `confirm(kind, overrides?)` resolves `true`/`false` — it never calls a Server Action itself, callers submit their own form/action after a `true` result. */
type ConfirmFn = (kind: ConfirmKind, overrides?: Partial<ConfirmCopy>) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback<ConfirmFn>(
    (kind, overrides) =>
      new Promise<boolean>((resolve) => {
        setPending({ copy: { ...CONFIRM_COPY[kind], ...overrides }, resolve });
      }),
    [],
  );

  const settle = (result: boolean) => {
    pending?.resolve(result);
    setPending(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(1,10,25,.7)] p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-[400px] rounded-2xl border border-surface-border bg-overlay-surface p-7 shadow-[0_24px_60px_rgba(0,0,0,.5)]">
            <h2 className="font-display text-xl">{pending.copy.title}</h2>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted">{pending.copy.body}</p>
            <div className="mt-5 flex gap-2.5">
              <Button variant="secondary" size="sm" className="h-11 flex-1" onClick={() => settle(false)}>
                Cancel
              </Button>
              <Button
                variant={pending.copy.danger ? "danger" : "primary"}
                size="sm"
                className="h-11 flex-1"
                onClick={() => settle(true)}
              >
                {pending.copy.confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx;
}

/**
 * Gates a plain `<form action={serverAction}>` submit behind a confirm
 * dialog, without changing the action's signature: intercepts the click,
 * awaits the user's choice, and only calls `form.requestSubmit()` on "yes".
 * Drop-in replacement for a bare submit button on any destructive action.
 */
export function ConfirmSubmitButton({
  kind,
  overrides,
  onClick,
  ...props
}: Omit<ButtonProps, "type"> & {
  kind: ConfirmKind;
  overrides?: Partial<ConfirmCopy>;
}) {
  const confirm = useConfirm();

  return (
    <Button
      type="button"
      onClick={async (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        const form = event.currentTarget.closest("form");
        const ok = await confirm(kind, overrides);
        if (ok) form?.requestSubmit();
      }}
      {...props}
    />
  );
}
