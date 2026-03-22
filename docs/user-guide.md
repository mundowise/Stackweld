# StackPilot User Guide

## Table of Contents

- [Installation](#installation)
- [Creating Your First Stack](#creating-your-first-stack)
- [Using Templates](#using-templates)
- [Browsing the Catalog](#browsing-the-catalog)
- [Exporting and Importing Stacks](#exporting-and-importing-stacks)
- [Docker Runtime Management](#docker-runtime-management)
- [System Doctor](#system-doctor)
- [Configuration and Preferences](#configuration-and-preferences)
- [Shell Completions](#shell-completions)

---

## Installation

Install StackPilot globally via npm:

```bash
npm install -g @stackpilot/cli
```

Verify the installation:

```bash
stackpilot --version
```

### Requirements

- Node.js 22 or later
- Docker (required for `up`, `down`, `status`, `logs` commands)
- Git (recommended for scaffold initialization)

---

## Creating Your First Stack

Run `stackpilot init` to start the interactive stack builder:

```bash
stackpilot init
```

The wizard walks you through the following steps:

1. **Project name** -- Enter a name for your stack (used as the directory name during scaffold).
2. **Runtime** -- Pick a runtime: Node.js, Python, Go, Rust, or Bun.
3. **Frontend framework** -- Optionally select a frontend framework (React, Vue, Svelte, Angular, Next.js, Nuxt, SvelteKit, Astro, or none).
4. **Backend framework** -- Optionally select a backend framework (Express, Fastify, Hono, FastAPI, Django, Flask, Gin, Echo, or none).
5. **Database** -- Optionally select a database (PostgreSQL, MySQL, MongoDB, Redis).
6. **Additional technologies** -- Add ORMs, auth providers, styling libraries, services, and devops tools.
7. **Review** -- StackPilot validates your selections, resolves dependencies, and flags incompatibilities. You can go back and adjust.
8. **Save** -- The stack is saved to your local database for future use.

After saving, scaffold the project:

```bash
stackpilot scaffold --name my-project
```

This runs official CLI tools (create-next-app, django-admin, cargo init, etc.) to generate a real project -- not a copy of static templates.

---

## Using Templates

Templates are pre-composed stacks of technologies that work well together. To create a project from a template:

```bash
stackpilot create --template t3-stack --name my-app
```

This does three things in sequence:
1. Loads the template definition and resolves all technologies.
2. Saves the stack to your local database.
3. Runs the scaffold steps to generate project files.

List all available templates:

```bash
stackpilot create --list
```

Available templates:

- **t3-stack** -- Next.js + tRPC + Prisma + Tailwind CSS + NextAuth
- **django-rest-api** -- Django + DRF + PostgreSQL + Docker
- **fastapi-react** -- FastAPI backend + React frontend + PostgreSQL
- **go-microservice** -- Go + Gin + PostgreSQL + Docker
- **astro-landing** -- Astro + Tailwind CSS static site
- **sveltekit-fullstack** -- SvelteKit + Prisma + PostgreSQL + Tailwind CSS
- **nuxt3-app** -- Nuxt 3 + Vue 3 + Tailwind CSS + PostgreSQL
- **express-api** -- Express + TypeScript + Prisma + PostgreSQL
- **hono-microservice** -- Hono + Bun + Redis + Docker
- **django-react** -- Django backend + React frontend + PostgreSQL

---

## Browsing the Catalog

Explore all 50 technologies in the registry interactively:

```bash
stackpilot browse
```

This opens a navigable catalog grouped by category (runtime, frontend, backend, database, orm, auth, styling, service, devops). Select any technology to see its details: supported versions, default port, dependencies, suggested companions, and Docker image.

To view a specific stack:

```bash
stackpilot info my-stack
```

To list all saved stacks:

```bash
stackpilot list
```

---

## Exporting and Importing Stacks

### Exporting

Export a saved stack to a portable YAML file:

```bash
stackpilot export my-stack --output my-stack.yaml
```

The exported file contains the full stack definition: technologies, versions, configuration, and metadata. Share it with teammates or store it in version control.

### Importing

Import a stack from a YAML file:

```bash
stackpilot import my-stack.yaml
```

The stack is validated against the current registry and saved to your local database. If any technology in the file is not present in your registry, the import will report the issue.

---

## Docker Runtime Management

StackPilot generates `docker-compose.yml` files for stacks that include databases and services. Manage the containers directly from the CLI.

### Start services

```bash
stackpilot up
```

Starts all Docker services defined in the stack's compose file. Runs in detached mode by default.

### Stop services

```bash
stackpilot down
```

Stops and removes the containers.

### Check status

```bash
stackpilot status
```

Shows the running state of each service (container name, image, status, ports).

### View logs

```bash
stackpilot logs
```

Streams logs from all services. Use `--service <name>` to filter to a specific service.

---

## System Doctor

The `doctor` command checks that your system has the required tools installed and properly configured:

```bash
stackpilot doctor
```

It verifies:

- Node.js version (>= 22)
- pnpm availability
- Docker daemon running
- Docker Compose available
- Git installed
- Language runtimes relevant to your saved stacks (Python, Go, Rust, etc.)

Each check reports a pass/fail status with actionable guidance when something is missing.

---

## Configuration and Preferences

View your current configuration:

```bash
stackpilot config
```

Modify preferences:

```bash
stackpilot config set <key> <value>
```

Available configuration options include:

- **defaultRuntime** -- Runtime to pre-select during `init` (e.g., `nodejs`, `python`)
- **defaultDatabase** -- Database to pre-select during `init` (e.g., `postgresql`)
- **scaffoldDirectory** -- Base directory for scaffolded projects (default: current directory)
- **dockerComposeCommand** -- Override the compose command (default: `docker compose`)

Preferences are stored locally in your home directory and persist across sessions.

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
