"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  nextMessageId,
  type AiAction,
  type AiMessage,
} from "@/lib/ai/types";
import { FIXED_BOOT_ISO, nowIso } from "@/lib/format-clock";
import { fetchTree } from "@/lib/workspace/api";
import type { TreeNode } from "@/lib/workspace/sample-project";

export type PendingPatch = {
  path: string;
  description: string;
  newContent: string;
  messageId: string;
};

type AiChatContextValue = {
  messages: AiMessage[];
  contextPaths: string[];
  toggleContextPath: (path: string) => void;
  setContextPaths: (paths: string[]) => void;
  isThinking: boolean;
  send: (text: string, action?: AiAction) => void;
  pendingPatch: PendingPatch | null;
  requestApplyPatch: (patch: PendingPatch) => void;
  clearPendingPatch: () => void;
  appliedPatchVersion: number;
  lastAppliedPatch: PendingPatch | null;
  confirmApplyPatch: () => void;
  availableContextFiles: string[];
  aiConfigured: boolean | null;
};

const AiChatContext = createContext<AiChatContextValue | null>(null);

function flattenFiles(nodes: TreeNode[], acc: string[] = []): string[] {
  for (const n of nodes) {
    if (n.type === "file") acc.push(n.path);
    else flattenFiles(n.children, acc);
  }
  return acc;
}

export function AiChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [contextPaths, setContextPaths] = useState<string[]>([
    "contracts/Counter.sol",
    "src/app/page.tsx",
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [pendingPatch, setPendingPatch] = useState<PendingPatch | null>(null);
  const [lastAppliedPatch, setLastAppliedPatch] = useState<PendingPatch | null>(
    null,
  );
  const [appliedPatchVersion, setAppliedPatchVersion] = useState(0);
  const [availableContextFiles, setAvailableContextFiles] = useState<string[]>(
    [],
  );
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    void fetch("/api/config/status")
      .then((r) => r.json())
      .then((d: { aiConfigured?: boolean }) => {
        setAiConfigured(Boolean(d.aiConfigured));
        if (!d.aiConfigured) {
          setMessages([
            {
              id: "welcome-unconfigured",
              role: "system",
              createdAt: FIXED_BOOT_ISO,
              content:
                "**AI Coding Lab needs configuration.** Set `AI_API_KEY` in `.env.local` (OpenAI-compatible; default base `https://api.x.ai/v1`). Until then Akiro will not invent assistant replies.",
              claims: [
                {
                  kind: "Verified",
                  text: "AI_API_KEY is not set — API returns 503.",
                },
              ],
            },
          ]);
        } else {
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              createdAt: FIXED_BOOT_ISO,
              content:
                "Welcome to the **AI Coding Lab**. Model replies are labelled **Suggestion** unless a Verified tool result is attached. Confirm before any file patch is applied.",
              claims: [
                {
                  kind: "Verified",
                  text: "AI_API_KEY is configured on the server.",
                },
              ],
            },
          ]);
        }
      })
      .catch(() => setAiConfigured(false));

    void fetchTree()
      .then((tree) => setAvailableContextFiles(flattenFiles(tree)))
      .catch(() => setAvailableContextFiles([]));
  }, []);

  const toggleContextPath = useCallback((path: string) => {
    setContextPaths((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
    );
  }, []);

  const send = useCallback(
    (text: string, action: AiAction = "chat") => {
      const trimmed = text.trim();
      if (!trimmed && action === "chat") return;

      if (aiConfigured === false) {
        setMessages((m) => [
          ...m,
          {
            id: nextMessageId(),
            role: "user",
            content: trimmed || `(action: ${action})`,
            createdAt: nowIso(),
            action,
          },
          {
            id: nextMessageId(),
            role: "system",
            createdAt: nowIso(),
            content:
              "AI is not configured. Add `AI_API_KEY` to `.env.local` and restart the server. No stub replies are generated.",
            error: true,
            claims: [
              {
                kind: "Verified",
                text: "Request blocked locally — missing AI_API_KEY.",
              },
            ],
          },
        ]);
        return;
      }

      const userMsg: AiMessage = {
        id: nextMessageId(),
        role: "user",
        content: trimmed || `(action: ${action})`,
        createdAt: nowIso(),
        action,
      };
      setMessages((m) => [...m, userMsg]);
      setIsThinking(true);

      void fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          action,
          contextPaths,
        }),
      })
        .then(async (res) => {
          const data = (await res.json()) as {
            content?: string;
            error?: string;
            claims?: AiMessage["claims"];
            status?: string;
          };
          if (!res.ok) {
            setMessages((m) => [
              ...m,
              {
                id: nextMessageId(),
                role: "system",
                createdAt: nowIso(),
                content:
                  data.error ??
                  `AI request failed (${res.status}). ${data.status ?? ""}`.trim(),
                error: true,
                claims: [
                  {
                    kind: "Verified",
                    text: `HTTP ${res.status} from /api/ai/chat`,
                  },
                ],
              },
            ]);
            if (res.status === 503) setAiConfigured(false);
            return;
          }
          setMessages((m) => [
            ...m,
            {
              id: nextMessageId(),
              role: "assistant",
              createdAt: nowIso(),
              action,
              content: data.content ?? "",
              claims: data.claims ?? [
                {
                  kind: "Suggestion",
                  text: "Model response — not tool verified.",
                },
              ],
            },
          ]);
        })
        .catch((err: unknown) => {
          setMessages((m) => [
            ...m,
            {
              id: nextMessageId(),
              role: "system",
              createdAt: nowIso(),
              content: err instanceof Error ? err.message : String(err),
              error: true,
            },
          ]);
        })
        .finally(() => setIsThinking(false));
    },
    [contextPaths, aiConfigured],
  );

  const requestApplyPatch = useCallback((patch: PendingPatch) => {
    setPendingPatch(patch);
  }, []);

  const clearPendingPatch = useCallback(() => {
    setPendingPatch(null);
  }, []);

  const confirmApplyPatch = useCallback(() => {
    if (!pendingPatch) return;
    setLastAppliedPatch(pendingPatch);
    setAppliedPatchVersion((v) => v + 1);
    setMessages((m) => [
      ...m,
      {
        id: nextMessageId(),
        role: "system",
        createdAt: nowIso(),
        content: `Applied patch to \`${pendingPatch.path}\` on disk (after confirmation).`,
        claims: [
          {
            kind: "Verified",
            text: "User confirmed Apply patch in the UI.",
          },
        ],
      },
    ]);
    setPendingPatch(null);
  }, [pendingPatch]);

  const value = useMemo<AiChatContextValue>(
    () => ({
      messages,
      contextPaths,
      toggleContextPath,
      setContextPaths,
      isThinking,
      send,
      pendingPatch,
      requestApplyPatch,
      clearPendingPatch,
      appliedPatchVersion,
      lastAppliedPatch,
      confirmApplyPatch,
      availableContextFiles,
      aiConfigured,
    }),
    [
      messages,
      contextPaths,
      toggleContextPath,
      isThinking,
      send,
      pendingPatch,
      requestApplyPatch,
      clearPendingPatch,
      appliedPatchVersion,
      lastAppliedPatch,
      confirmApplyPatch,
      availableContextFiles,
      aiConfigured,
    ],
  );

  return (
    <AiChatContext.Provider value={value}>{children}</AiChatContext.Provider>
  );
}

export function useAiChat(): AiChatContextValue {
  const ctx = useContext(AiChatContext);
  if (!ctx) throw new Error("useAiChat must be used within AiChatProvider");
  return ctx;
}
