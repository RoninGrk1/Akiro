"use client";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

export type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: "sm" | "md";
  className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = "sm",
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <div
      className={[
        "inline-flex items-center rounded-md border border-border bg-surface p-0.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={selected}
            className={[
              "rounded px-2.5 font-medium transition-colors duration-150 ease-out",
              "min-h-9 sm:min-h-0",
              size === "sm" ? "py-1.5 text-[11px] sm:py-1" : "py-2 text-xs",
              selected
                ? "bg-accent-blue/20 text-accent-blue shadow-sm"
                : "text-muted hover:text-foreground active:bg-surface-raised",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
