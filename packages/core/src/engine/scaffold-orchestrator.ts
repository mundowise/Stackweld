/**
 * Scaffold Orchestrator — Generates project files from a stack definition.
 * Delegates to official CLI tools when available, fills the gaps with:
 * - docker-compose.yml
 * - .env.example
 * - README.md
 * - .gitignore (combined)
 * - devcontainer.json
 */

import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import type { StackDefinition, Technology } from "../types/index.js";

const WEAK_SECRETS = new Set([
  "postgres",
  "root",
  "admin",
  "password",
  "secret",
  "change-me",
  "change-me-in-production",
  "minioadmin",
  "mariadb",
]);

function securifyEnvValue(key: string, value: string, projectName: string): string {
  const lower = key.toLowerCase();
  if (WEAK_SECRETS.has(value)) {
    if (lower.includes("user") || lower.includes("username") || lower.includes("email")) {
      return value; // usernames are fine as defaults
    }
    return randomBytes(20).toString("base64url");
  }
  // Replace weak passwords inside DATABASE_URL strings
  if (
    lower.includes("url") &&
    (value.includes("postgres:postgres") ||
      value.includes("root:root") ||
      value.includes("admin:admin"))
  ) {
    const securePass = randomBytes(20).toString("base64url");
    return value
      .replace(/postgres:postgres/g, `postgres:${securePass}`)
      .replace(/root:root/g, `root:${securePass}`)
      .replace(/admin:admin/g, `admin:${securePass}`)
      .replace(/\/app/g, `/${projectName.replace(/[^a-zA-Z0-9_]/g, "_")}`);
  }
  return value;
}

export interface ScaffoldOutput {
  dockerCompose: string | null;
  envExample: string;
  readme: string;
  gitignore: string;
  devcontainer: string;
  devScript: string;
  setupScript: string;
  makefile: string;
  vscodeSettings: string;
  ciWorkflow: string;
  scaffoldCommands: Array<{ name: string; command: string }>;
  directories: string[];
}

export class ScaffoldOrchestrator {
  private technologies: Map<string, Technology>;

  constructor(technologies: Technology[]) {
    this.technologies = new Map(technologies.map((t) => [t.id, t]));
  }

  /**
   * Generate all scaffold files for a stack.
   */
  generate(stack: StackDefinition): ScaffoldOutput {
    const techs = stack.technologies
      .map((st) => this.technologies.get(st.technologyId))
      .filter((t): t is Technology => t != null);

    const dockerServices = techs.filter(
      (t) => t.dockerImage && (t.category === "database" || t.category === "service"),
    );

    return {
      dockerCompose: dockerServices.length > 0 ? this.generateDockerCompose(stack, techs) : null,
      envExample: this.generateEnvExample(stack, techs),
      readme: this.generateReadme(stack, techs),
      gitignore: this.generateGitignore(techs),
      devcontainer: this.generateDevcontainer(stack, techs),
      devScript: this.generateDevScript(stack, techs),
      setupScript: this.generateSetupScript(stack, techs),
      makefile: this.generateMakefile(stack, techs),
      vscodeSettings: this.generateVscodeSettings(techs),
      ciWorkflow: this.generateCiWorkflow(stack, techs),
      scaffoldCommands: this.getScaffoldCommands(stack, techs),
      directories: this.getRequiredDirectories(techs),
    };
  }

  /**
   * Generate docker-compose.yml from stack technologies.
   */
  generateDockerCompose(stack: StackDefinition, techs: Technology[]): string {
    const lines: string[] = ["services:"];
    const volumes: string[] = [];

    // Only containerize databases and services — runtimes run locally
    const containerizable = ["database", "service"];
    for (const tech of techs) {
      if (!tech.dockerImage || !containerizable.includes(tech.category)) continue;

      const stackTech = stack.technologies.find((st) => st.technologyId === tech.id);
      const port = stackTech?.port ?? tech.defaultPort;

      lines.push(`  ${tech.id}:`);
      lines.push(`    image: ${tech.dockerImage}`);
      lines.push("    restart: unless-stopped");

      // Ports
      if (port) {
        lines.push("    ports:");
        lines.push(`      - "${port}:${port}"`);
      }

      // Environment variables
      const envVars = Object.entries(tech.envVars);
      if (envVars.length > 0) {
        lines.push("    environment:");
        for (const [key, value] of envVars) {
          lines.push(`      ${key}: "${value}"`);
        }
      }

      // Health check
      if (tech.healthCheck) {
        lines.push("    healthcheck:");
        if (tech.healthCheck.command) {
          lines.push(`      test: ["CMD-SHELL", "${tech.healthCheck.command}"]`);
        } else if (tech.healthCheck.endpoint) {
          lines.push(`      test: ["CMD-SHELL", "curl -f ${tech.healthCheck.endpoint} || exit 1"]`);
        }
        if (tech.healthCheck.interval) {
          lines.push(`      interval: ${tech.healthCheck.interval}`);
        }
        if (tech.healthCheck.timeout) {
          lines.push(`      timeout: ${tech.healthCheck.timeout}`);
        }
        if (tech.healthCheck.retries) {
          lines.push(`      retries: ${tech.healthCheck.retries}`);
        }
      }

      // Volumes for databases
      if (tech.category === "database") {
        const volName = `${tech.id}_data`;
        const mountPath = this.getDataMount(tech.id);
        if (mountPath) {
          lines.push("    volumes:");
          lines.push(`      - ${volName}:${mountPath}`);
          volumes.push(volName);
        }
      }

      lines.push("");
    }

    // Named volumes
    if (volumes.length > 0) {
      lines.push("volumes:");
      for (const vol of volumes) {
        lines.push(`  ${vol}:`);
      }
    }

    return `${lines.join("\n")}\n`;
  }

  /**
   * Generate .env.example from all technologies' envVars.
   */
  generateEnvExample(stack: StackDefinition, techs: Technology[]): string {
    const projectName = stack.name.replace(/\s+/g, "-").toLowerCase();
    const lines: string[] = [
      `# ${stack.name} — Environment Variables`,
      `# Generated by Stackweld — rotate secrets before production`,
      "",
    ];

    const seen = new Set<string>();

    for (const tech of techs) {
      const entries = Object.entries(tech.envVars);
      if (entries.length === 0) continue;

      lines.push(`# ${tech.name}`);
      for (const [key, value] of entries) {
        if (!seen.has(key)) {
          const secureValue = securifyEnvValue(key, value, projectName);
          lines.push(`${key}=${secureValue}`);
          seen.add(key);
        }
      }
      lines.push("");
    }

    return lines.join("\n");
  }

  /**
   * Generate README.md for the project.
   */
  generateReadme(stack: StackDefinition, techs: Technology[]): string {
    const lines: string[] = [
      `# ${stack.name}`,
      "",
      stack.description || "A project generated by Stackweld.",
      "",
      "## Stack",
      "",
      "| Technology | Version | Category | Port |",
      "|------------|---------|----------|------|",
    ];

    for (const st of stack.technologies) {
      const tech = this.technologies.get(st.technologyId);
      if (tech) {
        const port = st.port ?? tech.defaultPort ?? "—";
        lines.push(`| ${tech.name} | ${st.version} | ${tech.category} | ${port} |`);
      }
    }

    lines.push("");
    lines.push("## Getting Started");
    lines.push("");
    lines.push("```bash");
    lines.push("# Copy environment variables");
    lines.push("cp .env.example .env");
    lines.push("");

    const dockerTechs = techs.filter(
      (t) => t.dockerImage && (t.category === "database" || t.category === "service"),
    );
    if (dockerTechs.length > 0) {
      lines.push("# Start services");
      lines.push("docker compose up -d");
      lines.push("");
    }

    const scaffoldCmds = this.getScaffoldCommands(stack, techs);
    if (scaffoldCmds.length > 0) {
      lines.push("# Install dependencies");
      for (const cmd of scaffoldCmds) {
        lines.push(`# ${cmd.name}`);
        lines.push(cmd.command);
      }
    }

    lines.push("```");
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push(
      `*Generated by [Stackweld](https://github.com/stackweld) — Profile: ${stack.profile}*`,
    );

    return `${lines.join("\n")}\n`;
  }

  /**
   * Generate combined .gitignore for all technologies.
   */
  generateGitignore(techs: Technology[]): string {
    const patterns = new Set<string>();

    // Always include — universal patterns
    patterns.add("node_modules/");
    patterns.add(".env");
    patterns.add(".env.local");
    patterns.add(".env.*.local");
    patterns.add("dist/");
    patterns.add("build/");
    patterns.add(".DS_Store");
    patterns.add("Thumbs.db");
    patterns.add("*.log");
    patterns.add("*.pid");
    patterns.add("*.seed");
    patterns.add("coverage/");
    patterns.add(".cache/");
    patterns.add("tmp/");
    patterns.add(".tmp/");

    for (const tech of techs) {
      switch (tech.category) {
        case "runtime":
          if (tech.id === "nodejs" || tech.id === "bun") {
            patterns.add("node_modules/");
            patterns.add(".next/");
            patterns.add(".nuxt/");
            patterns.add(".output/");
            patterns.add(".turbo/");
            patterns.add(".vercel/");
            patterns.add(".npm/");
            patterns.add("*.tsbuildinfo");
          }
          if (tech.id === "bun") {
            patterns.add("bun.lockb");
          }
          if (tech.id === "python") {
            patterns.add("__pycache__/");
            patterns.add("*.pyc");
            patterns.add("*.pyo");
            patterns.add(".venv/");
            patterns.add("venv/");
            patterns.add("*.egg-info/");
            patterns.add(".mypy_cache/");
            patterns.add(".ruff_cache/");
            patterns.add(".pytest_cache/");
            patterns.add("htmlcov/");
          }
          if (tech.id === "go") {
            patterns.add("/vendor/");
            patterns.add("*.exe");
            patterns.add("bin/");
          }
          if (tech.id === "rust") {
            patterns.add("target/");
            patterns.add("Cargo.lock");
          }
          if (tech.id === "deno") {
            patterns.add(".deno/");
          }
          break;
        case "database":
          patterns.add("*.db");
          patterns.add("*.sqlite");
          patterns.add("*.sqlite3");
          break;
        case "devops":
          if (tech.id === "docker") {
            patterns.add(".docker/");
          }
          if (tech.id === "storybook") {
            patterns.add("storybook-static/");
          }
          break;
        case "frontend":
          if (tech.id === "nextjs") {
            patterns.add(".next/");
            patterns.add("out/");
          }
          if (tech.id === "nuxt") {
            patterns.add(".nuxt/");
            patterns.add(".output/");
          }
          if (tech.id === "astro") {
            patterns.add(".astro/");
          }
          if (tech.id === "sveltekit") {
            patterns.add(".svelte-kit/");
          }
          break;
        case "orm":
          if (tech.id === "prisma") {
            patterns.add("prisma/*.db");
            patterns.add("prisma/*.db-journal");
          }
          break;
      }
    }

    return `${[...patterns].sort().join("\n")}\n`;
  }

  /**
   * Generate devcontainer.json.
   */
  generateDevcontainer(stack: StackDefinition, techs: Technology[]): string {
    const features: Record<string, unknown> = {};
    const forwardPorts: number[] = [];

    for (const tech of techs) {
      const st = stack.technologies.find((s) => s.technologyId === tech.id);
      const port = st?.port ?? tech.defaultPort;
      if (port) forwardPorts.push(port);

      switch (tech.id) {
        case "nodejs":
          features["ghcr.io/devcontainers/features/node:1"] = {
            version: tech.defaultVersion,
          };
          break;
        case "python":
          features["ghcr.io/devcontainers/features/python:1"] = {
            version: tech.defaultVersion,
          };
          break;
        case "go":
          features["ghcr.io/devcontainers/features/go:1"] = {
            version: tech.defaultVersion,
          };
          break;
        case "rust":
          features["ghcr.io/devcontainers/features/rust:1"] = {
            version: tech.defaultVersion,
          };
          break;
        case "docker":
          features["ghcr.io/devcontainers/features/docker-in-docker:2"] = {};
          break;
      }
    }

    const hasDocker = techs.some((t) => t.dockerImage);

    const devcontainer: Record<string, unknown> = {
      name: stack.name,
      image: "mcr.microsoft.com/devcontainers/base:ubuntu",
      features,
      forwardPorts: [...new Set(forwardPorts)].sort((a, b) => a - b),
      postCreateCommand: "echo 'Stackweld devcontainer ready'",
    };

    if (hasDocker) {
      devcontainer.features = {
        ...features,
        "ghcr.io/devcontainers/features/docker-in-docker:2": {},
      };
    }

    return `${JSON.stringify(devcontainer, null, 2)}\n`;
  }

  /**
   * Get official scaffold commands for technologies that have them.
   */
  getScaffoldCommands(
    _stack: StackDefinition,
    techs: Technology[],
  ): Array<{ name: string; command: string }> {
    const commands: Array<{ name: string; command: string }> = [];

    for (const tech of techs) {
      if (tech.officialScaffold) {
        commands.push({
          name: `Initialize ${tech.name}`,
          command: tech.officialScaffold,
        });
      }
    }

    return commands;
  }

  /**
   * Initialize a Git repository in the project directory.
   * Creates .gitignore, makes initial commit if requested.
   */
  initGit(
    projectDir: string,
    stack: StackDefinition,
    initialCommit = true,
  ): { success: boolean; message: string } {
    try {
      execFileSync("git", ["init"], { cwd: projectDir, stdio: "pipe" });

      if (initialCommit) {
        execFileSync("git", ["add", "-A"], { cwd: projectDir, stdio: "pipe" });
        const msg = `Initial commit: ${stack.name} (${stack.profile})\n\nGenerated by Stackweld`;
        execFileSync("git", ["commit", "-m", msg], {
          cwd: projectDir,
          stdio: "pipe",
        });
      }

      return { success: true, message: "Git repository initialized" };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Git init failed",
      };
    }
  }

  /**
   * Generate scripts/dev.sh — starts docker services and dev server.
   */
  generateDevScript(stack: StackDefinition, techs: Technology[]): string {
    const lines: string[] = [
      "#!/usr/bin/env bash",
      `# ${stack.name} — Development script`,
      "# Generated by Stackweld",
      "set -euo pipefail",
      "",
    ];

    const hasDockerServices = techs.some(
      (t) => t.dockerImage && (t.category === "database" || t.category === "service"),
    );
    if (hasDockerServices) {
      lines.push("echo '🐳 Starting Docker services...'");
      lines.push("docker compose up -d");
      lines.push("");
    }

    // Detect main framework dev command
    const devCmd = this.getDevCommand(techs);
    if (devCmd) {
      lines.push(`echo '🚀 Starting dev server...'`);
      lines.push(devCmd);
    } else {
      lines.push("echo '✅ Services ready.'");
    }

    lines.push("");
    return lines.join("\n");
  }

  /**
   * Generate scripts/setup.sh — first-time project setup.
   */
  generateSetupScript(stack: StackDefinition, techs: Technology[]): string {
    const lines: string[] = [
      "#!/usr/bin/env bash",
      `# ${stack.name} — First-time setup`,
      "# Generated by Stackweld",
      "set -euo pipefail",
      "",
      "# Copy environment variables if not present",
      "if [ ! -f .env ]; then",
      "  cp .env.example .env",
      '  echo "✅ .env created from .env.example"',
      "else",
      '  echo "ℹ️  .env already exists, skipping"',
      "fi",
      "",
    ];

    const hasDockerServices = techs.some(
      (t) => t.dockerImage && (t.category === "database" || t.category === "service"),
    );
    if (hasDockerServices) {
      lines.push("# Start Docker services");
      lines.push("echo '🐳 Starting Docker services...'");
      lines.push("docker compose up -d");
      lines.push("");
    }

    // Detect full-stack layout
    const hasFrontend = techs.some((t) => t.category === "frontend");
    const hasBackend = techs.some((t) => t.category === "backend");
    const isFullStack = hasFrontend && hasBackend;

    // Install commands based on runtime
    const hasNode = techs.some((t) => t.id === "nodejs" || t.id === "bun");
    const hasPython = techs.some((t) => t.id === "python");
    const hasGo = techs.some((t) => t.id === "go");
    const hasRust = techs.some((t) => t.id === "rust");
    const hasBun = techs.some((t) => t.id === "bun");

    if (isFullStack) {
      // Full-stack: install deps in subdirectories
      if (hasNode) {
        const installCmd = hasBun ? "bun install" : "npm install";
        lines.push("# Install frontend dependencies");
        lines.push(`echo '📦 Installing frontend dependencies...'`);
        lines.push(`cd frontend && ${installCmd} && cd ..`);
        lines.push("");
      }
      if (hasPython) {
        lines.push("# Install backend dependencies");
        lines.push(`echo '🐍 Setting up backend Python environment...'`);
        lines.push("cd backend && python3 -m venv .venv || true");
        lines.push("source .venv/bin/activate");
        lines.push(
          "pip install -r requirements.txt 2>/dev/null || echo 'No requirements.txt found'",
        );
        lines.push("cd ..");
        lines.push("");
      }
    } else {
      if (hasNode) {
        lines.push("# Install Node.js dependencies");
        const installCmd = hasBun ? "bun install" : "npm install";
        lines.push(`echo '📦 Installing dependencies...'`);
        lines.push(installCmd);
        lines.push("");
      }

      if (hasPython) {
        lines.push("# Install Python dependencies");
        lines.push(`echo '🐍 Setting up Python environment...'`);
        lines.push("python -m venv .venv || true");
        lines.push("source .venv/bin/activate");
        lines.push(
          "pip install -r requirements.txt 2>/dev/null || echo 'No requirements.txt found'",
        );
        lines.push("");
      }
    }

    if (hasGo) {
      lines.push("# Install Go dependencies");
      lines.push(`echo '🔧 Installing Go modules...'`);
      lines.push(isFullStack ? "cd backend && go mod download && cd .." : "go mod download");
      lines.push("");
    }

    if (hasRust) {
      lines.push("# Build Rust project");
      lines.push(`echo '🦀 Building Rust project...'`);
      lines.push(isFullStack ? "cd backend && cargo build && cd .." : "cargo build");
      lines.push("");
    }

    // Run migrations if ORM is present
    const hasOrm = techs.some((t) => t.category === "orm");
    if (hasOrm) {
      const hasPrisma = techs.some((t) => t.id === "prisma");
      const hasDrizzle = techs.some((t) => t.id === "drizzle");
      const hasSqlalchemy = techs.some((t) => t.id === "sqlalchemy");

      lines.push("# Run database migrations");
      lines.push(`echo '🗃️  Running migrations...'`);
      if (hasPrisma) {
        lines.push("npx prisma migrate dev");
      } else if (hasDrizzle) {
        lines.push("npx drizzle-kit push");
      } else if (hasSqlalchemy) {
        lines.push("alembic upgrade head 2>/dev/null || echo 'No Alembic config found'");
      }
      lines.push("");
    }

    lines.push("echo '✅ Setup complete!'");
    lines.push("");
    return lines.join("\n");
  }

  /**
   * Generate Makefile with common development targets.
   */
  generateMakefile(stack: StackDefinition, techs: Technology[]): string {
    const lines: string[] = [
      `# ${stack.name} — Makefile`,
      "# Generated by Stackweld",
      "",
      ".PHONY: dev up down logs status test setup clean",
      "",
    ];

    // dev target
    const hasFrontend = techs.some((t) => t.category === "frontend");
    const hasBackend = techs.some((t) => t.category === "backend");
    const isFullStack = hasFrontend && hasBackend;
    const devCmd = this.getDevCommand(techs);
    lines.push("dev:");
    if (
      techs.some((t) => t.dockerImage && (t.category === "database" || t.category === "service"))
    ) {
      lines.push("\tdocker compose up -d");
    }
    if (isFullStack) {
      const frontendDevCmd = this.getFrontendDevCommand(techs);
      const backendDevCmd = this.getBackendDevCommand(techs);
      if (frontendDevCmd) lines.push(`\tcd frontend && ${frontendDevCmd} &`);
      if (backendDevCmd) lines.push(`\tcd backend && ${backendDevCmd}`);
    } else {
      lines.push(`\t${devCmd || "echo 'No dev server configured'"}`);
    }
    lines.push("");

    // up / down / logs / status (docker)
    lines.push("up:");
    lines.push("\tdocker compose up -d");
    lines.push("");

    lines.push("down:");
    lines.push("\tdocker compose down");
    lines.push("");

    lines.push("logs:");
    lines.push("\tdocker compose logs -f");
    lines.push("");

    lines.push("status:");
    lines.push("\tdocker compose ps");
    lines.push("");

    // test target
    const testCmd = this.getTestCommand(techs);
    lines.push("test:");
    lines.push(`\t${testCmd}`);
    lines.push("");

    // setup target
    lines.push("setup:");
    lines.push("\tbash scripts/setup.sh");
    lines.push("");

    // clean target
    lines.push("clean:");
    lines.push("\tdocker compose down -v");
    const hasNode = techs.some((t) => t.id === "nodejs" || t.id === "bun");
    const hasPython = techs.some((t) => t.id === "python");
    if (hasNode) lines.push("\trm -rf node_modules dist .next .nuxt .output");
    if (hasPython) lines.push("\trm -rf .venv __pycache__");
    if (techs.some((t) => t.id === "rust")) lines.push("\tcargo clean");
    lines.push("");

    return lines.join("\n");
  }

  /**
   * Generate .vscode/settings.json with formatter and extensions.
   */
  generateVscodeSettings(techs: Technology[]): string {
    const settings: Record<string, unknown> = {};
    const recommendations: string[] = [];

    // Formatter detection
    const hasBiome = techs.some((t) => t.id === "biome");
    const hasPrettier = techs.some((t) => t.id === "prettier");
    const hasEslint = techs.some((t) => t.id === "eslint");
    const hasPython = techs.some((t) => t.id === "python");
    const hasGo = techs.some((t) => t.id === "go");
    const hasRust = techs.some((t) => t.id === "rust");
    const hasDocker = techs.some((t) => t.id === "docker" || t.dockerImage);
    const hasTailwind = techs.some((t) => t.id === "tailwindcss");
    const hasPrisma = techs.some((t) => t.id === "prisma");

    if (hasBiome) {
      settings["editor.defaultFormatter"] = "biomejs.biome";
      settings["editor.formatOnSave"] = true;
      recommendations.push("biomejs.biome");
    } else if (hasPrettier) {
      settings["editor.defaultFormatter"] = "esbenp.prettier-vscode";
      settings["editor.formatOnSave"] = true;
      recommendations.push("esbenp.prettier-vscode");
    }

    if (hasEslint) {
      settings["editor.codeActionsOnSave"] = {
        "source.fixAll.eslint": "explicit",
      };
      recommendations.push("dbaeumer.vscode-eslint");
    }

    if (hasPython) {
      settings["[python]"] = {
        "editor.defaultFormatter": "ms-python.black-formatter",
      };
      recommendations.push("ms-python.python");
      recommendations.push("ms-python.black-formatter");
    }

    if (hasGo) {
      settings["[go]"] = {
        "editor.defaultFormatter": "golang.go",
      };
      recommendations.push("golang.go");
    }

    if (hasRust) {
      recommendations.push("rust-lang.rust-analyzer");
    }

    if (hasDocker) {
      recommendations.push("ms-azuretools.vscode-docker");
    }

    if (hasTailwind) {
      recommendations.push("bradlc.vscode-tailwindcss");
    }

    if (hasPrisma) {
      recommendations.push("Prisma.prisma");
    }

    // Always recommend
    recommendations.push("EditorConfig.EditorConfig");

    const output: Record<string, unknown> = { ...settings };

    const _result = `${JSON.stringify(output, null, 2)}\n`;

    // We embed recommendations as a separate extensions.json-style comment
    // but since .vscode/settings.json doesn't support recommendations,
    // we'll return settings.json content and note the extensions
    // The extensions will be written to .vscode/extensions.json by the CLI
    return `${JSON.stringify(
      {
        ...output,
        "stackweld.recommendedExtensions": recommendations,
      },
      null,
      2,
    )}\n`;
  }

  /**
   * Generate .github/workflows/ci.yml for the user's project.
   */
  generateCiWorkflow(_stack: StackDefinition, techs: Technology[]): string {
    const lines: string[] = [
      `name: CI`,
      "",
      "on:",
      "  push:",
      "    branches: [main]",
      "  pull_request:",
      "    branches: [main]",
      "",
      "jobs:",
      "  ci:",
      "    runs-on: ubuntu-latest",
      "",
    ];

    // Services (databases for CI)
    const dbTechs = techs.filter((t) => t.category === "database" && t.dockerImage);
    if (dbTechs.length > 0) {
      lines.push("    services:");
      for (const db of dbTechs) {
        lines.push(`      ${db.id}:`);
        lines.push(`        image: ${db.dockerImage}`);
        const envEntries = Object.entries(db.envVars);
        if (envEntries.length > 0) {
          lines.push("        env:");
          for (const [key, value] of envEntries) {
            lines.push(`          ${key}: ${value}`);
          }
        }
        if (db.defaultPort) {
          lines.push("        ports:");
          lines.push(`          - ${db.defaultPort}:${db.defaultPort}`);
        }
        if (db.healthCheck) {
          lines.push("        options: >-");
          if (db.healthCheck.command) {
            lines.push(`          --health-cmd "${db.healthCheck.command}"`);
          }
          lines.push(`          --health-interval ${db.healthCheck.interval || "10s"}`);
          lines.push(`          --health-timeout ${db.healthCheck.timeout || "5s"}`);
          lines.push(`          --health-retries ${db.healthCheck.retries || 5}`);
        }
      }
      lines.push("");
    }

    lines.push("    steps:");
    lines.push("      - uses: actions/checkout@v4");
    lines.push("");

    // Setup runtime
    const hasNode = techs.some((t) => t.id === "nodejs");
    const hasBun = techs.some((t) => t.id === "bun");
    const hasPython = techs.some((t) => t.id === "python");
    const hasGo = techs.some((t) => t.id === "go");
    const hasRust = techs.some((t) => t.id === "rust");

    if (hasNode || hasBun) {
      const nodeVersion = techs.find((t) => t.id === "nodejs")?.defaultVersion || "22";
      lines.push("      - uses: actions/setup-node@v4");
      lines.push("        with:");
      lines.push(`          node-version: "${nodeVersion}"`);
      lines.push("");
    }

    if (hasBun) {
      lines.push("      - uses: oven-sh/setup-bun@v2");
      lines.push("");
    }

    if (hasPython) {
      const pyVersion = techs.find((t) => t.id === "python")?.defaultVersion || "3.12";
      lines.push("      - uses: actions/setup-python@v5");
      lines.push("        with:");
      lines.push(`          python-version: "${pyVersion}"`);
      lines.push("");
    }

    if (hasGo) {
      const goVersion = techs.find((t) => t.id === "go")?.defaultVersion || "1.22";
      lines.push("      - uses: actions/setup-go@v5");
      lines.push("        with:");
      lines.push(`          go-version: "${goVersion}"`);
      lines.push("");
    }

    if (hasRust) {
      lines.push("      - uses: dtolnay/rust-toolchain@stable");
      lines.push("");
    }

    // Install dependencies
    if (hasNode || hasBun) {
      const installCmd = hasBun ? "bun install" : "npm ci";
      lines.push(`      - name: Install dependencies`);
      lines.push(`        run: ${installCmd}`);
      lines.push("");
    }

    if (hasPython) {
      lines.push("      - name: Install dependencies");
      lines.push("        run: pip install -r requirements.txt");
      lines.push("");
    }

    if (hasGo) {
      lines.push("      - name: Download modules");
      lines.push("        run: go mod download");
      lines.push("");
    }

    // Lint step
    const hasBiome = techs.some((t) => t.id === "biome");
    const hasEslint = techs.some((t) => t.id === "eslint");

    if (hasBiome) {
      lines.push("      - name: Lint");
      lines.push("        run: npx biome check .");
      lines.push("");
    } else if (hasEslint) {
      lines.push("      - name: Lint");
      lines.push("        run: npx eslint .");
      lines.push("");
    } else if (hasGo) {
      lines.push("      - name: Lint");
      lines.push("        run: go vet ./...");
      lines.push("");
    } else if (hasRust) {
      lines.push("      - name: Lint");
      lines.push("        run: cargo clippy -- -D warnings");
      lines.push("");
    }

    // Test step
    const testCmd = this.getTestCommand(techs);
    lines.push("      - name: Test");
    lines.push(`        run: ${testCmd}`);
    lines.push("");

    // Build step
    const buildCmd = this.getBuildCommand(techs);
    if (buildCmd) {
      lines.push("      - name: Build");
      lines.push(`        run: ${buildCmd}`);
      lines.push("");
    }

    return lines.join("\n");
  }

  /**
   * Determine all directories that should be created during scaffolding.
   * Ensures frontend/, backend/, scripts/, .vscode/, .devcontainer/,
   * .github/workflows/, src/, and tests/ directories are included as needed.
   */
  getRequiredDirectories(techs: Technology[]): string[] {
    const dirs = new Set<string>();

    // Always create these
    dirs.add("scripts");
    dirs.add(".vscode");
    dirs.add(".devcontainer");
    dirs.add(".github/workflows");

    const hasFrontend = techs.some((t) => t.category === "frontend");
    const hasBackend = techs.some((t) => t.category === "backend");
    const isFullStack = hasFrontend && hasBackend;

    if (isFullStack) {
      // Full-stack layout: frontend/ and backend/ directories
      dirs.add("frontend");
      dirs.add("frontend/src");
      dirs.add("frontend/tests");
      dirs.add("backend");
      dirs.add("backend/src");
      dirs.add("backend/tests");
    } else {
      // Single-app layout: src/ and tests/ at root
      dirs.add("src");
      dirs.add("tests");

      if (hasFrontend) {
        dirs.add("public");
      }
    }

    return [...dirs].sort();
  }

  // ─── Private helpers ───────────────────────────────

  private getDataMount(techId: string): string | null {
    const mounts: Record<string, string> = {
      postgresql: "/var/lib/postgresql/data",
      mysql: "/var/lib/mysql",
      mongodb: "/data/db",
      redis: "/data",
    };
    return mounts[techId] ?? null;
  }

  private getDevCommand(techs: Technology[]): string | null {
    const hasBun = techs.some((t) => t.id === "bun");
    const hasNext = techs.some((t) => t.id === "nextjs");
    const hasNuxt = techs.some((t) => t.id === "nuxt");
    const hasVite = techs.some((t) => t.id === "vite");
    const hasAstro = techs.some((t) => t.id === "astro");
    const hasFastapi = techs.some((t) => t.id === "fastapi");
    const hasDjango = techs.some((t) => t.id === "django");
    const hasExpress = techs.some((t) => t.id === "express");
    const hasGo = techs.some((t) => t.id === "go");
    const hasRust = techs.some((t) => t.id === "rust");

    if (hasNext) return hasBun ? "bun run dev" : "npm run dev";
    if (hasNuxt) return hasBun ? "bun run dev" : "npm run dev";
    if (hasVite) return hasBun ? "bun run dev" : "npm run dev";
    if (hasAstro) return hasBun ? "bun run dev" : "npm run dev";
    if (hasExpress) return hasBun ? "bun run dev" : "npm run dev";
    if (hasFastapi) return "uvicorn main:app --reload";
    if (hasDjango) return "python manage.py runserver";
    if (hasGo) return "go run .";
    if (hasRust) return "cargo run";
    return null;
  }

  private getFrontendDevCommand(techs: Technology[]): string | null {
    const hasBun = techs.some((t) => t.id === "bun");
    const frontendTechs = techs.filter((t) => t.category === "frontend");
    for (const t of frontendTechs) {
      if (["nextjs", "nuxt", "vite", "astro", "sveltekit", "remix"].includes(t.id)) {
        return hasBun ? "bun run dev" : "npm run dev";
      }
    }
    return hasBun ? "bun run dev" : "npm run dev";
  }

  private getBackendDevCommand(techs: Technology[]): string | null {
    const hasBun = techs.some((t) => t.id === "bun");
    const backendTechs = techs.filter((t) => t.category === "backend");
    for (const t of backendTechs) {
      if (t.id === "fastapi") return "uvicorn config.main:app --reload";
      if (t.id === "django") return "python manage.py runserver";
      if (t.id === "flask") return "flask run --reload";
      if (t.id === "express" || t.id === "nestjs" || t.id === "fastify" || t.id === "hono") {
        return hasBun ? "bun run dev" : "npm run dev";
      }
      if (t.id === "gin" || t.id === "echo") return "go run .";
    }
    return null;
  }

  private getTestCommand(techs: Technology[]): string {
    const hasBun = techs.some((t) => t.id === "bun");
    const hasVitest = techs.some((t) => t.id === "vitest");
    const hasJest = techs.some((t) => t.id === "jest");
    const hasPytest = techs.some((t) => t.id === "pytest");
    const hasPython = techs.some((t) => t.id === "python");
    const hasGo = techs.some((t) => t.id === "go");
    const hasRust = techs.some((t) => t.id === "rust");

    if (hasVitest) return "npx vitest run";
    if (hasJest) return "npx jest";
    if (hasPytest) return "pytest";
    if (hasPython) return "python -m pytest";
    if (hasGo) return "go test ./...";
    if (hasRust) return "cargo test";
    if (hasBun) return "bun test";
    return "npm test";
  }

  private getBuildCommand(techs: Technology[]): string | null {
    const hasBun = techs.some((t) => t.id === "bun");
    const hasNext = techs.some((t) => t.id === "nextjs");
    const hasNuxt = techs.some((t) => t.id === "nuxt");
    const hasVite = techs.some((t) => t.id === "vite");
    const hasAstro = techs.some((t) => t.id === "astro");
    const hasGo = techs.some((t) => t.id === "go");
    const hasRust = techs.some((t) => t.id === "rust");

    if (hasNext || hasNuxt || hasVite || hasAstro) {
      return hasBun ? "bun run build" : "npm run build";
    }
    if (hasGo) return "go build -o bin/app .";
    if (hasRust) return "cargo build --release";
    return null;
  }
}
