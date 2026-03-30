# Stackweld v0.2 — Feature Implementation Plan

## 15 Features — 5 Phases

---

## Phase 1: Core Intelligence (Week 1-2)
> Make Stackweld smarter about what it already knows.

### F01 — Compatibility Score (0-100)
- **CLI**: `stackweld score <techA> <techB>` → shows compatibility score
- **Desktop**: Score badge on each tech in Builder when selecting
- **Core**: New `compatibility-scorer.ts` in engine — calculates based on: shared runtime (+20), suggested pairing (+15), same category (-30), incompatible (-100), neutral (0)
- **Registry**: Add `compatibilityNotes` field to YAML for nuanced scores
- **Files**: core/engine/compatibility-scorer.ts, cli/commands/score.ts, registry schema update

### F02 — Environment Sync
- **CLI**: `stackweld env sync` — compares .env.example vs .env
- **CLI**: `stackweld env check` — warns about default/dangerous values
- **Core**: New `env-analyzer.ts` — parses .env files, detects patterns (SECRET_KEY=change-me, password=postgres)
- **Files**: core/engine/env-analyzer.ts, cli/commands/env.ts

### F03 — Boilerplate Detection
- **CLI**: `stackweld analyze .` — scans existing project, detects stack
- **Core**: New `stack-detector.ts` — reads package.json, requirements.txt, go.mod, Cargo.toml, docker-compose.yml, Dockerfile
- **Output**: Generates a StackDefinition from detected technologies
- **Files**: core/engine/stack-detector.ts, cli/commands/analyze.ts

---

## Phase 2: Enhanced Scaffolding (Week 3-4)
> Generate better, more complete projects.

### F04 — Monorepo Scaffolding
- **Core**: Detect when frontend + backend selected → offer monorepo structure
- **Scaffold**: Generate Turborepo/pnpm workspace config, shared packages
- **Templates**: New "monorepo" profile option alongside rapid/standard/production
- **Files**: core/engine/scaffold-orchestrator.ts (extend), templates/monorepo-*.ts

### F05 — Live Docker Compose Preview
- **Desktop**: Real-time preview panel in BuilderPage showing generated docker-compose.yml
- **Core**: Extract compose generation into a pure function (no disk I/O)
- **Files**: core/engine/compose-generator.ts (extract), desktop/components/builder/ComposePreview.tsx

### F06 — Infrastructure as Code Generation
- **CLI**: `stackweld deploy --target aws|gcp|vps`
- **Core**: New `infra-generator.ts` — generates Dockerfile, nginx.conf, Terraform/docker-compose for prod
- **Templates**: Deploy templates per target (AWS ECS, GCP Cloud Run, VPS with Docker)
- **Files**: core/engine/infra-generator.ts, cli/commands/deploy.ts, templates/deploy/

---

## Phase 3: Developer Experience (Week 5-6)
> Make Stackweld indispensable in daily workflow.

### F07 — Stack Health Monitor
- **CLI**: `stackweld health` — checks deps, vulnerabilities, outdated versions
- **Core**: New `health-checker.ts` — runs npm audit, pip audit, cargo audit, checks Docker image tags
- **Output**: Health report with severity levels (critical, high, medium, low)
- **Files**: core/engine/health-checker.ts, cli/commands/health.ts

### F08 — Migration Assistant
- **CLI**: `stackweld migrate --from express --to fastify`
- **Core**: New `migration-planner.ts` — generates step-by-step migration plan
- **Registry**: Add `migratesTo` and `migratesFrom` fields with instructions
- **Files**: core/engine/migration-planner.ts, cli/commands/migrate.ts, registry schema update

### F09 — Learning Paths
- **CLI**: `stackweld learn <technology>`
- **Registry**: Add `learningResources` field to YAML (official docs, tutorials, videos)
- **Desktop**: Learning tab in CatalogPage for each technology
- **Files**: cli/commands/learn.ts, registry schema + all 83 YAML updates

---

## Phase 4: Collaboration (Week 7-8)
> Make Stackweld work for teams.

### F10 — Stack Sharing (URL-based, no cloud)
- **CLI**: `stackweld share <id>` → generates URL with compressed stack in hash
- **CLI**: `stackweld import <url>` → imports from URL
- **Core**: New `stack-serializer.ts` — compress/decompress stack to/from base64url
- **Files**: core/engine/stack-serializer.ts, cli/commands/share.ts

### F11 — Stack Comparison
- **CLI**: `stackweld compare <stackA> <stackB>`
- **Core**: New `stack-differ.ts` — diffs technologies, ports, configs
- **Output**: Side-by-side comparison with added/removed/changed highlights
- **Files**: core/engine/stack-differ.ts, cli/commands/compare.ts

### F12 — Team Stack Standards
- **CLI**: `stackweld lint` — validates project against .stackweldrc
- **Config**: `.stackweldrc` file format — allowed techs, min versions, required profile
- **Core**: New `standards-linter.ts` — reads .stackweldrc and validates
- **Files**: core/engine/standards-linter.ts, cli/commands/lint.ts

---

## Phase 5: Intelligence & Insights (Week 9-10)
> Make Stackweld the smartest tool in the room.

### F13 — Performance Profiles
- **Registry**: Add `benchmarks` field to YAML — req/s, latency, memory for common combos
- **CLI**: `stackweld benchmark <stackId>` → shows expected performance
- **Desktop**: Performance tab in StackDetailPage
- **Files**: registry schema update, cli/commands/benchmark.ts

### F14 — Cost Estimator
- **CLI**: `stackweld cost <stackId>` → estimates monthly cost
- **Core**: New `cost-estimator.ts` — maps technologies to cloud pricing
- **Registry**: Add `pricing` field to services/databases (free tier, per-unit cost)
- **Files**: core/engine/cost-estimator.ts, cli/commands/cost.ts

### F15 — Plugin System
- **CLI**: `stackweld plugin install <name>`, `stackweld plugin list`
- **Core**: Plugin loader that reads from ~/.stackweld/plugins/
- **Format**: Plugins are npm packages with a stackweld.plugin.json manifest
- **Files**: core/engine/plugin-loader.ts, cli/commands/plugin.ts

---

## Implementation Priority Matrix

| # | Feature | Impact | Effort | Priority |
|---|---------|--------|--------|----------|
| F01 | Compatibility Score | HIGH | LOW | P0 |
| F02 | Environment Sync | HIGH | LOW | P0 |
| F03 | Boilerplate Detection | HIGH | MEDIUM | P0 |
| F05 | Compose Preview | MEDIUM | LOW | P1 |
| F07 | Health Monitor | HIGH | MEDIUM | P1 |
| F10 | Stack Sharing | HIGH | LOW | P1 |
| F11 | Stack Comparison | MEDIUM | LOW | P1 |
| F04 | Monorepo Scaffolding | MEDIUM | HIGH | P2 |
| F06 | IaC Generation | HIGH | HIGH | P2 |
| F08 | Migration Assistant | MEDIUM | HIGH | P2 |
| F09 | Learning Paths | MEDIUM | MEDIUM | P2 |
| F12 | Team Standards | MEDIUM | MEDIUM | P2 |
| F13 | Performance Profiles | LOW | MEDIUM | P3 |
| F14 | Cost Estimator | LOW | MEDIUM | P3 |
| F15 | Plugin System | HIGH | HIGH | P3 |

---

## Success Metrics

- **v0.2.0**: F01-F03 (Core Intelligence) — 3 new commands, smarter engine
- **v0.3.0**: F04-F06 (Enhanced Scaffolding) — production-ready output
- **v0.4.0**: F07-F09 (DX) — daily workflow tool
- **v0.5.0**: F10-F12 (Collaboration) — team adoption
- **v1.0.0**: F13-F15 (Intelligence) — full platform
