/**
 * Template / Blueprint — Preconfigured recipe based on a stack.
 * Templates delegate to official tools and only fill gaps.
 */

export interface ScaffoldStep {
  name: string;
  command: string; // e.g. "npx create-next-app@latest {{projectName}}"
  workingDir?: string; // Relative to project root
  condition?: string; // e.g. "technology:nextjs"
}

export interface TemplateOverride {
  path: string; // File path relative to project root
  content: string; // File content (small files only)
  condition?: string;
}

export interface TemplateHook {
  timing: "pre-scaffold" | "post-scaffold" | "pre-up" | "post-up";
  name: string;
  command: string;
  description: string; // Human-readable — shown to user before execution
  requiresConfirmation: boolean;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  technologyIds: string[]; // Stack composition
  profile: string;
  scaffoldSteps: ScaffoldStep[];
  overrides: TemplateOverride[];
  hooks: TemplateHook[];
  variables: Record<string, string>; // e.g. { "projectName": "my-app" }
}
