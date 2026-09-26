import { NextRequest, NextResponse } from "next/server";
import { execInProject, validateCommand } from "@/lib/server/terminal";
import { PROJECT_ROOT } from "@/lib/server/paths";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { command?: string; timeoutMs?: number };
    const command = body.command?.trim() ?? "";
    if (!command) {
      return NextResponse.json({ error: "command is required" }, { status: 400 });
    }
    const check = validateCommand(command);
    if (!check.ok) {
      return NextResponse.json(
        {
          stdout: "",
          stderr: check.error,
          exitCode: 126,
          cwd: PROJECT_ROOT,
        },
        { status: 200 },
      );
    }
    const result = await execInProject(
      command,
      Math.min(Math.max(body.timeoutMs ?? 60_000, 1_000), 120_000),
    );
    return NextResponse.json({ ...result, cwd: PROJECT_ROOT });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Exec failed" },
      { status: 500 },
    );
  }
}
