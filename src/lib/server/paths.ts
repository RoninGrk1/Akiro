import fs from "node:fs";
import path from "node:path";

/** Absolute root for the default on-disk workspace project. */
export const PROJECT_ROOT = path.resolve(
  /*turbopackIgnore: true*/
  process.env.AKIRO_PROJECT_ROOT ?? "/workspace/akiro-projects/default",
);

const BLOCKED_SEGMENTS = new Set(["..", "."]);

/**
 * Resolve a relative workspace path safely under PROJECT_ROOT.
 * Rejects absolute paths, `..`, null bytes, and escapes outside the root.
 */
export function resolveProjectPath(relativePath: string): string {
  if (!relativePath || typeof relativePath !== "string") {
    throw new PathError("Path is required");
  }
  if (relativePath.includes("\0")) {
    throw new PathError("Path contains null byte");
  }
  if (
    relativePath.startsWith("/") ||
    relativePath.startsWith("\\") ||
    /^[A-Za-z]:[/\\]/.test(relativePath)
  ) {
    throw new PathError("Absolute paths are not allowed");
  }
  const normalised = relativePath.replace(/\\/g, "/");
  const segments = normalised.split("/").filter(Boolean);
  for (const seg of segments) {
    if (BLOCKED_SEGMENTS.has(seg)) {
      throw new PathError("Path traversal is not allowed");
    }
  }
  const resolved = path.resolve(PROJECT_ROOT, ...segments);
  const rootWithSep = PROJECT_ROOT.endsWith(path.sep)
    ? PROJECT_ROOT
    : PROJECT_ROOT + path.sep;
  if (resolved !== PROJECT_ROOT && !resolved.startsWith(rootWithSep)) {
    throw new PathError("Path escapes project root");
  }
  return resolved;
}

export class PathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PathError";
  }
}

export type TreeNode =
  | { type: "file"; name: string; path: string }
  | { type: "folder"; name: string; path: string; children: TreeNode[] };

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "out",
  "cache",
  "lib",
]);

export function ensureProjectRoot(): void {
  if (!fs.existsSync(/*turbopackIgnore: true*/ PROJECT_ROOT)) {
    fs.mkdirSync(/*turbopackIgnore: true*/ PROJECT_ROOT, { recursive: true });
  }
}

export function listProjectTree(dir = PROJECT_ROOT, rel = ""): TreeNode[] {
  ensureProjectRoot();
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const nodes: TreeNode[] = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name.startsWith(".") && entry.name !== ".env.example") continue;
    if (SKIP_DIRS.has(entry.name)) continue;
    const childRel = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      nodes.push({
        type: "folder",
        name: entry.name,
        path: childRel,
        children: listProjectTree(path.join(dir, entry.name), childRel),
      });
    } else if (entry.isFile()) {
      nodes.push({ type: "file", name: entry.name, path: childRel });
    }
  }
  return nodes;
}

export function languageForPath(filePath: string): string {
  if (filePath.endsWith(".sol")) return "solidity";
  if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) return "typescript";
  if (filePath.endsWith(".jsx") || filePath.endsWith(".js")) return "javascript";
  if (filePath.endsWith(".json")) return "json";
  if (filePath.endsWith(".md")) return "markdown";
  if (filePath.endsWith(".toml")) return "toml";
  if (filePath.endsWith(".html")) return "html";
  if (filePath.endsWith(".css")) return "css";
  return "plaintext";
}

export function monacoLanguage(lang: string): string {
  switch (lang) {
    case "solidity":
      return "sol";
    case "toml":
      return "ini";
    default:
      return lang;
  }
}
