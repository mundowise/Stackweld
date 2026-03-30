# Changelog

All notable changes to StackPilot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-03-29

### Fixed
- Registry: Bidirectional incompatibilities between all frontend frameworks (react/vue/svelte/angular mutually exclusive)
- Registry: Full-stack frameworks (nextjs/nuxt/sveltekit/remix/astro) mutually exclusive
- Registry: Hono incompatibility with express/fastify/nestjs
- Registry: htmx no longer incorrectly requires Node.js
- Registry: RabbitMQ docker image updated to 4-management
- Registry: Express/Fastify/NestJS symmetric incompatibility with Hono
- Core: Rules engine now resolves dependencies recursively (BFS)
- Core: Incompatibility checking is bidirectional
- Core: Port assignment is deterministic (alphabetical order)
- Core: Improved error messages with technology names
- Scaffold: Creates all required directories (src/, tests/, frontend/, backend/)
- Scaffold: Expanded .gitignore with framework-specific patterns
- Scaffold: Docker compose env values properly quoted in YAML
- Scaffold: README stack table includes Port column

### Added
- CLI: Rich formatting toolkit (banners, tables, boxes, progress bars, icons)
- CLI: Doctor command checks 11 tools with install suggestions
- CLI: Init wizard with step indicators (1/5 through 5/5)
- CLI: Generate command with input validation and progress spinners
- CLI: Branded banner on startup
- CLI: Error handling for all engine initializers
- CLI: Docker availability check in runtime commands

### Changed
- CLI: All commands produce visually polished output with consistent formatting
- Biome config updated for v2.x compatibility

## [0.1.0] - 2026-03-28

### Added
- Initial release
- 83 technology definitions across 9 categories
- 20 pre-built stack templates
- Rules engine with compatibility validation
- Stack engine with SQLite persistence
- Scaffold orchestrator with Docker Compose generation
- Runtime manager for Docker lifecycle
- 23 CLI commands via Commander.js
- Desktop app (Tauri 2 + React 19)
- AI features via Anthropic SDK
- CI/CD with GitHub Actions
- Comprehensive documentation
