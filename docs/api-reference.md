# StackPilot — Core API Reference

> Package: `@stackpilot/core` | Version: 0.2.0 | Last updated: 2026-03-30

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

---

## Compatibility Engine (`engine/compatibility.ts`)

```typescript
import { scoreCompatibility, scoreStack } from "@stackpilot/core";
```

### `CompatibilityResult`

```typescript
interface CompatibilityResult {
  techA: string;                    // Technology ID
  techB: string;                    // Technology ID
  score: number;                    // 0-100
  verdict: "excellent" | "good" | "fair" | "poor" | "incompatible";
  notes: string[];                  // Positive and negative observations
}
```

### `scoreCompatibility(techA: string, techB: string, technologies: Technology[]): CompatibilityResult`

Returns a compatibility score between two technologies. The score considers: direct incompatibilities (score 0), shared dependencies, ecosystem overlap, common usage patterns, and community adoption.

```typescript
const result = scoreCompatibility("nextjs", "postgresql", technologies);
// { techA: "nextjs", techB: "postgresql", score: 92, verdict: "excellent", notes: [...] }
```

### `scoreStack(stack: StackDefinition, technologies: Technology[]): { overall: number; pairs: CompatibilityResult[] }`

Scores all technology pairs within a stack and returns an aggregate score.

```typescript
const report = scoreStack(myStack, technologies);
// { overall: 87, pairs: [{ techA: "nextjs", techB: "postgresql", score: 92, ... }, ...] }
```

---

## Environment Sync (`engine/env-sync.ts`)

```typescript
import { syncEnv, checkDangerous } from "@stackpilot/core";
```

### `EnvSyncResult`

```typescript
interface EnvSyncResult {
  added: string[];                  // Keys added to .env from .env.example
  existing: string[];               // Keys already present in .env
  warnings: EnvWarning[];           // Dangerous values detected
}

interface EnvWarning {
  file: string;                     // File path
  line: number;                     // Line number
  key: string;                      // Variable name
  reason: string;                   // Why it was flagged
}
```

### `syncEnv(projectDir: string): EnvSyncResult`

Reads `.env.example`, compares with `.env`, and adds missing keys with default values. Existing values in `.env` are preserved.

```typescript
const result = syncEnv("/home/user/projects/my-app");
// { added: ["REDIS_URL"], existing: ["DATABASE_URL"], warnings: [] }
```

### `checkDangerous(projectDir: string): EnvWarning[]`

Scans `.env` files for hardcoded secrets, default passwords, and placeholder values.

```typescript
const warnings = checkDangerous("/home/user/projects/my-app");
// [{ file: ".env", line: 3, key: "SECRET_KEY", reason: "default/placeholder value" }]
```

---

## Stack Detection (`engine/detect.ts`)

```typescript
import { detectStack } from "@stackpilot/core";
```

### `DetectedStack`

```typescript
interface DetectedStack {
  technologies: DetectedTechnology[];
  confidence: number;                // 0-100 overall confidence
}

interface DetectedTechnology {
  technologyId: string;              // Matched technology ID from registry
  version?: string;                  // Detected version if available
  source: string;                    // Where it was detected (e.g. "package.json", "docker-compose.yml")
  confidence: number;                // 0-100 confidence for this detection
}
```

### `detectStack(projectDir: string, technologies: Technology[]): DetectedStack`

Inspects files in `projectDir` to determine the technology stack. Checks: `package.json`, `requirements.txt`, `go.mod`, `Cargo.toml`, `docker-compose.yml`, config files, and directory structure.

```typescript
const detected = detectStack("/home/user/projects/my-app", technologies);
// { technologies: [{ technologyId: "nextjs", version: "15", source: "package.json", confidence: 98 }], confidence: 94 }
```

---

## Compose Preview (`engine/compose-preview.ts`)

```typescript
import { generateComposePreview } from "@stackpilot/core";
```

### `ComposePreviewResult`

```typescript
interface ComposePreviewResult {
  yaml: string;                     // Rendered docker-compose.yml content
  services: string[];               // List of service names
}
```

### `generateComposePreview(stack: StackDefinition, technologies: Technology[]): ComposePreviewResult`

Generates docker-compose.yml content from a stack definition without writing to disk.

```typescript
const preview = generateComposePreview(myStack, technologies);
console.log(preview.yaml);  // YAML string
// preview.services: ["postgresql", "redis"]
```

---

## Health Check (`engine/health.ts`)

```typescript
import { checkProjectHealth } from "@stackpilot/core";
```

### `HealthReport`

```typescript
interface HealthReport {
  score: number;                    // 0-100
  checks: HealthCheck[];
}

interface HealthCheck {
  name: string;                     // e.g. "gitignore-coverage", "no-secrets-tracked"
  status: "pass" | "warn" | "fail";
  message: string;                  // Human-readable description
  autoFixable: boolean;             // Whether --fix can resolve this
}
```

### `checkProjectHealth(projectDir: string): HealthReport`

Runs a suite of health checks on a project directory. Checks include: .gitignore coverage, exposed secrets in tracked files, TypeScript strict mode, Docker health checks, dependency vulnerabilities, and CI configuration.

```typescript
const report = checkProjectHealth("/home/user/projects/my-app");
// { score: 71, checks: [{ name: "gitignore-coverage", status: "pass", message: "...", autoFixable: false }, ...] }
```

---

## Migration Planner (`engine/migration.ts`)

```typescript
import { planMigration } from "@stackpilot/core";
```

### `MigrationPlan`

```typescript
interface MigrationPlan {
  from: string;                     // Source technology ID
  to: string;                       // Target technology ID
  steps: MigrationStep[];
  estimatedEffort: string;          // e.g. "2-4 hours"
  risk: "low" | "medium" | "high";
}

interface MigrationStep {
  order: number;
  title: string;                    // e.g. "Install Fastify"
  description: string;              // Detailed instructions
  codeExamples?: { before: string; after: string }[];
}
```

### `planMigration(from: string, to: string, technologies: Technology[]): MigrationPlan`

Generates a step-by-step migration plan between two technologies in the same category.

```typescript
const plan = planMigration("express", "fastify", technologies);
// { from: "express", to: "fastify", steps: [...], estimatedEffort: "2-4 hours", risk: "low" }
```

---

## Stack Diff (`engine/diff.ts`)

```typescript
import { diffStacks } from "@stackpilot/core";
```

### `StackDiff`

```typescript
interface StackDiff {
  added: string[];                  // Tech IDs in B but not in A
  removed: string[];                // Tech IDs in A but not in B
  changed: VersionChange[];         // Same tech, different version
  unchanged: string[];              // Same tech and version in both
}

interface VersionChange {
  technologyId: string;
  versionA: string;
  versionB: string;
}
```

### `diffStacks(a: StackDefinition, b: StackDefinition): StackDiff`

Compares two stack definitions and returns the difference.

```typescript
const diff = diffStacks(stackA, stackB);
// { added: ["redis"], removed: ["mongodb"], changed: [{ technologyId: "nodejs", versionA: "20", versionB: "22" }], unchanged: ["nextjs", "postgresql"] }
```

---

## Stack Sharing (`engine/share.ts`)

```typescript
import { serializeStack, deserializeStack } from "@stackpilot/core";
```

### `ShareableStack`

```typescript
interface ShareableStack {
  url: string;                      // Full stackpilot:// URL
  encoded: string;                  // Base64-encoded payload
}
```

### `serializeStack(stack: StackDefinition): ShareableStack`

Serializes a stack definition into a compact, URL-safe format.

```typescript
const shareable = serializeStack(myStack);
// { url: "stackpilot://import/eyJuYW1l...", encoded: "eyJuYW1l..." }
```

### `deserializeStack(urlOrEncoded: string): StackDefinition`

Reconstructs a stack definition from a serialized URL or base64 payload.

```typescript
const stack = deserializeStack("stackpilot://import/eyJuYW1l...");
// Returns a full StackDefinition ready to save
```

---

## Infrastructure Generation (`engine/infra.ts`)

```typescript
import { generateInfra } from "@stackpilot/core";
```

### `InfraOutput`

```typescript
interface InfraOutput {
  target: "vps" | "aws" | "gcp";
  files: InfraFile[];               // Generated file contents
  deployCommand: string;            // Suggested deploy command
}

interface InfraFile {
  path: string;                     // Relative path (e.g. "infra/cloudformation.yml")
  content: string;                  // File contents
}
```

### `generateInfra(stack: StackDefinition, target: "vps" | "aws" | "gcp", technologies: Technology[]): InfraOutput`

Generates Infrastructure as Code files for the specified target platform.

- **vps**: Dockerfile, nginx.conf, systemd service unit
- **aws**: CloudFormation template (ECS + RDS + ElastiCache), buildspec.yml, task definition
- **gcp**: Terraform files (Cloud Run + Cloud SQL + Memorystore)

```typescript
const infra = generateInfra(myStack, "aws", technologies);
// { target: "aws", files: [{ path: "infra/cloudformation.yml", content: "..." }], deployCommand: "aws cloudformation deploy ..." }
```

---

## Stack Linting (`engine/lint.ts`)

```typescript
import { lintStack } from "@stackpilot/core";
```

### `StackStandards`

```typescript
interface StackStandards {
  required: string[];               // Tech IDs that must be present
  banned: string[];                 // Tech IDs that must NOT be present
  versions: Record<string, string>; // Version constraints (semver ranges)
}
```

### `LintResult`

```typescript
interface LintResult {
  passed: boolean;
  checks: LintCheck[];
}

interface LintCheck {
  rule: string;                     // e.g. "required", "banned", "version"
  status: "pass" | "warn" | "fail";
  message: string;
}
```

### `lintStack(stack: StackDefinition, standards: StackStandards): LintResult`

Validates a stack against team-defined standards.

```typescript
const standards: StackStandards = {
  required: ["typescript", "docker", "biome"],
  banned: ["webpack"],
  versions: { nodejs: ">=22" },
};
const result = lintStack(myStack, standards);
// { passed: false, checks: [{ rule: "required", status: "fail", message: "biome is missing" }, ...] }
```

---

## Performance Profiling (`engine/benchmark.ts`)

```typescript
import { profilePerformance } from "@stackpilot/core";
```

### `PerformanceProfile`

```typescript
interface PerformanceProfile {
  coldStart: string;                // e.g. "~2.1s"
  hotReload: string;                // e.g. "~180ms"
  buildTime: string;                // e.g. "~45s"
  memoryIdle: string;               // e.g. "~320MB"
  memoryPeak: string;               // e.g. "~1.2GB"
  dockerImageSize: string;          // e.g. "~890MB"
  installTime: string;              // e.g. "~38s"
}
```

### `profilePerformance(stack: StackDefinition, technologies: Technology[]): PerformanceProfile`

Generates performance estimates based on the technologies in the stack. Values are heuristic-based, not from live benchmarks.

```typescript
const profile = profilePerformance(myStack, technologies);
// { coldStart: "~2.1s", hotReload: "~180ms", buildTime: "~45s", ... }
```

---

## Cost Estimation (`engine/cost.ts`)

```typescript
import { estimateCost } from "@stackpilot/core";
```

### `CostEstimate`

```typescript
interface CostEstimate {
  providers: ProviderCost[];
  assumptions: Record<string, string>;
}

interface ProviderCost {
  provider: "vps" | "aws" | "gcp";
  min: number;                      // USD per month
  typical: number;                  // USD per month
  max: number;                      // USD per month
  breakdown: Record<string, number>; // Per-service cost (e.g. { compute: 15, database: 10 })
}
```

### `estimateCost(stack: StackDefinition, technologies: Technology[], options?: { users?: number; storageGb?: number }): CostEstimate`

Estimates monthly hosting costs for a stack across providers.

```typescript
const estimate = estimateCost(myStack, technologies, { users: 10000, storageGb: 50 });
// { providers: [{ provider: "vps", min: 12, typical: 24, max: 48, breakdown: {...} }, ...], assumptions: { users: "10000", storage: "50GB" } }
```

---

## Plugin System (`engine/plugin.ts`)

```typescript
import { listPlugins, installPlugin, removePlugin } from "@stackpilot/core";
```

### `StackPilotPlugin`

```typescript
interface StackPilotPlugin {
  name: string;                     // Package name (e.g. "@stackpilot/plugin-aws")
  version: string;
  description: string;
  provides: {
    commands: string[];             // CLI commands added
    templates: string[];            // Template IDs added
    technologies: string[];         // Technology IDs added
  };
  installed: boolean;
}
```

### `listPlugins(): StackPilotPlugin[]`

Returns all installed plugins with their metadata.

```typescript
const plugins = listPlugins();
// [{ name: "@stackpilot/plugin-aws", version: "1.0.0", provides: { commands: ["deploy-aws"], ... }, installed: true }]
```

### `installPlugin(name: string): StackPilotPlugin`

Installs a plugin by name from the npm registry and registers its commands, templates, and technologies.

```typescript
const plugin = installPlugin("@stackpilot/plugin-aws");
```

### `removePlugin(name: string): boolean`

Removes an installed plugin and unregisters its contributions. Returns true if the plugin was found and removed.

```typescript
const removed = removePlugin("@stackpilot/plugin-aws");
// true
```
