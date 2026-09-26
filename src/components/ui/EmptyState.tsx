import type { ReactNode } from "react";

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center text-center",
        "rounded-lg border border-dashed border-border bg-surface/50",
        "px-6 py-10 sm:py-12",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
    >
      {icon ? (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-raised text-muted border border-border-subtle">
          {icon}
        </div>
      ) : null}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-xs text-muted leading-relaxed">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
