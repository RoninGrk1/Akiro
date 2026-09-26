"use client";

import { ClaimBadge } from "@/components/ai/ClaimBadge";
import { Button } from "@/components/ui/Button";
import type { AiMessage } from "@/lib/ai/types";
import { useAiChat } from "@/components/ai/AiChatContext";
import { formatClock } from "@/lib/format-clock";

export function ChatMessageList({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { messages, requestApplyPatch } = useAiChat();

  return (
    <div
      className={[
        "space-y-3 overflow-y-auto",
        compact ? "p-3" : "p-4",
      ].join(" ")}
    >
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          compact={compact}
          onRequestApply={() => {
            if (msg.proposedPatch) {
              requestApplyPatch({
                ...msg.proposedPatch,
                messageId: msg.id,
              });
            }
          }}
        />
      ))}
    </div>
  );
}

function MessageBubble({
  message,
  compact,
  onRequestApply,
}: {
  message: AiMessage;
  compact: boolean;
  onRequestApply: () => void;
}) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <div
      className={[
        "rounded-lg border p-3 transition-colors duration-150",
        isUser
          ? "border-accent-blue/30 bg-accent-blue/10 ml-2 sm:ml-6"
          : isSystem
            ? "border-gold/30 bg-gold/5"
            : "border-border-subtle bg-surface-raised mr-1 sm:mr-4",
      ].join(" ")}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          {isUser ? "You" : isSystem ? "System" : "Akiro AI"}
          {message.action && message.action !== "chat"
            ? ` · ${message.action}`
            : ""}
        </span>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {formatClock(message.createdAt)}
        </span>
      </div>
      <div
        className={[
          "whitespace-pre-wrap text-sm text-foreground leading-relaxed",
          compact ? "text-xs" : "",
        ].join(" ")}
      >
        {message.content}
      </div>
      {message.claims && message.claims.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {message.claims.map((c, i) => (
            <li
              key={i}
              className="flex flex-wrap items-start gap-2 text-xs text-muted"
            >
              <ClaimBadge kind={c.kind} />
              <span className="min-w-0 flex-1">{c.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {message.proposedPatch ? (
        <div className="mt-3 rounded-md border border-border bg-background p-2">
          <p className="text-xs text-muted mb-2">
            Patch:{" "}
            <code className="font-mono text-accent-green">
              {message.proposedPatch.path}
            </code>
            {" — "}
            {message.proposedPatch.description}
          </p>
          <Button size="sm" variant="outline" onClick={onRequestApply}>
            Apply patch…
          </Button>
        </div>
      ) : null}
    </div>
  );
}
