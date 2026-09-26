import type { TreeNode } from "@/lib/workspace/sample-project";

export async function fetchTree(): Promise<TreeNode[]> {
  const res = await fetch("/api/workspace/files");
  if (!res.ok) throw new Error("Failed to list workspace files");
  const data = (await res.json()) as { tree: TreeNode[] };
  return data.tree;
}

export async function fetchFile(
  path: string,
): Promise<{ path: string; content: string; language: string }> {
  const res = await fetch(
    `/api/workspace/files?path=${encodeURIComponent(path)}`,
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Failed to read ${path}`);
  }
  return res.json();
}

export async function saveFile(path: string, content: string): Promise<void> {
  const res = await fetch("/api/workspace/files", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, content }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Failed to save ${path}`);
  }
}

export type TerminalResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  cwd?: string;
  missingBinary?: string;
  timedOut?: boolean;
};

export async function execTerminal(command: string): Promise<TerminalResult> {
  const res = await fetch("/api/terminal/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Terminal failed (${res.status})`);
  }
  return res.json();
}
