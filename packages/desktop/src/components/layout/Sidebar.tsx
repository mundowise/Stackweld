import { cn } from "@/lib/cn";
import { useAppStore, type Page } from "@/stores/app-store";
import { LayoutDashboard, Layers, BookOpen, Play, Settings, PlusCircle, Sparkles } from "lucide-react";
import { stats } from "@/generated/registry-data";

const navItems: { page: Page; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
  { page: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { page: "builder", label: "Stack Builder", icon: PlusCircle },
  { page: "catalog", label: "Catalog", icon: BookOpen, badge: String(stats.totalTechnologies) },
  { page: "runtime", label: "Runtime", icon: Play },
  { page: "ai", label: "AI Assistant", icon: Sparkles },
  { page: "settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const { currentPage, setPage } = useAppStore();

  return (
    <aside className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Layers className="w-6 h-6 text-indigo-400" />
          <span className="font-bold text-lg tracking-tight">StackPilot</span>
        </div>
        <p className="text-xs text-zinc-500 mt-1">Dev stack OS</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ page, label, icon: Icon, badge }) => (
          <button
            key={page}
            onClick={() => setPage(page)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              currentPage === page
                ? "bg-indigo-500/15 text-indigo-400"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="flex-1 text-left">{label}</span>
            {badge && (
              <span className="text-xs bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">{badge}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-800">
        <p className="text-xs text-zinc-600 text-center">v0.1.0</p>
      </div>
    </aside>
  );
}
