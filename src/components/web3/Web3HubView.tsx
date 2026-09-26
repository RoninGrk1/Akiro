"use client";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { WalletConnector } from "@/components/web3/WalletConnector";
import { RpcManager } from "@/components/web3/RpcManager";
import { ExplorerPanel } from "@/components/web3/ExplorerPanel";
import { ContractWorkbench } from "@/components/web3/ContractWorkbench";

export function Web3HubView() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title="Web3 Hub"
        description="Wallets, RPC, explorers, Solidity IDE with real solc. Deploy signs in your wallet. No seed phrases, no private keys."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <WalletConnector />
        <ExplorerPanel />
      </div>
      <RpcManager />
      <ContractWorkbench />
    </div>
  );
}
