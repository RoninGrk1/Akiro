import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function handler() {
  const id = process.env.GITHUB_CLIENT_ID?.trim();
  const secret = process.env.GITHUB_CLIENT_SECRET?.trim();
  if (!id || !secret) {
    return NextResponse.json(
      {
        error:
          "GitHub OAuth Needs configuration. Set GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and NEXTAUTH_SECRET.",
        status: "Needs configuration",
      },
      { status: 503 },
    );
  }
  return NextResponse.json(
    {
      error:
        "Auth.js GitHub provider credentials are present but full NextAuth handlers are not fully wired for this local build. Use guest mode or complete Auth.js setup.",
      status: "Needs configuration",
    },
    { status: 503 },
  );
}

export { handler as GET, handler as POST };
