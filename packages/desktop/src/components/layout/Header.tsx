import { Search } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  builder: "Stack Builder",
  catalog: "Technology Catalog",
  "stack-detail": "Stack Details",
  runtime: "Runtime",
  ai: "AI Assistant",
  settings: "Settings",
};

export function Header() {
  const { currentPage, searchQuery, setSearchQuery } = useAppStore();

  return (
    <header className="h-14 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between px-6 backdrop-blur-sm">
      <h1 className="text-lg font-semibold text-zinc-100">
        {pageTitles[currentPage] || "StackPilot"}
      </h1>

      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search technologies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
        />
      </div>
    </header>
  );
}
