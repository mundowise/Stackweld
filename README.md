# StackPilot

The operating system for your dev stacks. Define, validate, generate, launch, version, and reproduce development environments from a single CLI or desktop app.

## Features

- **Stack Definition Engine** -- Declarative YAML-based technology definitions with dependency resolution, version constraints, and incompatibility detection.
- **Scaffold Orchestrator** -- Generates real projects using official CLI tools (create-next-app, django-admin, cargo init, etc.), not templates with stale boilerplate.
- **Runtime Orchestration** -- Launch, stop, and monitor Docker-based services directly from the CLI with `up`, `down`, `status`, and `logs` commands.
- **Portability** -- Export stacks to shareable YAML files and import them on any machine. Version history with diff and rollback.
- **50 Deep Technologies** -- Curated registry covering runtimes, frameworks, databases, ORMs, auth providers, styling libraries, infrastructure services, and devops tools.
- **10 Production-Ready Templates** -- Pre-composed stacks (T3 Stack, Django REST API, FastAPI + React, Go Microservice, and more) ready to scaffold in seconds.
- **Desktop App** -- Tauri 2 + React 19 native application for visual stack management alongside the CLI.

## Quick Start

```bash
# Install globally
npm install -g @stackpilot/cli

# Initialize a new stack interactively
stackpilot init

# Create a stack from a template
stackpilot create --template t3-stack --name my-app

# Launch Docker services
stackpilot up
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `init` | Create a new stack interactively |
| `create` | Create a stack from a template or selection |
| `list` | List all saved stacks |
| `info` | Show detailed information about a stack |
| `save` | Save current stack to the local database |
| `export` | Export a stack to a portable YAML file |
| `import` | Import a stack from a YAML file |
| `browse` | Browse the technology catalog interactively |
| `doctor` | Check system requirements and dependencies |
| `delete` | Delete a saved stack |
| `version list` | List version history of a stack |
| `version diff` | Show differences between two stack versions |
| `version rollback` | Rollback a stack to a previous version |
| `up` | Start Docker services for the current stack |
| `down` | Stop Docker services for the current stack |
| `status` | Show status of running services |
| `logs` | View logs from running services |
| `scaffold` | Generate project files from a stack definition |
| `config` | View and modify preferences |
| `completion` | Generate shell completion scripts |

## Technology Categories

StackPilot ships with 50 technologies organized into 9 categories:

- **runtime** -- Node.js, Python, Go, Rust, Bun
- **frontend** -- React, Vue, Svelte, Angular, Next.js, Nuxt, SvelteKit, Astro
- **backend** -- Express, Fastify, Hono, FastAPI, Django, Flask, Gin, Echo
- **database** -- PostgreSQL, MySQL, MongoDB, Redis
- **orm** -- Prisma, Drizzle, TypeORM, SQLAlchemy
- **auth** -- NextAuth, Clerk, Supabase Auth
- **styling** -- Tailwind CSS, shadcn/ui, Material UI, Chakra UI
- **service** -- Nginx, MinIO, RabbitMQ, Mailpit
- **devops** -- Docker, TypeScript, ESLint, Prettier, Biome, Vitest, Jest, Playwright, GitHub Actions, pnpm

## Templates

| Template | Description |
|----------|-------------|
| T3 Stack | Next.js + tRPC + Prisma + Tailwind CSS + NextAuth |
| Django REST API | Django + DRF + PostgreSQL + Docker |
| FastAPI + React | FastAPI backend + React frontend + PostgreSQL |
| Go Microservice | Go + Gin + PostgreSQL + Docker |
| Astro Landing | Astro + Tailwind CSS static site |
| SvelteKit Full-Stack | SvelteKit + Prisma + PostgreSQL + Tailwind CSS |
| Nuxt 3 App | Nuxt 3 + Vue 3 + Tailwind CSS + PostgreSQL |
| Express API | Express + TypeScript + Prisma + PostgreSQL |
| Hono Microservice | Hono + Bun + Redis + Docker |
| Django + React | Django backend + React frontend + PostgreSQL |

## Architecture

StackPilot is organized as a monorepo with five packages:

```
packages/
  core/        -- Stack engine, database, Docker integration, type definitions
  registry/    -- Technology definitions (YAML), JSON Schema validation, loader
  templates/   -- Template definitions and composition logic
  cli/         -- Command-line interface (Commander + Inquirer + Chalk)
  desktop/     -- Desktop application (Tauri 2 + React 19)
```

## Tech Stack

- **Build system** -- Turborepo + pnpm workspaces
- **Language** -- TypeScript (strict mode)
- **CLI** -- Commander, Inquirer, Chalk, Ora
- **Desktop** -- Tauri 2, React 19, Zustand, Tailwind CSS 4, Lucide icons
- **Database** -- SQLite via better-sqlite3
- **Schema** -- YAML definitions validated with AJV + JSON Schema
- **Testing** -- Vitest
- **Linting** -- Biome

## Development

```bash
# Clone and install
git clone https://github.com/yourusername/stackpilot.git
cd stackpilot
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Development mode (watch)
pnpm dev

# Type checking
pnpm typecheck

# Lint
pnpm lint
```

Requires Node.js >= 22.0.0 and pnpm >= 10.

## License

MIT

## Author

Orlando Fernandez
