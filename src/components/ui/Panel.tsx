import type { HTMLAttributes, ReactNode } from "react";

export type PanelProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  as?: "div" | "aside" | "section";
};

export function Panel({
  title,
  children,
  actions,
  as: Tag = "div",
  className = "",
  ...props
}: PanelProps) {
  return (
    <Tag
      className={[
        "flex flex-col bg-surface border-border",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {(title || actions) && (
        <div className="flex h-11 sm:h-10 shrink-0 items-center justify-between gap-2 border-b border-border-subtle px-3">
          {title ? (
            <h2 className="truncate text-xs font-semibold uppercase tracking-wider text-muted">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {actions ? (
            <div className="flex items-center gap-1">{actions}</div>
          ) : null}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </Tag>
  );
}
