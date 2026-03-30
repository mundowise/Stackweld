import { useEffect, useState } from "react";
import { useAppStore } from "../stores/app-store";
import { execCommand, isTauri } from "../lib/tauri";
import {
  technologies as registryTechnologies,
  templates as registryTemplates,
} from "../generated/registry-data";

export function useLoadData() {
  const { setTechnologies, setStacks, setTemplates } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Always load the full registry (83 technologies, 20 templates)
        // These are embedded at build time from the YAML registry
        setTechnologies(registryTechnologies as any);
        setTemplates(registryTemplates as any);

        if (isTauri) {
          // In Tauri mode, also load saved stacks from the CLI
          const stackResult = await execCommand({ action: "ListStacks" });
          if (
            stackResult.success &&
            stackResult.stdout &&
            stackResult.stdout.trim().startsWith("[")
          ) {
            setStacks(JSON.parse(stackResult.stdout));
          }
        } else {
          setStacks([]);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [setTechnologies, setStacks, setTemplates]);

  return { loading, error };
}
