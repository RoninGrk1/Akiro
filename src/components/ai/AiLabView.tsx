"use client";

import Link from "next/link";
import { AiChatPanel } from "@/components/ai/AiChatPanel";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function AiLabView() {
  return (
    <div className="flex h-full min-h-0 flex-col p-4 md:p-6 gap-4">
      <PageHeader
        title="AI Coding Lab"
        description="OpenAI-compatible AI when AI_API_KEY is set. Without it, the lab shows Needs configuration — no canned replies. Patches require confirmation."
        actions={
          <Link href="/workspace">
            <Button size="sm" variant="outline">
              Open workspace
            </Button>
          </Link>
        }
      />
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_280px]">
        <Card padding="none" className="min-h-[28rem] flex flex-col overflow-hidden">
          <AiChatPanel showContext compact={false} />
        </Card>
        <div className="space-y-3">
          <Card padding="md">
            <h3 className="text-sm font-semibold text-foreground mb-2">How claims work</h3>
            <ul className="space-y-2 text-xs text-muted leading-relaxed">
              <li className="flex gap-2 items-start">
                <Badge variant="available">Verified</Badge>
                <span>Locally confirmed facts (file exists, user confirmed apply).</span>
              </li>
              <li className="flex gap-2 items-start">
                <Badge variant="planned">Suggestion</Badge>
                <span>Guidance that has not been executed or proven.</span>
              </li>
            </ul>
          </Card>
          <Card padding="md">
            <h3 className="text-sm font-semibold mb-2">Actions</h3>
            <p className="text-xs text-muted leading-relaxed">
              Model text is labelled Suggestion unless a Verified tool result is
              attached. Apply patch writes to the on-disk workspace after confirm.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
