/** Client-side Web3 preferences (no secrets). RPC URLs may be public endpoints only. */

export type RpcEndpoint = {
  id: string;
  name: string;
  url: string;
  chainId: number;
};

export type ExplorerConfig = {
  name: string;
  baseUrl: string;
};

const RPC_KEY = "akiro.rpc.endpoints.v1";
const RPC_ACTIVE_KEY = "akiro.rpc.active.v1";
const EXPLORER_KEY = "akiro.explorer.v1";

export const DEFAULT_RPCS: RpcEndpoint[] = [
  {
    id: "anvil",
    name: "Anvil (local)",
    url: "http://127.0.0.1:8545",
    chainId: 31337,
  },
  {
    id: "sepolia-public",
    name: "Sepolia (public)",
    url: "https://rpc.sepolia.org",
    chainId: 11155111,
  },
];

export const DEFAULT_EXPLORER: ExplorerConfig = {
  name: "Etherscan Sepolia",
  baseUrl: "https://sepolia.etherscan.io",
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadRpcs(): RpcEndpoint[] {
  if (!canUseStorage()) return DEFAULT_RPCS;
  try {
    const raw = window.localStorage.getItem(RPC_KEY);
    if (!raw) return DEFAULT_RPCS;
    const parsed = JSON.parse(raw) as RpcEndpoint[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_RPCS;
  } catch {
    return DEFAULT_RPCS;
  }
}

export function saveRpcs(list: RpcEndpoint[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(RPC_KEY, JSON.stringify(list));
}

export function loadActiveRpcId(): string {
  if (!canUseStorage()) return DEFAULT_RPCS[0].id;
  return window.localStorage.getItem(RPC_ACTIVE_KEY) ?? DEFAULT_RPCS[0].id;
}

export function saveActiveRpcId(id: string): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(RPC_ACTIVE_KEY, id);
}

export function loadExplorer(): ExplorerConfig {
  if (!canUseStorage()) return DEFAULT_EXPLORER;
  try {
    const raw = window.localStorage.getItem(EXPLORER_KEY);
    if (!raw) return DEFAULT_EXPLORER;
    return JSON.parse(raw) as ExplorerConfig;
  } catch {
    return DEFAULT_EXPLORER;
  }
}

export function saveExplorer(cfg: ExplorerConfig): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(EXPLORER_KEY, JSON.stringify(cfg));
}
