import type { ReactNode } from "react";

/**
 * Lightweight tooltip via native title + accessible label.
 * Prefer visible labels on mobile; title is a progressive enhancement.
 */
export type TooltipProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function Tooltip({ label, children, className = "" }: TooltipProps) {
  return (
    <span
      className={["inline-flex", className].filter(Boolean).join(" ")}
      title={label}
      aria-label={label}
    >
      {children}
    </span>
  );
}
