import { useMemo, useState } from "react";
import { useAppStore } from "@/stores/app-store";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { isTauri, execCommand } from "@/lib/tauri";
import { Check, X, AlertTriangle, ChevronRight, FolderOpen, Loader2, CheckCircle2 } from "lucide-react";

const PROFILES = ["rapid", "standard", "production", "enterprise", "lightweight"] as const;
const CATEGORIES = ["runtime", "frontend", "backend", "database", "orm", "auth", "styling", "service", "devops"] as const;

export function BuilderPage() {
  const {
    technologies, builderTechs, builderProfile, builderName,
    toggleBuilderTech, setBuilderProfile, setBuilderName, resetBuilder
  } = useAppStore();

  const [projectPath, setProjectPath] = useState("");
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState<{ success: boolean; message: string } | null>(null);

  // Open native folder picker
  async function handleSelectFolder() {
    if (isTauri) {
      try {
        const { open } = await import("@tauri-apps/plugin-dialog");
        const selected = await open({
          directory: true,
          multiple: false,
          title: "Select project location",
        });
        if (selected && typeof selected === "string") {
          setProjectPath(selected);
        }
      } catch {
        // Fallback: let user type manually
      }
    }
  }

  // Create the stack and scaffold the full project
  async function handleCreateStack() {
    if (!builderName.trim() || !projectPath.trim()) return;
    setCreating(true);
    setCreateResult(null);

    const techList = builderTechs.join(",");

    if (isTauri) {
      try {
        // Use the CLI `generate` command which does everything in one step:
        // 1. Creates stack in DB with validation + auto-resolved deps
        // 2. Generates ALL scaffold files (docker-compose, .env, README, Makefile, scripts, devcontainer, CI, .gitignore, .vscode)
        // 3. Initializes git with first commit
        const cliBase = "/home/orlando/Desktop/XPlus-Finance/PROYECTOS_NUEVOS/StackPilot/stackpilot";
        const cmd = `node ${cliBase}/packages/cli/dist/index.js generate --name "${builderName}" --path "${projectPath}" --techs "${techList}" --profile "${builderProfile}" --git --json`;

        const result = await execCommand(cmd);

        if (result.success && result.stdout) {
          try {
            const data = JSON.parse(result.stdout);
            if (data.success) {
              const fileList = (data.filesGenerated || []).map((f: string) => `  - ${f}`).join("\n");
              const cmdList = (data.scaffoldCommands || []).map((c: { name: string; command: string }) => `  ${c.name}: ${c.command}`).join("\n");

              let msg = `Project "${builderName}" created at:\n${data.path}\n\nFiles generated:\n${fileList}`;

              if (data.validation?.resolvedDependencies?.length > 0) {
                msg += `\n\nAuto-resolved dependencies:\n  ${data.validation.resolvedDependencies.join(", ")}`;
              }

              if (cmdList) {
                msg += `\n\nOfficial scaffold commands to run:\n${cmdList}`;
              }

              msg += `\n\nNext steps:\n  cd ${data.path}\n  bash scripts/setup.sh\n  make dev`;

              setCreateResult({ success: true, message: msg });
            } else {
              setCreateResult({ success: false, message: `Validation failed:\n${JSON.stringify(data.errors, null, 2)}` });
            }
          } catch {
            setCreateResult({ success: true, message: result.stdout });
          }
        } else {
          setCreateResult({ success: false, message: result.stderr || "Generation failed" });
        }
      } catch (e) {
        setCreateResult({ success: false, message: e instanceof Error ? e.message : "Unknown error" });
      }
    } else {
      setCreateResult({
        success: false,
        message: `Project creation requires the Tauri desktop app.\n\nTo create from CLI:\n  stackpilot generate --name "${builderName}" --path "${projectPath}" --techs "${techList}" --profile "${builderProfile}" --git\n\nOr use the compiled app:\n  ./packages/desktop/src-tauri/target/release/stackpilot-desktop`,
      });
    }
    setCreating(false);
  }

  // Validate selected technologies
  const validation = useMemo(() => {
    const selected = new Set(builderTechs);
    const errors: string[] = [];
    const warnings: string[] = [];
    const autoAdded: string[] = [];

    for (const techId of builderTechs) {
      const tech = technologies.find(t => t.id === techId);
      if (!tech) continue;

      for (const incomp of tech.incompatibleWith) {
        if (selected.has(incomp)) {
          const other = technologies.find(t => t.id === incomp);
          errors.push(`${tech.name} is incompatible with ${other?.name || incomp}`);
        }
      }

      for (const req of tech.requires) {
        if (!selected.has(req)) {
          const dep = technologies.find(t => t.id === req);
          autoAdded.push(`${dep?.name || req} (required by ${tech.name})`);
        }
      }
    }

    for (const techId of builderTechs) {
      const tech = technologies.find(t => t.id === techId);
      if (!tech) continue;
      for (const sug of tech.suggestedWith) {
        if (!selected.has(sug)) {
          const other = technologies.find(t => t.id === sug);
          if (other) warnings.push(`Consider adding ${other.name} (pairs well with ${tech.name})`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: [...new Set(errors)],
      warnings: [...new Set(warnings)].slice(0, 5),
      autoAdded: [...new Set(autoAdded)],
    };
  }, [builderTechs, technologies]);

  const selectedTechs = technologies.filter(t => builderTechs.includes(t.id));

  return (
    <div className="flex gap-6 h-full">
      {/* Left - Tech Selection */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {/* Project config */}
        <Card>
          <div className="space-y-3">
            {/* Name */}
            <div>
              <label className="text-xs text-zinc-500 font-medium">Project Name</label>
              <input
                type="text"
                value={builderName}
                onChange={(e) => setBuilderName(e.target.value)}
                placeholder="my-awesome-project"
                className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            {/* Path selector */}
            <div>
              <label className="text-xs text-zinc-500 font-medium">Project Location</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={projectPath}
                  onChange={(e) => setProjectPath(e.target.value)}
                  placeholder="/home/user/projects"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/50"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleSelectFolder}
                  title="Browse folders"
                >
                  <FolderOpen className="w-4 h-4" />
                  Browse
                </Button>
              </div>
              {projectPath && builderName && (
                <p className="text-xs text-zinc-600 mt-1">
                  Full path: {projectPath}/{builderName}
                </p>
              )}
            </div>

            {/* Profile */}
            <div>
              <label className="text-xs text-zinc-500 font-medium">Profile</label>
              <div className="flex gap-1 mt-1 flex-wrap">
                {PROFILES.map((p) => (
                  <button
                    key={p}
                    onClick={() => setBuilderProfile(p)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors",
                      builderProfile === p
                        ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40"
                        : "bg-zinc-800 text-zinc-500 border border-zinc-700 hover:text-zinc-300"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Category sections */}
        {CATEGORIES.map((cat) => {
          const catTechs = technologies.filter(t => t.category === cat);
          if (catTechs.length === 0) return null;

          return (
            <div key={cat}>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 capitalize">
                {cat} <span className="text-zinc-600">({catTechs.length})</span>
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {catTechs.map((tech) => {
                  const isSelected = builderTechs.includes(tech.id);
                  const isIncompatible = builderTechs.some(bt => {
                    const sel = technologies.find(t => t.id === bt);
                    return sel?.incompatibleWith.includes(tech.id);
                  });

                  return (
                    <button
                      key={tech.id}
                      onClick={() => !isIncompatible && toggleBuilderTech(tech.id)}
                      disabled={isIncompatible}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-lg text-left text-sm border transition-all",
                        isSelected
                          ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300"
                          : isIncompatible
                            ? "bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50"
                            : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center",
                        isSelected ? "bg-indigo-500 border-indigo-500" : "border-zinc-600"
                      )}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                        {isIncompatible && <X className="w-3 h-3 text-zinc-600" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate text-xs">{tech.name}</p>
                        <p className="text-xs text-zinc-500 truncate">v{tech.defaultVersion}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right - Preview Panel */}
      <div className="w-80 flex-shrink-0 space-y-4">
        <Card className="sticky top-0">
          <h3 className="font-semibold text-sm mb-3">
            Stack Preview
            {selectedTechs.length > 0 && (
              <span className="text-zinc-500 font-normal ml-2">({selectedTechs.length})</span>
            )}
          </h3>

          {selectedTechs.length === 0 ? (
            <p className="text-sm text-zinc-500 py-4 text-center">Select technologies to start building</p>
          ) : (
            <>
              <div className="space-y-1.5 mb-4 max-h-48 overflow-y-auto">
                {selectedTechs.map((tech) => (
                  <div key={tech.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant={tech.category as any}>{tech.category}</Badge>
                      <span className="text-xs">{tech.name}</span>
                    </div>
                    <button onClick={() => toggleBuilderTech(tech.id)} className="text-zinc-600 hover:text-red-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Validation messages */}
              {validation.errors.length > 0 && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 mb-3">
                  {validation.errors.map((e, i) => (
                    <p key={i} className="text-xs text-red-400 flex items-start gap-1.5">
                      <X className="w-3 h-3 mt-0.5 flex-shrink-0" />{e}
                    </p>
                  ))}
                </div>
              )}

              {validation.autoAdded.length > 0 && (
                <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 mb-3">
                  <p className="text-xs text-blue-400 font-medium mb-1">Auto-added dependencies:</p>
                  {validation.autoAdded.map((a, i) => (
                    <p key={i} className="text-xs text-blue-300 flex items-start gap-1.5">
                      <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />{a}
                    </p>
                  ))}
                </div>
              )}

              {validation.warnings.length > 0 && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 mb-3">
                  {validation.warnings.map((w, i) => (
                    <p key={i} className="text-xs text-amber-400 flex items-start gap-1.5">
                      <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />{w}
                    </p>
                  ))}
                </div>
              )}

              {/* Create result */}
              {createResult && (
                <div className={cn(
                  "rounded-lg p-3 mb-3 border",
                  createResult.success
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-red-500/10 border-red-500/20"
                )}>
                  {createResult.success && <CheckCircle2 className="w-4 h-4 text-green-400 mb-1" />}
                  <pre className={cn(
                    "text-xs whitespace-pre-wrap",
                    createResult.success ? "text-green-400" : "text-red-400"
                  )}>
                    {createResult.message}
                  </pre>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  disabled={!validation.valid || !builderName.trim() || !projectPath.trim() || creating}
                  className="flex-1"
                  onClick={handleCreateStack}
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Project"
                  )}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { resetBuilder(); setCreateResult(null); setProjectPath(""); }}>
                  Clear
                </Button>
              </div>

              {!projectPath && builderName && (
                <p className="text-xs text-amber-400 mt-2">Select a project location to create</p>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
