export type CompileIssue = {
  severity: "error" | "warning" | "info";
  message: string;
  line?: number;
  source?: string;
};

export type CompileResult = {
  success: boolean;
  abi: unknown[];
  bytecode: string;
  deployedBytecode?: string;
  contractName?: string;
  issues: CompileIssue[];
  findings?: ScanFinding[];
  note: string;
  claimKind: "Verified";
};

export type ScanFinding = {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  detail: string;
  kind: "Verified" | "Suggestion";
  line?: number;
};

export async function compileSource(
  source: string,
  fileName = "Contract.sol",
): Promise<CompileResult> {
  const res = await fetch("/api/solc/compile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, fileName }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Compile failed (${res.status})`);
  }
  return res.json() as Promise<CompileResult>;
}
