import { NextRequest, NextResponse } from "next/server";
import { compileSolidity } from "@/lib/server/solc-compile";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      source?: string;
      fileName?: string;
    };
    if (!body.source || typeof body.source !== "string") {
      return NextResponse.json({ error: "source is required" }, { status: 400 });
    }
    const result = compileSolidity(
      body.source,
      body.fileName ?? "Contract.sol",
    );
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Compile failed" },
      { status: 500 },
    );
  }
}
