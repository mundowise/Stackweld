# Stackweld Roadmap

## v0.1.0 — Foundation (Released 2026-03-28)

- Technology registry with 83 technologies across 9 categories
- Rules engine with BFS validation, incompatibility detection, dependency resolution
- Stack engine with SQLite persistence and version control
- Scaffold orchestrator using official CLI tools
- Docker Compose generation for databases and services
- Runtime manager: up, down, status, logs
- 23 CLI commands, 20 built-in templates
- Desktop app: Tauri 2 + React 19 + visual stack builder

## v0.2.0 — Analysis & Intelligence (Released 2026-03-30)

- Compatibility scoring engine (0-100 scores with grade S/A/B/C/D/F)
- Stack detection from existing projects
- Performance profiling and cost estimation
- Environment sync and health checks
- Infrastructure as Code generation (VPS, AWS, GCP)
- Migration planner between technologies
- Stack sharing via base64-encoded URLs
- Team standards linting (`.stackweldrc`)
- Plugin system for community extensions
- 14 new engine modules, expanded to 38 CLI commands

## v0.3.0 — Interactive Generation (Released 2026-03-31)

- Interactive `stackweld init` wizard with step-by-step flow
- ASCII art banner on CLI startup
- Updated shell completions for all 38 commands
- npm package protection via `.npmignore`

## v0.3.1 — Security Hardening (Current Release, 2026-04-02)

- All shell commands migrated to `execFileSync` (prevents command injection)
- Scaffold command allowlist validation
- Cryptographically secure secrets in generated `.env.example` files
- Vulnerable dependency fixes (`@anthropic-ai/sdk`, `picomatch`)
- CI pipeline: build + lint + typecheck + test
- Automated npm publish in release workflow
- Content-Security-Policy on landing page
- Documentation accuracy pass

## v0.4.0 — Planned

- End-to-end tests for CLI command handlers
- Desktop app test suite (Zustand store, Tauri bridge, React pages)
- Expanded template library (10+ new templates)
- `stackweld doctor --fix` with safe auto-remediation
- `--dry-run` support across all scaffold commands
- Project profiles: rapid, standard, production, enterprise, lightweight

## v0.5.0 — Future

- AI utilities: `stackweld ai suggest`, `ai readme`, `ai explain`
- Custom user templates (`stackweld template save/use`)
- Expanded registry: 100+ deeply modeled technologies
- Evaluate demand for web dashboard, cloud sync, marketplace
