"use client";

export type EditorTabsProps = {
  openPaths: string[];
  activePath: string | null;
  dirtyPaths: Set<string>;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
};

export function EditorTabs({
  openPaths,
  activePath,
  dirtyPaths,
  onSelect,
  onClose,
}: EditorTabsProps) {
  if (openPaths.length === 0) {
    return (
      <div className="flex h-9 items-center border-b border-border-subtle px-3 text-xs text-muted">
        No files open — pick one from the explorer
      </div>
    );
  }

  return (
    <div
      className="flex h-9 shrink-0 items-stretch overflow-x-auto border-b border-border-subtle bg-surface"
      role="tablist"
      aria-label="Open editors"
    >
      {openPaths.map((path) => {
        const active = path === activePath;
        const dirty = dirtyPaths.has(path);
        const name = path.split("/").pop() ?? path;
        return (
          <div
            key={path}
            role="tab"
            aria-selected={active}
            className={[
              "group flex max-w-[12rem] items-center gap-1 border-r border-border-subtle px-2 text-xs",
              active
                ? "bg-background text-foreground"
                : "text-muted hover:bg-surface-raised hover:text-foreground",
            ].join(" ")}
          >
            <button
              type="button"
              className="min-w-0 flex-1 truncate py-2 text-left"
              onClick={() => onSelect(path)}
              title={path}
            >
              {dirty ? (
                <span className="mr-1 text-accent-green" aria-label="Unsaved">
                  ●
                </span>
              ) : null}
              {name}
            </button>
            <button
              type="button"
              className="rounded p-0.5 text-muted-foreground opacity-60 hover:bg-surface-overlay hover:opacity-100 group-hover:opacity-100"
              aria-label={`Close ${name}`}
              onClick={(e) => {
                e.stopPropagation();
                onClose(path);
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
