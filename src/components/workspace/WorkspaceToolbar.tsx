"use client";

import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

export type PreviewLayout = "editor" | "split" | "preview";

export type WorkspaceToolbarProps = {
  layout: PreviewLayout;
  onLayoutChange: (layout: PreviewLayout) => void;
  onRun: () => void;
  onFormat: () => void;
  onSave?: () => void;
  saving?: boolean;
  dirty?: boolean;
  onOpenTree?: () => void;
};

export function WorkspaceToolbar({
  layout,
  onLayoutChange,
  onRun,
  onFormat,
  onSave,
  saving,
  dirty,
  onOpenTree,
}: WorkspaceToolbarProps) {
  return (
    <div className="flex h-12 sm:h-10 shrink-0 items-center justify-between gap-2 border-b border-border-subtle bg-surface px-2">
      <div className="flex items-center gap-1 min-w-0 overflow-x-auto akiro-scroll-x">
        {onOpenTree ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenTree}
            aria-label="Open file tree"
            className="md:hidden !px-2 shrink-0"
          >
            <FilesIcon />
            <span className="sr-only sm:not-sr-only sm:inline">Files</span>
          </Button>
        ) : null}
        <Button size="sm" onClick={onRun} aria-label="Run build and tests" className="shrink-0">
          Run
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onFormat}
          aria-label="Format document"
          className="shrink-0"
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
            className="shrink-0"
          >
            {saving ? "Saving…" : dirty ? "Save" : "Saved"}
          </Button>
        ) : null}
      </div>
      <SegmentedControl
        ariaLabel="Editor and preview layout"
        value={layout}
        onChange={onLayoutChange}
        className="shrink-0 hidden xs:inline-flex sm:inline-flex"
        options={[
          { value: "editor", label: "Editor" },
          { value: "split", label: "Split" },
          { value: "preview", label: "Preview" },
        ]}
      />
      {/* Compact layout toggle on very small screens */}
      <div className="flex sm:hidden shrink-0 gap-0.5">
        {(
          [
            ["editor", "Ed"],
            ["split", "Sp"],
            ["preview", "Pr"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onLayoutChange(id)}
            aria-pressed={layout === id}
            aria-label={id}
            className={[
              "min-h-9 min-w-9 rounded px-2 text-[11px] font-medium",
              layout === id
                ? "bg-accent-blue/20 text-accent-blue"
                : "text-muted",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FilesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}
