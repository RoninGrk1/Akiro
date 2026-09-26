"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { FileTree } from "@/components/workspace/FileTree";
import { EditorTabs } from "@/components/workspace/EditorTabs";
import {
  WorkspaceToolbar,
  type PreviewLayout,
} from "@/components/workspace/WorkspaceToolbar";
import { PreviewPane } from "@/components/workspace/PreviewPane";
import { useConsole } from "@/components/shell/ConsoleContext";
import { useAiChat } from "@/components/ai/AiChatContext";
import {
  DEFAULT_OPEN_FILES,
  languageForPath,
  type TreeNode,
} from "@/lib/workspace/sample-project";
import { fetchFile, fetchTree, saveFile } from "@/lib/workspace/api";

const CodeEditor = dynamic(
  () =>
    import("@/components/workspace/CodeEditor").then((m) => m.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        Loading Monaco…
      </div>
    ),
  },
);

export function WorkspaceView() {
  const { runProjectBuild, expandBottom, appendLogs } = useConsole();
  const { appliedPatchVersion, lastAppliedPatch } = useAiChat();

  const [tree, setTree] = useState<TreeNode[]>([]);
  const [openPaths, setOpenPaths] = useState<string[]>([...DEFAULT_OPEN_FILES]);
  const [activePath, setActivePath] = useState<string | null>(
    DEFAULT_OPEN_FILES[0] ?? null,
  );
  const [contents, setContents] = useState<Record<string, string>>({});
  const [savedContents, setSavedContents] = useState<Record<string, string>>({});
  const [dirtyPaths, setDirtyPaths] = useState<Set<string>>(() => new Set());
  const [layout, setLayout] = useState<PreviewLayout>("split");
  const [treeCollapsed, setTreeCollapsed] = useState(false);
  const [mobileTreeOpen, setMobileTreeOpen] = useState(false);
  const [appliedVersionSeen, setAppliedVersionSeen] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refreshTree = useCallback(async () => {
    try {
      const t = await fetchTree();
      setTree(t);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load tree");
    }
  }, []);

  useEffect(() => {
    // Fetch on-disk tree once on mount
    let cancelled = false;
    void fetchTree().then((tree) => {
      if (!cancelled) {
        setTree(tree);
        setLoadError(null);
      }
    }).catch((err: unknown) => {
      if (!cancelled) {
        setLoadError(err instanceof Error ? err.message : "Failed to load tree");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load default open files from disk
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next: Record<string, string> = {};
      for (const path of DEFAULT_OPEN_FILES) {
        try {
          const file = await fetchFile(path);
          next[path] = file.content;
        } catch {
          // file may not exist yet
        }
      }
      if (!cancelled) {
        setContents((prev) => ({ ...next, ...prev }));
        setSavedContents((prev) => ({ ...next, ...prev }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Apply confirmed AI patches when version advances (adjust state during render).
  if (
    lastAppliedPatch &&
    appliedPatchVersion > 0 &&
    appliedPatchVersion !== appliedVersionSeen
  ) {
    const { path, newContent } = lastAppliedPatch;
    setAppliedVersionSeen(appliedPatchVersion);
    setOpenPaths((prev) => (prev.includes(path) ? prev : [...prev, path]));
    setContents((prev) => ({ ...prev, [path]: newContent }));
    setActivePath(path);
    setDirtyPaths((prev) => new Set(prev).add(path));
    void saveFile(path, newContent)
      .then(() => {
        setSavedContents((prev) => ({ ...prev, [path]: newContent }));
        setDirtyPaths((prev) => {
          const next = new Set(prev);
          next.delete(path);
          return next;
        });
        void refreshTree();
        appendLogs([
          { text: `Saved AI patch to ${path} (on disk)`, tone: "success" },
        ]);
      })
      .catch((err: unknown) => {
        appendLogs([
          {
            text: `Failed to save patch: ${err instanceof Error ? err.message : String(err)}`,
            tone: "error",
          },
        ]);
      });
  }

  const language = activePath ? languageForPath(activePath) : "plaintext";
  const value = activePath ? (contents[activePath] ?? "") : "";

  async function openFile(path: string) {
    setOpenPaths((prev) => (prev.includes(path) ? prev : [...prev, path]));
    setActivePath(path);
    if (contents[path] !== undefined) return;
    try {
      const file = await fetchFile(path);
      setContents((prev) => ({ ...prev, [path]: file.content }));
      setSavedContents((prev) => ({ ...prev, [path]: file.content }));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Open failed");
    }
  }

  function closeTab(path: string) {
    setOpenPaths((prev) => {
      const next = prev.filter((p) => p !== path);
      setActivePath((current) => {
        if (current !== path) return current;
        const idx = prev.indexOf(path);
        return next[Math.max(0, idx - 1)] ?? next[0] ?? null;
      });
      return next;
    });
    setDirtyPaths((prev) => {
      if (!prev.has(path)) return prev;
      const next = new Set(prev);
      next.delete(path);
      return next;
    });
  }

  function onChange(next: string) {
    if (!activePath) return;
    setContents((prev) => ({ ...prev, [activePath]: next }));
    const original = savedContents[activePath] ?? "";
    setDirtyPaths((prev) => {
      const dirty = next !== original;
      if (dirty === prev.has(activePath)) return prev;
      const copy = new Set(prev);
      if (dirty) copy.add(activePath);
      else copy.delete(activePath);
      return copy;
    });
  }

  async function onSave() {
    if (!activePath) return;
    setSaving(true);
    try {
      const content = contents[activePath] ?? "";
      await saveFile(activePath, content);
      setSavedContents((prev) => ({ ...prev, [activePath]: content }));
      setDirtyPaths((prev) => {
        const next = new Set(prev);
        next.delete(activePath);
        return next;
      });
      appendLogs([{ text: `Saved ${activePath}`, tone: "success" }]);
    } catch (err) {
      appendLogs([
        {
          text: err instanceof Error ? err.message : "Save failed",
          tone: "error",
        },
      ]);
    } finally {
      setSaving(false);
    }
  }

  function onFormat() {
    if (!activePath) return;
    const current = contents[activePath] ?? "";
    const formatted =
      current
        .split("\n")
        .map((line) => line.replace(/\s+$/, ""))
        .join("\n")
        .replace(/\n*$/, "\n");
    onChange(formatted);
  }

  function onRun() {
    void runProjectBuild();
    expandBottom("build");
  }

  const showEditor = layout === "editor" || layout === "split";
  const showPreview = layout === "preview" || layout === "split";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <WorkspaceToolbar
        layout={layout}
        onLayoutChange={setLayout}
        onRun={onRun}
        onFormat={onFormat}
        onSave={() => void onSave()}
        saving={saving}
        dirty={activePath ? dirtyPaths.has(activePath) : false}
        onOpenTree={() => setMobileTreeOpen(true)}
      />
      {loadError ? (
        <p className="border-b border-danger/30 bg-danger/10 px-3 py-1.5 text-xs text-danger">
          {loadError}
        </p>
      ) : null}
      {/* Mobile file tree sheet */}
      {mobileTreeOpen ? (
        <div
          className="fixed inset-0 z-40 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="File tree"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60 akiro-overlay"
            aria-label="Close file tree"
            onClick={() => setMobileTreeOpen(false)}
          />
          <div className="relative z-10 h-full w-[min(18rem,85vw)] bg-surface shadow-[var(--shadow-lg)] akiro-drawer-left">
            <FileTree
              tree={tree}
              activePath={activePath}
              onOpenFile={(p) => {
                void openFile(p);
                setMobileTreeOpen(false);
              }}
            />
          </div>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        {/* Desktop file tree */}
        <div
          className={[
            "hidden md:block shrink-0 border-r border-border transition-[width] duration-200",
            treeCollapsed ? "w-10" : "w-56",
          ].join(" ")}
        >
          {treeCollapsed ? (
            <div className="flex h-full flex-col items-center py-2">
              <button
                type="button"
                className="rounded p-2 text-muted hover:bg-surface-raised hover:text-foreground min-h-11 min-w-11 flex items-center justify-center"
                aria-label="Expand file tree"
                onClick={() => setTreeCollapsed(false)}
              >
                <span className="text-xs" aria-hidden>📁</span>
              </button>
            </div>
          ) : (
            <div className="relative h-full">
              <FileTree
                tree={tree}
                activePath={activePath}
                onOpenFile={(p) => void openFile(p)}
              />
              <button
                type="button"
                className="absolute right-1 top-2 rounded p-2 text-muted-foreground hover:bg-surface-raised hover:text-foreground min-h-9 min-w-9"
                aria-label="Collapse file tree"
                onClick={() => setTreeCollapsed(true)}
              >
                «
              </button>
            </div>
          )}
        </div>

        <div className="flex min-h-0 min-w-0 flex-1">
          {showEditor ? (
            <div
              className={[
                "flex min-h-0 min-w-0 flex-col",
                showPreview
                  ? "w-full md:w-1/2 border-border md:border-r"
                  : "w-full",
              ].join(" ")}
            >
              <EditorTabs
                openPaths={openPaths}
                activePath={activePath}
                dirtyPaths={dirtyPaths}
                onSelect={setActivePath}
                onClose={closeTab}
              />
              <div className="min-h-0 flex-1">
                <CodeEditor
                  path={activePath}
                  value={value}
                  language={language}
                  onChange={onChange}
                />
              </div>
            </div>
          ) : null}
          {showPreview ? (
            <div
              className={[
                "min-h-0",
                showEditor
                  ? "hidden md:block md:w-1/2"
                  : "w-full",
              ].join(" ")}
            >
              <PreviewPane
                activePath={activePath}
                content={value}
                language={language}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
