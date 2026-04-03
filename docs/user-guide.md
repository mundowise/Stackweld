# Stackweld User Guide

## Interactive Mode

The easiest way to use Stackweld is to simply run:

```bash
stackweld
```

This opens an interactive menu where you can navigate all features without memorizing commands. Use arrow keys to select, Enter to confirm, and the menu returns after each action.

For automation and scripting, all commands also work directly as documented below.

---

## Table of Contents

- [Interactive Mode](#interactive-mode)
- [Installation](#installation)
- [Creating Your First Project](#creating-your-first-project)
- [Using the Desktop App](#using-the-desktop-app)
- [Using Templates](#using-templates)
- [Browsing the Catalog](#browsing-the-catalog)
- [Docker Runtime Management](#docker-runtime-management)
- [Version Management](#version-management)
- [Exporting and Importing Stacks](#exporting-and-importing-stacks)
- [AI Commands](#ai-commands)
- [System Doctor](#system-doctor)
- [Configuration and Preferences](#configuration-and-preferences)
- [Shell Completions](#shell-completions)
- [Compatibility Scoring](#compatibility-scoring)
- [Stack Detection](#stack-detection)
- [Performance Benchmarks](#performance-benchmarks)
- [Cost Estimation](#cost-estimation)
- [Environment Management](#environment-management)
- [Project Health Check](#project-health-check)
- [Compose Preview](#compose-preview)
- [Infrastructure as Code](#infrastructure-as-code)
- [Migration Planning](#migration-planning)
- [Learning Resources](#learning-resources)
- [Stack Sharing](#stack-sharing)
- [Stack Comparison](#stack-comparison)
- [Team Standards (Lint)](#team-standards-lint)
- [Plugin Management](#plugin-management)
- [Troubleshooting](#troubleshooting)

---

## Installation

### Requirements

- **Node.js** 22.0.0 or later
- **pnpm** 10.0.0 or later
- **Docker + Docker Compose** (required for `up`, `down`, `status`, `logs` commands)
- **Git** (recommended for scaffold initialization)
- **Rust toolchain** (only required for building the desktop app)

### Linux

```bash
# Clone the repository
git clone https://github.com/mundowise/Stackweld.git
cd Stackweld

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Verify the CLI works
node packages/cli/dist/index.js --version

# Option A: use directly
node packages/cli/dist/index.js --help

# Option B: link globally for the `stackweld` command
cd packages/cli && pnpm link --global
stackweld --help
```

For the desktop app on Linux, install system dependencies first:

```bash
sudo apt install -y libwebkit2gtk-4.1-dev librsvg2-dev patchelf libssl-dev libayatana-appindicator3-dev

# Build the desktop app
cd packages/desktop
pnpm tauri:build

# The binary will be at src-tauri/target/release/stackweld-desktop
# .deb, .rpm, and .AppImage packages are generated in src-tauri/target/release/bundle/
```

### macOS

```bash
# Install Rust (required for the desktop app only)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Clone and build
git clone https://github.com/mundowise/Stackweld.git
cd Stackweld
pnpm install
pnpm build

# Link the CLI globally
cd packages/cli && pnpm link --global
```

For the desktop app on macOS, no additional system dependencies are needed beyond the Rust toolchain:

```bash
cd packages/desktop
pnpm tauri:build
# .dmg is generated in src-tauri/target/release/bundle/
```

### Windows

```bash
# Install Rust from https://rustup.rs (required for the desktop app only)

# Clone and build (PowerShell or Git Bash)
git clone https://github.com/mundowise/Stackweld.git
cd Stackweld
pnpm install
pnpm build

# Link the CLI globally
cd packages/cli
pnpm link --global
```

For the desktop app on Windows, install the [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the "Desktop development with C++" workload, then:

```bash
cd packages/desktop
pnpm tauri:build
# .msi and .exe are generated in src-tauri/target/release/bundle/
```

---

## Creating Your First Project

### CLI: Interactive mode

Run `stackweld init` to start the interactive wizard:

```bash
stackweld init
```

The wizard walks you through the following steps:

1. **Project name** -- Enter a name for your project (used as the directory name).
2. **Project path** -- Where to create the project on disk.
3. **Runtime** -- Pick a runtime: Node.js, Python, Go, Rust, Bun, Deno, or PHP.
4. **Frontend framework** -- Optionally select a frontend framework (Next.js, React, Vue, Nuxt, Svelte, SvelteKit, Astro, Angular, Remix, Solid, Qwik, HTMX, or none).
5. **Backend framework** -- Optionally select a backend framework (Express, Fastify, FastAPI, Django, Flask, Gin, Echo, Hono, NestJS, Laravel, tRPC, Spring Boot, or none).
6. **Database** -- Optionally select a database (PostgreSQL, MySQL, MongoDB, Redis, SQLite, Supabase, MariaDB, PocketBase, Neon, Turso, Kafka).
7. **Additional technologies** -- Add ORMs, auth providers, styling libraries, infrastructure services, and devops tools.
8. **Profile** -- Choose a scaffold profile (minimal, standard, or production).
9. **Review** -- Stackweld validates your selections, resolves dependencies, and flags incompatibilities. You can go back and adjust.
10. **Scaffold** -- The project is generated on disk with all files, dependencies, and configurations.

### CLI: One-shot generation

If you already know what you want, skip the wizard entirely:

```bash
stackweld generate \
  --name "my-saas" \
  --path "/home/user/projects" \
  --techs "nextjs,fastapi,postgresql,redis,prisma,tailwindcss,nextauth,vitest,docker" \
  --profile production \
  --git
```

This creates the project, installs all dependencies, initializes git, and generates all configuration files in a single command.

### What gets generated

When you select both a frontend and backend framework, Stackweld creates a full-stack project with separate directories:

```
my-saas/
  frontend/                  # Created by the framework's official CLI
    src/                     # Application source code
    prisma/schema.prisma     # ORM initialized with base models
    .env.example             # Frontend-specific environment variables
    package.json             # All dependencies installed

  backend/                   # Created by the framework's official tools
    main.py                  # Server with CORS, health check endpoint
    requirements.txt         # Python dependencies
    .venv/                   # Virtual environment (Python projects)
    .env.example             # Backend-specific environment variables

  docker-compose.yml         # Database and service containers only
  Makefile                   # Common targets: dev, up, down, test, clean
  scripts/dev.sh             # Start all services in one command
  scripts/setup.sh           # First-time setup script
  .devcontainer/             # VS Code Dev Container configuration
  .vscode/settings.json      # Editor settings + recommended extensions
  .github/workflows/ci.yml   # CI pipeline adapted to your stack
  .gitignore                 # Combined patterns for all selected technologies
  README.md                  # Project documentation with tech table
```

When only a frontend or only a backend is selected, the project is created at the root level without subdirectories.

---

## Using the Desktop App

The desktop application provides a visual interface for the same functionality available in the CLI.

### Dashboard

The main screen shows an overview of:
- Total technologies in the catalog (83)
- Saved stacks count
- Available templates (20 built-in)
- Technology categories (9)

### Stack Builder

1. Select technologies by category using checkboxes.
2. The builder validates selections in real time -- incompatible technologies are flagged, and required dependencies are auto-resolved.
3. Choose a name, output path (native folder picker), and profile.
4. Click "Generate" to scaffold the project.

### Technology Catalog

Browse and search all 83 technologies with filters by category. Each technology card shows its description, supported versions, default port, dependencies, suggested companions, and Docker image.

### Runtime Panel

If your project includes Docker services, the runtime panel lets you start, stop, and monitor containers. It shows container status, ports, and provides log streaming.

### Settings

View system information (Node.js version, pnpm version, Docker status) and configure user preferences.

---

## Using Templates

### Built-in templates (20)

Templates are pre-composed stacks of technologies that work well together. Stackweld ships with 20 built-in templates:

| Template | Technologies |
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
| MERN Stack | MongoDB + Express + React + Node.js |
| SaaS Starter | Next.js + Prisma + PostgreSQL + NextAuth + Stripe |
| NestJS API | NestJS + TypeORM + PostgreSQL + Docker |
| Remix Full-Stack | Remix + Prisma + PostgreSQL + Tailwind CSS |
| SolidStart App | SolidStart + Tailwind CSS + PostgreSQL |
| Laravel App | Laravel + MySQL + Redis + Docker |
| Python AI Lab | Python + FastAPI + PostgreSQL + Redis |
| Tauri Desktop | Tauri 2 + React + TypeScript + Tailwind CSS |
| Monorepo Starter | Turborepo + pnpm + TypeScript + Biome |
| HTMX + Django | Django + HTMX + Tailwind CSS + PostgreSQL |

### Creating from a template

```bash
# List all available templates
stackweld template list

# Or browse interactively
stackweld browse --templates

# Create a project from a template
stackweld create t3-stack --path /home/user/projects
```

This loads the template definition, resolves all technologies, saves the stack, and scaffolds the project.

### Custom templates

Save any stack as a reusable custom template:

```bash
# Save a stack as a custom template
stackweld template save my-stack-id

# List your saved custom templates
stackweld template saved

# Create a project from a custom template
stackweld template use-custom my-custom-template
```

Custom templates are stored locally and persist across sessions.

---

## Browsing the Catalog

Explore all 83 technologies in the registry interactively:

```bash
stackweld browse
```

This opens a navigable catalog grouped by category (runtime, frontend, backend, database, orm, auth, styling, service, devops). Select any technology to see its details: supported versions, default port, dependencies, suggested companions, and Docker image.

To view details about a specific technology or saved stack:

```bash
stackweld info nextjs
stackweld info my-stack
```

To list all saved stacks:

```bash
stackweld list
```

---

## Docker Runtime Management

Stackweld generates `docker-compose.yml` files for stacks that include databases and services. Only databases and infrastructure services get Docker containers -- runtimes (Node.js, Python, Go, etc.) run natively on the host.

### Start services

```bash
stackweld up
```

Starts all Docker services defined in the stack's compose file. Runs in detached mode by default.

### Stop services

```bash
# Stop and remove containers
stackweld down

# Stop and remove containers AND volumes (deletes data)
stackweld down --volumes
```

### Check status

```bash
stackweld status
```

Shows the running state of each service (container name, image, status, ports).

### View logs

```bash
# All services
stackweld logs

# Specific service
stackweld logs postgresql

# Follow log output
stackweld logs -f
```

---

## Version Management

Stackweld tracks changes to your stack definitions over time.

### Save a version snapshot

```bash
stackweld save my-stack
```

Creates a versioned snapshot of the current stack state. Each save increments the version number.

### View version history

```bash
stackweld version list my-stack
```

Shows all saved versions with timestamps and summaries of what changed.

### Compare versions

```bash
stackweld version diff my-stack 1 3
```

Shows the differences between version 1 and version 3 -- technologies added, removed, or changed.

### Rollback to a previous version

```bash
stackweld version rollback my-stack --to 2
```

Restores the stack to the state it was in at version 2.

---

## Exporting and Importing Stacks

### Exporting

Export a saved stack to a portable file for sharing with teammates or storing in version control:

```bash
stackweld export my-stack --output my-stack.yaml
```

The exported file contains the full stack definition: technologies, versions, configuration, and metadata. Both YAML and JSON formats are supported.

### Importing

Import a stack from a file:

```bash
stackweld import my-stack.yaml
```

The stack is validated against the current registry and saved to your local database. If any technology in the file is not present in your registry, the import reports the issue.

### Cloning

Duplicate an existing stack:

```bash
stackweld clone my-stack
```

Creates a copy of the stack with a new ID, useful for experimenting with variations without modifying the original.

---

## AI Commands

Stackweld includes optional commands that use the Anthropic API for suggestions and documentation generation. These commands do not affect the deterministic rules engine -- they are a convenience layer.

### Setup

Set your Anthropic API key as an environment variable:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

Add it to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.) to persist across sessions.

### Suggest a stack

Describe your project in natural language and get a recommended stack:

```bash
stackweld ai suggest "SaaS app with user authentication, payments, and a dashboard"
```

Returns a list of recommended technologies with reasoning.

### Generate a README

Generate project documentation from a stack definition:

```bash
stackweld ai readme my-stack
```

Produces a README with a technology table, getting started instructions, and architecture overview.

### Explain a stack

Get an architectural overview of a stack:

```bash
stackweld ai explain my-stack
```

Describes how the selected technologies fit together, common patterns, and potential considerations.

---

## System Doctor

The `doctor` command checks that your system has the required tools installed and properly configured:

```bash
stackweld doctor
```

It verifies:

- Node.js version (>= 22.0.0)
- pnpm availability
- Docker daemon running
- Docker Compose available
- Git installed
- Language runtimes relevant to your saved stacks (Python, Go, Rust, etc.)

Each check reports a pass/fail status with actionable guidance when something is missing.

### Suggested fixes

```bash
stackweld doctor --suggest
```

When a check fails, this flag provides specific installation commands for your platform.

---

## Configuration and Preferences

View your current configuration:

```bash
stackweld config list
```

Modify preferences:

```bash
stackweld config set <key> <value>
```

Available configuration options:

| Key | Description | Default |
|-----|-------------|---------|
| `editor` | Preferred code editor (code, cursor, zed, nvim, webstorm) | `code` |
| `packageManager` | Node.js package manager (pnpm, npm, yarn, bun) | `pnpm` |
| `shell` | Shell for completions and scripts (bash, zsh, fish) | `zsh` |
| `dockerMode` | Container strategy (compose, devcontainer, none) | `compose` |
| `defaultProfile` | Default stack profile (rapid, standard, production, enterprise, lightweight) | `standard` |
| `theme` | Desktop app theme | `dark` |

Preferences are stored locally in your home directory (`~/.stackweld/`) and persist across sessions.

---

## Shell Completions

Generate completion scripts for your shell:

```bash
# Bash
stackweld completion bash >> ~/.bashrc

# Zsh
stackweld completion zsh >> ~/.zshrc

# Fish
stackweld completion fish > ~/.config/fish/completions/stackweld.fish
```

After adding the completion script, restart your shell or source the configuration file. Tab completion works for all commands, subcommands, and saved stack names.

---

## Compatibility Scoring

Check how well two technologies work together, or score an entire stack:

```bash
# Score compatibility between two technologies (0-100)
stackweld score nextjs postgresql

# Example output:
#   nextjs <-> postgresql
#   Compatibility: 92/100
#   Verdict: Excellent
#   Notes:
#     + Both widely used together in production
#     + Prisma/Drizzle bridge available
#     - No native ORM, needs adapter layer

# Score a full saved stack
stackweld score my-stack
```

**Options:**

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON |
| `--verbose` | Show detailed scoring breakdown per category |

---

## Stack Detection

Detect the technology stack of an existing project by inspecting its files:

```bash
# Detect stack in current directory
stackweld analyze

# Detect stack in a specific path
stackweld analyze /home/user/projects/my-app

# Example output:
#   Detected Stack:
#     Runtime:   Node.js 22
#     Frontend:  Next.js 15
#     Backend:   (none detected)
#     Database:  PostgreSQL (from docker-compose.yml)
#     ORM:       Prisma
#     Styling:   Tailwind CSS
#     DevOps:    Docker, GitHub Actions, Biome
#   Confidence: 94%
```

**Options:**

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON |
| `--save` | Save detected stack to local database |
| `--path <dir>` | Project path (default: current directory) |

---

## Performance Benchmarks

Generate a performance profile for a saved stack:

```bash
stackweld benchmark my-stack

# Example output:
#   Performance Profile: my-stack
#   ┌──────────────────┬──────────┐
#   │ Metric           │ Estimate │
#   ├──────────────────┼──────────┤
#   │ Cold start       │ ~2.1s    │
#   │ Hot reload       │ ~180ms   │
#   │ Build time       │ ~45s     │
#   │ Memory (idle)    │ ~320MB   │
#   │ Memory (peak)    │ ~1.2GB   │
#   │ Docker image     │ ~890MB   │
#   │ Install time     │ ~38s     │
#   └──────────────────┴──────────┘
#   Profile: production
#   Technologies: 9
```

**Options:**

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON |
| `--profile <name>` | Override stack profile for the estimate |

---

## Cost Estimation

Estimate monthly hosting costs for a stack:

```bash
stackweld cost my-stack

# Example output:
#   Monthly Cost Estimate: my-stack
#   ┌───────────┬──────────┬──────────┬──────────┐
#   │ Provider  │ Min      │ Typical  │ Max      │
#   ├───────────┼──────────┼──────────┼──────────┤
#   │ VPS       │ $12/mo   │ $24/mo   │ $48/mo   │
#   │ AWS       │ $35/mo   │ $85/mo   │ $200/mo  │
#   │ GCP       │ $30/mo   │ $78/mo   │ $180/mo  │
#   └───────────┴──────────┴──────────┴──────────┘
#   Assumptions: 10K monthly users, 50GB storage
```

**Options:**

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON |
| `--users <n>` | Expected monthly active users (default: 10000) |
| `--storage <gb>` | Expected storage in GB (default: 50) |

---

## Environment Management

Manage environment variables across `.env.example` and `.env` files:

```bash
# Sync .env.example to .env (adds missing keys, preserves existing values)
stackweld env sync

# Example output:
#   Syncing .env.example -> .env
#   + Added DATABASE_URL (default: postgresql://localhost:5432/mydb)
#   + Added REDIS_URL (default: redis://localhost:6379)
#   = Kept NEXTAUTH_SECRET (already set)
#   Done: 2 added, 1 unchanged

# Check for dangerous values in .env files
stackweld env check

# Example output:
#   Environment Check:
#   [WARN] .env:3 DATABASE_URL contains "password" — likely hardcoded credential
#   [WARN] .env:7 SECRET_KEY = "changeme" — default/placeholder value
#   [PASS] .env:9 NEXTAUTH_SECRET — looks properly randomized
#   Result: 2 warnings, 1 passed
```

**Options:**

| Flag | Description |
|------|-------------|
| `--path <dir>` | Project path (default: current directory) |
| `--json` | Output as JSON |

---

## Project Health Check

Run a comprehensive health audit on a project:

```bash
stackweld health

# Or specify a path
stackweld health /home/user/projects/my-app

# Example output:
#   Project Health: my-app
#   [PASS] .gitignore exists and covers node_modules, .env, dist
#   [PASS] No secrets detected in tracked files
#   [WARN] TypeScript strict mode is disabled in tsconfig.json
#   [FAIL] .env file is tracked by git
#   [PASS] Docker Compose services have health checks
#   [WARN] 3 dependencies have known vulnerabilities
#   [PASS] CI pipeline configured
#
#   Score: 71/100 (5 passed, 2 warnings, 1 failure)
```

**Options:**

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON |
| `--fix` | Auto-fix issues where possible (e.g., add .env to .gitignore) |
| `--path <dir>` | Project path (default: current directory) |

---

## Compose Preview

Preview the generated docker-compose.yml without writing any files:

```bash
stackweld preview my-stack

# Example output (prints YAML to stdout):
#   version: "3.8"
#   services:
#     postgresql:
#       image: postgres:17
#       ports:
#         - "5432:5432"
#       environment:
#         POSTGRES_DB: "mydb"
#         POSTGRES_USER: "postgres"
#         POSTGRES_PASSWORD: "postgres"
#       volumes:
#         - pgdata:/var/lib/postgresql/data
#     redis:
#       image: redis:7-alpine
#       ports:
#         - "6379:6379"
#   volumes:
#     pgdata:
```

**Options:**

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON instead of YAML |

---

## Infrastructure as Code

Generate deployment configurations for a target platform:

```bash
# Generate for a VPS (Dockerfile + nginx config + systemd unit)
stackweld deploy my-stack --target vps

# Generate for AWS (CloudFormation template)
stackweld deploy my-stack --target aws

# Generate for GCP (Terraform files)
stackweld deploy my-stack --target gcp

# Example output:
#   Generated Infrastructure as Code:
#     Target: aws
#     Files:
#       infra/cloudformation.yml    (ECS + RDS + ElastiCache)
#       infra/buildspec.yml         (CodeBuild pipeline)
#       infra/task-definition.json  (ECS task)
#     Deploy with: aws cloudformation deploy --template-file infra/cloudformation.yml
```

**Options:**

| Flag | Description |
|------|-------------|
| `--target <provider>` | Target platform: `vps`, `aws`, or `gcp` (required) |
| `--output <dir>` | Output directory (default: `./infra/`) |
| `--json` | Output file manifest as JSON |

---

## Migration Planning

Generate a step-by-step migration plan between two technologies:

```bash
stackweld migrate --from express --to fastify

# Example output:
#   Migration Plan: Express -> Fastify
#
#   Step 1: Install Fastify
#     npm install fastify @fastify/cors @fastify/helmet
#
#   Step 2: Convert route handlers
#     Express: app.get('/api', (req, res) => res.json({...}))
#     Fastify: app.get('/api', async (req, reply) => reply.send({...}))
#
#   Step 3: Replace middleware with plugins
#     cors()        -> @fastify/cors
#     helmet()      -> @fastify/helmet
#     body-parser   -> built-in (fastify parses JSON by default)
#
#   Step 4: Update error handling
#     ...
#
#   Estimated effort: 2-4 hours for a medium project
#   Risk: Low (same ecosystem, similar API surface)
```

**Options:**

| Flag | Description |
|------|-------------|
| `--from <tech>` | Source technology (required) |
| `--to <tech>` | Target technology (required) |
| `--json` | Output as JSON |

---

## Learning Resources

Get curated learning resources for any technology in the catalog:

```bash
stackweld learn fastapi

# Example output:
#   Learning Resources: FastAPI
#
#   Official:
#     - Documentation: https://fastapi.tiangolo.com
#     - Tutorial: https://fastapi.tiangolo.com/tutorial/
#     - GitHub: https://github.com/tiangolo/fastapi
#
#   Tutorials:
#     - "FastAPI for Beginners" (freeCodeCamp)
#     - "Full Stack FastAPI + React" (official template)
#
#   Key concepts:
#     - Path operations and dependency injection
#     - Pydantic models for request/response validation
#     - Async support with ASGI
#     - OpenAPI docs auto-generated at /docs
```

**Options:**

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON |

---

## Stack Sharing

Share a stack definition via an encoded URL without any cloud service:

```bash
# Generate a shareable URL
stackweld share my-stack

# Example output:
#   Shareable URL:
#   stackweld://import/eyJuYW1lIjoibXktc2FhcyIsInRlY2hub2xvZ2llcyI6...
#
#   Or copy this command:
#   stackweld import-url "stackweld://import/eyJuYW1lIjoi..."

# Import a stack from a shared URL
stackweld import-url "stackweld://import/eyJuYW1lIjoibXktc2FhcyI..."

# Example output:
#   Imported stack: my-saas
#   Technologies: nextjs, fastapi, postgresql, redis, prisma, tailwindcss
#   Saved with ID: a1b2c3d4-...
```

**Options (share):**

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON |
| `--clipboard` | Copy URL to clipboard |

---

## Stack Comparison

Compare two saved stacks side by side:

```bash
stackweld compare stack-a stack-b

# Example output:
#   Comparing: stack-a vs stack-b
#   ┌──────────────┬───────────────┬───────────────┐
#   │ Technology   │ stack-a       │ stack-b       │
#   ├──────────────┼───────────────┼───────────────┤
#   │ Runtime      │ Node.js 22    │ Node.js 22    │
#   │ Frontend     │ Next.js 15    │ Nuxt 3        │
#   │ Backend      │ FastAPI 0.115 │ Express 4     │
#   │ Database     │ PostgreSQL 17 │ PostgreSQL 17 │
#   │ ORM          │ Prisma        │ Drizzle       │
#   │ Styling      │ Tailwind CSS  │ Tailwind CSS  │
#   │ Auth         │ NextAuth      │ Clerk         │
#   └──────────────┴───────────────┴───────────────┘
#   Added in stack-b: nuxt, express, drizzle, clerk
#   Removed from stack-a: nextjs, fastapi, prisma, nextauth
#   Unchanged: nodejs, postgresql, tailwindcss
```

**Options:**

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON |

---

## Team Standards (Lint)

Validate a stack against team-defined standards in a `.stackweldrc` file:

```bash
stackweld lint

# Example .stackweldrc (JSON):
# {
#   "required": ["typescript", "docker", "biome"],
#   "banned": ["webpack", "eslint"],
#   "versions": {
#     "nodejs": ">=22",
#     "postgresql": ">=16"
#   }
# }

# Example output:
#   Linting stack against .stackweldrc
#   [PASS] typescript is present
#   [PASS] docker is present
#   [FAIL] biome is missing (required by team standards)
#   [PASS] No banned technologies detected
#   [PASS] nodejs 22 satisfies >=22
#   [WARN] postgresql 15 does not satisfy >=16
#
#   Result: 1 failure, 1 warning, 3 passed
```

**Options:**

| Flag | Description |
|------|-------------|
| `--config <path>` | Path to standards file (default: `.stackweldrc`) |
| `--json` | Output as JSON |

---

## Plugin Management

Extend Stackweld with community plugins that add commands, templates, or technology definitions:

```bash
# List installed plugins
stackweld plugin list

# Install a plugin
stackweld plugin install @stackweld/plugin-aws

# Remove a plugin
stackweld plugin remove @stackweld/plugin-aws

# Show plugin details
stackweld plugin info @stackweld/plugin-aws

# Example output (list):
#   Installed Plugins:
#   ┌──────────────────────────┬─────────┬──────────────────────────┐
#   │ Name                     │ Version │ Provides                 │
#   ├──────────────────────────┼─────────┼──────────────────────────┤
#   │ @stackweld/plugin-aws   │ 1.0.0   │ 3 commands, 2 templates  │
#   │ @stackweld/plugin-k8s   │ 0.5.0   │ 1 command, 5 tech defs   │
#   └──────────────────────────┴─────────┴──────────────────────────┘
```

**Options:**

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON |

---

## Troubleshooting

### `command not found: stackweld`

The CLI is not linked globally. Either:
- Run `cd packages/cli && pnpm link --global` to create the global link.
- Use `node packages/cli/dist/index.js` directly instead.

### `pnpm install` fails with version error

Stackweld requires pnpm 10 or later. Check your version with `pnpm --version` and update with `npm install -g pnpm@latest`.

### `stackweld up` fails with "docker compose not found"

Ensure Docker Desktop (macOS/Windows) or Docker Engine + docker-compose-plugin (Linux) is installed. Stackweld uses `docker compose` (v2 syntax), not the legacy `docker-compose` binary.

If you use the legacy binary, configure it:

```bash
stackweld config set dockerComposeCommand "docker-compose"
```

### Scaffold fails with "create-next-app not found"

Stackweld delegates to official CLI tools during scaffolding. Ensure the required tools are available globally. For Node.js frameworks, `npx` is used automatically. For Python frameworks, ensure `pip` or `pipx` is available.

### Desktop app fails to build on Linux

Install the required system libraries:

```bash
sudo apt install -y libwebkit2gtk-4.1-dev librsvg2-dev patchelf libssl-dev libayatana-appindicator3-dev
```

On Fedora/RHEL:

```bash
sudo dnf install webkit2gtk4.1-devel librsvg2-devel patchelf openssl-devel libappindicator-gtk3-devel
```

### TypeScript errors during build

Run `pnpm clean && pnpm install && pnpm build` to rebuild from a clean state. Stackweld uses TypeScript strict mode and ESM -- ensure your Node.js version is 22 or later.

### SQLite errors

The local database is stored in `~/.stackweld/stackweld.db`. If it becomes corrupted, delete it and Stackweld will recreate it on next run. Note that this removes all saved stacks.

### AI commands return errors

Verify your Anthropic API key is set correctly:

```bash
echo $ANTHROPIC_API_KEY
```

The key should start with `sk-ant-`. If the environment variable is not set, the `ai` commands will fail with an authentication error.
