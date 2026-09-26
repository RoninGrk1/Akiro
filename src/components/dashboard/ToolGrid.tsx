import { ToolCard } from "@/components/dashboard/ToolCard";
import { TOOLS, TOOL_CATEGORIES, type ToolCategory } from "@/lib/tools";

export function ToolGrid() {
  return (
    <div className="space-y-8">
      {TOOL_CATEGORIES.map((category) => (
        <CategorySection key={category} category={category} />
      ))}
    </div>
  );
}

function CategorySection({ category }: { category: ToolCategory }) {
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
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}
