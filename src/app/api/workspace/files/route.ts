import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import {
  PathError,
  languageForPath,
  listProjectTree,
  resolveProjectPath,
  ensureProjectRoot,
} from "@/lib/server/paths";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    ensureProjectRoot();
    const rel = req.nextUrl.searchParams.get("path");
    if (!rel) {
      return NextResponse.json({
        root: "/workspace/akiro-projects/default",
        tree: listProjectTree(),
      });
    }
    const abs = resolveProjectPath(rel);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    const content = fs.readFileSync(abs, "utf8");
    return NextResponse.json({
      path: rel,
      content,
      language: languageForPath(rel),
    });
  } catch (err) {
    if (err instanceof PathError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Read failed" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    ensureProjectRoot();
    const body = (await req.json()) as { path?: string; content?: string };
    if (!body.path || typeof body.content !== "string") {
      return NextResponse.json(
        { error: "path and content are required" },
        { status: 400 },
      );
    }
    const abs = resolveProjectPath(body.path);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, body.content, "utf8");
    return NextResponse.json({
      ok: true,
      path: body.path,
      language: languageForPath(body.path),
    });
  } catch (err) {
    if (err instanceof PathError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Write failed" },
      { status: 500 },
    );
  }
}
