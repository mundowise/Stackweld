# StackPilot

The operating system for your dev stacks. Define, validate, scaffold, launch, version, and reproduce full development environments from CLI or desktop.

## What it does

StackPilot eliminates the hours spent setting up new projects. Select your technologies, and it generates a complete, working project with proper directory structure, Docker services, environment files, CI pipeline, scripts, and all dependencies installed -- ready to code.

## Key Features

- **83 technologies** across 9 categories: runtime, frontend, backend, database, ORM, auth, styling, service, devops
- **Smart scaffolding** using official CLI tools (create-next-app, django-admin, etc.) -- never replaces them
- **Full-stack detection**: frontend/ + backend/ with separate configs when both are selected
- **Per-technology installation**: ORMs initialized with schema, auth configured with routes, styling installed, devops tools with config files
- **20 built-in templates** + save your own custom templates
- **Docker Compose** generation with only databases and services (not runtimes)
- **Version control**: save, diff, rollback stack versions
- **Desktop app**: Tauri 2 native application with visual stack builder
- **23 CLI commands** for every workflow

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
git clone https://github.com/Xplus-technologies-open-in-process/StackPilot.git
cd StackPilot

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Use the CLI directly
node packages/cli/dist/index.js --help

# Or link globally
cd packages/cli && pnpm link --global
stackpilot --help
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
./src-tauri/target/release/stackpilot-desktop
```

## CLI Usage

### Creating a project (most common workflow)

```bash
# Interactive mode -- wizard guides you through everything
stackpilot init

# One-shot generation -- specify everything at once
stackpilot generate \
  --name "my-saas" \
  --path "/home/user/projects" \
  --techs "nextjs,fastapi,postgresql,redis,prisma,tailwindcss,nextauth,vitest,docker" \
  --profile production \
  --git

# From a built-in template
stackpilot create t3-stack --path /home/user/projects
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
| `stackpilot init` | Interactive stack creation wizard |
| `stackpilot generate` | One-shot project generation (name + path + techs + profile) |
| `stackpilot create <id>` | Scaffold from a template |
| `stackpilot list` | List saved stacks |
| `stackpilot info <id>` | Show stack or technology details |
| `stackpilot browse` | Browse technology catalog |
| `stackpilot browse --templates` | Browse templates |
| `stackpilot doctor` | Check system requirements |
| `stackpilot doctor --suggest` | Suggest fixes for missing tools |
| `stackpilot up` | Start Docker services |
| `stackpilot down` | Stop Docker services |
| `stackpilot down --volumes` | Stop and remove volumes |
| `stackpilot status` | Show running service status |
| `stackpilot logs [service]` | View service logs |
| `stackpilot logs -f` | Follow log output |
| `stackpilot export <id>` | Export stack to YAML or JSON |
| `stackpilot import <file>` | Import stack from file |
| `stackpilot save <id>` | Save version snapshot |
| `stackpilot delete <id>` | Delete a stack |
| `stackpilot clone <id>` | Duplicate a stack |
| `stackpilot scaffold <id>` | Generate project files from saved stack |
| `stackpilot version list <id>` | Show version history |
| `stackpilot version diff <id> <a> <b>` | Compare two versions |
| `stackpilot version rollback <id> --to <v>` | Rollback to version |
| `stackpilot template list` | List built-in templates |
| `stackpilot template save <id>` | Save stack as custom template |
| `stackpilot template saved` | List your custom templates |
| `stackpilot template use-custom <id>` | Create from custom template |
| `stackpilot config list` | Show preferences |
| `stackpilot config set <key> <value>` | Set a preference |
| `stackpilot ai suggest "<desc>"` | Get stack suggestion from description |
| `stackpilot ai readme <id>` | Generate README from stack |
| `stackpilot ai explain <id>` | Explain stack architecture |
| `stackpilot completion <shell>` | Generate shell completions (bash/zsh/fish) |

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
  registry/    -- 83 YAML technology definitions with JSON Schema validation
  templates/   -- 20 built-in stack templates + custom template support
  cli/         -- 23 commands (Commander + Inquirer + Chalk + Ora)
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
