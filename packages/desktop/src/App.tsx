import { AppLayout } from "@/components/layout/AppLayout";
import { useLoadData } from "@/hooks/use-data";
import { AiPage } from "@/pages/AiPage";
import { BuilderPage } from "@/pages/BuilderPage";
import { CatalogPage } from "@/pages/CatalogPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { RuntimePage } from "@/pages/RuntimePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { StackDetailPage } from "@/pages/StackDetailPage";
import { useAppStore } from "@/stores/app-store";

function PageRouter() {
  const { currentPage } = useAppStore();

  switch (currentPage) {
    case "dashboard":
      return <DashboardPage />;
    case "builder":
      return <BuilderPage />;
    case "catalog":
      return <CatalogPage />;
    case "runtime":
      return <RuntimePage />;
    case "stack-detail":
      return <StackDetailPage />;
    case "ai":
      return <AiPage />;
    case "settings":
      return <SettingsPage />;
    default:
      return <DashboardPage />;
  }
}

export function App() {
  const { loading, error } = useLoadData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-zinc-500 mt-4">Loading Stackweld...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="text-center max-w-md">
          <p className="text-red-400 font-medium">Failed to load</p>
          <p className="text-sm text-zinc-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <PageRouter />
    </AppLayout>
  );
}
