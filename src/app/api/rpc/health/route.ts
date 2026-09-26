import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { url?: string };
    if (!body.url?.trim()) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }
    let parsed: URL;
    try {
      parsed = new URL(body.url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json(
        { error: "Only http/https RPC URLs are allowed" },
        { status: 400 },
      );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const chainRes = await fetch(parsed.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_chainId",
          params: [],
        }),
        signal: controller.signal,
      });
      const chainJson = (await chainRes.json()) as {
        result?: string;
        error?: { message?: string };
      };
      if (chainJson.error) {
        return NextResponse.json({
          ok: false,
          error: chainJson.error.message ?? "RPC error",
        });
      }
      const blockRes = await fetch(parsed.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "eth_blockNumber",
          params: [],
        }),
        signal: controller.signal,
      });
      const blockJson = (await blockRes.json()) as {
        result?: string;
        error?: { message?: string };
      };
      const chainIdHex = chainJson.result;
      const blockHex = blockJson.result;
      return NextResponse.json({
        ok: true,
        claimKind: "Verified",
        chainId: chainIdHex ? Number.parseInt(chainIdHex, 16) : null,
        chainIdHex: chainIdHex ?? null,
        blockNumber: blockHex ? Number.parseInt(blockHex, 16) : null,
        blockNumberHex: blockHex ?? null,
      });
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : "Health check failed",
    });
  }
}
