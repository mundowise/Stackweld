import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { execCommand, isTauri } from "@/lib/tauri";
import { Sparkles, FileText, Brain, Terminal, Copy, Check } from "lucide-react";

type AiMode = "suggest" | "readme" | "explain";

const modes: { id: AiMode; name: string; icon: React.ComponentType<{ className?: string }>; description: string; placeholder: string }[] = [
  { id: "suggest", name: "Suggest Stack", icon: Sparkles, description: "Describe what you want to build and get a suggested stack", placeholder: 'e.g., "I want to build a SaaS with payments and auth"' },
  { id: "readme", name: "Generate README", icon: FileText, description: "Generate a professional README from a saved stack", placeholder: "Enter the Stack ID" },
  { id: "explain", name: "Explain Stack", icon: Brain, description: "Get an architectural explanation of a stack's decisions", placeholder: "Enter the Stack ID" },
];

export function AiPage() {
  const [activeMode, setActiveMode] = useState<AiMode>("suggest");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const currentMode = modes.find((m) => m.id === activeMode)!;

  async function handleSubmit() {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      if (isTauri) {
        const cliPath = "packages/cli/dist/index.js";
        let cmd: string;
        switch (activeMode) {
          case "suggest":
            cmd = `node ${cliPath} ai suggest "${input.replace(/"/g, '\\"')}"`;
            break;
          case "readme":
            cmd = `node ${cliPath} ai readme "${input}"`;
            break;
          case "explain":
            cmd = `node ${cliPath} ai explain "${input}"`;
            break;
        }
        const res = await execCommand(cmd);
        if (res.success) {
          setResult(res.stdout);
        } else {
          setError(res.stderr || "Command failed");
        }
      } else {
        // Browser mode — show instructions
        setError(
          "AI features require the Tauri desktop app with ANTHROPIC_API_KEY configured.\n\n" +
          "To use from CLI:\n" +
          `export ANTHROPIC_API_KEY=sk-ant-...\n` +
          `stackpilot ai ${activeMode} "${input}"`
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold">AI Assistant</h2>
          <Badge variant="default">Anthropic API</Badge>
        </div>
        <p className="text-sm text-zinc-500">
          AI-powered utilities for stack suggestions, documentation, and architectural analysis.
          The AI is a utility — the rules engine remains the source of truth for compatibility.
        </p>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-3 gap-3">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => { setActiveMode(mode.id); setResult(null); setError(null); setInput(""); }}
            className={cn(
              "flex flex-col items-start gap-2 p-4 rounded-xl border transition-all text-left",
              activeMode === mode.id
                ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-300"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            )}
          >
            <mode.icon className={cn("w-5 h-5", activeMode === mode.id ? "text-indigo-400" : "text-zinc-500")} />
            <div>
              <p className="font-medium text-sm">{mode.name}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{mode.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Input */}
      <Card>
        <div className="space-y-3">
          <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
            {activeMode === "suggest" ? "Describe your project" : "Stack ID"}
          </label>
          {activeMode === "suggest" ? (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentMode.placeholder}
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 resize-none"
            />
          ) : (
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentMode.placeholder}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50"
            />
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-600">
              Powered by Anthropic API — requires ANTHROPIC_API_KEY
            </p>
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || loading}
              size="sm"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  {activeMode === "suggest" ? "Suggest" : activeMode === "readme" ? "Generate" : "Explain"}
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-red-500/30 bg-red-500/5">
          <pre className="text-sm text-red-400 whitespace-pre-wrap font-mono">{error}</pre>
        </Card>
      )}

      {/* Result */}
      {result && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-300">Result</h3>
            <Button size="sm" variant="ghost" onClick={handleCopy}>
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed bg-zinc-950 rounded-lg p-4 max-h-96 overflow-y-auto">
            {result}
          </pre>
        </Card>
      )}

      {/* CLI commands reference */}
      <Card className="border-zinc-800/50">
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-400">CLI Commands</h3>
        </div>
        <div className="space-y-2 text-xs font-mono text-zinc-500">
          <p><span className="text-indigo-400">stackpilot ai suggest</span> "describe your project"</p>
          <p><span className="text-indigo-400">stackpilot ai readme</span> &lt;stack-id&gt;</p>
          <p><span className="text-indigo-400">stackpilot ai explain</span> &lt;stack-id&gt;</p>
        </div>
      </Card>
    </div>
  );
}
