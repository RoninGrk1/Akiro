"use client";

import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { AiChatPanel } from "@/components/ai/AiChatPanel";

export type RightPanelProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function RightPanel({ collapsed, onToggle }: RightPanelProps) {
  if (collapsed) {
    return (
      <div className="flex w-10 shrink-0 flex-col items-center border-l border-border bg-surface py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          aria-label="Expand AI chat panel"
          aria-expanded={false}
          className="!px-2"
          title="AI chat"
        >
          <ChatIcon />
        </Button>
      </div>
    );
  }

  return (
    <Panel
      as="aside"
      title="AI chat"
      className="w-96 shrink-0 border-l "
      aria-label="AI chat"
      actions={
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          aria-label="Collapse AI chat panel"
          aria-expanded={true}
          className="!px-2"
        >
          <ClosePanelIcon />
        </Button>
      }
    >
      <div className="flex h-full min-h-0 flex-col">
        <AiChatPanel showContext compact />
      </div>
    </Panel>
  );
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ClosePanelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
