"use client";

import Link from "next/link";
import { AiChatPanel } from "@/components/ai/AiChatPanel";
import { useAiChat } from "@/components/ai/AiChatContext";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export function AiLabView() {
  const { aiConfigured } = useAiChat();

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
      {aiConfigured === false ? (
        <EmptyState
          title="AI needs a quick setup"
          description="Add AI_API_KEY to .env.local (OpenAI-compatible; default base https://api.x.ai/v1), restart the server, and you are ready. Akiro will not invent replies until then."
          icon={<SparkIcon />}
          action={
            <Link href="/integrations">
              <Button size="sm" variant="secondary">
                View integrations
              </Button>
            </Link>
          }
          className="shrink-0"
        />
      ) : null}
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_260px]">
        <Card padding="none" className="min-h-[20rem] sm:min-h-[28rem] flex flex-col overflow-hidden">
          <AiChatPanel showContext compact={false} />
        </Card>
        <div className="hidden lg:block space-y-3">
          <Card padding="md">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              How claims work
            </h3>
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

function SparkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
