/** Server-side feature readiness — never expose secret values. */

export type FeatureStatus = {
  id: string;
  name: string;
  status: "Available" | "Needs configuration";
  detail: string;
};

export function getFeatureStatuses(): FeatureStatus[] {
  const has = (k: string) => Boolean(process.env[k]?.trim());

  return [
    {
      id: "workspace",
      name: "Workspace filesystem",
      status: "Available",
      detail: "On-disk project under akiro-projects/default",
    },
    {
      id: "terminal",
      name: "Sandboxed terminal",
      status: "Available",
      detail: "Allowlisted commands in project cwd",
    },
    {
      id: "solc",
      name: "Solidity compiler",
      status: "Available",
      detail: "solc npm package (server-side)",
    },
    {
      id: "sqlite",
      name: "Database console",
      status: "Available",
      detail: "SQLite file akiro.db via sql.js",
    },
    {
      id: "http-proxy",
      name: "API testing client",
      status: "Available",
      detail: "Server fetch with SSRF protections",
    },
    {
      id: "rpc",
      name: "RPC health checks",
      status: "Available",
      detail: "Real JSON-RPC eth_chainId / eth_blockNumber",
    },
    {
      id: "wallet-injected",
      name: "Injected browser wallet",
      status: "Available",
      detail: "wagmi/viem — requires a browser extension wallet",
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      status: has("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID")
        ? "Available"
        : "Needs configuration",
      detail: "Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID",
    },
    {
      id: "env-vault",
      name: "Environment vault",
      status: has("ENV_VAULT_SECRET") ? "Available" : "Needs configuration",
      detail: "AES-GCM with ENV_VAULT_SECRET",
    },
    {
      id: "ai",
      name: "AI Coding Lab",
      status: has("AI_API_KEY") ? "Available" : "Needs configuration",
      detail: "Set AI_API_KEY for OpenAI-compatible API",
    },
    {
      id: "github",
      name: "GitHub OAuth",
      status:
        has("GITHUB_CLIENT_ID") && has("GITHUB_CLIENT_SECRET")
          ? "Available"
          : "Needs configuration",
      detail: "Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET",
    },
    {
      id: "ipfs",
      name: "IPFS pinning",
      status:
        has("IPFS_JWT") || has("WEB3_STORAGE_TOKEN")
          ? "Available"
          : "Needs configuration",
      detail: "Set IPFS_JWT (Pinata) or WEB3_STORAGE_TOKEN",
    },
    {
      id: "vercel",
      name: "Vercel deploy",
      status: has("VERCEL_TOKEN") ? "Available" : "Needs configuration",
      detail: "Set VERCEL_TOKEN",
    },
  ];
}
