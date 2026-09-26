import { describe, expect, it } from "vitest";
import { PathError, resolveProjectPath, PROJECT_ROOT } from "@/lib/server/paths";
import path from "node:path";

describe("resolveProjectPath", () => {
  it("resolves a normal relative path under project root", () => {
    const abs = resolveProjectPath("contracts/Counter.sol");
    expect(abs).toBe(path.join(PROJECT_ROOT, "contracts/Counter.sol"));
  });

  it("rejects .. traversal", () => {
    expect(() => resolveProjectPath("../etc/passwd")).toThrow(PathError);
    expect(() => resolveProjectPath("contracts/../../etc/passwd")).toThrow(
      PathError,
    );
  });

  it("rejects absolute paths disguised as relative", () => {
    expect(() => resolveProjectPath("/etc/passwd")).toThrow(PathError);
  });

  it("rejects null bytes", () => {
    expect(() => resolveProjectPath("foo\0bar")).toThrow(PathError);
  });
});
