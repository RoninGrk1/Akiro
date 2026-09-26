import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const id = process.env.GITHUB_CLIENT_ID?.trim();
  const secret = process.env.GITHUB_CLIENT_SECRET?.trim();
  if (!id || !secret) {
    return NextResponse.json(
      {
        error:
          "GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.",
        status: "Needs configuration",
        repos: [],
      },
      { status: 503 },
    );
  }

  // Without a real session token we cannot list user repos honestly.
  return NextResponse.json(
    {
      error:
        "Sign in with GitHub to list repositories. OAuth credentials are present but no user session access token is available.",
      status: "Needs configuration",
      repos: [],
      oauthConfigured: true,
    },
    { status: 401 },
  );
}
