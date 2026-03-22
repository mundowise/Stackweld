import { describe, it, expect } from "vitest";
import { RulesEngine } from "../engine/rules-engine.js";
import type { Technology, StackTechnology } from "../types/index.js";

const mockTechs: Technology[] = [
  {
    id: "nodejs", name: "Node.js", category: "runtime",
    description: "", website: "", versions: [{ version: "22" }],
    defaultVersion: "22", defaultPort: 3000,
    requires: [], incompatibleWith: [], suggestedWith: ["typescript"],
    envVars: {}, configFiles: [], lastVerified: "2026-03-22", tags: [],
  },
  {
    id: "nextjs", name: "Next.js", category: "frontend",
    description: "", website: "", versions: [{ version: "15" }],
    defaultVersion: "15", defaultPort: 3000,
    requires: ["nodejs", "react"], incompatibleWith: ["nuxt"],
    suggestedWith: ["typescript", "tailwindcss"],
    envVars: {}, configFiles: [], lastVerified: "2026-03-22", tags: [],
  },
  {
    id: "react", name: "React", category: "frontend",
    description: "", website: "", versions: [{ version: "19" }],
    defaultVersion: "19", defaultPort: 3000,
    requires: ["nodejs"], incompatibleWith: [], suggestedWith: [],
    envVars: {}, configFiles: [], lastVerified: "2026-03-22", tags: [],
  },
  {
    id: "nuxt", name: "Nuxt", category: "frontend",
    description: "", website: "", versions: [{ version: "3" }],
    defaultVersion: "3", defaultPort: 3000,
    requires: ["nodejs"], incompatibleWith: ["nextjs"],
    suggestedWith: [],
    envVars: {}, configFiles: [], lastVerified: "2026-03-22", tags: [],
  },
  {
    id: "postgresql", name: "PostgreSQL", category: "database",
    description: "", website: "", versions: [{ version: "17" }],
    defaultVersion: "17", defaultPort: 5432,
    requires: [], incompatibleWith: [], suggestedWith: [],
    envVars: {}, configFiles: [], lastVerified: "2026-03-22", tags: [],
  },
  {
    id: "typescript", name: "TypeScript", category: "devops",
    description: "", website: "", versions: [{ version: "5" }],
    defaultVersion: "5",
    requires: [], incompatibleWith: [], suggestedWith: [],
    envVars: {}, configFiles: [], lastVerified: "2026-03-22", tags: [],
  },
];

describe("RulesEngine", () => {
  const engine = new RulesEngine(mockTechs);

  it("validates a simple valid stack", () => {
    const selected: StackTechnology[] = [
      { technologyId: "nodejs", version: "22" },
      { technologyId: "postgresql", version: "17" },
    ];
    const result = engine.validate(selected);
    expect(result.valid).toBe(true);
    expect(result.issues.filter((i) => i.severity === "error")).toHaveLength(0);
  });

  it("auto-resolves missing dependencies", () => {
    const selected: StackTechnology[] = [
      { technologyId: "nextjs", version: "15" },
    ];
    const result = engine.validate(selected);
    expect(result.resolvedDependencies).toContain("nodejs");
    expect(result.resolvedDependencies).toContain("react");
    expect(result.issues.some((i) => i.code === "AUTO_DEPENDENCY")).toBe(true);
  });

  it("detects incompatible technologies", () => {
    const selected: StackTechnology[] = [
      { technologyId: "nodejs", version: "22" },
      { technologyId: "nextjs", version: "15" },
      { technologyId: "nuxt", version: "3" },
    ];
    const result = engine.validate(selected);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === "INCOMPATIBLE")).toBe(true);
  });

  it("detects and resolves port conflicts", () => {
    const selected: StackTechnology[] = [
      { technologyId: "nodejs", version: "22" },
      { technologyId: "react", version: "19" },
      { technologyId: "nextjs", version: "15" },
    ];
    const result = engine.validate(selected);
    const ports = Object.values(result.portAssignments);
    const uniquePorts = new Set(ports);
    expect(ports.length).toBe(uniquePorts.size); // No duplicates
  });

  it("detects unknown technologies", () => {
    const selected: StackTechnology[] = [
      { technologyId: "doesnotexist", version: "1" },
    ];
    const result = engine.validate(selected);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === "UNKNOWN_TECHNOLOGY")).toBe(true);
  });

  it("returns suggestions for selected stack", () => {
    const suggestions = engine.getSuggestions(["nodejs"]);
    expect(suggestions.some((s) => s.id === "typescript")).toBe(true);
  });

  it("gets technologies by category", () => {
    const frontends = engine.getByCategory("frontend");
    expect(frontends.length).toBeGreaterThan(0);
    expect(frontends.every((t) => t.category === "frontend")).toBe(true);
  });
});
