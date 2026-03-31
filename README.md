# Stackweld

[![CI](https://github.com/mundowise/Stackweld/actions/workflows/ci.yml/badge.svg)](https://github.com/mundowise/Stackweld/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](https://github.com/mundowise/Stackweld/releases)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-orange.svg)](https://tauri.app/)

The operating system for your dev stacks. Define, validate, scaffold, launch, version, and reproduce full development environments from CLI or desktop.

## What it does

Stackweld eliminates the hours spent setting up new projects. Select your technologies, and it generates a complete, working project with proper directory structure, Docker services, environment files, CI pipeline, scripts, and all dependencies installed -- ready to code.

## Key Features

- **83 technologies** across 9 categories: runtime, frontend, backend, database, ORM, auth, styling, service, devops
- **Smart scaffolding** using official CLI tools (create-next-app, django-admin, etc.) -- never replaces them
- **Full-stack detection**: frontend/ + backend/ with separate configs when both are selected
- **Per-technology installation**: ORMs initialized with schema, auth configured with routes, styling installed, devops tools with config files
- **20 built-in templates** + save your own custom templates
- **Docker Compose** generation with only databases and services (not runtimes)
- **Version control**: save, diff, rollback stack versions
- **Desktop app**: Tauri 2 native application with visual stack builder
- **38 CLI commands** for every workflow
- **Compatibility scoring** between technologies (0-100)
- **Project health monitoring** (secrets, .gitignore, TypeScript strict, etc.)
- **Migration planning** with step-by-step guides between technologies
- **Cost estimation** for monthly hosting across providers
- **Performance profiling** for stack benchmarks
- **Stack sharing** via encoded URLs (no cloud needed)
- **Infrastructure as Code** generation for VPS, AWS, and GCP
- **Learning paths** with curated resources per technology
- **Team standards** enforcement via `.stackweldrc` linting
- **Plugin system** for community extensions

## Quick Start

### Option 1: Install via npm

```bash
npm install -g @stackweld/cli
```

### Option 2: Clone and run locally

```bash
git clone https://github.com/mundowise/Stackweld.git
cd Stackweld
pnpm install
pnpm build

# Run CLI directly
node packages/cli/dist/index.js --help

# Or link globally
cd packages/cli && pnpm link --global
stackweld --help
```

After installing, just run:

```bash
stackweld
```

This launches an interactive menu where you can:
- Create new projects step by step
- Browse 83 technologies
- Check system requirements
- Score compatibility between technologies
- And much more -- all guided, no commands to memorize

For power users, all commands also work directly:

```bash
stackweld doctor          # Check system requirements
stackweld score nextjs prisma  # Compatibility score
stackweld generate --name my-app --techs nextjs,prisma,postgresql --profile standard --path .
```

## Compatibility

| Platform | CLI | Desktop App |
|----------|-----|-------------|
| Linux (x64) | Yes | Yes (.deb, .rpm, .AppImage) |
| macOS (Intel/ARM) | Yes | Yes (.dmg) -- requires building from source |
| Windows (x64) | Yes | Yes (.msi, .exe) -- requires building from source |

**Requirements:**
- Node.js >= 22.0.0
- pnpm >= 10.0.0
- Docker + Docker Compose (for runtime commands)
- Rust toolchain (only for building the desktop app)

## Installation

### CLI (recommended)

```bash
# Clone the repository
git clone https://github.com/mundowise/Stackweld.git
cd Stackweld

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Use the CLI directly
node packages/cli/dist/index.js --help

# Or link globally
cd packages/cli && pnpm link --global
stackweld --help
```

### Desktop App

```bash
# Prerequisites: Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Linux: install system dependencies
sudo apt install -y libwebkit2gtk-4.1-dev librsvg2-dev patchelf libssl-dev libayatana-appindicator3-dev

# Build the desktop app
cd packages/desktop
pnpm tauri:build

# Run it
./src-tauri/target/release/stackweld-desktop
```

## CLI Usage

### Creating a project (most common workflow)

```bash
# Interactive mode -- wizard guides you through everything
stackweld init

# One-shot generation -- specify everything at once
stackweld generate \
  --name "my-saas" \
  --path "/home/user/projects" \
  --techs "nextjs,fastapi,postgresql,redis,prisma,tailwindcss,nextauth,vitest,docker" \
  --profile production \
  --git

# From a built-in template
stackweld create t3-stack --path /home/user/projects
```

### What gets generated (example: Next.js + FastAPI full-stack)

```
my-saas/
  frontend/                  # Next.js app (created by create-next-app)
    src/app/                 # App Router pages
    src/auth.ts              # NextAuth configured
    prisma/schema.prisma     # Prisma with User model + PostgreSQL
    vitest.config.ts         # Testing configured
    .env.example             # Frontend-specific variables
    package.json             # All deps installed

  backend/                   # FastAPI app (real Python project)
    main.py                  # Server with CORS, health endpoint
    requirements.txt         # All Python deps
    .venv/                   # Virtual environment ready
    .env.example             # Backend-specific variables

  docker-compose.yml         # PostgreSQL + Redis (databases only, no runtimes)
  Makefile                   # make dev, make up, make down, make test, make clean
  scripts/dev.sh             # Start everything in one command
  scripts/setup.sh           # First-time setup (env, docker, deps, migrations)
  .devcontainer/             # VS Code Dev Container config
  .vscode/settings.json      # Editor settings + recommended extensions
  .github/workflows/ci.yml   # CI pipeline adapted to your stack
  .gitignore                 # Combined patterns for all technologies
  README.md                  # Project docs with stack table and getting started
```

### All CLI commands

| Command | Description |
|---------|-------------|
| `stackweld init` | Interactive stack creation wizard |
| `stackweld generate` | One-shot project generation (name + path + techs + profile) |
| `stackweld create <id>` | Scaffold from a template |
| `stackweld list` | List saved stacks |
| `stackweld info <id>` | Show stack or technology details |
| `stackweld browse` | Browse technology catalog |
| `stackweld browse --templates` | Browse templates |
| `stackweld doctor` | Check system requirements |
| `stackweld doctor --suggest` | Suggest fixes for missing tools |
| `stackweld up` | Start Docker services |
| `stackweld down` | Stop Docker services |
| `stackweld down --volumes` | Stop and remove volumes |
| `stackweld status` | Show running service status |
| `stackweld logs [service]` | View service logs |
| `stackweld logs -f` | Follow log output |
| `stackweld export <id>` | Export stack to YAML or JSON |
| `stackweld import <file>` | Import stack from file |
| `stackweld save <id>` | Save version snapshot |
| `stackweld delete <id>` | Delete a stack |
| `stackweld clone <id>` | Duplicate a stack |
| `stackweld scaffold <id>` | Generate project files from saved stack |
| `stackweld version list <id>` | Show version history |
| `stackweld version diff <id> <a> <b>` | Compare two versions |
| `stackweld version rollback <id> --to <v>` | Rollback to version |
| `stackweld template list` | List built-in templates |
| `stackweld template save <id>` | Save stack as custom template |
| `stackweld template saved` | List your custom templates |
| `stackweld template use-custom <id>` | Create from custom template |
| `stackweld config list` | Show preferences |
| `stackweld config set <key> <value>` | Set a preference |
| `stackweld ai suggest "<desc>"` | Get stack suggestion from description |
| `stackweld ai readme <id>` | Generate README from stack |
| `stackweld ai explain <id>` | Explain stack architecture |
| `stackweld completion <shell>` | Generate shell completions (bash/zsh/fish) |
| **Analysis** | |
| `stackweld score <techA> [techB]` | Compatibility score (0-100) between technologies |
| `stackweld analyze [path]` | Detect stack from existing project |
| `stackweld benchmark <id>` | Performance profile for a stack |
| `stackweld cost <id>` | Estimate monthly hosting costs |
| **Environment** | |
| `stackweld env [sync\|check]` | Sync .env.example with .env, detect dangerous values |
| `stackweld health [path]` | Health check (secrets, .gitignore, TypeScript strict, etc.) |
| **Scaffolding** | |
| `stackweld preview <id>` | Preview docker-compose.yml without generating files |
| `stackweld deploy <id> --target <provider>` | Generate Infrastructure as Code (vps, aws, gcp) |
| **Migration & Learning** | |
| `stackweld migrate --from <tech> --to <tech>` | Step-by-step migration plan |
| `stackweld learn <technology>` | Learning resources for a technology |
| **Collaboration** | |
| `stackweld share <id>` | Generate shareable URL (no cloud needed) |
| `stackweld import-url <url>` | Import from shared URL |
| `stackweld compare <a> <b>` | Compare two stacks side by side |
| `stackweld lint` | Validate stack against team standards (.stackweldrc) |
| **Extensibility** | |
| `stackweld plugin list\|install\|remove\|info` | Plugin management |

### Technology catalog (83 technologies)

| Category | Count | Examples |
|----------|-------|---------|
| Runtime | 7 | Node.js, Python, Go, Rust, Bun, Deno, PHP |
| Frontend | 12 | Next.js, React, Vue, Nuxt, Svelte, SvelteKit, Astro, Angular, Remix, Solid, Qwik, HTMX |
| Backend | 12 | Express, Fastify, FastAPI, Django, Flask, Gin, Echo, Hono, NestJS, Laravel, tRPC, Spring Boot |
| Database | 11 | PostgreSQL, MySQL, MongoDB, Redis, SQLite, Supabase, MariaDB, PocketBase, Neon, Turso, Kafka |
| ORM | 6 | Prisma, Drizzle, SQLAlchemy, TypeORM, Django ORM, Mongoose |
| Auth | 4 | NextAuth, Clerk, Lucia, Supabase Auth |
| Styling | 6 | Tailwind CSS, shadcn/ui, Chakra UI, Material UI, DaisyUI, CSS Modules |
| Service | 10 | Nginx, Traefik, Mailpit, MinIO, RabbitMQ, Adminer, Grafana, Prometheus, Portainer, pgAdmin |
| DevOps | 15 | Docker, TypeScript, Vitest, Jest, Playwright, Cypress, Biome, ESLint, Prettier, GitHub Actions, Turborepo, Storybook, Zod, pnpm, Dev Containers |

### Built-in templates (20)

T3 Stack, Django REST API, FastAPI + React, Go Microservice, Astro Landing, SvelteKit Full-Stack, Nuxt 3 App, Express API, Hono Microservice, Django + React, MERN Stack, SaaS Starter, NestJS API, Remix Full-Stack, SolidStart App, Laravel App, Python AI Lab, Tauri Desktop, Monorepo Starter, HTMX + Django

## Desktop App

The desktop application provides a visual interface for all CLI functionality:

- **Dashboard**: Overview of technologies, saved stacks, templates, and categories
- **Stack Builder**: Select technologies by category with real-time validation, incompatibility warnings, dependency auto-resolution, and native folder picker for project creation
- **Technology Catalog**: Browse and search 83 technologies with filters by category
- **Runtime Panel**: Docker service status and controls
- **AI Assistant**: Natural language stack suggestions and documentation generation
- **Settings**: System information and user preferences

## Architecture

```
packages/
  core/        -- Engine, rules, scaffold orchestrator, runtime manager, tech installer, SQLite DB
                  + 14 new modules: compatibility, env-sync, detect, compose-preview,
                    health, migration, diff, share, infra, lint, benchmark, cost, learn, plugin
  registry/    -- 83 YAML technology definitions with JSON Schema validation
  templates/   -- 20 built-in stack templates + custom template support
  cli/         -- 38 commands (Commander + Inquirer + Chalk + Ora)
  desktop/     -- Tauri 2 + React 19 + TypeScript + Tailwind CSS 4 + Zustand
```

**Package dependency graph:**

```
cli ──────────► core, registry, templates
desktop ──────► core (via Tauri IPC)
registry ─────► core (types only)
templates ────► core (types only)
```

**Scaffold pipeline (what runs when you `generate`):**

```
User input
  └─► Rules Engine (BFS validation + port assignment)
        └─► Stack Engine (persist to SQLite)
              └─► Scaffold Orchestrator
                    ├─ 1. Official scaffold CLI (create-next-app, django-admin...)
                    ├─ 2. Tech Installer (Prisma, NextAuth, Vitest, Biome...)
                    ├─ 3. Docker Compose generation (databases + services only)
                    └─ 4. Config files (Makefile, CI workflow, devcontainer)
```

Full architecture documentation with ADRs: [docs/architecture.md](docs/architecture.md)

Monorepo managed with Turborepo + pnpm. TypeScript strict mode. Biome for linting. Vitest for testing. GitHub Actions for CI.

## Development

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm test             # Run tests (62+ passing)
pnpm lint             # Lint with Biome
pnpm typecheck        # TypeScript checking
```

## License

MIT

## Author

Orlando Fernandez
