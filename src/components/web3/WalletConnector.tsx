"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { walletConnectConfigured } from "@/lib/web3/wagmi-config";

export function WalletConnector() {
  const { address, isConnected, status } = useAccount();
  const { connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <Card>
      <CardHeader
        title="Wallet connector"
        description="Connect an injected browser wallet (e.g. MetaMask). Akiro never asks for seed phrases or private keys."
        action={
          <Badge variant={isConnected ? "available" : "disconnected"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        }
      />
      {isConnected && address ? (
        <div className="space-y-3">
          <p className="font-mono text-xs text-accent-green break-all">
            {address}
          </p>
          <p className="text-xs text-muted">Provider: injected browser wallet</p>
          <Button size="sm" variant="outline" onClick={() => disconnect()}>
            Disconnect
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={isPending || status === "connecting"}
            onClick={() => connect({ connector: injected() })}
          >
            {isPending ? "Connecting…" : "Browser wallet"}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled
            title={
              walletConnectConfigured
                ? "WalletConnect connector not wired in this build"
                : "Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"
            }
          >
            {walletConnectConfigured
              ? "WalletConnect"
              : "WalletConnect — Needs configuration"}
          </Button>
        </div>
      )}
      {error ? (
        <p className="mt-2 text-xs text-danger">
          {/provider not found|connector.*not found|no provider/i.test(
            error.message,
          )
            ? "No injected wallet detected in this browser."
            : error.message}
        </p>
      ) : null}
      {!walletConnectConfigured ? (
        <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
          WalletConnect needs{" "}
          <code className="font-mono">NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID</code>{" "}
          in <code className="font-mono">.env.local</code>. Injected wallets work
          without it.
        </p>
      ) : null}
    </Card>
  );
}
