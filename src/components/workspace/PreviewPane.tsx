"use client";

import { useEffect, useMemo, useState } from "react";
import type { SampleLanguage } from "@/lib/workspace/sample-project";
import { fetchFile } from "@/lib/workspace/api";

export type PreviewPaneProps = {
  activePath: string | null;
  content: string;
  language: SampleLanguage;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function simpleMarkdown(md: string): string {
  const escaped = escapeHtml(md);
  return escaped
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n\n/g, "</p><p>");
}

export function PreviewPane({ activePath, content, language }: PreviewPaneProps) {
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const file = await fetchFile("preview/index.html");
        if (!cancelled) setPreviewHtml(file.content);
      } catch {
        if (!cancelled) setPreviewHtml(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mode = useMemo(() => {
    if (!activePath) return "app" as const;
    if (language === "markdown") return "markdown" as const;
    if (activePath.endsWith(".html")) return "html" as const;
    return "app" as const;
  }, [activePath, language]);

  const srcDoc = useMemo(() => {
    if (mode === "markdown") {
      const body = simpleMarkdown(content || "");
      return `<!DOCTYPE html><html lang="en-GB"><head><meta charset="utf-8"/>
<style>
  body { margin: 0; padding: 1.25rem; font-family: system-ui, sans-serif;
    background: #080B0D; color: #E8ECEF; line-height: 1.55; font-size: 14px; }
  h1,h2,h3 { color: #fff; letter-spacing: -0.02em; }
  code, pre { font-family: ui-monospace, Menlo, monospace; font-size: 12px; }
  code { background: #141B21; padding: 0.1rem 0.35rem; border-radius: 4px; color: #22E676; }
  p { color: #9AA3AB; }
</style></head><body><p>${body}</p></body></html>`;
    }
    if (mode === "html") return content;
    return (
      previewHtml ??
      `<!DOCTYPE html><html lang="en-GB"><body style="background:#080B0D;color:#9AA3AB;font-family:system-ui;padding:2rem">
<p>No <code>preview/index.html</code> found in the project.</p>
<p>Run <code>npm run dev</code> in the terminal for a live Next.js preview of this project.</p>
</body></html>`
    );
  }, [mode, content, previewHtml]);

  return (
    <div className="flex h-full min-h-0 flex-col border-l border-border bg-surface">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border-subtle px-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Preview
        </span>
        <span className="text-[10px] text-muted-foreground">
          {mode === "markdown"
            ? "Markdown"
            : mode === "html"
              ? "HTML"
              : "preview/index.html"}
        </span>
      </div>
      <iframe
        title="Application preview"
        className="min-h-0 flex-1 w-full border-0 bg-background"
        sandbox="allow-scripts"
        srcDoc={srcDoc}
      />
    </div>
  );
}
