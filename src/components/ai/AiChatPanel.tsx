"use client";

import { useState } from "react";
import { ChatMessageList } from "@/components/ai/ChatMessageList";
import { useAiChat } from "@/components/ai/AiChatContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import type { AiAction } from "@/lib/ai/types";

const ACTIONS: { id: AiAction; label: string }[] = [
  { id: "generate", label: "Generate" },
  { id: "explain", label: "Explain" },
  { id: "refactor", label: "Refactor" },
  { id: "review", label: "Review" },
  { id: "debug", label: "Debug" },
  { id: "interpret-terminal", label: "Interpret terminal" },
];

export function AiChatPanel({
  showContext = true,
  compact = false,
}: {
  showContext?: boolean;
  compact?: boolean;
}) {
  const {
    send,
    isThinking,
    contextPaths,
    toggleContextPath,
    availableContextFiles,
    pendingPatch,
    clearPendingPatch,
    confirmApplyPatch,
  } = useAiChat();
  const [input, setInput] = useState("");

  return (
    <div className="flex h-full min-h-0 flex-col">
      {showContext ? (
        <div className="shrink-0 border-b border-border-subtle p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
            Project context
          </p>
          <div className="flex flex-wrap gap-1.5">
            {availableContextFiles.map((path) => {
              const on = contextPaths.includes(path);
              return (
                <button
                  key={path}
                  type="button"
                  onClick={() => toggleContextPath(path)}
                  aria-pressed={on}
                  className={[
                    "rounded-full border px-2 py-0.5 text-[10px] font-mono transition-colors",
                    on
                      ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                      : "border-border text-muted hover:text-foreground",
                  ].join(" ")}
                >
                  {path.split("/").pop()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-hidden flex flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ChatMessageList compact={compact} />
          {isThinking ? (
            <p className="px-4 pb-3 text-xs text-accent-blue">Thinking…</p>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-border-subtle p-3 space-y-2">
        <div className="flex flex-wrap gap-1">
          {ACTIONS.map((a) => (
            <Button
              key={a.id}
              size="sm"
              variant="ghost"
              className="!px-2 !h-7 text-[11px]"
              disabled={isThinking}
              onClick={() => send(input, a.id)}
            >
              {a.label}
            </Button>
          ))}
        </div>
        <label htmlFor={compact ? "ai-compact-input" : "ai-lab-input"} className="sr-only">
          Message
        </label>
        <textarea
          id={compact ? "ai-compact-input" : "ai-lab-input"}
          rows={compact ? 2 : 3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Akiro… (requires AI_API_KEY)"
          className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input, "chat");
              setInput("");
            }
          }}
        />
        <Button
          fullWidth
          size="sm"
          disabled={isThinking || !input.trim()}
          onClick={() => {
            send(input, "chat");
            setInput("");
          }}
        >
          Send
        </Button>
      </div>

      <ConfirmDialog
        open={Boolean(pendingPatch)}
        title="Apply code patch?"
        description={
          pendingPatch ? (
            <>
              <p>
                Write suggested changes to{" "}
                <code className="font-mono text-accent-green">
                  {pendingPatch.path}
                </code>{" "}
                on disk in the project workspace.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {pendingPatch.description}. This does not deploy or run forge.
              </p>
            </>
          ) : null
        }
        confirmLabel="Apply patch"
        tone="default"
        onCancel={clearPendingPatch}
        onConfirm={confirmApplyPatch}
      />
    </div>
  );
}
