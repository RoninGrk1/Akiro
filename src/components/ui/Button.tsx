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
    "akiro-btn-primary bg-accent-green text-background hover:bg-accent-green-dim font-medium active:bg-accent-green-dim",
  secondary:
    "bg-surface-raised text-foreground hover:bg-surface-overlay border border-border active:bg-surface-overlay",
  ghost:
    "bg-transparent text-muted hover:text-foreground hover:bg-surface-raised active:bg-surface-overlay",
  danger:
    "bg-danger/15 text-danger hover:bg-danger/25 border border-danger/30 active:bg-danger/30",
  outline:
    "bg-transparent text-foreground border border-border hover:border-accent-blue/60 hover:text-accent-blue active:bg-accent-blue/10",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 h-9 px-3 text-xs gap-1.5 sm:min-h-8 sm:h-8",
  md: "min-h-11 h-11 px-4 text-sm gap-2 sm:min-h-9 sm:h-9",
  lg: "min-h-12 h-12 px-5 text-sm gap-2 sm:min-h-11 sm:h-11",
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
        "inline-flex items-center justify-center rounded-md",
        "transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out",
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
