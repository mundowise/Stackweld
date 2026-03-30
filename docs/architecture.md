# Stackweld — Architecture Documentation

> Version: 0.2.0 | Last updated: 2026-03-30 | Covers: Core, Registry, Templates, CLI, Desktop

---

## System Overview

Stackweld is a local-first developer tool that generates complete, working project structures from a stack definition. It eliminates manual project setup by delegating to official scaffold tools (create-next-app, django-admin, etc.) and layering additional configuration on top.

**Core principle:** Stackweld never replaces official CLI tools — it orchestrates them.

---

## Architecture Diagram

View the live diagram: https://excalidraw.com/#json=BP8xETF3JbxkKp41nNR99,K8_-h6SHr3WGTB8mOZYi7A

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  User Layer                                                                  │
│  ┌───────────────────┐    ┌──────────────────────────────────────────────┐   │
│  │  CLI (38 commands)│    │  Desktop App (Tauri 2 + React 19 + Zustand) │   │
│  │  Commander+Inquirer│   │  Communicates via Tauri IPC                 │   │
│  └────────┬──────────┘    └──────────────────┬───────────────────────────┘   │
└───────────┼───────────────────────────────────┼──────────────────────────────┘
            │ imports                            │ Tauri IPC
            ▼                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  Core Package (@stackweld/core)                                             │
│  ┌────────────────┐  ┌───────────────┐  ┌─────────────────────────────────┐ │
│  │  Stack Engine  │  │ Rules Engine  │  │  Scaffold Orchestrator          │ │
│  │  CRUD+version  │  │ BFS validate  │  │  Docker Compose + CI + env      │ │
│  └────────────────┘  └───────────────┘  └─────────────────────────────────┘ │
│  ┌────────────────┐  ┌───────────────┐                                       │
│  │  Tech Installer│  │Runtime Manager│                                       │
│  │  ORM/auth/devop│  │Docker lifecycle│                                      │
│  └────────────────┘  └───────────────┘                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  New Engine Modules (v0.2.0)                                           │  │
│  │  compatibility · env-sync · detect · compose-preview · health          │  │
│  │  migration · diff · share · infra · lint · benchmark · cost            │  │
│  │  learn · plugin                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────┐                                                 │
│  │  SQLite (better-sqlite3)│  ~/.stackweld/stackweld.db                   │
│  └─────────────────────────┘                                                 │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │ imports
              ┌──────────────────┴──────────────────┐
              ▼                                      ▼
┌────────────────────────┐         ┌──────────────────────────────┐
│  Registry Package      │         │  Templates Package            │
│  83 YAML definitions   │         │  20 TypeScript templates      │
│  9 categories          │         │  + Custom template store      │
│  JSON Schema validated │         └──────────────────────────────┘
└────────────────────────┘
```

---

## Package Dependency Graph

```
cli ──────────────────► core
cli ──────────────────► registry
cli ──────────────────► templates
desktop ──────────────► core (via Tauri IPC)
registry ─────────────► core (types only)
templates ────────────► core (types only)
```

Build order enforced by Turborepo: `core` and `registry` build first, then `templates`, then `cli` and `desktop`.

---

## Core Package Internals

### Stack Engine (`engine/stack-engine.ts`)

Handles all CRUD operations for stack definitions. Responsibilities:

- Create a stack: validate technologies, auto-resolve dependencies, assign ports, persist to SQLite
- Update a stack: increment version, save a `StackVersion` snapshot for rollback
- List, get, delete stacks
- Clone: deep copy with a new UUID

**Key behavior:** The Stack Engine calls the Rules Engine before persisting. If validation fails, the stack definition is returned but NOT saved — the caller decides whether to proceed.

### Rules Engine (`engine/rules-engine.ts`)

The source of truth for technology compatibility. All validation flows through here.

**Algorithm:**
1. Check all selected technologies exist in the registry
2. BFS dependency resolution: for each technology, resolve its `requires` recursively until no new dependencies are added
3. Bidirectional incompatibility check: if A is incompatible with B, it fails whether B was added before or after A
4. Deterministic port assignment: iterate technologies in alphabetical order, assign `defaultPort`, increment on collision

**Output:** `ValidationResult` with:
- `valid: boolean`
- `issues: ValidationIssue[]` (severity: error | warning | info)
- `resolvedDependencies: string[]` (auto-added tech IDs)
- `portAssignments: Record<string, number>` (tech ID → port)

### Scaffold Orchestrator (`scaffold/`)

Runs scaffold phases sequentially after a stack is validated and saved:

1. **Topology detection** — Does the stack have both a frontend and a backend? Create `frontend/` and `backend/` subdirectories. Single-side stacks are created at root.
2. **Official scaffold CLI** — Run the technology's `officialScaffold` command (e.g., `npx create-next-app@latest`). Some technologies have no official CLI and are handled in-place.
3. **Tech Installer** — Layer additional configuration: Prisma schema init, NextAuth route files, Vitest config, Biome config, etc.
4. **Docker Compose generation** — Only databases and services get containers. Runtimes (Node.js, Python, Go) run natively.
5. **Config file generation** — Makefile, `scripts/dev.sh`, `scripts/setup.sh`, `.devcontainer/`, `.vscode/settings.json`, `.github/workflows/ci.yml`, combined `.gitignore`

### Runtime Manager (`engine/runtime-manager.ts`)

Thin wrapper around `docker compose` for a project's `docker-compose.yml`. Operations:

- `up(opts, detach)` — `docker compose -f <path> up [-d]`, timeout 120s
- `down(opts, volumes)` — `docker compose -f <path> down [--volumes]`, timeout 60s
- `status(opts)` — `docker compose -f <path> ps --format json`
- `logs(opts, service, follow)` — `docker compose -f <path> logs [service] [-f]`

### New Engine Modules (v0.2.0)

14 new modules were added to the core package in v0.2.0:

| Module | File | Public API | Purpose |
|--------|------|-----------|---------|
| Compatibility | `engine/compatibility.ts` | `scoreCompatibility()`, `scoreStack()` | Score technology pairs (0-100) and aggregate stack scores |
| Env Sync | `engine/env-sync.ts` | `syncEnv()`, `checkDangerous()` | Sync .env.example with .env, detect hardcoded secrets |
| Stack Detection | `engine/detect.ts` | `detectStack()` | Detect technologies from project files (package.json, Cargo.toml, etc.) |
| Compose Preview | `engine/compose-preview.ts` | `generateComposePreview()` | Render docker-compose.yml to string without disk writes |
| Health Check | `engine/health.ts` | `checkProjectHealth()` | Audit project for secrets, .gitignore gaps, strict mode, vulnerabilities |
| Migration | `engine/migration.ts` | `planMigration()` | Generate step-by-step migration plans between technologies |
| Stack Diff | `engine/diff.ts` | `diffStacks()` | Compare two stack definitions (added, removed, changed, unchanged) |
| Sharing | `engine/share.ts` | `serializeStack()`, `deserializeStack()` | Encode/decode stacks as base64 URLs for cloudless sharing |
| Infrastructure | `engine/infra.ts` | `generateInfra()` | Generate IaC files for VPS, AWS, and GCP deployment |
| Lint | `engine/lint.ts` | `lintStack()` | Validate stacks against team standards (.stackweldrc) |
| Benchmark | `engine/benchmark.ts` | `profilePerformance()` | Heuristic performance estimates (cold start, build time, memory) |
| Cost | `engine/cost.ts` | `estimateCost()` | Monthly hosting cost estimates across providers |
| Learn | `engine/learn.ts` | `getResources()` | Curated learning resources per technology |
| Plugin | `engine/plugin.ts` | `listPlugins()`, `installPlugin()`, `removePlugin()` | Plugin lifecycle management (npm-based) |

All new modules follow the same pattern: pure functions that receive a `StackDefinition` and/or `Technology[]` and return a typed result. No side effects except `syncEnv()` (writes to .env), `installPlugin()` (npm install), and `removePlugin()` (npm uninstall).

### SQLite Database (`db/database.ts`)

Schema (5 tables):

| Table | Purpose |
|-------|---------|
| `stacks` | Stack definitions (id, name, description, profile, version, tags) |
| `stack_technologies` | Technologies per stack (technology_id, version, port, config) |
| `stack_versions` | Version snapshots for rollback (snapshot stored as JSON) |
| `project_instances` | Scaffolded projects on disk (path, template_id, last_opened) |
| `project_services` | Runtime service state per project (container_id, status, port) |

Database location: `~/.stackweld/stackweld.db`

---

## Registry Package Internals

Each of the 83 technologies is a single YAML file in `src/technologies/<category>/`. The `Registry Loader` reads all files at startup, validates against a JSON Schema (`schema.ts`), and returns a `Technology[]` array.

**Technology YAML fields:**

| Field | Type | Purpose |
|-------|------|---------|
| `id` | string | Unique key (kebab-case) |
| `name` | string | Display name |
| `category` | enum | One of 9 categories |
| `requires` | string[] | Direct dependency IDs |
| `incompatibleWith` | string[] | IDs that conflict |
| `suggestedWith` | string[] | Companion suggestions |
| `officialScaffold` | string? | CLI command to invoke |
| `dockerImage` | string? | Docker Hub image |
| `envVars` | Record | Default env variable values |
| `lastVerified` | ISO date | When definition was last checked |

---

## Templates Package Internals

Templates are TypeScript modules that define a `Template` object. Each template specifies:
- `technologyIds[]` — exact IDs from the registry
- `scaffoldSteps[]` — ordered commands with optional `workingDir`
- `overrides[]` — file content overrides (e.g., custom `.env.example`)
- `hooks[]` — pre/post scaffold actions with optional user confirmation
- `variables` — template substitution values (`{{projectName}}`)

Custom templates follow the same `Template` interface and are stored locally in `~/.stackweld/templates/`.

---

## Desktop App Internals

Built with Tauri 2 (Rust backend + WebView frontend). The React frontend communicates with the `core` package via Tauri's IPC bridge — the Rust backend invokes the same TypeScript functions that the CLI uses.

**Pages:**

| Page | Purpose |
|------|---------|
| `DashboardPage` | Overview: counts for technologies, stacks, templates, categories |
| `BuilderPage` | Visual stack builder with real-time validation |
| `CatalogPage` | Browse and search 83 technologies |
| `StackDetailPage` | View and manage a saved stack |
| `RuntimePage` | Docker service status and controls |
| `AiPage` | Natural language stack suggestion and README generation |
| `SettingsPage` | System info and user preferences |

**State management:** Zustand store in `src/stores/app-store.ts`.

---

## Architecture Decision Records

### ADR-001: Monorepo with Turborepo + pnpm

**Status:** Accepted — 2026-03-28

**Context:** Stackweld has five distinct packages with a clear dependency graph. A monorepo avoids duplication of types and utilities across packages. The toolchain choice affects developer experience significantly.

**Decision:** Use Turborepo for build orchestration and pnpm workspaces for package management.

**Alternatives considered:**
1. Single package (flat structure) — rejected because the desktop and CLI have incompatible dependency sets (Tauri build toolchain vs Node.js CLI toolchain)
2. nx — rejected because Turborepo is simpler to configure for TypeScript-only monorepos and requires no code generation

**Consequences:**
- Positive: Incremental builds cache unchanged packages. Parallel builds reduce CI time.
- Positive: Clean import boundaries enforce the dependency graph.
- Negative: pnpm 10+ required. Contributors on older pnpm versions need to upgrade.

---

### ADR-002: SQLite via better-sqlite3 (synchronous API)

**Status:** Accepted — 2026-03-28

**Context:** Stackweld is a local-first tool. Stack data lives on the developer's machine. The data model is simple (five tables, no complex queries). Writes happen during scaffold (infrequent). Reads happen during validation and list commands (frequent, small datasets).

**Decision:** Use `better-sqlite3` with its synchronous API. No async/await for database operations.

**Alternatives considered:**
1. Prisma — rejected because Prisma's query engine binary adds ~20MB to the installation and the ORM abstraction is unnecessary for five simple tables
2. async sqlite3 — rejected because the sync API is simpler and thread-safety is not a concern for a single-user CLI tool

**Consequences:**
- Positive: Zero async ceremony. Code reads like plain logic.
- Positive: No separate database process.
- Negative: Synchronous I/O would block an event loop — acceptable because the CLI does not run an event loop; the desktop app uses Tauri IPC which runs database access off the main thread.

---

### ADR-003: Technology definitions as YAML, not TypeScript

**Status:** Accepted — 2026-03-28

**Context:** The registry contains 83 technologies that contributors will add over time. The definition format needs to be approachable for contributors who are not TypeScript experts and must be validated at build time.

**Decision:** YAML files with JSON Schema validation at build time.

**Alternatives considered:**
1. TypeScript objects — rejected because TypeScript syntax errors and type mismatches surface only at compile time and are harder to write for non-TypeScript contributors
2. JSON — rejected because YAML supports inline comments (useful for `lastVerified` and `incompatibleWith` rationale) and is more readable for multi-field objects

**Consequences:**
- Positive: Contributors can add a technology by copying one YAML file and editing values.
- Positive: JSON Schema validator catches missing fields before the code ever runs.
- Negative: YAML indentation errors are a common source of confusion.

---

### ADR-004: Scaffold delegates to official CLI tools

**Status:** Accepted — 2026-03-28

**Context:** Stackweld could generate all project files from templates. This would give full control but requires maintaining templates that track every framework's evolving conventions.

**Decision:** For technologies with an `officialScaffold` command, Stackweld runs that command and layers configuration on top. Stackweld never replaces the official generator.

**Alternatives considered:**
1. Full template generation — rejected because maintaining accurate templates for 83 technologies is unsustainable. Official CLIs produce the correct, current structure for their framework.
2. Hybrid (templates for some, official for others) — partially adopted: technologies without an official scaffold CLI (e.g., plain Express) use in-place file generation.

**Consequences:**
- Positive: Generated projects use the official structure that framework users expect.
- Positive: Framework updates are absorbed automatically — Stackweld does not need to be updated when Next.js changes its default structure.
- Negative: Scaffold requires network access (npx downloads packages) and takes longer than pure template generation.

---

### ADR-005: Desktop app uses Tauri 2, not Electron

**Status:** Accepted — 2026-03-28

**Context:** A visual interface for Stackweld requires a cross-platform desktop framework. The main candidates are Electron and Tauri.

**Decision:** Tauri 2 with React 19 frontend.

**Alternatives considered:**
1. Electron — rejected because Electron bundles Chromium (~150MB) and a Node.js runtime. A Stackweld desktop binary would be 200MB+. Tauri uses the system WebView and a Rust backend, producing binaries under 10MB.
2. Native (Swift/Kotlin/Win32) — rejected because a React frontend can be shared with the CLI's web-based output formats and reduces maintenance to one codebase.

**Consequences:**
- Positive: Binary size under 10MB on all platforms.
- Positive: Rust backend has access to the same Node.js core package via Tauri's `sidecar` feature.
- Negative: Rust toolchain required to build the desktop app from source — adds a heavy build dependency for contributors who only need the CLI.
- Negative: Linux requires `libwebkit2gtk-4.1-dev` and related system libraries.

---

## Data Flow: `stackweld generate`

```
User input (CLI flags or wizard)
    │
    ▼
Rules Engine.validate(selectedTechnologies)
    │
    ├─ errors? → print validation issues → exit 1
    │
    ▼ (valid)
Stack Engine.create(opts)
    │ → save StackDefinition + StackTechnologies to SQLite
    │
    ▼
Scaffold Orchestrator.run(stack, outputPath)
    │
    ├─ 1. Create project directories (frontend/, backend/, or root)
    ├─ 2. Run officialScaffold commands (create-next-app, django-admin...)
    ├─ 3. Tech Installer: Prisma init, NextAuth, Vitest, Biome, etc.
    ├─ 4. Docker Compose generation (databases + services only)
    └─ 5. Config file generation (Makefile, CI, devcontainer, .gitignore)
    │
    ▼
Project on disk — ready to code
```

---

## Configuration

User preferences are stored in `~/.stackweld/config.json`. Database is at `~/.stackweld/stackweld.db`. Custom templates are stored in `~/.stackweld/templates/`.

| Preference key | Default | Options |
|---------------|---------|---------|
| `editor` | `code` | code, cursor, zed, nvim, webstorm |
| `packageManager` | `pnpm` | pnpm, npm, yarn, bun |
| `shell` | `zsh` | bash, zsh, fish |
| `dockerMode` | `compose` | compose, devcontainer, none |
| `defaultProfile` | `standard` | rapid, standard, production, enterprise, lightweight |
| `theme` | `dark` | dark, light |

---

## Build System

Turborepo task graph:

```
test ──depends──► build
build ──depends──► ^build  (build dependencies first)
dev ──no cache──► parallel
lint ──parallel (no deps)
typecheck ──parallel (no deps)
```

All packages output built artifacts to `dist/`. TypeScript strict mode is enabled globally via the root `tsconfig.json`. Biome handles linting and formatting — no separate ESLint/Prettier config.
