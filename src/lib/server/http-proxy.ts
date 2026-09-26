import dns from "node:dns/promises";
import net from "node:net";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.google.com",
]);

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    return false;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === "::1") return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // ULA
    if (lower.startsWith("fe80")) return true;
    return false;
  }
  return true;
}

/** Allow project preview origin when running locally (explicit allowlist). */
function isAllowlistedPreview(url: URL): boolean {
  // Static preview is served from same app; no need to hit localhost from proxy.
  void url;
  return false;
}

export async function assertSafeUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid URL");
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http and https are allowed");
  }
  const host = url.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host) && !isAllowlistedPreview(url)) {
    throw new Error(`Host blocked (SSRF protection): ${host}`);
  }
  // Block literal IPs that are private
  if (net.isIP(host) && isPrivateIp(host)) {
    throw new Error(`Private IP blocked (SSRF protection): ${host}`);
  }
  // Resolve DNS and check
  try {
    const records = await dns.lookup(host, { all: true });
    for (const r of records) {
      if (isPrivateIp(r.address)) {
        throw new Error(
          `Resolved private IP blocked (SSRF protection): ${r.address}`,
        );
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("SSRF")) throw err;
    throw new Error(`DNS lookup failed for ${host}`);
  }
  return url;
}

export type ProxyResult = {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  truncated: boolean;
};

export async function proxyFetch(opts: {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
}): Promise<ProxyResult> {
  const url = await assertSafeUrl(opts.url);
  const method = (opts.method || "GET").toUpperCase();
  const headers: Record<string, string> = { ...(opts.headers ?? {}) };
  // Strip hop-by-hop / dangerous
  delete headers.host;
  delete headers.cookie;
  delete headers.authorization;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch(url.toString(), {
      method,
      headers,
      body: ["GET", "HEAD"].includes(method) ? undefined : opts.body,
      signal: controller.signal,
      redirect: "manual",
    });
    const text = await res.text();
    const truncated = text.length > 200_000;
    const outHeaders: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      if (["set-cookie", "authorization"].includes(k.toLowerCase())) return;
      outHeaders[k] = v;
    });
    return {
      status: res.status,
      statusText: res.statusText,
      headers: outHeaders,
      body: truncated ? text.slice(0, 200_000) + "\n…truncated" : text,
      truncated,
    };
  } finally {
    clearTimeout(timer);
  }
}
