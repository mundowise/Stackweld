import { useMemo } from "react";
import { useAppStore } from "@/stores/app-store";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Layers, Database, Code, PlusCircle, BookOpen, Zap, Sparkles, Box } from "lucide-react";

export function DashboardPage() {
  const { technologies, stacks, templates, setPage, selectStack } = useAppStore();

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of technologies) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    return counts;
  }, [technologies]);

  const statCards = [
    { label: "Technologies", value: technologies.length, icon: Code, color: "text-indigo-400" },
    { label: "Saved Stacks", value: stacks.length, icon: Layers, color: "text-green-400" },
    { label: "Templates", value: templates.length, icon: BookOpen, color: "text-amber-400" },
    { label: "Categories", value: Object.keys(categoryCounts).length, icon: Database, color: "text-cyan-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color} opacity-60`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button onClick={() => setPage("builder")}>
          <PlusCircle className="w-4 h-4" />
          New Stack
        </Button>
        <Button variant="secondary" onClick={() => setPage("catalog")}>
          <BookOpen className="w-4 h-4" />
          Browse Catalog ({technologies.length})
        </Button>
        <Button variant="secondary" onClick={() => setPage("ai")}>
          <Sparkles className="w-4 h-4" />
          AI Assistant
        </Button>
      </div>

      {/* Categories overview */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Technology Categories</h2>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
            <Card key={cat} hoverable onClick={() => setPage("catalog")} className="flex items-center gap-3">
              <Box className="w-4 h-4 text-zinc-500" />
              <div className="flex-1">
                <p className="text-sm font-medium capitalize">{cat}</p>
              </div>
              <Badge variant={cat as any}>{count}</Badge>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Stacks */}
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Recent Stacks</h2>
          {stacks.length === 0 ? (
            <Card>
              <div className="text-center py-8 text-zinc-500">
                <Layers className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No stacks yet</p>
                <p className="text-sm mt-1">Create your first stack to get started</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-2">
              {stacks.slice(0, 5).map((stack) => (
                <Card key={stack.id} hoverable onClick={() => selectStack(stack.id)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{stack.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {stack.technologies.length} technologies -- v{stack.version}
                      </p>
                    </div>
                    <Badge variant={stack.profile === "production" ? "success" : "default"}>
                      {stack.profile}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Templates */}
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Templates ({templates.length})
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {templates.map((template) => (
              <Card key={template.id} hoverable onClick={() => setPage("builder")}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{template.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">{template.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Badge variant={
                      template.profile === "production" ? "success" :
                      template.profile === "lightweight" ? "warning" :
                      template.profile === "enterprise" ? "runtime" :
                      "default"
                    }>
                      {template.profile}
                    </Badge>
                    <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
