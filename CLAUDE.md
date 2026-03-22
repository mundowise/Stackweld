# StackPilot

**The operating system for your dev stacks.**
StackPilot is a local-first CLI tool that helps developers define, validate, scaffold, and manage full development stacks (framework + database + ORM + auth + devops) from a single source of truth.

## 4 Pillars

1. **Registry** — Curated catalog of 50+ deeply modeled technologies with versions, ports, env vars, health checks, compatibility rules, and `lastVerified` dates.
2. **Engine** — Rules engine that validates stacks (requires/incompatible/suggested), resolves conflicts, and enforces version compatibility.
3. **Scaffold** — Generates project files (docker-compose, .env, Makefile, CI workflow, devcontainer, scripts) without replacing official CLI tools (`create-next-app`, `cargo init`, etc.).
4. **Runtime** — Manages the running stack: start/stop services, check health, tail logs.

## Architecture (Monorepo)

```
packages/
  core/       — Types, engine, rules, scaffold orchestrator, runtime manager, SQLite DB
  cli/        — Commander-based CLI (stackpilot add, remove, scaffold, status, etc.)
  registry/   — Technology catalog (JSON files, one per tech)
  templates/  — Pre-built stack templates (e.g., nextjs-prisma-postgres)
  desktop/    — Reserved for future Tauri desktop app (NOT a web dashboard)
```

- **Build system**: Turborepo + pnpm workspaces
- **Node**: >=22.0.0
- **Package manager**: pnpm 10.x

## Rules

### Scaffold Rule
StackPilot NEVER replaces official tools. If a technology has `officialScaffold` (e.g., `npx create-next-app@latest`), StackPilot lists it as a command for the user to run. StackPilot only generates the glue files: docker-compose, .env, Makefile, CI, devcontainer, scripts.

### AI Rule
StackPilot does NOT use AI to generate application code or make compatibility decisions. All logic is deterministic. The catalog is human-curated and machine-verifiable. The `stackpilot ai` commands use the Anthropic API as a utility layer for suggestions and documentation, but the rules engine remains the source of truth.

### Catalog Rule
Every technology in `packages/registry/` must have:
- `lastVerified` date (ISO format, must be refreshed periodically)
- All fields from the `Technology` interface (id, name, category, versions, envVars, etc.)
- At least one version entry
- Accurate `requires`, `incompatibleWith`, and `suggestedWith` arrays
- Target: 50+ deeply modeled technologies minimum

## Code Conventions

- **TypeScript strict mode** — `strict: true` in all tsconfig.json
- **Formatter/Linter**: Biome 2.x (space indent, width 2, line width 100, recommended rules)
- **Tests**: Vitest — all engine logic must have tests
- **Imports**: Use `.js` extensions in imports (ESM)
- **No default exports** — use named exports everywhere
- **Type-only imports**: Use `import type { ... }` when importing only types

## What NOT To Do

- **No web dashboard** — StackPilot is CLI-first. The desktop package is for a future Tauri app, not a browser UI.
- **No marketplace** — Templates and technologies are local, version-controlled, and auditable.
- **No cloud sync** — Everything is local-first. Stacks are stored in a local SQLite database.
- **No telemetry** — Zero data collection.
- **No AI code generation** — StackPilot outputs deterministic, predictable files.

## Development Commands

```bash
pnpm install          # Install all dependencies
pnpm build            # Build all packages (turbo)
pnpm dev              # Dev mode (turbo, persistent)
pnpm test             # Run all tests (turbo, depends on build)
pnpm lint             # Lint all packages (biome)
pnpm typecheck        # TypeScript type checking
pnpm clean            # Clean all dist/ and node_modules
```

## Priority Order

**Functional > Tested > Documented > Beautiful**

1. Make it work correctly first.
2. Cover it with tests (Vitest).
3. Document the interface and behavior.
4. Then make it pretty.
