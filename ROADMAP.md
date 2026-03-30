# Stackweld Roadmap

## v0.1 — Foundation (Completed)

### Phase 1: Core Engine
- Technology registry with 83 technologies across 9 categories (YAML definitions + JSON Schema validation)
- Rules engine with BFS validation, incompatibility detection, dependency auto-resolution, and port assignment
- Stack engine with SQLite persistence (create, list, info, delete, clone, export/import)
- Version control system: save snapshots, diff versions, rollback

### Phase 2: Scaffold & Runtime
- Scaffold orchestrator using official CLI tools (create-next-app, django-admin, etc.)
- Full-stack detection: separate frontend/ + backend/ directories with per-project configs
- Per-technology installer: ORMs with schema, auth with routes, styling with configs, devops with pipelines
- Docker Compose generation for databases and services (not runtimes)
- Config file generation: Makefile, CI workflow, .devcontainer, .gitignore, README
- Runtime manager: up, down, status, logs commands wrapping Docker Compose

### Phase 3: CLI & Templates
- 23 CLI commands covering the full workflow (Commander + Inquirer + Chalk + Ora)
- 20 built-in templates (T3 Stack, SaaS Starter, FastAPI + React, Go Microservice, etc.)
- Custom template support: save your stacks as reusable templates
- Shell completion generation (bash, zsh, fish)
- User preferences via `config` command

### Phase 4: Desktop Application
- Tauri 2 + React 19 + TypeScript + Tailwind CSS 4 + Zustand
- Dashboard with technology overview, saved stacks, templates, and category stats
- Visual stack builder with real-time validation, incompatibility warnings, and native folder picker
- Technology catalog browser with category filters and search
- Runtime panel for Docker service management
- Settings page with system information and preferences

## v0.1.1 — Current Release

### Phase 5: AI Utilities (In Progress)
- `ai suggest` — natural language stack suggestions
- `ai readme` — generate project README from stack definition
- `ai explain` — explain stack architecture decisions
- AI assistant panel in the desktop app

## v0.2 — Planned

- **More technologies**: Expand beyond 83 to cover emerging tools and frameworks
- **Plugin system**: Allow community-contributed technology definitions and templates
- **Web dashboard**: Browser-based interface as an alternative to the desktop app
- **Cloud sync**: Sync stacks and templates across machines
- **Team features**: Shared templates and stack standards for teams
