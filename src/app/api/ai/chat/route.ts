import fs from "node:fs";
import { NextRequest, NextResponse } from "next/server";
import { PathError, resolveProjectPath } from "@/lib/server/paths";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const apiKey = process.env.AI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "AI is not configured. Set AI_API_KEY in .env.local to enable the Coding Lab.",
        status: "Needs configuration",
      },
      { status: 503 },
    );
  }

  try {
    const body = (await req.json()) as {
      message?: string;
      action?: string;
      contextPaths?: string[];
    };
    const message = body.message?.trim() ?? "";
    const action = body.action ?? "chat";
    const contextPaths = Array.isArray(body.contextPaths)
      ? body.contextPaths.slice(0, 12)
      : [];

    const fileContext: { path: string; content: string }[] = [];
    for (const p of contextPaths) {
      try {
        const abs = resolveProjectPath(p);
        if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
          const content = fs.readFileSync(abs, "utf8");
          fileContext.push({
            path: p,
            content: content.slice(0, 20_000),
          });
        }
      } catch (err) {
        if (!(err instanceof PathError)) throw err;
      }
    }

    const baseUrl = (
      process.env.AI_BASE_URL?.trim() || "https://api.x.ai/v1"
    ).replace(/\/$/, "");
    const model = process.env.AI_MODEL?.trim() || "grok-2-latest";

    const system = [
      "You are Akiro, a Web3 development assistant. Use British English.",
      "Never invent wallet addresses, CIDs, compile results, or deploy URLs.",
      "Distinguish facts you can verify from opinions — mark opinions as suggestions.",
      `User action mode: ${action}`,
      fileContext.length
        ? `Project file context:\n${fileContext
            .map((f) => `--- ${f.path} ---\n${f.content}`)
            .join("\n\n")}`
        : "No project files attached.",
    ].join("\n\n");

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: message || `(action: ${action})`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return NextResponse.json(
        {
          error: `AI provider returned ${res.status}`,
          detail: errText.slice(0, 500),
        },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content =
      data.choices?.[0]?.message?.content?.trim() ||
      "(Empty response from model)";

    return NextResponse.json({
      content,
      claimKind: "Suggestion" as const,
      claims: [
        {
          kind: "Suggestion" as const,
          text: "Model response — not tool/RPC verified unless a Verified tool result is attached.",
        },
        ...(fileContext.length
          ? [
              {
                kind: "Verified" as const,
                text: `Attached ${fileContext.length} on-disk file(s) as context.`,
              },
            ]
          : []),
      ],
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI request failed" },
      { status: 500 },
    );
  }
}
