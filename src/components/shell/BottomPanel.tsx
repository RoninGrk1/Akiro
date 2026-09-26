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
};

export function BottomPanel({ collapsed, onToggle }: BottomPanelProps) {
  const {
    activeTab,
    setActiveTab,
    buildLines,
    testLines,
    errorLines,
    logLines,
    clearTab,
  } = useConsole();

  if (collapsed) {
    return (
      <div className="flex h-9 shrink-0 items-center justify-between border-t border-border bg-surface px-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted shrink-0">
            Console
          </span>
          <div className="hidden sm:flex items-center gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  onToggle();
                }}
                className="rounded px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-surface-raised hover:text-foreground"
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
          className="!px-2"
        >
          <ExpandIcon />
        </Button>
      </div>
    );
  }

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

  return (
    <section
      className="flex h-56 shrink-0 flex-col border-t border-border bg-surface"
      aria-label="Build, tests, logs and terminal"
    >
      <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-border-subtle px-2">
        <div
          role="tablist"
          aria-label="Console tabs"
          className="flex min-w-0 items-center gap-0.5 overflow-x-auto"
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
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  selected
                    ? "bg-surface-raised text-accent-green"
                    : "text-muted hover:text-foreground hover:bg-surface-raised/60",
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
            className="!px-2"
          >
            <CollapseIcon />
          </Button>
        </div>
      </div>

      <div
        role="tabpanel"
        aria-labelledby={`console-tab-${activeTab}`}
        className="min-h-0 flex-1 overflow-hidden"
      >
        {activeTab === "terminal" ? (
          <WorkspaceTerminal />
        ) : (
          <div className="h-full overflow-auto p-3 font-mono text-xs leading-relaxed">
            {linesForTab?.map((line) => (
              <p
                key={line.id}
                className={toneClass[line.tone ?? "default"]}
              >
                {line.text}
              </p>
            ))}
          </div>
        )}
      </div>
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
