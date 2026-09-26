import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.(tsx?|jsx?|md)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

describe("secret / seed hygiene", () => {
  it("does not introduce seed phrase or private key input fields", () => {
    const files = walk(ROOT);
    const offenders: string[] = [];
    const inputish =
      /(name|id|placeholder|label|aria-label)\s*=\s*["'][^"']*(seed\s*phrase|mnemonic|private[_-]?key)[^"']*["']/i;
    const solicit =
      /(enter|paste|provide|type|input)\s+(your\s+)?(seed\s*phrase|mnemonic|private[_-]?key)/i;
    for (const file of files) {
      if (file.includes("__tests__")) continue;
      if (file.endsWith("SECURITY.md") || file.endsWith("README.md")) continue;
      const text = fs.readFileSync(file, "utf8");
      if (inputish.test(text) || solicit.test(text)) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });
});
