# Changelog

All notable changes to Stackweld will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-03-30

### Added — Phase 1: Analysis & Intelligence
- Compatibility scoring engine: `stackweld score <techA> [techB]` returns a 0-100 compatibility score between technologies
- Stack detection: `stackweld analyze [path]` detects the technology stack of an existing project by inspecting package.json, requirements.txt, go.mod, Cargo.toml, docker-compose.yml, etc.
- Performance profiling: `stackweld benchmark <id>` generates a performance profile for a stack (cold start, memory, build time estimates)
- Cost estimation: `stackweld cost <id>` estimates monthly hosting costs across providers (VPS, AWS, GCP)

### Added — Phase 2: Environment & Health
- Environment sync: `stackweld env sync` synchronizes .env.example with .env, `stackweld env check` detects dangerous values (hardcoded secrets, default passwords)
- Project health check: `stackweld health [path]` audits a project for common issues (exposed secrets, missing .gitignore entries, TypeScript strict mode disabled, outdated dependencies)

### Added — Phase 3: Scaffolding & Infrastructure
- Compose preview: `stackweld preview <id>` renders docker-compose.yml to stdout without writing files
- Infrastructure as Code: `stackweld deploy <id> --target <vps|aws|gcp>` generates deployment configurations (Dockerfile + nginx for VPS, CloudFormation for AWS, Terraform for GCP)

### Added — Phase 4: Migration & Learning
- Migration planner: `stackweld migrate --from <tech> --to <tech>` generates a step-by-step migration plan with code examples
- Learning resources: `stackweld learn <technology>` curates official docs, tutorials, and recommended courses for a technology

### Added — Phase 5: Collaboration & Sharing
- Stack sharing: `stackweld share <id>` serializes a stack into a base64-encoded URL that can be shared without any cloud service
- Stack import from URL: `stackweld import-url <url>` reconstructs a stack from a shared URL
- Stack comparison: `stackweld compare <a> <b>` shows a side-by-side diff of two stacks (technologies added, removed, changed)
- Team standards: `stackweld lint` validates the current stack against rules defined in `.stackweldrc` (required technologies, banned technologies, version constraints)

### Added — Phase 6: Extensibility
- Plugin system: `stackweld plugin list|install|remove|info` manages community plugins that extend Stackweld with custom commands, templates, and technology definitions

### Added — Core Engine Modules (14 new)
- `engine/compatibility.ts` — scoreCompatibility(), scoreStack()
- `engine/env-sync.ts` — syncEnv(), checkDangerous()
- `engine/detect.ts` — detectStack()
- `engine/compose-preview.ts` — generateComposePreview()
- `engine/health.ts` — checkProjectHealth()
- `engine/migration.ts` — planMigration()
- `engine/diff.ts` — diffStacks()
- `engine/share.ts` — serializeStack(), deserializeStack()
- `engine/infra.ts` — generateInfra()
- `engine/lint.ts` — lintStack()
- `engine/benchmark.ts` — profilePerformance()
- `engine/cost.ts` — estimateCost()
- `engine/learn.ts` — getResources()
- `engine/plugin.ts` — listPlugins(), installPlugin(), removePlugin()

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
