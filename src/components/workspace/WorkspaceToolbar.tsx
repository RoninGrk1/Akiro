"use client";

import { Button } from "@/components/ui/Button";

export type PreviewLayout = "editor" | "split" | "preview";

export type WorkspaceToolbarProps = {
  layout: PreviewLayout;
  onLayoutChange: (layout: PreviewLayout) => void;
  onRun: () => void;
  onFormat: () => void;
  onSave?: () => void;
  saving?: boolean;
  dirty?: boolean;
};

export function WorkspaceToolbar({
  layout,
  onLayoutChange,
  onRun,
  onFormat,
  onSave,
  saving,
  dirty,
}: WorkspaceToolbarProps) {
  return (
    <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-border-subtle bg-surface px-2">
      <div className="flex items-center gap-1">
        <Button size="sm" onClick={onRun} aria-label="Run build and tests">
          Run
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onFormat}
          aria-label="Format document"
        >
          Format
        </Button>
        {onSave ? (
          <Button
            size="sm"
            variant="outline"
            onClick={onSave}
            disabled={saving || !dirty}
            aria-label="Save file to disk"
          >
            {saving ? "Saving…" : dirty ? "Save" : "Saved"}
          </Button>
        ) : null}
      </div>
      <div
        className="flex items-center rounded-md border border-border p-0.5"
        role="group"
        aria-label="Editor and preview layout"
      >
        {(
          [
            ["editor", "Editor"],
            ["split", "Split"],
            ["preview", "Preview"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onLayoutChange(id)}
            aria-pressed={layout === id}
            className={[
              "rounded px-2.5 py-1 text-[11px] font-medium transition-colors",
              layout === id
                ? "bg-accent-blue/20 text-accent-blue"
                : "text-muted hover:text-foreground",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
