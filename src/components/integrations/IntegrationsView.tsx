"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge, statusToBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import {
  loadIpfsHistory,
  saveIpfsHistory,
  type IpfsRecord,
} from "@/lib/integrations/state";
import { execTerminal } from "@/lib/workspace/api";

type ConfigStatus = {
  aiConfigured: boolean;
  githubConfigured: boolean;
  ipfsConfigured: boolean;
  vercelConfigured: boolean;
  envVaultConfigured: boolean;
  walletConnectProjectId: boolean;
};

export function IntegrationsView() {
  const [cfg, setCfg] = useState<ConfigStatus | null>(null);

  useEffect(() => {
    void fetch("/api/config/status")
      .then((r) => r.json())
      .then((d: ConfigStatus) => setCfg(d))
      .catch(() =>
        setCfg({
          aiConfigured: false,
          githubConfigured: false,
          ipfsConfigured: false,
          vercelConfigured: false,
          envVaultConfigured: false,
          walletConnectProjectId: false,
        }),
      );
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader
        title="Integrations"
        description="Local-first connectors. Features without secrets show Needs configuration — Akiro never fakes success."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <GithubCard configured={cfg?.githubConfigured ?? false} />
        <IpfsCard configured={cfg?.ipfsConfigured ?? false} />
        <DeployCard configured={cfg?.vercelConfigured ?? false} />
        <DatabaseCard />
        <EnvVaultCard configured={cfg?.envVaultConfigured ?? false} />
        <ApiClientCard />
        <PackageManagerCard />
        <StaticStatusCards cfg={cfg} />
      </div>
    </div>
  );
}

function GithubCard({ configured }: { configured: boolean }) {
  const [repos, setRepos] = useState<{ name: string; private: boolean }[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadRepos() {
    setError(null);
    const res = await fetch("/api/github/repos");
    const data = (await res.json()) as {
      error?: string;
      repos?: { name: string; private: boolean }[];
    };
    if (!res.ok) {
      setError(data.error ?? `HTTP ${res.status}`);
      setRepos([]);
      return;
    }
    setRepos(data.repos ?? []);
  }

  return (
    <Card>
      <CardHeader
        title="GitHub OAuth"
        description="Real OAuth when GITHUB_CLIENT_ID / SECRET are set. No demo toggle."
        action={
          <Badge variant={configured ? "available" : "configured"}>
            {configured ? "Configured" : "Needs configuration"}
          </Badge>
        }
      />
      {!configured ? (
        <p className="text-xs text-muted">
          Set <code className="font-mono">GITHUB_CLIENT_ID</code> and{" "}
          <code className="font-mono">GITHUB_CLIENT_SECRET</code> in{" "}
          <code className="font-mono">.env.local</code>, then use Sign in with
          GitHub.
        </p>
      ) : (
        <div className="space-y-2">
          <Button size="sm" onClick={() => void loadRepos()}>
            List repositories
          </Button>
          {error ? <p className="text-xs text-danger">{error}</p> : null}
          <ul className="space-y-1 text-xs">
            {repos.map((r) => (
              <li
                key={r.name}
                className="flex items-center justify-between rounded border border-border px-2 py-1.5"
              >
                <span className="font-mono text-foreground">{r.name}</span>
                <Badge variant={r.private ? "planned" : "info"}>
                  {r.private ? "Private" : "Public"}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

function IpfsCard({ configured }: { configured: boolean }) {
  const [fileName, setFileName] = useState("artifact.json");
  const [content, setContent] = useState('{"ok":true}');
  const [history, setHistory] = useState<IpfsRecord[]>(loadIpfsHistory);
  const [lastCid, setLastCid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  async function pin() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ipfs/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fileName, content }),
      });
      const data = (await res.json()) as { cid?: string; error?: string };
      if (!res.ok || !data.cid) {
        setError(data.error ?? `HTTP ${res.status}`);
        setLastCid(null);
        return;
      }
      const row = {
        name: fileName || "file",
        cid: data.cid,
        at: new Date().toISOString(),
      };
      const next = [row, ...history];
      setHistory(next);
      saveIpfsHistory(next);
      setLastCid(data.cid);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="IPFS / decentralised storage"
        description="Pins via Pinata or web3.storage when configured. No fake CIDs."
        action={
          <Badge variant={configured ? "available" : "configured"}>
            {configured ? "Available" : "Needs configuration"}
          </Badge>
        }
      />
      {!configured ? (
        <p className="text-xs text-muted">
          Set <code className="font-mono">IPFS_JWT</code> or{" "}
          <code className="font-mono">WEB3_STORAGE_TOKEN</code>.
        </p>
      ) : (
        <>
          <Input
            label="File name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
          <textarea
            className="mt-2 w-full min-h-[64px] rounded-md border border-border bg-background p-2 font-mono text-xs"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            aria-label="Content to pin"
          />
          <Button
            size="sm"
            className="mt-2"
            disabled={busy}
            onClick={() => setConfirm(true)}
          >
            Pin to IPFS…
          </Button>
        </>
      )}
      {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
      {lastCid ? (
        <p className="mt-2 font-mono text-xs text-accent-green break-all">
          Verified CID: {lastCid}
        </p>
      ) : null}
      {history.length > 0 ? (
        <ul className="mt-3 max-h-32 overflow-auto space-y-1 text-[11px] text-muted">
          {history.map((h) => (
            <li key={h.cid + h.at} className="font-mono truncate">
              {h.name} → {h.cid}
            </li>
          ))}
        </ul>
      ) : null}
      <ConfirmDialog
        open={confirm}
        title="Pin to IPFS?"
        description="This uploads content to your configured pinning service."
        confirmLabel="Pin"
        tone="danger"
        onCancel={() => setConfirm(false)}
        onConfirm={() => void pin()}
      />
    </Card>
  );
}

function DeployCard({ configured }: { configured: boolean }) {
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function deploy() {
    setError(null);
    setMessage(null);
    const res = await fetch("/api/deploy/vercel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true }),
    });
    const data = (await res.json()) as { error?: string; url?: string };
    if (!res.ok) {
      setError(data.error ?? `HTTP ${res.status}`);
    } else if (data.url) {
      setMessage(data.url);
    } else {
      setError(data.error ?? "Deploy did not return a URL");
    }
    setConfirm(false);
  }

  return (
    <Card>
      <CardHeader
        title="Deployment manager"
        description="Vercel deploy only when VERCEL_TOKEN is set. No fake success URLs."
        action={
          <Badge variant={configured ? "available" : "configured"}>
            {configured ? "Available" : "Needs configuration"}
          </Badge>
        }
      />
      {!configured ? (
        <p className="text-xs text-muted">
          Set <code className="font-mono">VERCEL_TOKEN</code> (and project
          mapping) in <code className="font-mono">.env.local</code>.
        </p>
      ) : (
        <Button size="sm" onClick={() => setConfirm(true)}>
          Deploy to Vercel…
        </Button>
      )}
      {message ? <p className="mt-2 text-xs text-accent-green">{message}</p> : null}
      {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
      <ConfirmDialog
        open={confirm}
        title="Deploy to Vercel?"
        description="Requires a configured VERCEL_TOKEN. No fake deploy URL will be invented."
        confirmLabel="Confirm deploy"
        tone="danger"
        onCancel={() => setConfirm(false)}
        onConfirm={() => void deploy()}
      />
    </Card>
  );
}

function DatabaseCard() {
  const [sql, setSql] = useState("SELECT * FROM users");
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [confirmWrite, setConfirmWrite] = useState(false);
  const [pendingSql, setPendingSql] = useState<string | null>(null);

  async function run(allowWrite = false) {
    const q = pendingSql ?? sql;
    const res = await fetch("/api/db/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql: q, allowWrite }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      rows?: Record<string, unknown>[];
      needsConfirm?: boolean;
      error?: string;
    };
    if (data.needsConfirm) {
      setPendingSql(q);
      setConfirmWrite(true);
      setMessage(data.message ?? "Confirm write");
      return;
    }
    setMessage(data.message ?? data.error ?? "");
    setRows(data.rows ?? []);
    setConfirmWrite(false);
    setPendingSql(null);
  }

  return (
    <Card>
      <CardHeader
        title="Database console"
        description="Real SQLite file at akiro-projects/default/akiro.db. Read-only by default; writes need confirmation."
        action={<Badge variant="available">Available</Badge>}
      />
      <textarea
        className="w-full min-h-[72px] rounded-md border border-border bg-background p-2 font-mono text-xs"
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        aria-label="SQL query"
      />
      <Button size="sm" className="mt-2" onClick={() => void run(false)}>
        Run query
      </Button>
      <p className="mt-2 text-xs text-muted">{message}</p>
      {rows.length > 0 ? (
        <pre className="mt-2 max-h-40 overflow-auto rounded border border-border bg-background p-2 font-mono text-[10px]">
          {JSON.stringify(rows, null, 2)}
        </pre>
      ) : null}
      <ConfirmDialog
        open={confirmWrite}
        title="Confirm write SQL?"
        description={
          <p>
            Execute mutating SQL against <code className="font-mono">akiro.db</code>?
          </p>
        }
        confirmLabel="Run write"
        tone="danger"
        onCancel={() => {
          setConfirmWrite(false);
          setPendingSql(null);
        }}
        onConfirm={() => void run(true)}
      />
    </Card>
  );
}

type VaultEntry = {
  id: string;
  key: string;
  maskedPreview: string;
  updatedAt: string;
};

function EnvVaultCard({ configured }: { configured: boolean }) {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/env-vault");
    const data = (await res.json()) as {
      configured?: boolean;
      entries?: VaultEntry[];
    };
    setEntries(data.entries ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/env-vault")
      .then((r) => r.json())
      .then((data: { entries?: VaultEntry[] }) => {
        if (!cancelled) setEntries(data.entries ?? []);
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const add = useCallback(async () => {
    if (!key.trim() || !value) return;
    setError(null);
    const res = await fetch("/api/env-vault", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: key.trim(), value }),
    });
    const data = (await res.json()) as {
      error?: string;
      entries?: VaultEntry[];
    };
    if (!res.ok) {
      setError(data.error ?? `HTTP ${res.status}`);
      return;
    }
    setEntries(data.entries ?? []);
    setKey("");
    setValue("");
    setFlash("Stored with AES-GCM. Value was not logged.");
  }, [key, value]);

  return (
    <Card>
      <CardHeader
        title="Environment variable manager"
        description="AES-GCM encrypted vault on disk. Requires ENV_VAULT_SECRET."
        action={
          <Badge variant={configured ? "available" : "configured"}>
            {configured ? "Available" : "Needs configuration"}
          </Badge>
        }
      />
      {!configured ? (
        <p className="text-xs text-muted">
          A local <code className="font-mono">ENV_VAULT_SECRET</code> should be
          in <code className="font-mono">.env.local</code> (generated on first
          setup). Restart the server if you just added it.
        </p>
      ) : (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input label="Key" value={key} onChange={(e) => setKey(e.target.value)} />
            <Input
              label="Value"
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoComplete="off"
            />
          </div>
          <Button size="sm" className="mt-2" onClick={() => void add()}>
            Save (encrypted)
          </Button>
        </>
      )}
      {flash ? <p className="mt-2 text-xs text-accent-green">{flash}</p> : null}
      {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
      <ul className="mt-3 space-y-1">
        {entries.map((e) => (
          <li
            key={e.id}
            className="flex items-center justify-between gap-2 rounded border border-border px-2 py-1.5 text-xs"
          >
            <span className="font-mono">{e.key}</span>
            <span className="text-muted">{e.maskedPreview}</span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="!h-7"
                onClick={async () => {
                  const res = await fetch(
                    `/api/env-vault?reveal=${encodeURIComponent(e.id)}`,
                  );
                  const data = (await res.json()) as {
                    value?: string;
                    error?: string;
                  };
                  if (!res.ok || !data.value) {
                    setFlash(data.error ?? "Reveal failed");
                    return;
                  }
                  try {
                    await navigator.clipboard.writeText(data.value);
                    setFlash("Copied to clipboard (not logged).");
                  } catch {
                    setFlash("Clipboard unavailable.");
                  }
                }}
              >
                Copy
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="!h-7"
                onClick={async () => {
                  await fetch(`/api/env-vault?id=${encodeURIComponent(e.id)}`, {
                    method: "DELETE",
                  });
                  void refresh();
                }}
              >
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ApiClientCard() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://httpbin.org/get");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Card>
      <CardHeader
        title="API testing client"
        description="Real server-side fetch with SSRF protections (blocks private IPs / localhost)."
        action={<Badge variant="available">Available</Badge>}
      />
      <div className="flex gap-2 mb-2">
        <select
          className="h-10 rounded-md border border-border bg-surface px-2 text-sm"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          aria-label="HTTP method"
        >
          {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-label="URL"
          className="flex-1"
        />
      </div>
      <textarea
        className="mb-2 w-full min-h-[64px] rounded-md border border-border bg-background p-2 font-mono text-xs"
        placeholder="Body (optional)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        aria-label="Request body"
      />
      <Button
        size="sm"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const res = await fetch("/api/http-proxy", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ method, url, body }),
            });
            const data = await res.json();
            setResponse(JSON.stringify(data, null, 2));
          } catch (err) {
            setResponse(
              err instanceof Error ? err.message : "Request failed",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        Send
      </Button>
      {response ? (
        <pre className="mt-2 max-h-40 overflow-auto rounded border border-border bg-background p-2 font-mono text-[10px]">
          {response}
        </pre>
      ) : null}
    </Card>
  );
}

function PackageManagerCard() {
  const [pkg, setPkg] = useState("viem");
  const [log, setLog] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<"install" | "uninstall" | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(kind: "install" | "uninstall") {
    setBusy(true);
    setConfirm(null);
    const cmd =
      kind === "install" ? `npm install ${pkg}` : `npm uninstall ${pkg}`;
    try {
      const result = await execTerminal(cmd);
      setLog((l) => [
        ...l,
        `$ ${cmd}`,
        result.stdout,
        result.stderr,
        `(exit ${result.exitCode})`,
      ]);
    } catch (err) {
      setLog((l) => [
        ...l,
        err instanceof Error ? err.message : String(err),
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Package manager"
        description="Runs real npm install/uninstall in the project directory via the sandboxed terminal."
        action={<Badge variant="available">Available</Badge>}
      />
      <Input
        label="Package"
        value={pkg}
        onChange={(e) => setPkg(e.target.value)}
      />
      <div className="mt-2 flex gap-2">
        <Button
          size="sm"
          disabled={busy || !pkg.trim()}
          onClick={() => setConfirm("install")}
        >
          Install…
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={busy || !pkg.trim()}
          onClick={() => setConfirm("uninstall")}
        >
          Remove…
        </Button>
      </div>
      <pre className="mt-2 max-h-28 overflow-auto font-mono text-[11px] text-muted whitespace-pre-wrap">
        {log.join("\n")}
      </pre>
      <ConfirmDialog
        open={confirm !== null}
        title={confirm === "install" ? "Install package?" : "Remove package?"}
        description={
          <p>
            Run{" "}
            <code className="font-mono text-xs">
              npm {confirm === "install" ? "install" : "uninstall"} {pkg}
            </code>{" "}
            in the project directory?
          </p>
        }
        confirmLabel="Confirm"
        tone="danger"
        onCancel={() => setConfirm(null)}
        onConfirm={() => confirm && void run(confirm)}
      />
    </Card>
  );
}

function StaticStatusCards({ cfg }: { cfg: ConfigStatus | null }) {
  const items = [
    {
      title: "WalletConnect",
      status: cfg?.walletConnectProjectId
        ? "Available"
        : "Needs configuration",
      blurb: "Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID. Injected wallets work without it.",
    },
    {
      title: "EVM RPC providers",
      status: "Available",
      blurb: "Managed under Web3 Hub → RPC endpoint manager with real health checks.",
    },
    {
      title: "Blockchain explorers",
      status: "Available",
      blurb: "Configurable explorer base URL in Web3 Hub.",
    },
    {
      title: "Solidity compiler/testing",
      status: "Available",
      blurb: "Real solc compile API; forge tests via sandboxed terminal when installed.",
    },
    {
      title: "AI Coding Lab",
      status: cfg?.aiConfigured ? "Available" : "Needs configuration",
      blurb: "Set AI_API_KEY. No canned stub replies when missing.",
    },
  ];
  return (
    <>
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader
            title={item.title}
            description={item.blurb}
            action={
              <Badge variant={statusToBadgeVariant(item.status)}>
                {item.status}
              </Badge>
            }
          />
        </Card>
      ))}
    </>
  );
}
