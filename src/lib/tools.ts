export type ToolStatus =
  | "In progress"
  | "Planned"
  | "Available"
  | "Needs configuration";

export type ToolCategory = "Coding" | "Web3" | "Testing/Security" | "Productivity";

export type Tool = {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
};

export const TOOLS: Tool[] = [
  {
    id: "code-editor",
    name: "Code editor",
    description: "Monaco editor backed by the on-disk workspace project.",
    category: "Coding",
    status: "Available",
  },
  {
    id: "ai-code-generator",
    name: "AI code generator",
    description: "OpenAI-compatible AI lab — Needs configuration without AI_API_KEY.",
    category: "Coding",
    status: "Needs configuration",
  },
  {
    id: "integrated-terminal",
    name: "Integrated terminal",
    description: "Sandboxed allowlisted commands in the project directory.",
    category: "Coding",
    status: "Available",
  },
  {
    id: "git-github",
    name: "Git and GitHub integration",
    description: "git status/diff/log in terminal; GitHub OAuth when configured.",
    category: "Coding",
    status: "Needs configuration",
  },
  {
    id: "package-manager",
    name: "Package manager",
    description: "Real npm install/uninstall via the sandboxed terminal.",
    category: "Coding",
    status: "Available",
  },
  {
    id: "wallet-connector",
    name: "Wallet connector",
    description: "Injected browser wallets via wagmi/viem. WalletConnect needs a project id.",
    category: "Web3",
    status: "Available",
  },
  {
    id: "rpc-manager",
    name: "RPC endpoint manager",
    description: "Configure RPCs with real eth_chainId / eth_blockNumber health checks.",
    category: "Web3",
    status: "Available",
  },
  {
    id: "blockchain-explorer",
    name: "Blockchain explorer",
    description: "Open real explorer URLs for addresses and transactions.",
    category: "Web3",
    status: "Available",
  },
  {
    id: "smart-contract-ide",
    name: "Smart contract IDE",
    description: "Write Solidity with real solc compile diagnostics.",
    category: "Web3",
    status: "Available",
  },
  {
    id: "smart-contract-deployer",
    name: "Smart contract deployer",
    description: "Deploy via wallet signature only — no server private keys.",
    category: "Web3",
    status: "Available",
  },
  {
    id: "solidity-compiler",
    name: "Solidity compiler",
    description: "Server-side solc returning real ABI, bytecode, errors and warnings.",
    category: "Testing/Security",
    status: "Available",
  },
  {
    id: "security-scanner",
    name: "Smart contract security scanner",
    description: "Verified static pattern matches only — not a formal audit.",
    category: "Testing/Security",
    status: "Available",
  },
  {
    id: "unit-testing",
    name: "Unit testing runner",
    description: "forge test via sandboxed terminal when Foundry is installed.",
    category: "Testing/Security",
    status: "Available",
  },
  {
    id: "gas-optimiser",
    name: "Gas optimiser",
    description: "Verified compile-only bytecode metrics; estimateGas with wallet+RPC.",
    category: "Testing/Security",
    status: "Available",
  },
  {
    id: "api-testing",
    name: "API testing client",
    description: "Real HTTP proxy with SSRF protections.",
    category: "Testing/Security",
    status: "Available",
  },
  {
    id: "env-manager",
    name: "Environment variable manager",
    description: "AES-GCM vault with ENV_VAULT_SECRET (local .env.local).",
    category: "Productivity",
    status: "Available",
  },
  {
    id: "database-console",
    name: "Database console",
    description: "Real SQLite file (akiro.db) with read-only default.",
    category: "Productivity",
    status: "Available",
  },
  {
    id: "ipfs-storage",
    name: "IPFS and decentralised storage",
    description: "Pinata / web3.storage when tokens are set — no fake CIDs.",
    category: "Productivity",
    status: "Needs configuration",
  },
  {
    id: "deployment-manager",
    name: "Deployment manager",
    description: "Vercel deploy when VERCEL_TOKEN is set — no fake URLs.",
    category: "Productivity",
    status: "Needs configuration",
  },
  {
    id: "live-preview",
    name: "Live application preview",
    description: "Serves project preview/index.html beside the editor.",
    category: "Productivity",
    status: "Available",
  },
];

export const TOOL_CATEGORIES: ToolCategory[] = [
  "Coding",
  "Web3",
  "Testing/Security",
  "Productivity",
];
