"use client";

import { useCallback, useState, type KeyboardEvent } from "react";
import type { TreeNode } from "@/lib/workspace/sample-project";

export type FileTreeProps = {
  tree: TreeNode[];
  activePath: string | null;
  onOpenFile: (path: string) => void;
};

export function FileTree({ tree, activePath, onOpenFile }: FileTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(["contracts", "contracts/test", "src", "src/app", "src/lib", "preview"]),
  );

  const toggle = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="flex h-10 shrink-0 items-center border-b border-border-subtle px-3">
        <h2 className="truncate text-xs font-semibold uppercase tracking-wider text-muted">
          Explorer
        </h2>
      </div>
      <div
        className="min-h-0 flex-1 overflow-auto py-1"
        role="tree"
        aria-label="Project files"
      >
        <p className="px-3 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          akiro-default
        </p>
        {tree.map((node) => (
          <TreeItem
            key={node.path}
            node={node}
            depth={0}
            expanded={expanded}
            activePath={activePath}
            onToggle={toggle}
            onOpenFile={onOpenFile}
          />
        ))}
      </div>
    </div>
  );
}

function TreeItem({
  node,
  depth,
  expanded,
  activePath,
  onToggle,
  onOpenFile,
}: {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  activePath: string | null;
  onToggle: (path: string) => void;
  onOpenFile: (path: string) => void;
}) {
  const pad = 8 + depth * 12;

  if (node.type === "folder") {
    const isOpen = expanded.has(node.path);
    return (
      <div role="treeitem" aria-expanded={isOpen} aria-selected={false}>
        <button
          type="button"
          className="flex w-full items-center gap-1.5 py-1 pr-2 text-left text-xs text-muted hover:bg-surface-raised hover:text-foreground"
          style={{ paddingLeft: pad }}
          onClick={() => onToggle(node.path)}
          onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
            if (e.key === "ArrowRight" && !isOpen) {
              e.preventDefault();
              onToggle(node.path);
            }
            if (e.key === "ArrowLeft" && isOpen) {
              e.preventDefault();
              onToggle(node.path);
            }
          }}
        >
          <Chevron open={isOpen} />
          <FolderIcon />
          <span className="truncate">{node.name}</span>
        </button>
        {isOpen ? (
          <div role="group">
            {node.children.map((child) => (
              <TreeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                expanded={expanded}
                activePath={activePath}
                onToggle={onToggle}
                onOpenFile={onOpenFile}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  const active = activePath === node.path;
  return (
    <div role="treeitem" aria-selected={active}>
      <button
        type="button"
        className={[
          "flex w-full items-center gap-1.5 py-1 pr-2 text-left text-xs",
          active
            ? "bg-accent-green/10 text-accent-green"
            : "text-muted hover:bg-surface-raised hover:text-foreground",
        ].join(" ")}
        style={{ paddingLeft: pad + 14 }}
        onClick={() => onOpenFile(node.path)}
        onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenFile(node.path);
          }
        }}
      >
        <FileIcon name={node.name} />
        <span className="truncate">{node.name}</span>
      </button>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={["shrink-0 transition-transform", open ? "rotate-90" : ""].join(" ")}
      aria-hidden
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="shrink-0 text-gold" aria-hidden>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  );
}

function FileIcon({ name }: { name: string }) {
  const color = name.endsWith(".sol")
    ? "text-accent-blue"
    : name.endsWith(".tsx") || name.endsWith(".ts")
      ? "text-accent-green"
      : name.endsWith(".md")
        ? "text-muted"
        : "text-muted-foreground";
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={`shrink-0 ${color}`} aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
