"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "error";
type ToastState = { message: string; tone: ToastTone } | null;

/** Single-slot: a new toast replaces whatever is currently showing and resets the 3200ms timer — deliberate, not a bug. */
type ShowToast = (message: string, tone?: ToastTone) => void;

const ToastContext = createContext<ShowToast | null>(null);

const AUTO_DISMISS_MS = 3200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback<ShowToast>((message, tone = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, tone });
    timerRef.current = setTimeout(() => setToast(null), AUTO_DISMISS_MS);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div className="fixed bottom-7 left-1/2 z-[210] -translate-x-1/2 animate-anc-toast-in">
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-xl border bg-overlay-surface-soft px-[22px] py-3 text-[13.5px] text-foreground shadow-[0_12px_30px_rgba(0,0,0,.4)]",
              toast.tone === "success" ? "border-whatsapp-green" : "border-arsenal-red-bright",
            )}
            role="status"
          >
            {toast.tone === "success" ? (
              <CheckCircleIcon weight="fill" className="h-4 w-4 flex-shrink-0 text-whatsapp-green" />
            ) : (
              <XCircleIcon weight="fill" className="h-4 w-4 flex-shrink-0 text-arsenal-red-bright" />
            )}
            {toast.message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
