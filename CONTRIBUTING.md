# Contributing to StackPilot

Thank you for considering a contribution to StackPilot. This document explains how to set up the project, understand the codebase, and submit changes.

---

## Prerequisites

- **Node.js** 22.0.0 or later
- **pnpm** 10 or later
- **Rust** (only required if working on the desktop app -- Tauri 2 needs a Rust toolchain)
- **Docker** (required for testing runtime orchestration features)

---

## Setup

```bash
# Clone the repository
git clone https://github.com/Xplus-technologies-open-in-process/StackPilot.git
cd stackpilot

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run the test suite
pnpm test
```

To work on a specific package in watch mode:

```bash
cd packages/cli
pnpm dev
```

---

## Project Structure

```
stackpilot/
  packages/
    core/          -- Stack engine, SQLite database, Docker integration, types
    registry/      -- Technology definitions (YAML files), JSON Schema validation
    templates/     -- Template definitions (TypeScript modules)
    cli/           -- CLI application (Commander + Inquirer + Chalk)
    desktop/       -- Desktop application (Tauri 2 + React 19)
  docs/            -- Documentation
  biome.json       -- Biome linter/formatter configuration
  turbo.json       -- Turborepo pipeline configuration
  pnpm-workspace.yaml
  tsconfig.json    -- Root TypeScript configuration
```

Package dependency graph:

```
cli --> core, registry, templates
desktop --> core (via Tauri IPC)
registry --> core
templates --> core
```

---

## Adding a Technology

Technologies live in `packages/registry/src/technologies/` organized by category. Each technology is a single YAML file.

### YAML Format

Create a new file at `packages/registry/src/technologies/<category>/<id>.yaml`:

```yaml
id: my-tech
name: My Technology
category: backend           # One of: runtime, frontend, backend, database, orm, auth, styling, service, devops
description: Short description of the technology
website: https://my-tech.dev
versions: [{version: "2"}, {version: "1"}]
defaultVersion: "2"
defaultPort: 4000           # Default exposed port, or null
requires: [nodejs]           # Technology IDs this depends on
incompatibleWith: []         # Technology IDs that conflict
suggestedWith: [typescript, postgresql]  # Companion technologies
officialScaffold: null       # Official CLI scaffold command, or null
dockerImage: null            # Docker Hub image name, or null
envVars: {PORT: "4000"}     # Default environment variables
configFiles: []              # Config files this technology creates
lastVerified: "2026-03-22"  # Date the definition was last verified
tags: [my-tech, api]        # Searchable tags
```

### Validation

Technology files are validated against a JSON Schema at build time. Run the validator:

```bash
cd packages/registry
pnpm test
```

### Guidelines for Technology Definitions

- Use the official project name for the `name` field.
- The `id` must be lowercase, kebab-case, and unique across all categories.
- `requires` should list only direct dependencies (e.g., Express requires Node.js, not TypeScript).
- `incompatibleWith` should only list genuine conflicts, not preference-based exclusions.
- `suggestedWith` should list technologies that are commonly used together.
- Set `lastVerified` to the date you confirmed the versions and URLs are current.

---

## Adding a Template

Templates live in `packages/templates/src/templates/` as TypeScript modules.

### Template Format

Create a new file at `packages/templates/src/templates/<id>.ts`:

```typescript
import type { Template } from "@stackpilot/core";

export const myTemplate: Template = {
  id: "my-template",
  name: "My Template",
  description: "Short description of what this template sets up",
  technologyIds: ["nodejs", "express", "typescript", "postgresql", "prisma"],
  profile: "standard",
  scaffoldSteps: [
    {
      name: "Initialize project",
      command: "npm init -y",
    },
    {
      name: "Install dependencies",
      command: "npm install express prisma @prisma/client",
      workingDir: "{{projectName}}",
    },
  ],
  overrides: [
    {
      path: ".env.example",
      content: "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/{{projectName}}",
    },
  ],
  hooks: [
    {
      timing: "post-scaffold",
      name: "Install dependencies",
      command: "cd {{projectName}} && npm install",
      description: "Install all npm dependencies",
      requiresConfirmation: false,
    },
  ],
  variables: {
    projectName: "my-project",
  },
};
```

Then register the template in `packages/templates/src/index.ts`.

### Template Guidelines

- Use `{{projectName}}` as the placeholder for the user-provided project name.
- Scaffold steps should use official CLI tools whenever possible (create-next-app, django-admin, etc.).
- Include a `docker-compose.yml` override if the template uses databases or services.
- Include an `.env.example` override with sensible defaults.
- Keep the `technologyIds` list accurate -- it must reference valid IDs from the registry.

---

## Running Tests

```bash
# Run all tests across all packages
pnpm test

# Run tests for a specific package
cd packages/core
pnpm test

# Run tests in watch mode
cd packages/core
npx vitest
```

Tests use Vitest. Place test files in `__tests__/` directories within each package's `src/` folder.

---

## Code Style

StackPilot uses **Biome** for linting and formatting. The configuration is in `biome.json` at the repository root.

```bash
# Check for lint and format issues
pnpm lint

# Type checking
pnpm typecheck
```

Key rules:

- TypeScript strict mode is enabled.
- All source files use ESM (`"type": "module"` in every package).
- Prefer `const` over `let`. Do not use `var`.
- Use explicit return types on exported functions.
- No unused imports or variables.

---

## PR Guidelines

1. **Branch from main.** Create a feature branch with a descriptive name (e.g., `add-tech-supabase`, `fix-scaffold-docker`).
2. **One concern per PR.** Keep changes focused. A PR that adds a technology should not also refactor the CLI.
3. **Include tests.** If you add a technology or template, include at least a validation test. If you change core logic, add or update unit tests.
4. **Run the full suite before pushing.** `pnpm build && pnpm test && pnpm typecheck` should all pass.
5. **Write a clear description.** Explain what the PR does and why. Link to any relevant issues.
6. **Keep commits atomic.** Each commit should represent a logical unit of work and have a descriptive message.
