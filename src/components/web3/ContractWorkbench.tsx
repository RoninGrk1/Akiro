"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useDeployContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { fetchFile } from "@/lib/workspace/api";
import { execTerminal } from "@/lib/workspace/api";
import {
  compileSource,
  type CompileResult,
  type ScanFinding,
} from "@/lib/web3/compiler";
import type { Abi } from "viem";

const CodeEditor = dynamic(
  () =>
    import("@/components/workspace/CodeEditor").then((m) => m.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 items-center justify-center text-sm text-muted">
        Loading editor…
      </div>
    ),
  },
);

export function ContractWorkbench() {
  const [source, setSource] = useState("// loading…");
  const [compile, setCompile] = useState<CompileResult | null>(null);
  const [findings, setFindings] = useState<ScanFinding[]>([]);
  const [testOut, setTestOut] = useState<string[]>([]);
  const [gasOut, setGasOut] = useState<string[]>([]);
  const [confirmDeploy, setConfirmDeploy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const {
    deployContract,
    data: deployHash,
    error: deployError,
    isPending: deployPending,
    reset: resetDeploy,
  } = useDeployContract();
  const { isLoading: waitingTx, isSuccess: deploySuccess, data: receipt } =
    useWaitForTransactionReceipt({ hash: deployHash });

  useEffect(() => {
    void fetchFile("contracts/Counter.sol")
      .then((f) => setSource(f.content))
      .catch(() =>
        setSource(
          "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.24;\ncontract Counter {\n    uint256 public number;\n}\n",
        ),
      );
  }, []);

  const canDeploy = Boolean(compile?.success && compile.bytecode && compile.bytecode !== "0x");

  const severityVariant = useMemo(
    () =>
      ({
        critical: "danger" as const,
        high: "danger" as const,
        medium: "warning" as const,
        low: "planned" as const,
        info: "info" as const,
      }),
    [],
  );

  async function onCompile() {
    setBusy(true);
    setError(null);
    setCompile(null);
    try {
      const result = await compileSource(source, "Counter.sol");
      setCompile(result);
      if (result.findings) setFindings(result.findings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compile failed");
    } finally {
      setBusy(false);
    }
  }

  async function onScan() {
    setBusy(true);
    setError(null);
    try {
      const result = await compileSource(source, "Counter.sol");
      setFindings(result.findings ?? []);
      setCompile(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setBusy(false);
    }
  }

  async function onTests() {
    setBusy(true);
    setError(null);
    try {
      const result = await execTerminal("forge test");
      const lines = [
        ...(result.stdout ? result.stdout.split("\n") : []),
        ...(result.stderr ? result.stderr.split("\n") : []),
      ];
      if (result.missingBinary) {
        lines.push(
          `[akiro] forge is not installed on this host. Install Foundry to run real tests. Exit ${result.exitCode}.`,
        );
      } else {
        lines.push(`(exit ${result.exitCode})`);
      }
      setTestOut(lines);
    } catch (err) {
      setTestOut([err instanceof Error ? err.message : String(err)]);
    } finally {
      setBusy(false);
    }
  }

  async function onGas() {
    setBusy(true);
    setError(null);
    try {
      const result = await compileSource(source, "Counter.sol");
      setCompile(result);
      if (!result.success) {
        setGasOut(["Compile failed — cannot estimate gas."]);
        return;
      }
      const lines = [
        "Verified compile-only metrics from solc:",
        `Contract: ${result.contractName ?? "(unknown)"}`,
        `Creation bytecode length: ${(result.bytecode.length - 2) / 2} bytes`,
        `Deployed bytecode length: ${((result.deployedBytecode?.length ?? 2) - 2) / 2} bytes`,
        "",
        "eth_estimateGas requires a connected wallet + reachable RPC with the bytecode.",
        isConnected
          ? "Wallet connected — use Deploy to let the wallet estimate gas at send time."
          : "No wallet connected — connect an injected wallet for live gas estimation.",
      ];
      setGasOut(lines);
    } catch (err) {
      setGasOut([err instanceof Error ? err.message : String(err)]);
    } finally {
      setBusy(false);
    }
  }

  function doDeploy() {
    if (!compile?.success || !isConnected) return;
    resetDeploy();
    deployContract({
      abi: compile.abi as Abi,
      bytecode: compile.bytecode as `0x${string}`,
    });
  }

  return (
    <div className="space-y-4">
      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-border-subtle px-4 py-3">
          <CardHeader
            title="Smart contract IDE"
            description="Monaco for Solidity from the on-disk project. Compile uses real solc. Deploy signs in your wallet — never server-side keys."
            action={<Badge variant="available">Available</Badge>}
          />
        </div>
        <div className="h-72 border-b border-border">
          <CodeEditor
            path="contracts/Counter.sol"
            value={source}
            language="solidity"
            onChange={setSource}
          />
        </div>
        <div className="flex flex-wrap gap-2 p-3">
          <Button size="sm" disabled={busy} onClick={() => void onCompile()}>
            Compile
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => void onScan()}
          >
            Security scan
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => void onTests()}
          >
            Run tests
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => void onGas()}
          >
            Gas optimiser
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!canDeploy}
            onClick={() => setConfirmDeploy(true)}
          >
            Deploy…
          </Button>
        </div>
      </Card>

      {error ? (
        <Card>
          <p className="text-sm text-danger">{error}</p>
        </Card>
      ) : null}

      {compile ? (
        <Card>
          <CardHeader
            title="Compiler output"
            description={compile.note}
            action={
              <Badge variant={compile.success ? "available" : "danger"}>
                {compile.success ? "Verified success" : "Verified failure"}
              </Badge>
            }
          />
          {compile.issues.length > 0 ? (
            <ul className="mb-3 space-y-1 text-xs">
              {compile.issues.map((i, idx) => (
                <li
                  key={idx}
                  className={
                    i.severity === "error"
                      ? "text-danger"
                      : i.severity === "warning"
                        ? "text-warning"
                        : "text-muted"
                  }
                >
                  [{i.severity}] {i.message}
                  {i.line ? ` (line ${i.line})` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-accent-green mb-3">No solc issues.</p>
          )}
          {compile.success ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted mb-1">
                  ABI (Verified)
                </p>
                <pre className="max-h-40 overflow-auto rounded-md border border-border bg-background p-2 font-mono text-[10px] text-muted">
                  {JSON.stringify(compile.abi, null, 2)}
                </pre>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted mb-1">
                  Bytecode (Verified)
                </p>
                <pre className="max-h-40 overflow-auto rounded-md border border-border bg-background p-2 font-mono text-[10px] text-muted break-all whitespace-pre-wrap">
                  {compile.bytecode}
                </pre>
              </div>
            </div>
          ) : null}
        </Card>
      ) : null}

      {findings.length > 0 ? (
        <Card>
          <CardHeader
            title="Security scanner"
            description="Verified static pattern matches only — not a formal audit."
          />
          <ul className="space-y-2">
            {findings.map((f) => (
              <li
                key={f.id}
                className="rounded-md border border-border p-3 text-xs"
              >
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge variant={severityVariant[f.severity]}>{f.severity}</Badge>
                  <Badge variant={f.kind === "Verified" ? "available" : "planned"}>
                    {f.kind}
                  </Badge>
                  <span className="font-medium text-foreground">{f.title}</span>
                </div>
                <p className="text-muted">{f.detail}</p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {testOut.length > 0 ? (
        <Card>
          <CardHeader
            title="Unit testing runner"
            description="Real forge test via sandboxed terminal (or honest missing-binary message)."
          />
          <pre className="font-mono text-xs text-muted whitespace-pre-wrap">
            {testOut.join("\n")}
          </pre>
        </Card>
      ) : null}

      {gasOut.length > 0 ? (
        <Card>
          <CardHeader
            title="Gas optimiser"
            description="Verified compile-only metrics; live estimateGas needs wallet + RPC."
          />
          <pre className="font-mono text-xs text-muted whitespace-pre-wrap">
            {gasOut.join("\n")}
          </pre>
        </Card>
      ) : null}

      {deployHash || deployError || deploySuccess ? (
        <Card>
          {deployError ? (
            <p className="text-sm text-danger">{deployError.message}</p>
          ) : null}
          {deployHash ? (
            <p className="text-xs font-mono text-muted break-all">
              Tx: {deployHash}
              {waitingTx ? " (waiting for receipt…)" : ""}
            </p>
          ) : null}
          {deploySuccess && receipt?.contractAddress ? (
            <p className="text-sm text-accent-green break-all">
              Verified deploy · contract {receipt.contractAddress}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-muted-foreground">
            Signed in your wallet. No private keys on the server.
          </p>
        </Card>
      ) : null}

      <ConfirmDialog
        open={confirmDeploy}
        title="Confirm deploy?"
        description={
          isConnected ? (
            <>
              <p>
                Your wallet (<span className="font-mono text-xs">{address}</span>)
                will be asked to sign a contract creation transaction with the
                Verified solc bytecode.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Nothing is broadcast until you approve in the wallet extension.
              </p>
            </>
          ) : (
            <p className="text-danger">
              No wallet connected. Connect an injected browser wallet first —
              Akiro will not invent a deploy address.
            </p>
          )
        }
        confirmLabel={isConnected ? "Sign in wallet" : "Close"}
        tone="danger"
        onCancel={() => setConfirmDeploy(false)}
        onConfirm={() => {
          setConfirmDeploy(false);
          if (isConnected) doDeploy();
        }}
      />
      {deployPending ? (
        <p className="text-xs text-muted">Waiting for wallet signature…</p>
      ) : null}
    </div>
  );
}
