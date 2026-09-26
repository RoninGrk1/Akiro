import type { Metadata } from "next";
import Link from "next/link";
import { AkiroLogo } from "@/components/logo/AkiroLogo";
import { ToolGrid } from "@/components/dashboard/ToolGrid";
import { StatusChips } from "@/components/dashboard/StatusChips";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TOOLS } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  const available = TOOLS.filter((t) => t.status === "Available").length;
  const needsConfig = TOOLS.filter(
    (t) => t.status === "Needs configuration",
  ).length;

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Hero */}
      <section className="akiro-hero-mesh mb-8 rounded-xl border border-border-subtle bg-surface/40 p-5 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <AkiroLogo size={44} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gold">
                  Local-first production
                </p>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                  Akiro
                </h1>
              </div>
            </div>
            <p className="text-sm sm:text-base text-muted leading-relaxed">
              One website. Twenty tools. One expert AI. Zero unnecessary
              complexity.
            </p>
            <div className="mt-4">
              <StatusChips />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
            <Link href="/workspace" className="w-full sm:w-auto">
              <Button size="lg" fullWidth className="sm:!w-auto">
                Open workspace
              </Button>
            </Link>
            <Link href="/ai-lab" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" fullWidth className="sm:!w-auto">
                Open AI Lab
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Tools" value={String(TOOLS.length)} />
        <StatCard label="Available" value={String(available)} accent="green" />
        <StatCard
          label="Needs configuration"
          value={String(needsConfig)}
          accent="blue"
        />
        <StatCard label="Mode" value="Local" accent="green" />
      </div>

      <Card
        padding="md"
        className="mb-8 !border-accent-green/20 !bg-accent-green/[0.04]"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Badge variant="available">Local-first</Badge>
              <span className="text-sm font-medium text-foreground">
                Real workspace · solc · terminal · SQLite
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              On-disk project, sandboxed terminal, and solc are live. Cloud AI,
              GitHub OAuth, IPFS, and Vercel show Needs configuration until
              secrets are set.
            </p>
          </div>
          <Link href="/integrations" className="shrink-0">
            <Button variant="ghost" size="sm" className="w-full sm:w-auto">
              View integrations →
            </Button>
          </Link>
        </div>
      </Card>

      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">All 20 tools</h2>
        <p className="text-xs text-muted-foreground">
          Available = works locally · Needs configuration = requires env secrets
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
      <p className={`mt-1 text-xl sm:text-2xl font-semibold tabular-nums ${valueClass}`}>
        {value}
      </p>
    </Card>
  );
}
