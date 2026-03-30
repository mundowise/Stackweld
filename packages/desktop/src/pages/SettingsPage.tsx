import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { getSystemInfo } from "@/lib/tauri";

interface SysInfo {
  os: string;
  arch: string;
  cpus: number;
  total_memory_gb: number;
  free_memory_gb: number;
}

export function SettingsPage() {
  const [sysInfo, setSysInfo] = useState<SysInfo | null>(null);

  useEffect(() => {
    getSystemInfo().then(setSysInfo);
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold mb-4">System Information</h2>
        {sysInfo ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">OS</span>
              <span>
                {sysInfo.os} ({sysInfo.arch})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">CPUs</span>
              <span>{sysInfo.cpus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Memory</span>
              <span>
                {sysInfo.free_memory_gb}GB free / {sysInfo.total_memory_gb}GB total
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Loading...</p>
        )}
      </Card>

      <Card>
        <h2 className="font-semibold mb-4">About Stackweld</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Version</span>
            <span>0.1.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Engine</span>
            <span>Tauri 2 + React 19</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
