export type IntegrationStatus =
  | "Disconnected"
  | "Not configured"
  | "Needs configuration"
  | "Available";

export type Integration = {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
};

export const INTEGRATIONS: Integration[] = [
  {
    id: "github-oauth",
    name: "GitHub OAuth",
    description: "Sign in and sync repositories via GitHub OAuth.",
    status: "Needs configuration",
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    description: "Needs NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID. Injected wallets work without it.",
    status: "Needs configuration",
  },
  {
    id: "evm-rpc",
    name: "EVM RPC providers",
    description: "Public and custom RPC endpoints with live health checks.",
    status: "Available",
  },
  {
    id: "blockchain-explorers",
    name: "Blockchain explorers",
    description: "Configurable explorer base URLs.",
    status: "Available",
  },
  {
    id: "solidity-testing",
    name: "Solidity compiler/testing",
    description: "solc compile API and forge via sandboxed terminal.",
    status: "Available",
  },
  {
    id: "ipfs",
    name: "IPFS",
    description: "Pinning services when IPFS_JWT / WEB3_STORAGE_TOKEN are set.",
    status: "Needs configuration",
  },
  {
    id: "git-deploy",
    name: "Git-based deployment",
    description: "Vercel deploy when VERCEL_TOKEN is set.",
    status: "Needs configuration",
  },
  {
    id: "db-api",
    name: "Database/API connectors",
    description: "SQLite console and HTTP proxy with SSRF protections.",
    status: "Available",
  },
];
