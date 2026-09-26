import solc from "solc";
import { scanSolidityPatterns, type ScanFinding } from "@/lib/server/security-scan";

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

type SolcOutput = {
  errors?: Array<{
    severity: string;
    formattedMessage?: string;
    message?: string;
    sourceLocation?: { start: number; end: number; file: string };
  }>;
  contracts?: Record<
    string,
    Record<
      string,
      {
        abi?: unknown[];
        evm?: {
          bytecode?: { object?: string };
          deployedBytecode?: { object?: string };
        };
      }
    >
  >;
};

function lineFromOffset(source: string, offset: number): number | undefined {
  if (offset < 0) return undefined;
  return source.slice(0, offset).split("\n").length;
}

export function compileSolidity(
  source: string,
  fileName = "Contract.sol",
): CompileResult {
  const input = {
    language: "Solidity",
    sources: {
      [fileName]: { content: source },
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode", "evm.deployedBytecode"],
        },
      },
    },
  };

  let raw: string;
  try {
    raw = solc.compile(JSON.stringify(input));
  } catch (err) {
    return {
      success: false,
      abi: [],
      bytecode: "0x",
      issues: [
        {
          severity: "error",
          message: err instanceof Error ? err.message : String(err),
        },
      ],
      note: "solc threw while compiling.",
      claimKind: "Verified",
    };
  }

  const output = JSON.parse(raw) as SolcOutput;
  const issues: CompileIssue[] = [];

  for (const err of output.errors ?? []) {
    const sev =
      err.severity === "error"
        ? "error"
        : err.severity === "warning"
          ? "warning"
          : "info";
    issues.push({
      severity: sev,
      message: err.formattedMessage ?? err.message ?? "Unknown solc message",
      line: err.sourceLocation
        ? lineFromOffset(source, err.sourceLocation.start)
        : undefined,
      source: err.sourceLocation?.file,
    });
  }

  const hasError = issues.some((i) => i.severity === "error");
  let abi: unknown[] = [];
  let bytecode = "0x";
  let deployedBytecode = "0x";
  let contractName: string | undefined;

  const fileContracts = output.contracts?.[fileName];
  if (fileContracts) {
    const names = Object.keys(fileContracts);
    if (names.length > 0) {
      contractName = names[0];
      const c = fileContracts[names[0]];
      abi = c.abi ?? [];
      const obj = c.evm?.bytecode?.object;
      bytecode = obj ? (obj.startsWith("0x") ? obj : `0x${obj}`) : "0x";
      const dep = c.evm?.deployedBytecode?.object;
      deployedBytecode = dep
        ? dep.startsWith("0x")
          ? dep
          : `0x${dep}`
        : "0x";
    }
  }

  const success = !hasError && bytecode !== "0x" && bytecode.length > 2;

  return {
    success,
    abi,
    bytecode: success ? bytecode : "0x",
    deployedBytecode: success ? deployedBytecode : "0x",
    contractName,
    issues,
    findings: scanSolidityPatterns(source),
    note: `Compiled with solc ${solc.version?.() ?? "npm"} — Verified output.`,
    claimKind: "Verified",
  };
}
