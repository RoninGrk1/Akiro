import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { compileSolidity } from "@/lib/server/solc-compile";
import { scanSolidityPatterns } from "@/lib/server/security-scan";

const COUNTER = path.resolve(
  "/workspace/akiro-projects/default/contracts/Counter.sol",
);

describe("compileSolidity", () => {
  it("compiles Counter.sol with real ABI and bytecode", () => {
    const source = fs.readFileSync(COUNTER, "utf8");
    const res = compileSolidity(source, "Counter.sol");
    expect(res.success).toBe(true);
    expect(res.claimKind).toBe("Verified");
    expect(res.abi.length).toBeGreaterThan(0);
    expect(res.bytecode.startsWith("0x")).toBe(true);
    expect(res.bytecode.length).toBeGreaterThan(10);
    expect(res.bytecode).not.toMatch(/mock/i);
    expect(res.contractName).toBe("Counter");
  });

  it("returns Verified errors without pragma/contract", () => {
    const res = compileSolidity("not solidity", "Bad.sol");
    expect(res.success).toBe(false);
    expect(res.issues.some((i) => i.severity === "error")).toBe(true);
  });
});

describe("scanSolidityPatterns", () => {
  it("returns Verified findings only for pattern matches", () => {
    const findings = scanSolidityPatterns(
      "pragma solidity ^0.8.24;\ncontract X { function f() public { selfdestruct(payable(msg.sender)); } }",
    );
    expect(findings.some((f) => f.id === "PAT-SELFDESTRUCT")).toBe(true);
    for (const f of findings) {
      expect(["Verified", "Suggestion"]).toContain(f.kind);
    }
  });
});
