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
  success: "bg-accent-green/15 text-accent-green border-accent-green/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  info: "bg-accent-blue/15 text-accent-blue border-accent-blue/30",
  planned: "bg-surface-overlay text-muted border-border",
  progress: "bg-accent-blue/15 text-accent-blue border-accent-blue/30",
  available: "bg-accent-green/15 text-accent-green border-accent-green/30",
  disconnected: "bg-warning/15 text-warning border-warning/30",
  configured: "bg-muted-foreground/15 text-muted border-border",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2 py-0.5",
        "text-[11px] font-medium leading-tight tracking-wide uppercase",
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

export function statusToBadgeVariant(
  status: string,
): BadgeVariant {
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
    default:
      return "default";
  }
}
