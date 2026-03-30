# StackPilot — Core API Reference

> Package: `@stackpilot/core` | Version: 0.1.0 | Last updated: 2026-03-29

This document covers the public API of the `@stackpilot/core` package. The CLI and Desktop app both consume this package — understanding this API is useful if you want to embed StackPilot in a custom tool or write integration tests.

---

## Types

### `Technology`

Atomic unit of the technology catalog. Loaded from YAML at startup.

```typescript
interface Technology {
  id: string;                        // e.g. "nextjs", "postgresql"
  name: string;                      // e.g. "Next.js", "PostgreSQL"
  category: TechnologyCategory;      // One of 9 categories (see below)
  description: string;
  website: string;
  versions: TechnologyVersion[];     // Available versions, newest first
  defaultVersion: string;
  defaultPort?: number;              // Default exposed port, undefined = no port

  requires: string[];                // Direct dependency IDs (auto-resolved)
  incompatibleWith: string[];        // IDs that conflict
  suggestedWith: string[];           // Companion suggestions (informational)

  officialScaffold?: string;         // CLI command to run (e.g. "npx create-next-app@latest")
  dockerImage?: string;              // Docker Hub image (e.g. "postgres:17")
  healthCheck?: HealthCheckConfig;

  envVars: Record<string, string>;   // Default env variable values
  configFiles: string[];             // Config files this technology creates

  lastVerified: string;              // ISO date — when definition was last checked
  tags: string[];
}

type TechnologyCategory =
  | "runtime" | "frontend" | "backend" | "database"
  | "orm" | "auth" | "styling" | "service" | "devops";
```

### `StackDefinition`

An abstract definition of a development stack. Not a project on disk — just a saved configuration.

```typescript
interface StackDefinition {
  id: string;                      // UUID
  name: string;                    // User-defined name, unique
  description: string;
  profile: StackProfile;           // "rapid" | "standard" | "production" | "enterprise" | "lightweight"
  technologies: StackTechnology[];
  createdAt: string;               // ISO date
  updatedAt: string;               // ISO date
  version: number;                 // Auto-incremented on each update
  tags: string[];
}

interface StackTechnology {
  technologyId: string;            // Must match a Technology.id from the registry
  version: string;                 // Selected version string
  port?: number;                   // Assigned port (may differ from defaultPort on conflicts)
  config?: Record<string, unknown>;// Per-technology config overrides
}
```

### `ValidationResult`

Returned by `RulesEngine.validate()` and passed through `StackEngine.create()`.

```typescript
interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  resolvedDependencies: string[];          // Tech IDs auto-added to satisfy requires
  portAssignments: Record<string, number>; // Final port per technology ID
}

interface ValidationIssue {
  severity: "error" | "warning" | "info";
  code: string;                            // Machine-readable code (see below)
  message: string;                         // Human-readable description
  technologyId: string;                    // Primary technology involved
  relatedTechnologyId?: string;            // Secondary technology (for conflicts)
  autoFixable: boolean;
  suggestedFix?: string;
}
```

**Issue codes:**

| Code | Severity | Meaning |
|------|----------|---------|
| `UNKNOWN_TECHNOLOGY` | error | Technology ID not in registry |
| `MISSING_DEPENDENCY` | error | Required technology not in registry (registry gap) |
| `INCOMPATIBLE_PAIR` | error | Two selected technologies conflict |
| `AUTO_DEPENDENCY` | info | Dependency auto-resolved and added |

---

## RulesEngine

```typescript
import { RulesEngine } from "@stackpilot/core";

const engine = new RulesEngine(technologies); // Technology[] from registry
```

### `validate(selected: StackTechnology[]): ValidationResult`

Validates a set of selected technologies. Performs:
1. Existence check for each technology ID
2. BFS dependency resolution (recursive)
3. Bidirectional incompatibility check
4. Deterministic port assignment (alphabetical order, no conflicts)

Returns a `ValidationResult`. Does NOT persist anything.

```typescript
const result = engine.validate([
  { technologyId: "nextjs", version: "15" },
  { technologyId: "postgresql", version: "17" },
]);

if (!result.valid) {
  for (const issue of result.issues.filter(i => i.severity === "error")) {
    console.error(issue.message);
  }
}

// Auto-resolved deps are in result.resolvedDependencies
// ["nodejs", "react"] — added because nextjs requires them
```

### `getTechnology(id: string): Technology | undefined`

Look up a single technology by ID.

```typescript
const tech = engine.getTechnology("nextjs");
// { id: "nextjs", name: "Next.js", category: "frontend", ... }
```

### `getAllTechnologies(): Technology[]`

Returns all 83 technologies.

### `getTechnologiesByCategory(category: TechnologyCategory): Technology[]`

Returns technologies filtered by category.

---

## StackEngine

```typescript
import { StackEngine } from "@stackpilot/core";

const engine = new StackEngine(rulesEngine);
```

### `create(opts): { stack: StackDefinition; validation: ValidationResult }`

Creates a new stack. Validates first, then persists to SQLite if validation passes.

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Unique name for this stack |
| `description` | string | no | Human-readable description |
| `profile` | StackProfile | no | Default: `"standard"` |
| `technologies` | StackTechnology[] | yes | Selected technologies |
| `tags` | string[] | no | Searchable tags |

**Returns:** `{ stack, validation }`. If `validation.valid` is false, the stack is NOT saved.

```typescript
const { stack, validation } = engine.create({
  name: "my-saas",
  technologies: [
    { technologyId: "nextjs", version: "15" },
    { technologyId: "fastapi", version: "0.115" },
    { technologyId: "postgresql", version: "17" },
  ],
  profile: "production",
});

if (validation.valid) {
  console.log(`Stack saved: ${stack.id}`);
  // stack.technologies includes auto-resolved deps (nodejs, react, python)
}
```

### `get(id: string): StackDefinition | null`

Retrieves a stack by UUID. Returns null if not found.

### `list(): StackDefinition[]`

Returns all stacks ordered by `updatedAt` descending.

### `update(id, changes): { stack, validation } | null`

Updates an existing stack. Auto-increments version and saves a version snapshot for rollback. Returns null if the stack ID does not exist.

**Updatable fields:** `name`, `description`, `profile`, `technologies`, `tags`

```typescript
const result = engine.update(stack.id, {
  technologies: [
    ...stack.technologies,
    { technologyId: "redis", version: "7" },
  ],
});
// result.stack.version === 2
```

### `delete(id: string): boolean`

Deletes a stack and all its technology rows and version snapshots. Returns true if a row was deleted.

### `getVersionHistory(stackId: string): StackVersion[]`

Returns all version snapshots for a stack, newest first.

```typescript
interface StackVersion {
  version: number;
  timestamp: string;       // ISO date of the save
  changelog: string;       // Auto-generated description ("Updated to v2")
  snapshot: StackDefinition; // Full state at that version
}
```

### `rollback(stackId, targetVersion): StackDefinition | null`

Restores a stack to a previous version. Creates a new version entry (does not mutate history). Returns the updated stack, or null if the target version does not exist.

```typescript
const restored = engine.rollback(stack.id, 1);
// restored.version === 3 (new version that matches the state of v1)
```

---

## RuntimeManager

```typescript
import { RuntimeManager } from "@stackpilot/core";

const manager = new RuntimeManager(technologies); // Technology[] for healthcheck metadata
```

All methods require `RuntimeOptions`:

```typescript
interface RuntimeOptions {
  composePath: string;  // Absolute path to docker-compose.yml
  projectDir: string;   // Project root directory
}
```

### `up(opts, detach?): { success: boolean; output: string }`

Runs `docker compose up`. `detach` defaults to `true`. Times out after 120 seconds.

### `down(opts, volumes?): { success: boolean; output: string }`

Runs `docker compose down`. Pass `volumes: true` to also delete volumes (destructive). Times out after 60 seconds.

### `status(opts): RuntimeState`

Runs `docker compose ps --format json` and parses the output.

```typescript
interface RuntimeState {
  running: boolean;
  services: ServiceStatus[];
}

interface ServiceStatus {
  name: string;
  status: string;       // e.g. "running", "exited", "not_started"
  ports: string[];      // e.g. ["5432/tcp -> 0.0.0.0:5432"]
}
```

### `logs(opts, service?, follow?): string | ChildProcess`

If `follow` is false (default), returns the log output as a string.
If `follow` is true, returns a `ChildProcess` that streams output — the caller is responsible for attaching to `stdout`/`stderr` and killing the process when done.

---

## Preferences

```typescript
import { PreferencesManager } from "@stackpilot/core";

const prefs = new PreferencesManager();
```

Preferences are stored in `~/.stackpilot/config.json`.

### `get(): UserPreferences`

Returns the current preferences object.

```typescript
interface UserPreferences {
  editor: "code" | "cursor" | "zed" | "nvim" | "webstorm";
  packageManager: "pnpm" | "npm" | "yarn" | "bun";
  shell: "bash" | "zsh" | "fish";
  dockerMode: "compose" | "devcontainer" | "none";
  defaultProfile: StackProfile;
  theme: "dark" | "light";
}
```

### `set(key, value): void`

Sets a single preference and persists to disk.

```typescript
prefs.set("packageManager", "bun");
```

---

## Error Handling

The core package does not throw custom error classes. All methods either:
- Return a result object with a `success` boolean (RuntimeManager)
- Return `null` for not-found cases (StackEngine.get, rollback)
- Return a `ValidationResult` with `valid: false` for invalid input (never throws on invalid tech selections)

Callers should check return values rather than catching exceptions. The only exceptions that can propagate are SQLite errors (disk full, corrupted database) and `execSync` errors from Docker operations — both are unrecoverable and should be treated as fatal.
