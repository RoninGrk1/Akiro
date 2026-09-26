import { describe, expect, it } from "vitest";
import { validateCommand } from "@/lib/server/terminal";

describe("validateCommand", () => {
  it("allows ls and pwd", () => {
    expect(validateCommand("ls").ok).toBe(true);
    expect(validateCommand("pwd").ok).toBe(true);
  });

  it("rejects shell metacharacters", () => {
    const res = validateCommand("ls; rm -rf /");
    expect(res.ok).toBe(false);
  });

  it("rejects unknown binaries", () => {
    const res = validateCommand("curl https://example.com");
    expect(res.ok).toBe(false);
  });

  it("allows git status but not git push", () => {
    expect(validateCommand("git status").ok).toBe(true);
    expect(validateCommand("git push origin main").ok).toBe(false);
  });

  it("rejects path traversal args", () => {
    expect(validateCommand("cat ../secret").ok).toBe(false);
  });
});
