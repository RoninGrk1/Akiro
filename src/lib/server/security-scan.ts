export type ScanFinding = {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  detail: string;
  /** Pattern matches are Verified; heuristic advice is Suggestion. */
  kind: "Verified" | "Suggestion";
  line?: number;
};

/**
 * Real static pattern scanner — only reports Verified matches for concrete
 * source patterns. No fabricated audit theatre.
 */
export function scanSolidityPatterns(source: string): ScanFinding[] {
  const findings: ScanFinding[] = [];
  const lines = source.split("\n");

  const check = (
    re: RegExp,
    finding: Omit<ScanFinding, "line"> & { line?: number },
  ) => {
    for (let i = 0; i < lines.length; i += 1) {
      if (re.test(lines[i])) {
        findings.push({ ...finding, line: i + 1 });
        return;
      }
    }
    // Also try whole-source for multi-line patterns when line loop misses
    if (re.flags.includes("s") || re.flags.includes("m")) {
      if (re.test(source)) findings.push(finding);
    }
  };

  check(/\bselfdestruct\s*\(/, {
    id: "PAT-SELFDESTRUCT",
    severity: "high",
    title: "selfdestruct usage",
    detail: "Verified: source contains selfdestruct(...).",
    kind: "Verified",
  });

  check(/\bdelegatecall\s*\(/, {
    id: "PAT-DELEGATECALL",
    severity: "high",
    title: "delegatecall usage",
    detail: "Verified: source contains delegatecall(...).",
    kind: "Verified",
  });

  check(/\btx\.origin\b/, {
    id: "PAT-TX-ORIGIN",
    severity: "medium",
    title: "tx.origin auth pattern",
    detail: "Verified: source references tx.origin (often unsafe for auth).",
    kind: "Verified",
  });

  check(/\bblock\.(timestamp|number)\b/, {
    id: "PAT-BLOCK-TIME",
    severity: "low",
    title: "Block timestamp/number dependency",
    detail: "Verified: source reads block.timestamp or block.number.",
    kind: "Verified",
  });

  check(/\bsuicide\s*\(/, {
    id: "PAT-SUICIDE",
    severity: "critical",
    title: "Deprecated suicide()",
    detail: "Verified: source contains suicide(...).",
    kind: "Verified",
  });

  check(/\bassembly\s*\{/, {
    id: "PAT-ASSEMBLY",
    severity: "info",
    title: "Inline assembly",
    detail: "Verified: source contains an assembly block.",
    kind: "Verified",
  });

  // Unrestricted public state mutators — pattern match only
  if (/function\s+\w+\s*\([^)]*\)\s+(public|external)\s*(?!.*\b(view|pure)\b)/.test(source)) {
    const hasOnlyOwner =
      /onlyOwner|require\s*\(\s*msg\.sender\s*==/.test(source);
    if (!hasOnlyOwner) {
      findings.push({
        id: "PAT-PUBLIC-MUTATOR",
        severity: "medium",
        title: "Public/external mutator without obvious access control",
        detail:
          "Verified pattern: public/external non-view function without onlyOwner or msg.sender == owner check in file.",
        kind: "Verified",
      });
    }
  }

  findings.push({
    id: "SCAN-SCOPE",
    severity: "info",
    title: "Pattern scanner scope",
    detail:
      "This is a Verified static pattern matcher only — not a formal audit or symbolic analyser.",
    kind: "Verified",
  });

  return findings;
}
