export type IntegrationUiStatus =
  | "Available"
  | "Needs configuration"
  | "Disconnected"
  | "Not configured"
  | "Connected";

export type IpfsRecord = { name: string; cid: string; at: string };

const IPFS_KEY = "akiro.integrations.ipfs.v1";

export function loadIpfsHistory(): IpfsRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(IPFS_KEY);
    return raw ? (JSON.parse(raw) as IpfsRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveIpfsHistory(rows: IpfsRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(IPFS_KEY, JSON.stringify(rows.slice(0, 20)));
}
