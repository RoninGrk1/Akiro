"use client";

import type { ReactNode } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { WalletConnector } from "@/components/web3/WalletConnector";
import { RpcManager } from "@/components/web3/RpcManager";
import { ExplorerPanel } from "@/components/web3/ExplorerPanel";
import { ContractWorkbench } from "@/components/web3/ContractWorkbench";

export function Web3HubView() {
  return (
    <div className="p-4 sm:p-6 space-y-8">
      <PageHeader
        title="Web3 Hub"
        description="Wallets, RPC, explorers, Solidity IDE with real solc. Deploy signs in your wallet. No seed phrases, no private keys."
      />

      <Section
        id="wallet"
        title="Wallet"
        blurb="Connect an injected browser wallet. Connected state is shown clearly."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <WalletConnector />
          <ExplorerPanel />
        </div>
      </Section>

      <Section
        id="rpc"
        title="RPC"
        blurb="Manage endpoints and run real health checks (chain ID and block number)."
      >
        <RpcManager />
      </Section>

      <Section
        id="contracts"
        title="Contracts"
        blurb="Compile with solc and deploy via your connected wallet."
      >
        <ContractWorkbench />
      </Section>
    </div>
  );
}

function Section({
  id,
  title,
  blurb,
  children,
}: {
  id: string;
  title: string;
  blurb: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`web3-${id}`} className="space-y-3">
      <div>
        <h2
          id={`web3-${id}`}
          className="text-xs font-semibold uppercase tracking-wider text-muted"
        >
          {title}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-2xl">
          {blurb}
        </p>
      </div>
      {children}
    </section>
  );
}
