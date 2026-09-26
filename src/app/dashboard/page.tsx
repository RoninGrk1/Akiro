import type { Metadata } from "next";
import Link from "next/link";
import { AkiroLogo } from "@/components/logo/AkiroLogo";
import { ToolGrid } from "@/components/dashboard/ToolGrid";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TOOLS } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  const available = TOOLS.filter((t) => t.status === "Available").length;
  const needsConfig = TOOLS.filter((t) => t.status === "Needs configuration").length;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 flex items-center gap-3">
            <AkiroLogo size={40} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gold">
                Local-first production
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Akiro
              </h1>
            </div>
          </div>
          <p className="text-base text-muted leading-relaxed">
            One website. Twenty tools. One expert AI. Zero unnecessary complexity.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/sign-in">
            <Button variant="outline" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/workspace">
            <Button size="sm">Open workspace</Button>
          </Link>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Tools" value={String(TOOLS.length)} />
        <StatCard label="Available" value={String(available)} accent="green" />
        <StatCard label="Needs configuration" value={String(needsConfig)} accent="blue" />
        <StatCard label="Mode" value="Local" accent="green" />
      </div>

      <Card padding="md" className="mb-8 border-accent-green/20 bg-accent-green/5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="available">Local-first</Badge>
              <span className="text-sm font-medium text-foreground">
                Real workspace · solc · terminal · SQLite
              </span>
            </div>
            <p className="text-xs text-muted">
              On-disk project, sandboxed terminal, and solc are live. Cloud AI,
              GitHub OAuth, IPFS, and Vercel show Needs configuration until secrets are set.
            </p>
          </div>
          <Link href="/integrations" className="shrink-0">
            <Button variant="ghost" size="sm">
              View integrations →
            </Button>
          </Link>
        </div>
      </Card>

      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">All 20 tools</h2>
        <p className="text-xs text-muted-foreground">
          Available = works locally; Needs configuration = requires env secrets
        </p>
      </div>

      <ToolGrid />
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "green" | "blue";
}) {
  const valueClass =
    accent === "green"
      ? "text-accent-green"
      : accent === "blue"
        ? "text-accent-blue"
        : "text-foreground";

  return (
    <Card padding="md">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${valueClass}`}>
        {value}
      </p>
    </Card>
  );
}
