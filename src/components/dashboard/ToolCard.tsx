import { Badge, statusToBadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Tool } from "@/lib/tools";

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Card
      padding="md"
      className="flex h-full flex-col transition-colors hover:border-accent-blue/40"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground leading-snug">
          {tool.name}
        </h3>
        <Badge variant={statusToBadgeVariant(tool.status)}>{tool.status}</Badge>
      </div>
      <p className="text-xs text-muted leading-relaxed flex-1">
        {tool.description}
      </p>
      <p className="mt-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {tool.category}
      </p>
    </Card>
  );
}
