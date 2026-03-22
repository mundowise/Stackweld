# StackPilot User Guide

## Table of Contents

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
git clone https://github.com/Xplus-technologies-open-in-process/StackPilot.git
cd StackPilot

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Verify the CLI works
node packages/cli/dist/index.js --version

# Option A: use directly
node packages/cli/dist/index.js --help

# Option B: link globally for the `stackpilot` command
cd packages/cli && pnpm link --global
stackpilot --help
```

For the desktop app on Linux, install system dependencies first:

```bash
sudo apt install -y libwebkit2gtk-4.1-dev librsvg2-dev patchelf libssl-dev libayatana-appindicator3-dev

# Build the desktop app
cd packages/desktop
pnpm tauri:build

# The binary will be at src-tauri/target/release/stackpilot-desktop
# .deb, .rpm, and .AppImage packages are generated in src-tauri/target/release/bundle/
```

### macOS

```bash
# Install Rust (required for the desktop app only)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Clone and build
git clone https://github.com/Xplus-technologies-open-in-process/StackPilot.git
cd StackPilot
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
git clone https://github.com/Xplus-technologies-open-in-process/StackPilot.git
cd StackPilot
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

Run `stackpilot init` to start the interactive wizard:

```bash
stackpilot init
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
9. **Review** -- StackPilot validates your selections, resolves dependencies, and flags incompatibilities. You can go back and adjust.
10. **Scaffold** -- The project is generated on disk with all files, dependencies, and configurations.

### CLI: One-shot generation

If you already know what you want, skip the wizard entirely:

```bash
stackpilot generate \
  --name "my-saas" \
  --path "/home/user/projects" \
  --techs "nextjs,fastapi,postgresql,redis,prisma,tailwindcss,nextauth,vitest,docker" \
  --profile production \
  --git
```

This creates the project, installs all dependencies, initializes git, and generates all configuration files in a single command.

### What gets generated

When you select both a frontend and backend framework, StackPilot creates a full-stack project with separate directories:

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

Templates are pre-composed stacks of technologies that work well together. StackPilot ships with 20 built-in templates:

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
stackpilot template list

# Or browse interactively
stackpilot browse --templates

# Create a project from a template
stackpilot create t3-stack --path /home/user/projects
```

This loads the template definition, resolves all technologies, saves the stack, and scaffolds the project.

### Custom templates

Save any stack as a reusable custom template:

```bash
# Save a stack as a custom template
stackpilot template save my-stack-id

# List your saved custom templates
stackpilot template saved

# Create a project from a custom template
stackpilot template use-custom my-custom-template
```

Custom templates are stored locally and persist across sessions.

---

## Browsing the Catalog

Explore all 83 technologies in the registry interactively:

```bash
stackpilot browse
```

This opens a navigable catalog grouped by category (runtime, frontend, backend, database, orm, auth, styling, service, devops). Select any technology to see its details: supported versions, default port, dependencies, suggested companions, and Docker image.

To view details about a specific technology or saved stack:

```bash
stackpilot info nextjs
stackpilot info my-stack
```

To list all saved stacks:

```bash
stackpilot list
```

---

## Docker Runtime Management

StackPilot generates `docker-compose.yml` files for stacks that include databases and services. Only databases and infrastructure services get Docker containers -- runtimes (Node.js, Python, Go, etc.) run natively on the host.

### Start services

```bash
stackpilot up
```

Starts all Docker services defined in the stack's compose file. Runs in detached mode by default.

### Stop services

```bash
# Stop and remove containers
stackpilot down

# Stop and remove containers AND volumes (deletes data)
stackpilot down --volumes
```

### Check status

```bash
stackpilot status
```

Shows the running state of each service (container name, image, status, ports).

### View logs

```bash
# All services
stackpilot logs

# Specific service
stackpilot logs postgresql

# Follow log output
stackpilot logs -f
```

---

## Version Management

StackPilot tracks changes to your stack definitions over time.

### Save a version snapshot

```bash
stackpilot save my-stack
```

Creates a versioned snapshot of the current stack state. Each save increments the version number.

### View version history

```bash
stackpilot version list my-stack
```

Shows all saved versions with timestamps and summaries of what changed.

### Compare versions

```bash
stackpilot version diff my-stack 1 3
```

Shows the differences between version 1 and version 3 -- technologies added, removed, or changed.

### Rollback to a previous version

```bash
stackpilot version rollback my-stack --to 2
```

Restores the stack to the state it was in at version 2.

---

## Exporting and Importing Stacks

### Exporting

Export a saved stack to a portable file for sharing with teammates or storing in version control:

```bash
stackpilot export my-stack --output my-stack.yaml
```

The exported file contains the full stack definition: technologies, versions, configuration, and metadata. Both YAML and JSON formats are supported.

### Importing

Import a stack from a file:

```bash
stackpilot import my-stack.yaml
```

The stack is validated against the current registry and saved to your local database. If any technology in the file is not present in your registry, the import reports the issue.

### Cloning

Duplicate an existing stack:

```bash
stackpilot clone my-stack
```

Creates a copy of the stack with a new ID, useful for experimenting with variations without modifying the original.

---

## AI Commands

StackPilot includes optional commands that use the Anthropic API for suggestions and documentation generation. These commands do not affect the deterministic rules engine -- they are a convenience layer.

### Setup

Set your Anthropic API key as an environment variable:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

Add it to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.) to persist across sessions.

### Suggest a stack

Describe your project in natural language and get a recommended stack:

```bash
stackpilot ai suggest "SaaS app with user authentication, payments, and a dashboard"
```

Returns a list of recommended technologies with reasoning.

### Generate a README

Generate project documentation from a stack definition:

```bash
stackpilot ai readme my-stack
```

Produces a README with a technology table, getting started instructions, and architecture overview.

### Explain a stack

Get an architectural overview of a stack:

```bash
stackpilot ai explain my-stack
```

Describes how the selected technologies fit together, common patterns, and potential considerations.

---

## System Doctor

The `doctor` command checks that your system has the required tools installed and properly configured:

```bash
stackpilot doctor
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
stackpilot doctor --suggest
```

When a check fails, this flag provides specific installation commands for your platform.

---

## Configuration and Preferences

View your current configuration:

```bash
stackpilot config list
```

Modify preferences:

```bash
stackpilot config set <key> <value>
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

Preferences are stored locally in your home directory (`~/.stackpilot/`) and persist across sessions.

---

## Shell Completions

Generate completion scripts for your shell:

```bash
# Bash
stackpilot completion bash >> ~/.bashrc

# Zsh
stackpilot completion zsh >> ~/.zshrc

# Fish
stackpilot completion fish > ~/.config/fish/completions/stackpilot.fish
```

After adding the completion script, restart your shell or source the configuration file. Tab completion works for all commands, subcommands, and saved stack names.

---

## Troubleshooting

### `command not found: stackpilot`

The CLI is not linked globally. Either:
- Run `cd packages/cli && pnpm link --global` to create the global link.
- Use `node packages/cli/dist/index.js` directly instead.

### `pnpm install` fails with version error

StackPilot requires pnpm 10 or later. Check your version with `pnpm --version` and update with `npm install -g pnpm@latest`.

### `stackpilot up` fails with "docker compose not found"

Ensure Docker Desktop (macOS/Windows) or Docker Engine + docker-compose-plugin (Linux) is installed. StackPilot uses `docker compose` (v2 syntax), not the legacy `docker-compose` binary.

If you use the legacy binary, configure it:

```bash
stackpilot config set dockerComposeCommand "docker-compose"
```

### Scaffold fails with "create-next-app not found"

StackPilot delegates to official CLI tools during scaffolding. Ensure the required tools are available globally. For Node.js frameworks, `npx` is used automatically. For Python frameworks, ensure `pip` or `pipx` is available.

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

Run `pnpm clean && pnpm install && pnpm build` to rebuild from a clean state. StackPilot uses TypeScript strict mode and ESM -- ensure your Node.js version is 22 or later.

### SQLite errors

The local database is stored in `~/.stackpilot/stackpilot.db`. If it becomes corrupted, delete it and StackPilot will recreate it on next run. Note that this removes all saved stacks.

### AI commands return errors

Verify your Anthropic API key is set correctly:

```bash
echo $ANTHROPIC_API_KEY
```

The key should start with `sk-ant-`. If the environment variable is not set, the `ai` commands will fail with an authentication error.
