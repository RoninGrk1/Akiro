import { Badge } from "@/components/ui/Badge";
import type { ClaimKind } from "@/lib/ai/types";

export function ClaimBadge({ kind }: { kind: ClaimKind }) {
  return (
    <Badge variant={kind === "Verified" ? "available" : "planned"}>
      {kind}
    </Badge>
  );
}
