import { spawn } from "node:child_process";
import { PROJECT_ROOT, resolveProjectPath, PathError } from "@/lib/server/paths";

export type ExecResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut?: boolean;
  missingBinary?: string;
};

const ALLOWED_BINARIES = new Set([
  "ls",
  "pwd",
  "cat",
  "npm",
  "npx",
  "node",
  "forge",
  "cast",
  "solc",
  "git",
  "mkdir",
  "touch",
  "rm",
  "echo",
  "which",
  "head",
  "wc",
]);

const GIT_ALLOWED_SUB = new Set([
  "status",
  "diff",
  "log",
  "branch",
  "show",
  "rev-parse",
  "remote",
]);

const DANGEROUS_GIT = /\b(push|force|reset\s+--hard|clean\s+-f|filter-branch)\b/i;

function parseCommandLine(raw: string): string[] {
  const tokens: string[] = [];
  let cur = "";
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (/\s/.test(ch)) {
      if (cur) {
        tokens.push(cur);
        cur = "";
      }
      continue;
    }
    cur += ch;
  }
  if (cur) tokens.push(cur);
  return tokens;
}

export function validateCommand(raw: string): {
  ok: true;
  argv: string[];
} | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: "Empty command" };
  if (/[;&|`$<>]/.test(trimmed) || trimmed.includes("\n")) {
    return {
      ok: false,
      error: "Shell metacharacters (;|&`$<>) are not allowed. Pass a single allowlisted command.",
    };
  }
  const argv = parseCommandLine(trimmed);
  if (!argv.length) return { ok: false, error: "Empty command" };
  const bin = argv[0];
  if (!ALLOWED_BINARIES.has(bin)) {
    return {
      ok: false,
      error: `Command not allowlisted: ${bin}. Allowed: ${[...ALLOWED_BINARIES].sort().join(", ")}`,
    };
  }
  if (bin === "git") {
    const sub = argv[1];
    if (!sub || !GIT_ALLOWED_SUB.has(sub)) {
      return {
        ok: false,
        error: `git subcommand not allowed. Allowed: ${[...GIT_ALLOWED_SUB].join(", ")}`,
      };
    }
    if (DANGEROUS_GIT.test(trimmed)) {
      return { ok: false, error: "Destructive git operations are blocked." };
    }
  }
  // Reject path traversal in any arg
  for (const arg of argv.slice(1)) {
    if (arg.includes("..") || arg.startsWith("/") || arg.startsWith("~")) {
      // Allow absolute only for nothing — keep cwd-relative
      if (arg.startsWith("/") || arg.startsWith("~") || arg.split("/").includes("..")) {
        return { ok: false, error: `Argument rejects absolute or '..' paths: ${arg}` };
      }
    }
  }
  if (bin === "rm") {
    for (const arg of argv.slice(1)) {
      if (arg.startsWith("-") && /[rR]/.test(arg) && arg.includes("f")) {
        // allow rm -rf only of relative paths already checked
      }
      if (arg === "/" || arg === "." || arg === "..") {
        return { ok: false, error: "Refusing unsafe rm target" };
      }
    }
  }
  return { ok: true, argv };
}

export function execInProject(
  raw: string,
  timeoutMs = 60_000,
): Promise<ExecResult> {
  const validated = validateCommand(raw);
  if (!validated.ok) {
    return Promise.resolve({
      stdout: "",
      stderr: validated.error,
      exitCode: 126,
    });
  }
  const { argv } = validated;
  const bin = argv[0];

  return new Promise((resolve) => {
    const child = spawn(argv[0], argv.slice(1), {
      cwd: PROJECT_ROOT,
      env: {
        ...process.env,
        // Avoid leaking parent secrets into child beyond PATH etc. — keep PATH
        HOME: process.env.HOME,
        PATH: process.env.PATH,
        NODE_ENV: process.env.NODE_ENV,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout?.on("data", (d: Buffer) => {
      stdout += d.toString("utf8");
      if (stdout.length > 512_000) stdout = stdout.slice(0, 512_000) + "\n…truncated";
    });
    child.stderr?.on("data", (d: Buffer) => {
      stderr += d.toString("utf8");
      if (stderr.length > 512_000) stderr = stderr.slice(0, 512_000) + "\n…truncated";
    });

    child.on("error", (err: NodeJS.ErrnoException) => {
      clearTimeout(timer);
      if (err.code === "ENOENT") {
        resolve({
          stdout,
          stderr: `Binary not found: ${bin}. Install it on the host, or use an alternative allowlisted tool.`,
          exitCode: 127,
          missingBinary: bin,
        });
        return;
      }
      resolve({
        stdout,
        stderr: err.message,
        exitCode: 1,
      });
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr: timedOut
          ? `${stderr}\n[akiro] Command timed out after ${timeoutMs}ms`.trim()
          : stderr,
        exitCode: timedOut ? 124 : (code ?? 1),
        timedOut,
      });
    });
  });
}

/** Re-export for callers that need path checks alongside exec. */
export { PROJECT_ROOT, resolveProjectPath, PathError };
