/**
 * stackpilot generate — Smart project generator.
 * Detects project type (full-stack, frontend-only, backend-only),
 * creates proper directory structure, executes official scaffolds,
 * generates per-directory .env files, and leaves everything ready to code.
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import type { StackProfile, StackTechnology, Technology } from "@stackpilot/core";
import { installTechnologies } from "@stackpilot/core";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import { getRulesEngine, getScaffoldOrchestrator, getStackEngine } from "../ui/context.js";
import {
  box,
  error,
  formatValidation,
  gradientHeader,
  nextSteps,
  stepIndicator,
  warning,
} from "../ui/format.js";

// ─── Helpers ────────────────────────────────────────

function run(cmd: string, cwd: string, timeoutMs = 120_000): { success: boolean; output: string } {
  try {
    const out = execSync(cmd, {
      cwd,
      stdio: "pipe",
      timeout: timeoutMs,
    }).toString();
    return { success: true, output: out };
  } catch (e) {
    return {
      success: false,
      output: e instanceof Error ? e.message.slice(0, 200) : String(e),
    };
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

// ─── Frontend scaffolders ───────────────────────────

function scaffoldFrontend(
  tech: Technology,
  frontendDir: string,
  parentDir: string,
  projectName: string,
): string[] {
  const log: string[] = [];
  fs.mkdirSync(frontendDir, { recursive: true });

  if (tech.id === "nextjs") {
    const r = run(
      `npx create-next-app@latest frontend --typescript --tailwind --app --src-dir --import-alias "@/*" --no-git --yes`,
      parentDir,
    );
    log.push(r.success ? `Next.js scaffolded` : `Next.js (manual: npx create-next-app@latest)`);
  } else if (tech.id === "nuxt") {
    const r = run(`npx nuxi@latest init frontend --no-git --force`, parentDir);
    log.push(r.success ? `Nuxt scaffolded` : `Nuxt (manual: npx nuxi init)`);
  } else if (tech.id === "sveltekit") {
    const r = run(`npx sv create frontend --template minimal --types ts`, parentDir);
    log.push(r.success ? `SvelteKit scaffolded` : `SvelteKit (manual: npx sv create)`);
  } else if (tech.id === "astro") {
    const r = run(
      `npm create astro@latest frontend -- --template minimal --install --no-git --typescript strict --yes`,
      parentDir,
    );
    log.push(r.success ? `Astro scaffolded` : `Astro (manual: npm create astro@latest)`);
  } else if (tech.id === "remix") {
    const r = run(`npx create-remix@latest frontend --no-git --yes`, parentDir);
    log.push(r.success ? `Remix scaffolded` : `Remix (manual: npx create-remix@latest)`);
  } else if (tech.id === "angular") {
    const r = run(`npx @angular/cli new frontend --skip-git --defaults`, parentDir);
    log.push(r.success ? `Angular scaffolded` : `Angular (manual: npx @angular/cli new)`);
  } else if (tech.id === "react" || tech.id === "solidjs" || tech.id === "qwik") {
    const template =
      tech.id === "solidjs" ? "solid-ts" : tech.id === "qwik" ? "qwik-ts" : "react-ts";
    const r = run(`npm create vite@latest frontend -- --template ${template}`, parentDir);
    log.push(
      r.success
        ? `${tech.name} (Vite) scaffolded`
        : `${tech.name} (manual: npm create vite@latest)`,
    );
  } else {
    log.push(`${tech.name} (create manually in frontend/)`);
  }

  const envLines = [
    `# ${projectName} — Frontend Environment Variables`,
    "",
    `NEXT_PUBLIC_API_URL=http://localhost:8000`,
    `VITE_API_URL=http://localhost:8000`,
    `PUBLIC_API_URL=http://localhost:8000`,
    "",
  ];
  writeFile(path.join(frontendDir, ".env.example"), envLines.join("\n"));
  log.push("frontend/.env.example created");

  return log;
}

// ─── Backend scaffolders ────────────────────────────

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

  // Python backends
  if (tech.id === "django" || tech.id === "fastapi" || tech.id === "flask") {
    run(`python3 -m venv .venv`, backendDir, 30_000);
    const pip = path.join(backendDir, ".venv/bin/pip");

    if (tech.id === "django") {
      run(
        `${pip} install django djangorestframework django-cors-headers python-dotenv psycopg2-binary`,
        backendDir,
        90_000,
      );
      run(
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
          hasRedis ? "django-redis>=5.4" : "",
        ]
          .filter(Boolean)
          .join("\n")}\n`,
      );
      log.push("Django project created");
    } else if (tech.id === "fastapi") {
      run(
        `${pip} install fastapi uvicorn sqlalchemy alembic python-dotenv psycopg2-binary`,
        backendDir,
        90_000,
      );
      writeFile(
        path.join(backendDir, "main.py"),
        `${[
          `from fastapi import FastAPI`,
          `from fastapi.middleware.cors import CORSMiddleware`,
          ``,
          `app = FastAPI(title="${projectName}")`,
          ``,
          `app.add_middleware(`,
          `    CORSMiddleware,`,
          `    allow_origins=["http://localhost:3000", "http://localhost:5173"],`,
          `    allow_credentials=True,`,
          `    allow_methods=["*"],`,
          `    allow_headers=["*"],`,
          `)`,
          ``,
          `@app.get("/health")`,
          `def health():`,
          `    return {"status": "ok"}`,
          ``,
          `@app.get("/api")`,
          `def root():`,
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
          hasRedis ? "redis>=5.0" : "",
        ]
          .filter(Boolean)
          .join("\n")}\n`,
      );
      log.push("FastAPI project created");
    } else if (tech.id === "flask") {
      run(`${pip} install flask flask-cors python-dotenv`, backendDir, 60_000);
      writeFile(
        path.join(backendDir, "app.py"),
        `${[
          `from flask import Flask, jsonify`,
          `from flask_cors import CORS`,
          ``,
          `app = Flask(__name__)`,
          `CORS(app)`,
          ``,
          `@app.route("/health")`,
          `def health():`,
          `    return jsonify(status="ok")`,
          ``,
          `@app.route("/api")`,
          `def root():`,
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
        ``,
        `DEBUG=True`,
        `SECRET_KEY=change-me-in-production`,
        `DATABASE_URL=${dbUrl}`,
        hasRedis ? `REDIS_URL=redis://localhost:6379/0` : "",
        `ALLOWED_HOSTS=localhost,127.0.0.1`,
        `CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173`,
        `PORT=8000`,
      ]
        .filter(Boolean)
        .join("\n")}\n`,
    );
    log.push("backend/.env.example created");
  }

  // Node.js backends
  if (
    tech.id === "express" ||
    tech.id === "fastify" ||
    tech.id === "hono" ||
    tech.id === "nestjs"
  ) {
    if (tech.id === "nestjs") {
      const r = run(
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

      run(`npm install ${deps}`, backendDir, 60_000);
      run(`npm install -D ${devDeps}`, backendDir, 60_000);
      log.push(`${tech.name} project created`);
    }

    writeFile(
      path.join(backendDir, ".env.example"),
      `${[
        `# ${projectName} — Backend Environment Variables`,
        ``,
        `NODE_ENV=development`,
        `PORT=8000`,
        `DATABASE_URL=${dbUrl}`,
        hasRedis ? `REDIS_URL=redis://localhost:6379/0` : "",
        `CORS_ORIGINS=http://localhost:3000,http://localhost:5173`,
      ]
        .filter(Boolean)
        .join("\n")}\n`,
    );
    log.push("backend/.env.example created");
  }

  // Go backends
  if (tech.id === "gin" || tech.id === "echo") {
    run(`go mod init ${projectName}`, backendDir, 15_000);
    const framework =
      tech.id === "gin" ? "github.com/gin-gonic/gin" : "github.com/labstack/echo/v4";
    run(`go get ${framework}`, backendDir, 60_000);

    const mainCode =
      tech.id === "gin"
        ? `package main\n\nimport (\n\t"github.com/gin-gonic/gin"\n)\n\nfunc main() {\n\tr := gin.Default()\n\tr.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })\n\tr.GET("/api", func(c *gin.Context) { c.JSON(200, gin.H{"message": "Welcome to ${projectName} API"}) })\n\tr.Run(":8000")\n}\n`
        : `package main\n\nimport (\n\t"net/http"\n\t"github.com/labstack/echo/v4"\n)\n\nfunc main() {\n\te := echo.New()\n\te.GET("/health", func(c echo.Context) error { return c.JSON(http.StatusOK, map[string]string{"status": "ok"}) })\n\te.GET("/api", func(c echo.Context) error { return c.JSON(http.StatusOK, map[string]string{"message": "Welcome to ${projectName} API"}) })\n\te.Start(":8000")\n}\n`;
    writeFile(path.join(backendDir, "main.go"), mainCode);

    writeFile(
      path.join(backendDir, ".env.example"),
      `${[
        `# ${projectName} — Backend Environment Variables`,
        `PORT=8000`,
        `DATABASE_URL=${dbUrl}`,
        hasRedis ? `REDIS_URL=redis://localhost:6379/0` : "",
      ]
        .filter(Boolean)
        .join("\n")}\n`,
    );
    log.push(`${tech.name} project created`);
    log.push("backend/.env.example created");
  }

  return log;
}

// ─── Command ────────────────────────────────────────

export const generateCommand = new Command("generate")
  .description(
    "Create a fully scaffolded project: directory structure, configs, dependencies, ready to code",
  )
  .requiredOption("--name <name>", "Project name")
  .requiredOption("--path <dir>", "Parent directory")
  .requiredOption("--techs <ids>", "Comma-separated technology IDs")
  .option("--profile <profile>", "Stack profile", "standard")
  .option("--git", "Initialize git repository", true)
  .option("--json", "Output result as JSON")
  .action((opts) => {
    const engine = getStackEngine();
    const orchestrator = getScaffoldOrchestrator();
    const rules = getRulesEngine();

    // ── Input validation ──
    const techIds = opts.techs
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);

    if (techIds.length === 0) {
      console.error(error("No technologies specified."));
      console.error(
        chalk.dim("  Use --techs with comma-separated IDs: --techs nextjs,postgresql,prisma"),
      );
      process.exit(1);
    }

    if (!opts.name || opts.name.trim().length === 0) {
      console.error(error("Project name is required."));
      process.exit(1);
    }

    // SEC-004: Sanitize project name to prevent path traversal
    const safeName = path.basename(opts.name);
    if (safeName !== opts.name || !/^[a-zA-Z0-9_.-]+$/.test(safeName)) {
      console.error(
        error("Project name must be alphanumeric (a-z, 0-9, -, _, .). No path separators."),
      );
      process.exit(1);
    }

    const parentDir = path.resolve(opts.path);
    if (!fs.existsSync(parentDir)) {
      console.error(error(`Parent directory does not exist: ${parentDir}`));
      process.exit(1);
    }

    const targetDir = path.resolve(parentDir, safeName);
    if (!targetDir.startsWith(parentDir)) {
      console.error(error("Project path resolves outside the parent directory."));
      process.exit(1);
    }
    if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
      console.error(error(`Target directory already exists and is not empty: ${targetDir}`));
      process.exit(1);
    }

    // Validate all tech IDs exist
    const unknownTechs = techIds.filter((id: string) => !rules.getTechnology(id));
    if (unknownTechs.length > 0) {
      console.error(error(`Unknown technologies: ${unknownTechs.join(", ")}`));
      console.error(chalk.dim("  Run `stackpilot browse` to see available technologies."));
      process.exit(1);
    }

    const projectName = opts.name;

    if (!opts.json) {
      console.log(`\n  ${gradientHeader("StackPilot")} ${chalk.dim("/ Generate Project")}\n`);
    }

    // ── Step 1: Build technology list ──
    const spinner1 = !opts.json
      ? ora(stepIndicator(1, 5, "Building technology list")).start()
      : null;
    const technologies: StackTechnology[] = techIds.map((id: string) => {
      const tech = rules.getTechnology(id);
      return { technologyId: id, version: tech?.defaultVersion || "latest" };
    });
    spinner1?.succeed(stepIndicator(1, 5, `${technologies.length} technologies resolved`));

    // ── Step 2: Validate stack ──
    const spinner2 = !opts.json
      ? ora(stepIndicator(2, 5, "Validating stack compatibility")).start()
      : null;
    const { stack, validation } = engine.create({
      name: projectName,
      description: "Generated by StackPilot",
      profile: (opts.profile as StackProfile) || "standard",
      technologies,
      tags: ["generated"],
    });

    if (!validation.valid) {
      spinner2?.fail(stepIndicator(2, 5, "Validation failed"));
      if (opts.json) {
        console.log(JSON.stringify({ success: false, errors: validation.issues }, null, 2));
      } else {
        console.log("");
        console.log(formatValidation(validation));
      }
      process.exit(1);
    }
    spinner2?.succeed(stepIndicator(2, 5, "Stack is valid"));

    if (!opts.json && validation.issues.length > 0) {
      for (const issue of validation.issues) {
        if (issue.severity === "warning") {
          console.log(`  ${warning(issue.message)}`);
        }
      }
    }

    // ── Step 3: Detect project type & scaffold ──
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

    const spinner3 = !opts.json
      ? ora(stepIndicator(3, 5, `Generating ${projectType} project structure`)).start()
      : null;

    fs.mkdirSync(targetDir, { recursive: true });

    const output = orchestrator.generate(stack);
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
    spinner3?.succeed(stepIndicator(3, 5, `${written.length} root files generated`));

    // ── Step 4: Scaffold sub-projects ──
    const scaffoldLog: string[] = [];
    const spinner4 = !opts.json
      ? ora(stepIndicator(4, 5, "Scaffolding applications")).start()
      : null;

    if (isFullStack) {
      if (spinner4)
        spinner4.text = stepIndicator(4, 5, `Scaffolding ${frontendTech?.name} frontend...`);
      const fLog = scaffoldFrontend(
        frontendTech!,
        path.join(targetDir, "frontend"),
        targetDir,
        projectName,
      );
      scaffoldLog.push(...fLog.map((l) => `frontend: ${l}`));

      if (spinner4)
        spinner4.text = stepIndicator(4, 5, `Scaffolding ${backendTech?.name} backend...`);
      const bLog = scaffoldBackend(
        backendTech!,
        path.join(targetDir, "backend"),
        targetDir,
        projectName,
        allTechObjects,
      );
      scaffoldLog.push(...bLog.map((l) => `backend: ${l}`));
    } else if (isFrontendOnly) {
      if (frontendTech?.officialScaffold) {
        if (spinner4) spinner4.text = stepIndicator(4, 5, `Scaffolding ${frontendTech?.name}...`);
        const tempName = ".scaffold-temp";
        const r = run(`${frontendTech?.officialScaffold} ${tempName}`, targetDir);
        if (r.success) {
          const tempDir = path.join(targetDir, tempName);
          if (fs.existsSync(tempDir)) {
            for (const item of fs.readdirSync(tempDir)) {
              const src = path.join(tempDir, item);
              const dest = path.join(targetDir, item);
              if (!fs.existsSync(dest)) {
                fs.renameSync(src, dest);
              }
            }
            fs.rmSync(tempDir, { recursive: true, force: true });
          }
          scaffoldLog.push(`${frontendTech?.name} scaffolded in project root`);
        } else {
          scaffoldLog.push(
            `${frontendTech?.name} (run manually: ${frontendTech?.officialScaffold})`,
          );
        }
      }
    } else if (isBackendOnly) {
      if (spinner4) spinner4.text = stepIndicator(4, 5, `Scaffolding ${backendTech?.name}...`);
      const bLog = scaffoldBackend(backendTech!, targetDir, targetDir, projectName, allTechObjects);
      scaffoldLog.push(...bLog);
    }

    // Install additional technologies
    if (spinner4)
      spinner4.text = stepIndicator(
        4,
        5,
        "Installing additional technologies (ORM, Auth, Styling, DevOps)...",
      );

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
      if (r.success) {
        scaffoldLog.push(`${r.techId}: ${r.message}`);
      } else {
        scaffoldLog.push(`${r.techId}: FAILED \u2014 ${r.message}`);
      }
    }
    spinner4?.succeed(stepIndicator(4, 5, `${scaffoldLog.length} scaffold operations completed`));

    // ── Step 5: Git init ──
    if (opts.git) {
      const spinner5 = !opts.json
        ? ora(stepIndicator(5, 5, "Initializing git repository")).start()
        : null;
      orchestrator.initGit(targetDir, stack);
      scaffoldLog.push("Git initialized with initial commit");
      spinner5?.succeed(stepIndicator(5, 5, "Git repository initialized"));
    }

    // ── Output ──
    if (opts.json) {
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
            validation: {
              issues: validation.issues,
              resolvedDependencies: validation.resolvedDependencies,
              portAssignments: validation.portAssignments,
            },
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
        `${chalk.dim("Profile:")}  ${opts.profile || "standard"}`,
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
  });
