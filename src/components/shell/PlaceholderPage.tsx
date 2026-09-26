import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/dashboard/PageHeader";

export function PlaceholderPage({
  title,
  description,
  phaseHint,
}: {
  title: string;
  description: string;
  phaseHint?: string;
}) {
  return (
    <div className="p-6 md:p-8">
      <PageHeader title={title} description={description} />
      <Card padding="lg" className="max-w-xl">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="planned">Planned</Badge>
          {phaseHint ? (
            <span className="text-xs text-muted-foreground">{phaseHint}</span>
          ) : null}
        </div>
        <p className="text-sm text-muted leading-relaxed">
          This section is scaffolded in Phase 1. Functionality lands in later
          roadmap phases — see the README for the full plan.
        </p>
      </Card>
    </div>
  );
}
