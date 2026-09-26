import { NextRequest, NextResponse } from "next/server";
import { proxyFetch } from "@/lib/server/http-proxy";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      method?: string;
      url?: string;
      headers?: Record<string, string>;
      body?: string;
    };
    if (!body.url) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }
    const result = await proxyFetch({
      method: body.method ?? "GET",
      url: body.url,
      headers: body.headers,
      body: body.body,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Proxy failed" },
      { status: 400 },
    );
  }
}
