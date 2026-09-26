import { NextRequest, NextResponse } from "next/server";
import { isWriteSql, runSql } from "@/lib/server/sqlite";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      sql?: string;
      allowWrite?: boolean;
    };
    if (!body.sql?.trim()) {
      return NextResponse.json({ error: "sql is required" }, { status: 400 });
    }
    if (isWriteSql(body.sql) && !body.allowWrite) {
      return NextResponse.json(
        {
          ok: false,
          needsConfirm: true,
          message:
            "This SQL mutates the database. Confirm with allowWrite: true.",
          columns: [],
          rows: [],
        },
        { status: 200 },
      );
    }
    const result = await runSql(body.sql, {
      allowWrite: Boolean(body.allowWrite),
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Query failed" },
      { status: 500 },
    );
  }
}
