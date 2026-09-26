"use client";

import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge, statusToBadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { TOOL_CATEGORIES } from "@/lib/tools";
import { getToolsCatalog } from "@/lib/tools-catalog";

export function ToolsCatalogView() {
  const catalog = getToolsCatalog();

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Developer Tools"
        description="All twenty Akiro tools with deep links into the workspace, AI lab, Web3 hub, or integrations UI."
      />
      <div className="space-y-8">
        {TOOL_CATEGORIES.map((category) => {
          const items = catalog.filter((c) => c.tool.category === category);
          return (
            <section key={category} aria-labelledby={`tools-${category}`}>
              <h2
                id={`tools-${category}`}
                className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted"
              >
                {category}
              </h2>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {items.map(({ tool, href }) => (
                  <Link
                    key={tool.id}
                    href={href}
                    className="block h-full rounded-lg focus-visible:outline-none"
                  >
                    <Card
                      padding="md"
                      interactive
                      className="flex h-full flex-col min-h-[7.5rem]"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-foreground">
                          {tool.name}
                        </h3>
                        <Badge variant={statusToBadgeVariant(tool.status)}>
                          {tool.status}
                        </Badge>
                      </div>
                      <p className="flex-1 text-xs text-muted leading-relaxed">
                        {tool.description}
                      </p>
                      <span className="mt-3 text-xs font-medium text-accent-blue">
                        Open →
                      </span>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
