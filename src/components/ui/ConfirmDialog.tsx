"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => cancelRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 akiro-overlay"
        aria-label="Dismiss dialog"
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={[
          "relative z-10 w-full sm:max-w-md",
          "rounded-t-xl sm:rounded-xl border border-border bg-surface-raised",
          "p-5 shadow-[var(--shadow-lg)]",
          "akiro-sheet-up sm:animate-none",
          "akiro-safe-bottom",
        ].join(" ")}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" aria-hidden />
        <h2 id={titleId} className="text-base font-semibold text-foreground">
          {title}
        </h2>
        {description ? (
          <div className="mt-2 text-sm text-muted leading-relaxed">{description}</div>
        ) : null}
        <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button ref={cancelRef} variant="secondary" size="md" onClick={onCancel} className="sm:!h-8 sm:!min-h-8">
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            size="md"
            onClick={onConfirm}
            className="sm:!h-8 sm:!min-h-8"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
