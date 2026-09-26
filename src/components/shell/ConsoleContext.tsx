"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { FIXED_BOOT_ISO, formatClock, nowIso } from "@/lib/format-clock";
import { execTerminal } from "@/lib/workspace/api";

export type ConsoleTab = "build" | "tests" | "errors" | "logs" | "terminal";

export type ConsoleLine = {
  id: string;
  text: string;
  tone?: "default" | "success" | "info" | "warn" | "error" | "muted";
};

type ConsoleContextValue = {
  activeTab: ConsoleTab;
  setActiveTab: (tab: ConsoleTab) => void;
  bottomCollapsed: boolean;
  setBottomCollapsed: (v: boolean) => void;
  toggleBottom: () => void;
  expandBottom: (tab?: ConsoleTab) => void;
  buildLines: ConsoleLine[];
  testLines: ConsoleLine[];
  errorLines: ConsoleLine[];
  logLines: ConsoleLine[];
  appendBuild: (lines: Omit<ConsoleLine, "id">[]) => void;
  appendTests: (lines: Omit<ConsoleLine, "id">[]) => void;
  appendErrors: (lines: Omit<ConsoleLine, "id">[]) => void;
  appendLogs: (lines: Omit<ConsoleLine, "id">[]) => void;
  clearTab: (tab: Exclude<ConsoleTab, "terminal">) => void;
  runProjectBuild: () => Promise<void>;
};

const ConsoleContext = createContext<ConsoleContextValue | null>(null);

let lineSeq = 0;
function makeLines(lines: Omit<ConsoleLine, "id">[]): ConsoleLine[] {
  return lines.map((l) => {
    lineSeq += 1;
    return { ...l, id: `l-${lineSeq}` };
  });
}

const INITIAL_BUILD: ConsoleLine[] = makeLines([
  { text: "[akiro] Development Workspace — on-disk project", tone: "muted" },
  {
    text: "No active build. Press Run to execute real allowlisted commands.",
    tone: "muted",
  },
]);

const INITIAL_TESTS: ConsoleLine[] = makeLines([
  {
    text: "No test run yet. Press Run or use forge test in the terminal.",
    tone: "muted",
  },
]);

const INITIAL_ERRORS: ConsoleLine[] = makeLines([
  { text: "No problems detected.", tone: "success" },
]);

const INITIAL_LOGS: ConsoleLine[] = makeLines([
  { text: `[${FIXED_BOOT_ISO}] Akiro console initialised`, tone: "muted" },
]);

export function ConsoleProvider({
  children,
  bottomCollapsed,
  setBottomCollapsed,
}: {
  children: ReactNode;
  bottomCollapsed: boolean;
  setBottomCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
}) {
  const [activeTab, setActiveTab] = useState<ConsoleTab>("terminal");
  const [buildLines, setBuildLines] = useState(INITIAL_BUILD);
  const [testLines, setTestLines] = useState(INITIAL_TESTS);
  const [errorLines, setErrorLines] = useState(INITIAL_ERRORS);
  const [logLines, setLogLines] = useState(INITIAL_LOGS);

  const toggleBottom = useCallback(() => {
    setBottomCollapsed((v) => !v);
  }, [setBottomCollapsed]);

  const expandBottom = useCallback(
    (tab?: ConsoleTab) => {
      setBottomCollapsed(false);
      if (tab) setActiveTab(tab);
    },
    [setBottomCollapsed],
  );

  const appendBuild = useCallback((lines: Omit<ConsoleLine, "id">[]) => {
    setBuildLines((prev) => [...prev, ...makeLines(lines)]);
  }, []);
  const appendTests = useCallback((lines: Omit<ConsoleLine, "id">[]) => {
    setTestLines((prev) => [...prev, ...makeLines(lines)]);
  }, []);
  const appendErrors = useCallback((lines: Omit<ConsoleLine, "id">[]) => {
    setErrorLines((prev) => [...prev, ...makeLines(lines)]);
  }, []);
  const appendLogs = useCallback((lines: Omit<ConsoleLine, "id">[]) => {
    setLogLines((prev) => [...prev, ...makeLines(lines)]);
  }, []);

  const clearTab = useCallback((tab: Exclude<ConsoleTab, "terminal">) => {
    const empty = makeLines([{ text: "(cleared)", tone: "muted" }]);
    if (tab === "build") setBuildLines(empty);
    if (tab === "tests") setTestLines(empty);
    if (tab === "errors") setErrorLines(empty);
    if (tab === "logs") setLogLines(empty);
  }, []);

  const runProjectBuild = useCallback(async () => {
    const stamp = formatClock(nowIso());
    setBottomCollapsed(false);
    setActiveTab("build");
    setBuildLines(
      makeLines([
        { text: `[${stamp}] Run triggered — real terminal commands`, tone: "info" },
      ]),
    );

    const build = await execTerminal("ls");
    setBuildLines((prev) => [
      ...prev,
      ...makeLines([
        { text: "> ls (project root)", tone: "muted" },
        ...build.stdout.split("\n").filter(Boolean).map((text) => ({
          text,
          tone: "default" as const,
        })),
        ...(build.stderr
          ? build.stderr.split("\n").filter(Boolean).map((text) => ({
              text,
              tone: "error" as const,
            }))
          : []),
      ]),
    ]);

    const forge = await execTerminal("forge test");
    const forgeLines = [
      ...(forge.stdout ? forge.stdout.split("\n") : []),
      ...(forge.stderr ? forge.stderr.split("\n") : []),
    ].filter(Boolean);
    if (forge.missingBinary) {
      forgeLines.push(
        `[akiro] forge not installed — cannot run Foundry tests. Exit ${forge.exitCode}.`,
      );
    }
    setTestLines(
      makeLines([
        { text: `[${stamp}] forge test`, tone: "info" },
        ...forgeLines.map((text) => ({
          text,
          tone:
            forge.exitCode === 0
              ? ("default" as const)
              : ("error" as const),
        })),
        {
          text: `Exit code ${forge.exitCode}`,
          tone: forge.exitCode === 0 ? "success" : "error",
        },
      ]),
    );

    setErrorLines(
      makeLines([
        forge.exitCode === 0 && !forge.missingBinary
          ? { text: "No problems detected from forge test.", tone: "success" }
          : {
              text: forge.missingBinary
                ? "forge binary missing on host."
                : `forge test exited ${forge.exitCode}`,
              tone: "warn",
            },
      ]),
    );

    setLogLines((prev) => [
      ...prev,
      ...makeLines([
        {
          text: `[${stamp}] Run finished (build listing + forge test)`,
          tone: "info",
        },
      ]),
    ]);
  }, [setBottomCollapsed]);

  const value = useMemo<ConsoleContextValue>(
    () => ({
      activeTab,
      setActiveTab,
      bottomCollapsed,
      setBottomCollapsed: (v) => setBottomCollapsed(v),
      toggleBottom,
      expandBottom,
      buildLines,
      testLines,
      errorLines,
      logLines,
      appendBuild,
      appendTests,
      appendErrors,
      appendLogs,
      clearTab,
      runProjectBuild,
    }),
    [
      activeTab,
      bottomCollapsed,
      setBottomCollapsed,
      toggleBottom,
      expandBottom,
      buildLines,
      testLines,
      errorLines,
      logLines,
      appendBuild,
      appendTests,
      appendErrors,
      appendLogs,
      clearTab,
      runProjectBuild,
    ],
  );

  return (
    <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>
  );
}

export function useConsole(): ConsoleContextValue {
  const ctx = useContext(ConsoleContext);
  if (!ctx) {
    throw new Error("useConsole must be used within a ConsoleProvider");
  }
  return ctx;
}
