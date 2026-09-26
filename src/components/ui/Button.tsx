import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-green text-background hover:bg-accent-green-dim font-medium",
  secondary:
    "bg-surface-raised text-foreground hover:bg-surface-overlay border border-border",
  ghost: "bg-transparent text-muted hover:text-foreground hover:bg-surface-raised",
  danger: "bg-danger/15 text-danger hover:bg-danger/25 border border-danger/30",
  outline:
    "bg-transparent text-foreground border border-border hover:border-accent-blue hover:text-accent-blue",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    fullWidth = false,
    className = "",
    children,
    disabled,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center rounded-md transition-colors",
        "disabled:opacity-50 disabled:pointer-events-none",
        "focus-visible:outline-none",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
});
