import type { Tool } from "@/lib/tools";
import { TOOLS } from "@/lib/tools";

/** Deep-link targets for Developer Tools catalogue. */
export type ToolLink = {
  tool: Tool;
  href: string;
  anchor?: string;
};

const HREF: Record<string, string> = {
  "code-editor": "/workspace",
  "ai-code-generator": "/ai-lab",
  "integrated-terminal": "/workspace",
  "git-github": "/integrations",
  "package-manager": "/integrations",
  "wallet-connector": "/web3",
  "rpc-manager": "/web3",
  "blockchain-explorer": "/web3",
  "smart-contract-ide": "/web3",
  "smart-contract-deployer": "/web3",
  "solidity-compiler": "/web3",
  "security-scanner": "/web3",
  "unit-testing": "/web3",
  "gas-optimiser": "/web3",
  "api-testing": "/integrations",
  "env-manager": "/integrations",
  "database-console": "/integrations",
  "ipfs-storage": "/integrations",
  "deployment-manager": "/integrations",
  "live-preview": "/workspace",
};

export function getToolsCatalog(): ToolLink[] {
  return TOOLS.map((tool) => ({
    tool,
    href: HREF[tool.id] ?? "/dashboard",
  }));
}
