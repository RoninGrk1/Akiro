/** Language helpers and default open paths for the on-disk workspace. */

export type SampleLanguage =
  | "typescript"
  | "javascript"
  | "json"
  | "markdown"
  | "solidity"
  | "toml"
  | "html"
  | "css"
  | "plaintext";

export type TreeNode =
  | { type: "file"; name: string; path: string }
  | { type: "folder"; name: string; path: string; children: TreeNode[] };

export const DEFAULT_OPEN_FILES = [
  "src/app/page.tsx",
  "contracts/Counter.sol",
] as const;

export function languageForPath(path: string): SampleLanguage {
  if (path.endsWith(".sol")) return "solidity";
  if (path.endsWith(".tsx") || path.endsWith(".ts")) return "typescript";
  if (path.endsWith(".jsx") || path.endsWith(".js")) return "javascript";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".md")) return "markdown";
  if (path.endsWith(".toml")) return "toml";
  if (path.endsWith(".html")) return "html";
  if (path.endsWith(".css")) return "css";
  return "plaintext";
}

export function monacoLanguage(lang: SampleLanguage): string {
  switch (lang) {
    case "solidity":
      return "sol";
    case "toml":
      return "ini";
    default:
      return lang;
  }
}
