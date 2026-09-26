import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const token = process.env.VERCEL_TOKEN?.trim();
  if (!token) {
    return NextResponse.json(
      {
        error: "Vercel is not configured. Set VERCEL_TOKEN in .env.local.",
        status: "Needs configuration",
      },
      { status: 503 },
    );
  }

  try {
    const body = (await req.json()) as { confirm?: boolean; name?: string };
    if (!body.confirm) {
      return NextResponse.json(
        { error: "Deploy requires confirm: true" },
        { status: 400 },
      );
    }
    // Minimal Vercel deployment trigger — list teams/projects would need more config.
    // For now attempt a deployments list as a connectivity check then refuse without project id.
    const res = await fetch("https://api.vercel.com/v6/deployments?limit=1", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json(
        {
          error: `Vercel API ${res.status}`,
          detail: t.slice(0, 300),
        },
        { status: 502 },
      );
    }
    return NextResponse.json({
      error:
        "VERCEL_TOKEN is set but a project/target mapping is not configured. Add VERCEL_PROJECT_ID to enable real deploys.",
      status: "Needs configuration",
    }, { status: 503 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Deploy failed" },
      { status: 500 },
    );
  }
}
