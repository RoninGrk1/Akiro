import Link from "next/link";
import { Badge, statusToBadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Tool } from "@/lib/tools";

export function ToolCard({
  tool,
  href,
}: {
  tool: Tool;
  href?: string;
}) {
  const inner = (
    <>
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground leading-snug">
          {tool.name}
        </h3>
        <Badge variant={statusToBadgeVariant(tool.status)}>{tool.status}</Badge>
      </div>
      <p className="text-xs text-muted leading-relaxed flex-1">{tool.description}</p>
      <p className="mt-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {tool.category}
      </p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full focus-visible:outline-none rounded-lg">
        <Card
          padding="md"
          interactive
          className="flex h-full flex-col min-h-[7.5rem]"
        >
          {inner}
        </Card>
      </Link>
    );
  }

  return (
    <Card padding="md" className="flex h-full flex-col min-h-[7.5rem]">
      {inner}
    </Card>
  );
}
