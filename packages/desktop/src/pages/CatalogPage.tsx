import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { type Technology, useAppStore } from "@/stores/app-store";

const CATEGORIES = [
  "all",
  "runtime",
  "frontend",
  "backend",
  "database",
  "orm",
  "auth",
  "styling",
  "service",
  "devops",
] as const;

export function CatalogPage() {
  const { technologies, searchQuery } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    return technologies.filter((tech) => {
      const matchesCategory = activeCategory === "all" || tech.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [technologies, activeCategory, searchQuery]);

  const grouped = useMemo(() => {
    const groups: Record<string, Technology[]> = {};
    for (const tech of filtered) {
      (groups[tech.category] ||= []).push(tech);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Category tabs */}
      <div className="flex gap-1 bg-zinc-900 rounded-lg p-1 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors whitespace-nowrap",
              activeCategory === cat
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            {cat}
            {cat !== "all" && (
              <span className="ml-1.5 text-xs opacity-60">
                {technologies.filter((t) => t.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-zinc-500">{filtered.length} technologies</p>

      {/* Technology grid */}
      {activeCategory === "all" ? (
        Object.entries(grouped).map(([category, techs]) => (
          <div key={category}>
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 capitalize">
              {category}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {techs.map((tech) => (
                <TechCard key={tech.id} tech={tech} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((tech) => (
            <TechCard key={tech.id} tech={tech} />
          ))}
        </div>
      )}
    </div>
  );
}

function TechCard({ tech }: { tech: Technology }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      hoverable
      onClick={() => setExpanded(!expanded)}
      className={cn(expanded && "border-indigo-500/30")}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium">{tech.name}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{tech.description}</p>
        </div>
        <Badge variant={tech.category as any}>{tech.category}</Badge>
      </div>

      <div className="flex items-center gap-2 mt-3 text-xs text-zinc-500">
        <span>v{tech.defaultVersion}</span>
        {tech.defaultPort && <span>:{tech.defaultPort}</span>}
        {tech.dockerImage && <span className="text-blue-400">Docker</span>}
        {tech.officialScaffold && <span className="text-green-400">Scaffold</span>}
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-zinc-800 text-xs space-y-2">
          {tech.requires.length > 0 && (
            <p>
              <span className="text-zinc-500">Requires:</span> {tech.requires.join(", ")}
            </p>
          )}
          {tech.incompatibleWith.length > 0 && (
            <p>
              <span className="text-red-400">Incompatible:</span> {tech.incompatibleWith.join(", ")}
            </p>
          )}
          {tech.suggestedWith.length > 0 && (
            <p>
              <span className="text-green-400">Works well with:</span>{" "}
              {tech.suggestedWith.join(", ")}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
