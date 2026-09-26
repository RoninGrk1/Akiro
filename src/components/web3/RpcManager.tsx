"use client";

import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  loadActiveRpcId,
  loadRpcs,
  saveActiveRpcId,
  saveRpcs,
  type RpcEndpoint,
} from "@/lib/web3/storage";

type Health = {
  ok: boolean;
  chainId?: number | null;
  blockNumber?: number | null;
  error?: string;
};

export function RpcManager() {
  const [rpcs, setRpcs] = useState<RpcEndpoint[]>(loadRpcs);
  const [activeId, setActiveId] = useState(loadActiveRpcId);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [chainId, setChainId] = useState("31337");
  const [health, setHealth] = useState<Record<string, Health>>({});
  const [checking, setChecking] = useState<string | null>(null);

  const persistList = useCallback((list: RpcEndpoint[]) => {
    setRpcs(list);
    saveRpcs(list);
  }, []);

  async function checkHealth(rpc: RpcEndpoint) {
    setChecking(rpc.id);
    try {
      const res = await fetch("/api/rpc/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: rpc.url }),
      });
      const data = (await res.json()) as Health & {
        chainId?: number | null;
        blockNumber?: number | null;
      };
      setHealth((h) => ({
        ...h,
        [rpc.id]: {
          ok: Boolean(data.ok),
          chainId: data.chainId,
          blockNumber: data.blockNumber,
          error: data.error,
        },
      }));
      if (data.ok && data.chainId) {
        const next = rpcs.map((r) =>
          r.id === rpc.id ? { ...r, chainId: data.chainId! } : r,
        );
        persistList(next);
      }
    } catch (err) {
      setHealth((h) => ({
        ...h,
        [rpc.id]: {
          ok: false,
          error: err instanceof Error ? err.message : "Health check failed",
        },
      }));
    } finally {
      setChecking(null);
    }
  }

  return (
    <Card>
      <CardHeader
        title="RPC endpoint manager"
        description="Public or local URLs only. Health checks use real JSON-RPC eth_chainId / eth_blockNumber. Do not paste API keys into the URL."
        action={<Badge variant="available">Available</Badge>}
      />
      <ul className="space-y-2 mb-4">
        {rpcs.map((rpc) => {
          const h = health[rpc.id];
          return (
            <li
              key={rpc.id}
              className={[
                "flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-xs",
                activeId === rpc.id
                  ? "border-accent-green/40 bg-accent-green/5"
                  : "border-border",
              ].join(" ")}
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">{rpc.name}</p>
                <p className="font-mono text-muted truncate">{rpc.url}</p>
                <p className="text-muted-foreground">chainId {rpc.chainId}</p>
                {h ? (
                  <p
                    className={
                      h.ok ? "text-accent-green mt-1" : "text-danger mt-1"
                    }
                  >
                    {h.ok
                      ? `Verified · chain ${h.chainId} · block ${h.blockNumber}`
                      : `Unreachable · ${h.error}`}
                  </p>
                ) : null}
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={checking === rpc.id}
                  onClick={() => void checkHealth(rpc)}
                >
                  {checking === rpc.id ? "Checking…" : "Health"}
                </Button>
                <Button
                  size="sm"
                  variant={activeId === rpc.id ? "primary" : "ghost"}
                  onClick={() => {
                    setActiveId(rpc.id);
                    saveActiveRpcId(rpc.id);
                  }}
                >
                  {activeId === rpc.id ? "Active" : "Use"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const next = rpcs.filter((r) => r.id !== rpc.id);
                    if (!next.length) return;
                    persistList(next);
                    if (activeId === rpc.id) {
                      setActiveId(next[0].id);
                      saveActiveRpcId(next[0].id);
                    }
                  }}
                >
                  Remove
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="grid gap-2 sm:grid-cols-3">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          label="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          hint="Avoid embedding API keys in the URL"
        />
        <Input
          label="Chain ID"
          value={chainId}
          onChange={(e) => setChainId(e.target.value)}
        />
      </div>
      <Button
        size="sm"
        className="mt-3"
        disabled={!name.trim() || !url.trim()}
        onClick={() => {
          const id = `rpc-${Date.now()}`;
          const endpoint: RpcEndpoint = {
            id,
            name: name.trim(),
            url: url.trim(),
            chainId: Number(chainId) || 0,
          };
          persistList([...rpcs, endpoint]);
          setName("");
          setUrl("");
          void checkHealth(endpoint);
        }}
      >
        Add &amp; health-check
      </Button>
    </Card>
  );
}
