import type { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "planned"
  | "progress"
  | "available"
  | "disconnected"
  | "configured";

export type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface-overlay text-muted border-border",
  success:
    "bg-accent-green/12 text-accent-green border-accent-green/35 shadow-[0_0_8px_color-mix(in_srgb,var(--accent-green)_12%,transparent)]",
  warning: "bg-warning/12 text-warning border-warning/35",
  danger: "bg-danger/12 text-danger border-danger/35",
  info: "bg-accent-blue/12 text-accent-blue border-accent-blue/35",
  planned: "bg-surface-overlay text-muted border-border",
  progress: "bg-accent-blue/12 text-accent-blue border-accent-blue/35",
  available:
    "bg-accent-green/12 text-accent-green border-accent-green/35 shadow-[0_0_8px_color-mix(in_srgb,var(--accent-green)_12%,transparent)]",
  disconnected: "bg-warning/12 text-warning border-warning/35",
  configured: "bg-gold/10 text-gold border-gold/30",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
        "text-[11px] font-medium leading-tight tracking-wide uppercase",
        "whitespace-nowrap",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}

export function statusToBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case "In progress":
      return "progress";
    case "Available":
      return "available";
    case "Planned":
      return "planned";
    case "Disconnected":
      return "disconnected";
    case "Not configured":
      return "configured";
    case "Needs configuration":
      return "configured";
    case "Demo":
      return "progress";
    case "Connected":
      return "available";
    case "Configured":
      return "available";
    default:
      return "default";
  }
}
