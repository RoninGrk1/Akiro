import { ToolCard } from "@/components/dashboard/ToolCard";
import { TOOLS, TOOL_CATEGORIES, type ToolCategory } from "@/lib/tools";
import { getToolsCatalog } from "@/lib/tools-catalog";

export function ToolGrid() {
  const catalog = getToolsCatalog();
  const hrefById = new Map(catalog.map((c) => [c.tool.id, c.href]));

  return (
    <div className="space-y-8">
      {TOOL_CATEGORIES.map((category) => (
        <CategorySection
          key={category}
          category={category}
          hrefById={hrefById}
        />
      ))}
    </div>
  );
}

function CategorySection({
  category,
  hrefById,
}: {
  category: ToolCategory;
  hrefById: Map<string, string>;
}) {
  const tools = TOOLS.filter((t) => t.category === category);
  return (
    <section aria-labelledby={`category-${category}`}>
      <h2
        id={`category-${category}`}
        className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted"
      >
        {category}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            href={hrefById.get(tool.id)}
          />
        ))}
      </div>
    </section>
  );
}
