"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { loadExplorer, saveExplorer, type ExplorerConfig } from "@/lib/web3/storage";

export function ExplorerPanel() {
  const [cfg, setCfg] = useState<ExplorerConfig>(loadExplorer);
  const [address, setAddress] = useState("");

  const looksLikeTx = address.startsWith("0x") && address.length === 66;
  const path = looksLikeTx
    ? `/tx/${address}`
    : address
      ? `/address/${address}`
      : "";
  const openUrl = path
    ? `${cfg.baseUrl.replace(/\/$/, "")}${path}`
    : cfg.baseUrl;

  return (
    <Card>
      <CardHeader
        title="Blockchain explorer"
        description="Opens real explorer URLs in a new tab."
        action={<Badge variant="available">Available</Badge>}
      />
      <div className="grid gap-2 sm:grid-cols-2 mb-3">
        <Input
          label="Explorer name"
          value={cfg.name}
          onChange={(e) => setCfg((c) => ({ ...c, name: e.target.value }))}
        />
        <Input
          label="Base URL"
          value={cfg.baseUrl}
          onChange={(e) => setCfg((c) => ({ ...c, baseUrl: e.target.value }))}
        />
      </div>
      <Button
        size="sm"
        variant="secondary"
        className="mb-3"
        onClick={() => saveExplorer(cfg)}
      >
        Save explorer
      </Button>
      <Input
        label="Address or transaction hash"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="0x…"
      />
      <a
        href={openUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex"
      >
        <Button size="sm" variant="outline" disabled={!address.trim()}>
          Open in {cfg.name || "explorer"}
        </Button>
      </a>
    </Card>
  );
}
