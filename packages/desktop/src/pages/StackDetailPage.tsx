import { useAppStore } from "@/stores/app-store";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Download, Trash2, History } from "lucide-react";

export function StackDetailPage() {
  const { selectedStackId, stacks, technologies, setPage, selectStack } = useAppStore();
  const stack = stacks.find(s => s.id === selectedStackId);

  if (!stack) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <p>Stack not found</p>
        <Button variant="ghost" className="mt-4" onClick={() => setPage("dashboard")}>
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const stackTechs = stack.technologies.map(st => {
    const tech = technologies.find(t => t.id === st.technologyId);
    return { ...st, tech };
  });

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button onClick={() => selectStack(null)} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{stack.name}</h1>
          <p className="text-sm text-zinc-500 mt-1">{stack.description || "No description"}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary"><Download className="w-4 h-4" /> Export</Button>
          <Button size="sm" variant="secondary"><History className="w-4 h-4" /> History</Button>
          <Button size="sm" variant="danger"><Trash2 className="w-4 h-4" /> Delete</Button>
        </div>
      </div>

      {/* Meta */}
      <div className="flex gap-4">
        <Badge variant={stack.profile === "production" ? "success" : "default"}>{stack.profile}</Badge>
        <span className="text-sm text-zinc-500">Version {stack.version}</span>
        <span className="text-sm text-zinc-500">Created {new Date(stack.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Technologies */}
      <Card>
        <h2 className="font-semibold mb-4">Technologies ({stackTechs.length})</h2>
        <div className="divide-y divide-zinc-800">
          {stackTechs.map(({ technologyId, version, port, tech }) => (
            <div key={technologyId} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Badge variant={tech?.category as any}>{tech?.category || "unknown"}</Badge>
                <span className="font-medium">{tech?.name || technologyId}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-500">
                <span>v{version}</span>
                {port && <span>:{port}</span>}
                {tech?.dockerImage && <Badge variant="default">Docker</Badge>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
