"use client";

import { Button } from "@/components/ui/Button";
import { useConsole, type ConsoleTab, type ConsoleLine } from "@/components/shell/ConsoleContext";
import { WorkspaceTerminal } from "@/components/workspace/WorkspaceTerminal";

const TABS: { id: ConsoleTab; label: string }[] = [
  { id: "terminal", label: "Terminal" },
  { id: "build", label: "Build" },
  { id: "tests", label: "Tests" },
  { id: "errors", label: "Errors" },
  { id: "logs", label: "Logs" },
];

const toneClass: Record<NonNullable<ConsoleLine["tone"]>, string> = {
  default: "text-muted",
  success: "text-accent-green",
  info: "text-accent-blue",
  warn: "text-warning",
  error: "text-danger",
  muted: "text-muted-foreground",
};

export type BottomPanelProps = {
  collapsed: boolean;
  onToggle: () => void;
  /** Mobile: render as bottom sheet overlay instead of in-flow panel */
  mobileSheet?: boolean;
};

export function BottomPanel({
  collapsed,
  onToggle,
  mobileSheet = false,
}: BottomPanelProps) {
  const {
    activeTab,
    setActiveTab,
    buildLines,
    testLines,
    errorLines,
    logLines,
    clearTab,
  } = useConsole();

  const linesForTab =
    activeTab === "build"
      ? buildLines
      : activeTab === "tests"
        ? testLines
        : activeTab === "errors"
          ? errorLines
          : activeTab === "logs"
            ? logLines
            : null;

  const tabBar = (
    <div className="flex h-11 sm:h-10 shrink-0 items-center justify-between gap-2 border-b border-border-subtle px-2">
      <div
        role="tablist"
        aria-label="Console tabs"
        className="flex min-w-0 items-center gap-0.5 overflow-x-auto akiro-scroll-x"
      >
        {TABS.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              id={`console-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={[
                "rounded-md px-3 py-2 sm:px-2.5 sm:py-1 text-xs font-medium",
                "min-h-10 sm:min-h-0 transition-colors duration-150",
                selected
                  ? "bg-surface-raised text-accent-green"
                  : "text-muted hover:text-foreground hover:bg-surface-raised/60 active:bg-surface-overlay",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {activeTab !== "terminal" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearTab(activeTab)}
            aria-label={`Clear ${activeTab}`}
            className="!px-2 text-[11px]"
          >
            Clear
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          aria-label="Collapse console panel"
          aria-expanded={true}
          className="!px-2 !min-h-10 !h-10 sm:!min-h-8 sm:!h-8"
        >
          <CollapseIcon />
        </Button>
      </div>
    </div>
  );

  const panelBody = (
    <div
      role="tabpanel"
      aria-labelledby={`console-tab-${activeTab}`}
      className="min-h-0 flex-1 overflow-hidden"
    >
      {activeTab === "terminal" ? (
        <WorkspaceTerminal />
      ) : (
        <div className="h-full overflow-auto p-3 font-mono text-xs leading-relaxed">
          {linesForTab && linesForTab.length > 0 ? (
            linesForTab.map((line) => (
              <p key={line.id} className={toneClass[line.tone ?? "default"]}>
                {line.text}
              </p>
            ))
          ) : (
            <p className="text-muted-foreground">No output yet.</p>
          )}
        </div>
      )}
    </div>
  );

  /* Collapsed bar — always in flow so it doesn't cover content */
  if (collapsed) {
    return (
      <div className="flex h-11 sm:h-9 shrink-0 items-center justify-between border-t border-border bg-surface px-3 akiro-safe-bottom">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted shrink-0">
            Console
          </span>
          <div className="hidden sm:flex items-center gap-1 overflow-x-auto akiro-scroll-x">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  onToggle();
                }}
                className="rounded px-2 py-1.5 text-[11px] text-muted-foreground hover:bg-surface-raised hover:text-foreground min-h-8"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          aria-label="Expand console panel"
          aria-expanded={false}
          className="!px-2 !min-h-10 !h-10 sm:!min-h-8 sm:!h-8"
        >
          <ExpandIcon />
        </Button>
      </div>
    );
  }

  /* Mobile sheet: overlay so editor stays full-width underneath */
  if (mobileSheet) {
    return (
      <>
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 akiro-overlay md:hidden"
          aria-label="Close console"
          onClick={onToggle}
        />
        <section
          className={[
            "fixed inset-x-0 bottom-0 z-50 flex flex-col",
            "h-[55dvh] max-h-[70dvh] rounded-t-xl border border-border bg-surface",
            "shadow-[var(--shadow-lg)] akiro-sheet-up akiro-safe-bottom",
            "md:hidden",
          ].join(" ")}
          aria-label="Build, tests, logs and terminal"
        >
          <div className="flex justify-center pt-2 pb-0" aria-hidden>
            <div className="h-1 w-10 rounded-full bg-border" />
          </div>
          {tabBar}
          {panelBody}
        </section>
        {/* Desktop in-flow twin when mobileSheet mode but md+ */}
        <section
          className="hidden md:flex h-56 shrink-0 flex-col border-t border-border bg-surface"
          aria-label="Build, tests, logs and terminal"
        >
          {tabBar}
          {panelBody}
        </section>
      </>
    );
  }

  return (
    <section
      className="flex h-[40dvh] sm:h-56 shrink-0 flex-col border-t border-border bg-surface"
      aria-label="Build, tests, logs and terminal"
    >
      {tabBar}
      {panelBody}
    </section>
  );
}

function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function CollapseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
