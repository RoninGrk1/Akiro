import { NextRequest, NextResponse } from "next/server";
import {
  listVaultEntries,
  removeVaultEntry,
  revealVaultEntry,
  upsertVaultEntry,
  vaultConfigured,
} from "@/lib/server/env-vault";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("reveal");
  if (id) {
    const result = revealVaultEntry(id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ value: result.value });
  }
  return NextResponse.json(listVaultEntries());
}

export async function POST(req: NextRequest) {
  if (!vaultConfigured()) {
    return NextResponse.json(
      {
        error:
          "ENV_VAULT_SECRET is not set. Cannot store secrets without encryption.",
        status: "Needs configuration",
      },
      { status: 503 },
    );
  }
  const body = (await req.json()) as { key?: string; value?: string };
  if (!body.key || body.value === undefined) {
    return NextResponse.json(
      { error: "key and value are required" },
      { status: 400 },
    );
  }
  const result = upsertVaultEntry(body.key, body.value);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ configured: true, entries: result.entries });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const result = removeVaultEntry(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ configured: true, entries: result.entries });
}
