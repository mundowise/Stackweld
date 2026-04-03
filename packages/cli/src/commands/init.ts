/**
 * stackweld init — Interactive project creation wizard.
 * Creates the stack definition AND generates the full project.
 */

import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { checkbox, confirm, input, select } from "@inquirer/prompts";
import type { StackProfile, StackTechnology, Technology } from "@stackweld/core";
import { installTechnologies } from "@stackweld/core";
import { getAllTemplates } from "@stackweld/templates";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import { getRulesEngine, getScaffoldOrchestrator, getStackEngine } from "../ui/context.js";
import {
  box,
  formatStackSummary,
  formatValidation,
  gradientHeader,
  nextSteps,
  stepIndicator,
  warning,
} from "../ui/format.js";

// ─── Helpers ───────────────────────────────────────

function runCmd(
  cmd: string,
  cwd: string,
  timeoutMs = 120_000,
): { success: boolean; output: string } {
  try {
    const parts = cmd.split(/\s+/).filter(Boolean);
    const out = execFileSync(parts[0], parts.slice(1), {
      cwd,
      stdio: "pipe",
      timeout: timeoutMs,
    }).toString();
    return { success: true, output: out };
  } catch (e) {
    return { success: false, output: e instanceof Error ? e.message.slice(0, 200) : String(e) };
  }
}

function writeFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
}

function makeExecutable(filePath: string): void {
  fs.chmodSync(filePath, 0o755);
}

// ─── Frontend scaffolders ──────────────────────────

function scaffoldFrontend(
  tech: Technology,
  frontendDir: string,
  parentDir: string,
  projectName: string,
): string[] {
  const log: string[] = [];
  fs.mkdirSync(frontendDir, { recursive: true });

  if (tech.id === "nextjs") {
    const r = runCmd(
      `npx create-next-app@latest frontend --typescript --tailwind --app --src-dir --import-alias "@/*" --no-git --yes`,
      parentDir,
    );
    log.push(r.success ? "Next.js scaffolded" : "Next.js (manual: npx create-next-app@latest)");
  } else if (tech.id === "nuxt") {
    const r = runCmd(`npx nuxi@latest init frontend --no-git --force`, parentDir);
    log.push(r.success ? "Nuxt scaffolded" : "Nuxt (manual: npx nuxi init)");
  } else if (tech.id === "sveltekit") {
    const r = runCmd(`npx sv create frontend --template minimal --types ts`, parentDir);
    log.push(r.success ? "SvelteKit scaffolded" : "SvelteKit (manual: npx sv create)");
  } else if (tech.id === "astro") {
    const r = runCmd(
      `npm create astro@latest frontend -- --template minimal --install --no-git --typescript strict --yes`,
      parentDir,
    );
    log.push(r.success ? "Astro scaffolded" : "Astro (manual: npm create astro@latest)");
  } else if (tech.id === "remix") {
    const r = runCmd(`npx create-remix@latest frontend --no-git --yes`, parentDir);
    log.push(r.success ? "Remix scaffolded" : "Remix (manual: npx create-remix@latest)");
  } else if (tech.id === "angular") {
    const r = runCmd(`npx @angular/cli new frontend --skip-git --defaults`, parentDir);
    log.push(r.success ? "Angular scaffolded" : "Angular (manual: npx @angular/cli new)");
  } else if (tech.id === "react" || tech.id === "solidjs" || tech.id === "qwik") {
    const template =
      tech.id === "solidjs" ? "solid-ts" : tech.id === "qwik" ? "qwik-ts" : "react-ts";
    const r = runCmd(`npm create vite@latest frontend -- --template ${template}`, parentDir);
    log.push(
      r.success
        ? `${tech.name} (Vite) scaffolded`
        : `${tech.name} (manual: npm create vite@latest)`,
    );
  } else {
    log.push(`${tech.name} (create manually in frontend/)`);
  }

  writeFile(
    path.join(frontendDir, ".env.example"),
    [
      `# ${projectName} — Frontend Environment Variables`,
      "",
      "NEXT_PUBLIC_API_URL=http://localhost:8000",
      "VITE_API_URL=http://localhost:8000",
      "PUBLIC_API_URL=http://localhost:8000",
      "",
    ].join("\n"),
  );
  log.push("frontend/.env.example created");
  return log;
}

// ─── Backend scaffolders ───────────────────────────

function scaffoldBackend(
  tech: Technology,
  backendDir: string,
  _parentDir: string,
  projectName: string,
  allTechs: Technology[],
): string[] {
  const log: string[] = [];
  fs.mkdirSync(backendDir, { recursive: true });

  const hasPostgres = allTechs.some((t) => t.id === "postgresql");
  const hasRedis = allTechs.some((t) => t.id === "redis");
  const hasSqlite = allTechs.some((t) => t.id === "sqlite");
  const dbUrl = hasPostgres
    ? `postgresql://postgres:postgres@localhost:5432/${projectName}`
    : hasSqlite
      ? "file:./dev.db"
      : `mysql://root:root@localhost:3306/${projectName}`;

  if (tech.id === "django" || tech.id === "fastapi" || tech.id === "flask") {
    runCmd("python3 -m venv .venv", backendDir, 30_000);
    const pip = path.join(backendDir, ".venv/bin/pip");

    if (tech.id === "django") {
      runCmd(
        `${pip} install django djangorestframework django-cors-headers python-dotenv psycopg2-binary`,
        backendDir,
        90_000,
      );
      runCmd(
        `${path.join(backendDir, ".venv/bin/django-admin")} startproject config .`,
        backendDir,
        15_000,
      );
      writeFile(
        path.join(backendDir, "requirements.txt"),
        `${[
          "django>=5.1",
          "djangorestframework>=3.15",
          "django-cors-headers>=4.4",
          "python-dotenv>=1.0",
          "psycopg2-binary>=2.9",
          "gunicorn>=22.0",
          ...(hasRedis ? ["django-redis>=5.4"] : []),
        ].join("\n")}\n`,
      );
      log.push("Django project created");
    } else if (tech.id === "fastapi") {
      runCmd(
        `${pip} install fastapi uvicorn sqlalchemy alembic python-dotenv psycopg2-binary`,
        backendDir,
        90_000,
      );
      writeFile(
        path.join(backendDir, "main.py"),
        `${[
          "from fastapi import FastAPI",
          "from fastapi.middleware.cors import CORSMiddleware",
          "",
          `app = FastAPI(title="${projectName}")`,
          "",
          "app.add_middleware(",
          "    CORSMiddleware,",
          '    allow_origins=["http://localhost:3000", "http://localhost:5173"],',
          "    allow_credentials=True,",
          '    allow_methods=["*"],',
          '    allow_headers=["*"],',
          ")",
          "",
          '@app.get("/health")',
          "def health():",
          '    return {"status": "ok"}',
          "",
          '@app.get("/api")',
          "def root():",
          `    return {"message": "Welcome to ${projectName} API"}`,
        ].join("\n")}\n`,
      );
      writeFile(
        path.join(backendDir, "requirements.txt"),
        `${[
          "fastapi>=0.115",
          "uvicorn[standard]>=0.30",
          "sqlalchemy>=2.0",
          "alembic>=1.13",
          "python-dotenv>=1.0",
          "psycopg2-binary>=2.9",
          ...(hasRedis ? ["redis>=5.0"] : []),
        ].join("\n")}\n`,
      );
      log.push("FastAPI project created");
    } else if (tech.id === "flask") {
      runCmd(`${pip} install flask flask-cors python-dotenv`, backendDir, 60_000);
      writeFile(
        path.join(backendDir, "app.py"),
        `${[
          "from flask import Flask, jsonify",
          "from flask_cors import CORS",
          "",
          "app = Flask(__name__)",
          "CORS(app)",
          "",
          '@app.route("/health")',
          "def health():",
          '    return jsonify(status="ok")',
          "",
          '@app.route("/api")',
          "def root():",
          `    return jsonify(message="Welcome to ${projectName} API")`,
        ].join("\n")}\n`,
      );
      writeFile(
        path.join(backendDir, "requirements.txt"),
        `${["flask>=3.0", "flask-cors>=4.0", "python-dotenv>=1.0"].join("\n")}\n`,
      );
      log.push("Flask project created");
    }

    writeFile(
      path.join(backendDir, ".env.example"),
      `${[
        `# ${projectName} — Backend Environment Variables`,
        "",
        "DEBUG=True",
        `SECRET_KEY=${randomBytes(32).toString("base64url")}`,
        `DATABASE_URL=${dbUrl}`,
        ...(hasRedis ? ["REDIS_URL=redis://localhost:6379/0"] : []),
        "ALLOWED_HOSTS=localhost,127.0.0.1",
        "CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173",
        "PORT=8000",
      ].join("\n")}\n`,
    );
    log.push("backend/.env.example created");
  }

  if (
    tech.id === "express" ||
    tech.id === "fastify" ||
    tech.id === "hono" ||
    tech.id === "nestjs"
  ) {
    if (tech.id === "nestjs") {
      const r = runCmd(
        `npx @nestjs/cli new backend --package-manager npm --skip-git`,
        backendDir.replace(/\/backend$/, ""),
        120_000,
      );
      log.push(r.success ? "NestJS project created" : "NestJS (manual: npx @nestjs/cli new)");
    } else {
      writeFile(
        path.join(backendDir, "package.json"),
        `${JSON.stringify(
          {
            name: `${projectName}-backend`,
            version: "0.1.0",
            private: true,
            type: "module",
            scripts: {
              dev: "npx tsx watch src/index.ts",
              build: "tsc",
              start: "node dist/index.js",
            },
          },
          null,
          2,
        )}\n`,
      );

      writeFile(
        path.join(backendDir, "tsconfig.json"),
        `${JSON.stringify(
          {
            compilerOptions: {
              target: "ES2022",
              module: "ESNext",
              moduleResolution: "bundler",
              outDir: "dist",
              rootDir: "src",
              strict: true,
              esModuleInterop: true,
              skipLibCheck: true,
            },
            include: ["src"],
          },
          null,
          2,
        )}\n`,
      );

      const serverCode =
        tech.id === "hono"
          ? `import { Hono } from "hono";\nimport { cors } from "hono/cors";\nimport { serve } from "@hono/node-server";\n\nconst app = new Hono();\napp.use("*", cors());\n\napp.get("/health", (c) => c.json({ status: "ok" }));\napp.get("/api", (c) => c.json({ message: "Welcome to ${projectName} API" }));\n\nserve({ fetch: app.fetch, port: 8000 });\nconsole.log("Server running on http://localhost:8000");\n`
          : tech.id === "fastify"
            ? `import Fastify from "fastify";\nimport cors from "@fastify/cors";\n\nconst app = Fastify();\nawait app.register(cors);\n\napp.get("/health", async () => ({ status: "ok" }));\napp.get("/api", async () => ({ message: "Welcome to ${projectName} API" }));\n\nawait app.listen({ port: 8000, host: "0.0.0.0" });\nconsole.log("Server running on http://localhost:8000");\n`
            : `import express from "express";\nimport cors from "cors";\n\nconst app = express();\napp.use(cors());\napp.use(express.json());\n\napp.get("/health", (_, res) => res.json({ status: "ok" }));\napp.get("/api", (_, res) => res.json({ message: "Welcome to ${projectName} API" }));\n\napp.listen(8000, () => console.log("Server running on http://localhost:8000"));\n`;

      fs.mkdirSync(path.join(backendDir, "src"), { recursive: true });
      writeFile(path.join(backendDir, "src/index.ts"), serverCode);

      const deps =
        tech.id === "hono"
          ? "hono @hono/node-server"
          : tech.id === "fastify"
            ? "fastify @fastify/cors"
            : "express cors";
      const devDeps = `typescript tsx @types/node${tech.id === "express" ? " @types/express @types/cors" : ""}`;
      runCmd(`npm install ${deps}`, backendDir, 60_000);
      runCmd(`npm install -D ${devDeps}`, backendDir, 60_000);
      log.push(`${tech.name} project created`);
    }

    writeFile(
      path.join(backendDir, ".env.example"),
      `${[
        `# ${projectName} — Backend Environment Variables`,
        "",
        "NODE_ENV=development",
        "PORT=8000",
        `DATABASE_URL=${dbUrl}`,
        ...(hasRedis ? ["REDIS_URL=redis://localhost:6379/0"] : []),
        "CORS_ORIGINS=http://localhost:3000,http://localhost:5173",
      ].join("\n")}\n`,
    );
    log.push("backend/.env.example created");
  }

  if (tech.id === "gin" || tech.id === "echo") {
    runCmd(`go mod init ${projectName}`, backendDir, 15_000);
    const framework =
      tech.id === "gin" ? "github.com/gin-gonic/gin" : "github.com/labstack/echo/v4";
    runCmd(`go get ${framework}`, backendDir, 60_000);

    const mainCode =
      tech.id === "gin"
        ? `package main\n\nimport "github.com/gin-gonic/gin"\n\nfunc main() {\n\tr := gin.Default()\n\tr.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })\n\tr.GET("/api", func(c *gin.Context) { c.JSON(200, gin.H{"message": "Welcome to ${projectName} API"}) })\n\tr.Run(":8000")\n}\n`
        : `package main\n\nimport (\n\t"net/http"\n\t"github.com/labstack/echo/v4"\n)\n\nfunc main() {\n\te := echo.New()\n\te.GET("/health", func(c echo.Context) error { return c.JSON(http.StatusOK, map[string]string{"status": "ok"}) })\n\te.GET("/api", func(c echo.Context) error { return c.JSON(http.StatusOK, map[string]string{"message": "Welcome to ${projectName} API"}) })\n\te.Start(":8000")\n}\n`;
    writeFile(path.join(backendDir, "main.go"), mainCode);

    writeFile(
      path.join(backendDir, ".env.example"),
      `${[
        `# ${projectName} — Backend Environment Variables`,
        "PORT=8000",
        `DATABASE_URL=${dbUrl}`,
        ...(hasRedis ? ["REDIS_URL=redis://localhost:6379/0"] : []),
      ].join("\n")}\n`,
    );
    log.push(`${tech.name} project created`);
    log.push("backend/.env.example created");
  }

  return log;
}

// ─── Generate project from stack ───────────────────

function generateProject(
  stack: { id: string; name: string; technologies: StackTechnology[]; profile: string },
  targetDir: string,
  projectName: string,
  rules: ReturnType<typeof getRulesEngine>,
  orchestrator: ReturnType<typeof getScaffoldOrchestrator>,
  json: boolean,
): void {
  const allTechObjects: Technology[] = stack.technologies
    .map((st) => rules.getTechnology(st.technologyId))
    .filter((t): t is Technology => t != null);

  const frontendTech = allTechObjects.find((t) => t.category === "frontend");
  const backendTech = allTechObjects.find((t) => t.category === "backend");
  const isFullStack = !!frontendTech && !!backendTech;
  const isFrontendOnly = !!frontendTech && !backendTech;
  const isBackendOnly = !frontendTech && !!backendTech;
  const projectType = isFullStack
    ? "full-stack"
    : isFrontendOnly
      ? "frontend"
      : isBackendOnly
        ? "backend"
        : "library";

  const spinner1 = !json ? ora(`  Generating ${projectType} project structure...`).start() : null;

  fs.mkdirSync(targetDir, { recursive: true });

  const output = orchestrator.generate(stack as any);
  const written: string[] = [];

  const rootFiles: Array<{ p: string; content: string }> = [
    { p: "README.md", content: output.readme },
    { p: ".gitignore", content: output.gitignore },
    { p: "Makefile", content: output.makefile },
    { p: "scripts/dev.sh", content: output.devScript },
    { p: "scripts/setup.sh", content: output.setupScript },
    { p: ".devcontainer/devcontainer.json", content: output.devcontainer },
    { p: ".vscode/settings.json", content: output.vscodeSettings },
    { p: ".github/workflows/ci.yml", content: output.ciWorkflow },
  ];

  if (output.dockerCompose) {
    rootFiles.unshift({ p: "docker-compose.yml", content: output.dockerCompose });
  }
  rootFiles.push({ p: ".env.example", content: output.envExample });

  for (const f of rootFiles) {
    writeFile(path.join(targetDir, f.p), f.content);
    if (f.p.endsWith(".sh")) makeExecutable(path.join(targetDir, f.p));
    written.push(f.p);
  }
  spinner1?.succeed(`  ${written.length} root files generated`);

  // Scaffold sub-projects
  const scaffoldLog: string[] = [];
  const spinner2 = !json ? ora("  Scaffolding applications...").start() : null;

  if (isFullStack) {
    if (spinner2) spinner2.text = `  Scaffolding ${frontendTech?.name} frontend...`;
    scaffoldLog.push(
      ...scaffoldFrontend(
        frontendTech!,
        path.join(targetDir, "frontend"),
        targetDir,
        projectName,
      ).map((l) => `frontend: ${l}`),
    );
    if (spinner2) spinner2.text = `  Scaffolding ${backendTech?.name} backend...`;
    scaffoldLog.push(
      ...scaffoldBackend(
        backendTech!,
        path.join(targetDir, "backend"),
        targetDir,
        projectName,
        allTechObjects,
      ).map((l) => `backend: ${l}`),
    );
  } else if (isFrontendOnly && frontendTech?.officialScaffold) {
    if (spinner2) spinner2.text = `  Scaffolding ${frontendTech.name}...`;
    const tempName = ".scaffold-temp";
    const r = runCmd(`${frontendTech.officialScaffold} ${tempName}`, targetDir);
    if (r.success) {
      const tempDir = path.join(targetDir, tempName);
      if (fs.existsSync(tempDir)) {
        for (const item of fs.readdirSync(tempDir)) {
          const src = path.join(tempDir, item);
          const dest = path.join(targetDir, item);
          if (!fs.existsSync(dest)) fs.renameSync(src, dest);
        }
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
      scaffoldLog.push(`${frontendTech.name} scaffolded in project root`);
    } else {
      scaffoldLog.push(`${frontendTech.name} (run manually: ${frontendTech.officialScaffold})`);
    }
  } else if (isBackendOnly && backendTech) {
    if (spinner2) spinner2.text = `  Scaffolding ${backendTech.name}...`;
    scaffoldLog.push(
      ...scaffoldBackend(backendTech, targetDir, targetDir, projectName, allTechObjects),
    );
  }

  // Install additional technologies (ORM, Auth, Styling, DevOps)
  if (spinner2) spinner2.text = "  Installing additional technologies...";
  const installCtx = {
    projectDir: targetDir,
    frontendDir: isFullStack ? path.join(targetDir, "frontend") : null,
    backendDir: isFullStack ? path.join(targetDir, "backend") : null,
    projectName,
    isFullStack,
    allTechs: allTechObjects,
    runtime: (allTechObjects.find((t) => t.category === "runtime")?.id as any) ?? null,
  };
  const installResults = installTechnologies(installCtx);
  for (const r of installResults) {
    scaffoldLog.push(
      r.success ? `${r.techId}: ${r.message}` : `${r.techId}: FAILED — ${r.message}`,
    );
  }
  spinner2?.succeed(`  ${scaffoldLog.length} scaffold operations completed`);

  // Git init
  const spinner3 = !json ? ora("  Initializing git repository...").start() : null;
  orchestrator.initGit(targetDir, stack as any);
  spinner3?.succeed("  Git repository initialized");

  // Output
  if (json) {
    console.log(
      JSON.stringify(
        {
          success: true,
          stackId: stack.id,
          stackName: stack.name,
          projectType,
          path: targetDir,
          filesGenerated: written,
          scaffoldLog,
        },
        null,
        2,
      ),
    );
  } else {
    const summaryContent = [
      `${chalk.dim("Project:")}  ${chalk.cyan.bold(projectName)}`,
      `${chalk.dim("Type:")}     ${projectType}`,
      `${chalk.dim("Path:")}     ${targetDir}`,
      `${chalk.dim("Profile:")}  ${stack.profile}`,
      `${chalk.dim("Files:")}    ${written.length} root + ${scaffoldLog.length} scaffold ops`,
      `${chalk.dim("Stack ID:")} ${chalk.dim(stack.id)}`,
    ].join("\n");

    console.log("");
    console.log(box(summaryContent, "\u2714 Project Created"));

    if (scaffoldLog.length > 0) {
      console.log(chalk.bold("\n  Scaffold log:"));
      for (const l of scaffoldLog) {
        const isFailure = l.includes("FAILED");
        const icon = isFailure ? chalk.red("\u2716") : chalk.green("\u2714");
        console.log(`    ${icon} ${isFailure ? chalk.red(l) : chalk.dim(l)}`);
      }
    }

    const steps = [`cd ${targetDir}`];
    if (output.dockerCompose) steps.push("docker compose up -d");
    steps.push("make dev");
    console.log(nextSteps(steps));
  }
}

// ─── Command ───────────────────────────────────────

export const initCommand = new Command("init")
  .description("Create a new stack interactively")
  .option("--template <id>", "Start from a template")
  .option("--json", "Output result as JSON")
  .action(async (opts) => {
    console.log(`\n  ${gradientHeader("Stackweld")} ${chalk.dim("/ New Project Wizard")}\n`);

    const rules = getRulesEngine();
    const engine = getStackEngine();

    // ── Step 1: Choose mode ──
    console.log(stepIndicator(1, 6, "Choose how to start"));
    const mode = opts.template
      ? "template"
      : await select({
          message: "How do you want to start?",
          loop: false,
          choices: [
            { name: "From scratch \u2014 pick technologies one by one", value: "scratch" },
            { name: "From a template \u2014 use a pre-built stack", value: "template" },
          ],
        });

    let technologies: StackTechnology[] = [];
    let profile: StackProfile = "standard";
    let stackName = "";

    if (mode === "template") {
      // ── Step 2: Select template ──
      console.log(`\n${stepIndicator(2, 6, "Select template")}`);
      const templates = getAllTemplates();

      if (templates.length === 0) {
        console.log(warning("No templates available. Run from scratch instead."));
        return;
      }

      const templateId =
        opts.template ||
        (await select({
          message: "Choose a template:",
          loop: false,
          pageSize: 15,
          choices: templates.map((t) => ({
            name: `${chalk.cyan(t.name)} ${chalk.dim("\u2014")} ${t.description}`,
            value: t.id,
          })),
        }));

      const template = templates.find((t) => t.id === templateId);
      if (!template) {
        console.error(chalk.red(`\u2716 Template "${templateId}" not found.`));
        console.error(chalk.dim(`  Available templates: ${templates.map((t) => t.id).join(", ")}`));
        process.exit(1);
      }

      // ── Step 3: Name ──
      console.log(`\n${stepIndicator(3, 6, "Name your project")}`);
      stackName = await input({
        message: "Project name:",
        default: template.variables.projectName || "my-project",
        validate: (v) => {
          if (v.trim().length === 0) return "Name cannot be empty";
          if (!/^[a-zA-Z0-9_.-]+$/.test(v.trim()))
            return "Only letters, numbers, hyphens, dots, and underscores";
          return true;
        },
      });

      technologies = template.technologyIds.map((tid) => {
        const tech = rules.getTechnology(tid);
        return { technologyId: tid, version: tech?.defaultVersion || "latest" };
      });
      profile = template.profile as StackProfile;

      console.log(`\n${stepIndicator(4, 6, chalk.dim("Profile: ") + profile)}`);
      console.log(
        `${stepIndicator(5, 6, `${chalk.dim("Technologies: ") + technologies.length} from template`)}`,
      );
    } else {
      // ── Step 2: Name ──
      console.log(`\n${stepIndicator(2, 6, "Name your project")}`);
      stackName = await input({
        message: "Project name:",
        default: "my-project",
        validate: (v) => {
          if (v.trim().length === 0) return "Name cannot be empty";
          if (!/^[a-zA-Z0-9_.-]+$/.test(v.trim()))
            return "Only letters, numbers, hyphens, dots, and underscores";
          return true;
        },
      });

      // ── Step 3: Profile ──
      console.log(`\n${stepIndicator(3, 6, "Choose a project profile")}`);
      profile = (await select({
        message: "Project profile:",
        loop: false,
        choices: [
          {
            name: `${chalk.cyan("Rapid")}       ${chalk.dim("\u2014 Quick prototyping, minimal config")}`,
            value: "rapid",
          },
          {
            name: `${chalk.cyan("Standard")}    ${chalk.dim("\u2014 Balanced defaults for most projects")}`,
            value: "standard",
          },
          {
            name: `${chalk.cyan("Production")}  ${chalk.dim("\u2014 Battle-tested, monitoring included")}`,
            value: "production",
          },
          {
            name: `${chalk.cyan("Enterprise")}  ${chalk.dim("\u2014 Full compliance, audit, security")}`,
            value: "enterprise",
          },
          {
            name: `${chalk.cyan("Lightweight")} ${chalk.dim("\u2014 Minimal footprint")}`,
            value: "lightweight",
          },
        ],
      })) as StackProfile;

      // ── Step 4: Technologies ──
      console.log(`\n${stepIndicator(4, 6, "Select technologies by category")}`);
      console.log(
        chalk.dim("  Use arrow keys + space to select, Enter to confirm each category\n"),
      );

      const categories = [
        "runtime",
        "frontend",
        "backend",
        "database",
        "orm",
        "auth",
        "styling",
        "service",
        "devops",
      ] as const;

      for (const category of categories) {
        const available = rules.getByCategory(category);
        if (available.length === 0) continue;

        const selected = await checkbox({
          message: `${chalk.cyan(category.charAt(0).toUpperCase() + category.slice(1))} technologies:`,
          pageSize: 15,
          choices: available.map((t) => ({
            name: `${t.name} ${chalk.dim(`v${t.defaultVersion}`)} ${t.description ? chalk.dim(`\u2014 ${t.description}`) : ""}`,
            value: t.id,
          })),
        });

        for (const id of selected) {
          const tech = rules.getTechnology(id);
          if (tech) {
            technologies.push({ technologyId: id, version: tech.defaultVersion });
          }
        }
      }

      // ── Step 5: Confirm ──
      console.log(`\n${stepIndicator(5, 6, "Review and confirm")}`);
    }

    if (technologies.length === 0) {
      console.log(warning("No technologies selected. Aborting."));
      return;
    }

    // Show summary
    console.log("");
    console.log(chalk.bold("  Summary:"));
    console.log(`  ${chalk.dim("Name:")}     ${chalk.cyan(stackName)}`);
    console.log(`  ${chalk.dim("Profile:")}  ${profile}`);
    console.log(
      `  ${chalk.dim("Techs:")}    ${technologies.map((t) => t.technologyId).join(", ")}`,
    );
    console.log("");

    if (mode !== "template") {
      const proceed = await confirm({ message: "Create this stack?", default: true });
      if (!proceed) {
        console.log(chalk.dim("  Cancelled."));
        return;
      }
    }

    const { stack, validation } = engine.create({ name: stackName, profile, technologies });

    console.log("");
    console.log(formatValidation(validation));

    if (opts.json) {
      console.log(JSON.stringify({ stack, validation }, null, 2));
      return;
    }

    // ── Step 6: Generate project ──
    console.log(`\n${stepIndicator(6, 6, "Generate project files")}`);

    const shouldGenerate = await confirm({
      message: "Generate the project files now?",
      default: true,
    });

    if (!shouldGenerate) {
      console.log("");
      console.log(formatStackSummary(stack));
      console.log(
        nextSteps([
          `stackweld generate --name ${stackName} --path . --techs ${technologies.map((t) => t.technologyId).join(",")}`,
          `stackweld info ${stack.id}`,
        ]),
      );
      return;
    }

    const projectPath = await input({
      message: "Where to create the project?",
      default: process.cwd(),
      validate: (v) => {
        const resolved = path.resolve(v.trim());
        if (!fs.existsSync(resolved)) return `Directory does not exist: ${resolved}`;
        return true;
      },
    });

    const targetDir = path.resolve(projectPath.trim(), stackName);

    if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
      console.log(chalk.red(`\n  \u2716 Directory already exists and is not empty: ${targetDir}`));
      return;
    }

    console.log("");
    const orchestrator = getScaffoldOrchestrator();
    generateProject(stack, targetDir, stackName, rules, orchestrator, !!opts.json);
  });
