/**
 * Tauri bridge — abstracts Tauri invoke calls.
 * Falls back to mock data when running in browser (dev without Tauri).
 *
 * SEC-001/SEC-002/SEC-003: All IPC uses structured CliAction instead of shell strings.
 */

const isTauri =
  "__TAURI__" in window || "__TAURI_INTERNALS__" in window || navigator.userAgent.includes("Tauri");

interface SystemInfo {
  os: string;
  arch: string;
  cpus: number;
  total_memory_gb: number;
  free_memory_gb: number;
}

interface ToolCheck {
  name: string;
  available: boolean;
  version: string | null;
}

interface CliResult {
  success: boolean;
  stdout: string;
  stderr: string;
}

// ─── Structured CLI Actions (mirrors Rust CliAction enum) ───

type CliAction =
  | { action: "ListStacks" }
  | { action: "Generate"; name: string; path: string; techs: string; profile: string }
  | { action: "AiSuggest"; description: string }
  | { action: "AiReadme"; stack_id: string }
  | { action: "AiExplain"; stack_id: string }
  | { action: "DockerUp"; path: string }
  | { action: "DockerDown"; path: string }
  | { action: "DockerStatus"; path: string }
  | { action: "DockerLogs"; path: string; service?: string };

// ─── Internal invoke helper ─────────────────────────

async function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauri) {
    const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
    return tauriInvoke<T>(command, args);
  }
  throw new Error(`Tauri not available for command: ${command}`);
}

// ─── Public API ─────────────────────────────────────

export async function getSystemInfo(): Promise<SystemInfo> {
  if (!isTauri) {
    return {
      os: navigator.platform,
      arch: "x64",
      cpus: navigator.hardwareConcurrency || 4,
      total_memory_gb: 16,
      free_memory_gb: 8,
    };
  }
  return invoke<SystemInfo>("get_system_info");
}

export async function checkTool(name: string): Promise<ToolCheck> {
  if (!isTauri) {
    return { name, available: false, version: null };
  }
  return invoke<ToolCheck>("check_tool", { name });
}

export async function execCommand(action: CliAction): Promise<CliResult> {
  if (!isTauri) {
    return { success: false, stdout: "", stderr: "Not running in Tauri" };
  }
  return invoke<CliResult>("exec_command", { action });
}

export type { CliAction, CliResult, SystemInfo, ToolCheck };
export { isTauri };
