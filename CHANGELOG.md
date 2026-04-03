# Changelog

All notable changes to Stackweld will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2026-04-02

### Security
- All shell execution migrated from `execSync` to `execFileSync` — prevents command injection in scaffold, runtime, and git operations
- Scaffold command allowlist: only trusted binaries (`npx`, `npm`, `pnpm`, `cargo`, `go`, `python3`, etc.) are executed
- Input validation: project names, service names, and paths validated with strict regex before use
- Cryptographically secure secrets generated via `crypto.randomBytes` for all `.env.example` files — replaces weak defaults (`postgres`, `root`, `change-me`)
- Bumped `@anthropic-ai/sdk` from `^0.80.0` to `^0.81.0` (fixes CVE GHSA-5474-4w2j-mq4c path traversal)
- Added `picomatch >=4.0.4` override (fixes CVE GHSA-c2c7-rcm5-vvqj ReDoS)
- Added `Content-Security-Policy` meta tag to landing page

### Changed
- CI pipeline now runs: build → lint → typecheck → test (previously missing lint and typecheck)
- Release workflow now publishes all 4 packages to npm automatically
- Turbo `typecheck` task now depends on `^build` for correct workspace resolution
- Biome config: `noNonNullAssertion`, `noExplicitAny`, `noControlCharactersInRegex` set to warn level

### Fixed
- CHANGELOG engine module names corrected to match actual filenames
- ROADMAP.md rewritten to reflect actual release history (was stuck at v0.1.1)
- SECURITY.md supported versions updated to 0.3.x
- GitHub URLs corrected in user-guide.md, CONTRIBUTING.md (was using old org name)
- Architecture docs version stamp and module paths corrected
- Removed stale `package-lock.json` from desktop package
- Removed duplicate nested `packages/desktop/packages/` directory
- Automated `registry-data.ts` generation in desktop prebuild step

---

## [0.3.0] - 2026-03-31

### Added
- Interactive project generation: `stackweld init` now walks through a full step-by-step wizard for stack name, profile, technologies, output path, and git initialization
- ASCII art banner on CLI startup
- Updated shell completions covering all 38 commands (`stackweld completion bash|zsh|fish`)

### Changed
- Version sync: all packages (`@stackweld/core`, `@stackweld/registry`, `@stackweld/templates`, `@stackweld/cli`) bumped to 0.3.0
- npm package protection via `.npmignore` (excludes `src/`, test files, config files, and workspace artifacts from published package)

### Fixed
- Security: removed internal paths from error messages exposed to CLI output
- Shell completion entries updated to match the current 38-command surface

---

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
- `engine/compatibility-scorer.ts` — scoreCompatibility(), scoreStack()
- `engine/env-analyzer.ts` — syncEnv(), checkDangerous()
- `engine/stack-detector.ts` — detectStack()
- `engine/compose-generator.ts` — generateComposePreview()
- `engine/health-checker.ts` — checkProjectHealth()
- `engine/migration-planner.ts` — planMigration()
- `engine/stack-differ.ts` — diffStacks()
- `engine/stack-serializer.ts` — serializeStack(), deserializeStack()
- `engine/infra-generator.ts` — generateInfra()
- `engine/standards-linter.ts` — lintStack()
- `engine/performance-profiler.ts` — profilePerformance()
- `engine/cost-estimator.ts` — estimateCost()
- `engine/learning-resources.ts` — getResources() (in registry)
- `engine/plugin-loader.ts` — listPlugins(), installPlugin(), removePlugin()

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
