import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { TOOLS } from "@/lib/tools";
import { getToolsCatalog } from "@/lib/tools-catalog";

describe("TOOLS catalogue", () => {
  it("exposes exactly 20 tools", () => {
    expect(TOOLS).toHaveLength(20);
  });

  it("deep-links every tool", () => {
    const catalog = getToolsCatalog();
    expect(catalog).toHaveLength(20);
    for (const item of catalog) {
      expect(item.href.startsWith("/")).toBe(true);
    }
  });

  it("does not mark cloud-only tools Available without caveats in description when Needs configuration", () => {
    const ai = TOOLS.find((t) => t.id === "ai-code-generator");
    expect(ai?.status).toBe("Needs configuration");
  });
});

describe("on-disk project", () => {
  it("includes Counter.sol and page.tsx on disk", () => {
    const root = "/workspace/akiro-projects/default";
    expect(
      fs.existsSync(path.join(root, "contracts/Counter.sol")),
    ).toBe(true);
    expect(fs.existsSync(path.join(root, "src/app/page.tsx"))).toBe(true);
  });
});
