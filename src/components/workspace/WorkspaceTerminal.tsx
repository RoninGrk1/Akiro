"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { execTerminal } from "@/lib/workspace/api";

type HistoryLine =
  | { kind: "input"; text: string }
  | { kind: "output"; text: string; tone?: "default" | "error" | "muted" };

const PROMPT = "akiro % ";

export function WorkspaceTerminal() {
  const [history, setHistory] = useState<HistoryLine[]>([
    {
      kind: "output",
      text: "Akiro sandboxed terminal — allowlisted commands in /workspace/akiro-projects/default",
      tone: "muted",
    },
    {
      kind: "output",
      text: 'Type a command. Try: ls · pwd · cat README.md · forge --version · npm --version',
      tone: "muted",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState<number | null>(null);
  const [pendingRm, setPendingRm] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [history]);

  const run = useCallback(async (raw: string) => {
    const trimmed = raw.trimEnd();
    setHistory((h) => [...h, { kind: "input", text: PROMPT + trimmed }]);
    if (trimmed) setCmdHistory((prev) => [...prev, trimmed]);
    setHistIndex(null);
    setInput("");

    if (!trimmed) return;
    if (trimmed === "clear" || trimmed === "cls") {
      setHistory([]);
      return;
    }

    const isRm = /^\s*rm\b/.test(trimmed);
    if (isRm) {
      setPendingRm(trimmed);
      return;
    }

    setBusy(true);
    try {
      const result = await execTerminal(trimmed);
      const lines: HistoryLine[] = [];
      if (result.stdout) {
        for (const text of result.stdout.replace(/\n$/, "").split("\n")) {
          lines.push({ kind: "output", text });
        }
      }
      if (result.stderr) {
        for (const text of result.stderr.replace(/\n$/, "").split("\n")) {
          lines.push({
            kind: "output",
            text,
            tone: result.exitCode === 0 ? "muted" : "error",
          });
        }
      }
      if (result.missingBinary) {
        lines.push({
          kind: "output",
          text: `[akiro] Binary missing: ${result.missingBinary}. Install it on the host to use this command.`,
          tone: "error",
        });
      }
      if (!result.stdout && !result.stderr) {
        lines.push({
          kind: "output",
          text: `(exit ${result.exitCode})`,
          tone: result.exitCode === 0 ? "muted" : "error",
        });
      }
      setHistory((h) => [...h, ...lines]);
    } catch (err) {
      setHistory((h) => [
        ...h,
        {
          kind: "output",
          text: err instanceof Error ? err.message : String(err),
          tone: "error",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }, []);

  const confirmRm = useCallback(async () => {
    const cmd = pendingRm;
    setPendingRm(null);
    if (!cmd) return;
    setBusy(true);
    try {
      const result = await execTerminal(cmd);
      const lines: HistoryLine[] = [];
      if (result.stdout) {
        for (const text of result.stdout.replace(/\n$/, "").split("\n")) {
          lines.push({ kind: "output", text });
        }
      }
      if (result.stderr) {
        for (const text of result.stderr.replace(/\n$/, "").split("\n")) {
          lines.push({ kind: "output", text, tone: "error" });
        }
      }
      setHistory((h) => [...h, ...lines]);
    } catch (err) {
      setHistory((h) => [
        ...h,
        {
          kind: "output",
          text: err instanceof Error ? err.message : String(err),
          tone: "error",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }, [pendingRm]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !busy) {
      e.preventDefault();
      void run(input);
      return;
    }
    if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const next =
        histIndex === null ? cmdHistory.length - 1 : Math.max(0, histIndex - 1);
      setHistIndex(next);
      setInput(cmdHistory[next] ?? "");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIndex === null) return;
      if (histIndex >= cmdHistory.length - 1) {
        setHistIndex(null);
        setInput("");
        return;
      }
      const next = histIndex + 1;
      setHistIndex(next);
      setInput(cmdHistory[next] ?? "");
    }
  };

  return (
    <div
      className="flex h-full min-h-0 flex-col bg-background font-mono text-xs"
      onClick={() => inputRef.current?.focus()}
      role="application"
      aria-label="Workspace terminal"
    >
      <div className="shrink-0 border-b border-border-subtle px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        Sandboxed shell · project cwd · allowlisted binaries
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3 leading-relaxed">
        {history.map((line, i) => (
          <div
            key={`${i}-${line.text.slice(0, 24)}`}
            className={
              line.kind === "input"
                ? "text-foreground whitespace-pre-wrap"
                : line.tone === "error"
                  ? "text-danger whitespace-pre-wrap"
                  : line.tone === "muted"
                    ? "text-muted-foreground whitespace-pre-wrap"
                    : "text-muted whitespace-pre-wrap"
            }
          >
            {line.text || "\u00a0"}
          </div>
        ))}
        <div className="flex items-center gap-0 text-foreground">
          <span className="shrink-0 text-accent-green" aria-hidden>
            {PROMPT}
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={busy}
            className="min-w-0 flex-1 bg-transparent text-foreground outline-none disabled:opacity-50"
            aria-label="Terminal command"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
          />
        </div>
        <div ref={bottomRef} />
      </div>
      <ConfirmDialog
        open={pendingRm !== null}
        title="Confirm rm?"
        description={
          <p>
            Run <code className="font-mono text-xs">{pendingRm}</code> in the
            project directory? This cannot be undone from Akiro.
          </p>
        }
        confirmLabel="Run rm"
        tone="danger"
        onCancel={() => {
          setPendingRm(null);
          setHistory((h) => [
            ...h,
            { kind: "output", text: "(rm cancelled)", tone: "muted" },
          ]);
        }}
        onConfirm={() => void confirmRm()}
      />
    </div>
  );
}
