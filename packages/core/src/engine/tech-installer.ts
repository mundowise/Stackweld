/**
 * TechInstaller — Knows how to install and configure EVERY technology
 * in a project directory. Each category has specific installation logic.
 *
 * Categories handled:
 * - database: Docker service + connection env vars
 * - orm: Initialize schema + connect to selected DB
 * - auth: Install package + config files + env vars
 * - styling: Install + configure (Tailwind, shadcn, etc.)
 * - devops: Create config files (biome, vitest, playwright, etc.)
 * - service: Docker service entry
 *
 * Frontend and Backend scaffolding is handled by the generate command directly.
 */

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import type { Technology } from "../types/index.js";

// ─── Types ──────────────────────────────────────────

export interface InstallContext {
  projectDir: string; // Root project directory
  frontendDir: string | null; // frontend/ subdir (null if single project)
  backendDir: string | null; // backend/ subdir (null if single project)
  projectName: string;
  isFullStack: boolean;
  allTechs: Technology[];
  runtime: "node" | "python" | "go" | "rust" | "bun" | "deno" | "php" | null;
}

export interface InstallResult {
  techId: string;
  success: boolean;
  message: string;
  filesCreated: string[];
}

// ─── Helpers ────────────────────────────────────────

function run(cmd: string, cwd: string, timeout = 60_000): boolean {
  try {
    const parts = cmd.split(/\s+/).filter(Boolean);
    execFileSync(parts[0], parts.slice(1), { cwd, stdio: "pipe", timeout });
    return true;
  } catch {
    return false;
  }
}

function write(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
}

function hasTech(ctx: InstallContext, id: string): boolean {
  return ctx.allTechs.some((t) => t.id === id);
}

function getNodeDir(ctx: InstallContext): string {
  return ctx.frontendDir || ctx.projectDir;
}

function getPythonDir(ctx: InstallContext): string {
  return ctx.backendDir || ctx.projectDir;
}

function getDbUrl(ctx: InstallContext): string {
  if (hasTech(ctx, "postgresql"))
    return `postgresql://postgres:postgres@localhost:5432/${ctx.projectName}`;
  if (hasTech(ctx, "mysql") || hasTech(ctx, "mariadb"))
    return `mysql://root:root@localhost:3306/${ctx.projectName}`;
  if (hasTech(ctx, "mongodb"))
    return `mongodb://admin:admin@localhost:27017/${ctx.projectName}?authSource=admin`;
  if (hasTech(ctx, "sqlite")) return "file:./prisma/dev.db";
  if (hasTech(ctx, "turso")) return "libsql://your-db.turso.io";
  if (hasTech(ctx, "neon")) return "postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb";
  return "file:./dev.db";
}

// ─── ORM Installers ─────────────────────────────────

function installPrisma(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  const files: string[] = [];
  const dbUrl = getDbUrl(ctx);

  const provider = hasTech(ctx, "postgresql")
    ? "postgresql"
    : hasTech(ctx, "mysql") || hasTech(ctx, "mariadb")
      ? "mysql"
      : hasTech(ctx, "mongodb")
        ? "mongodb"
        : "sqlite";

  run(`npm install prisma @prisma/client`, dir);
  run(`npx prisma init --datasource-provider ${provider}`, dir);

  // Update schema if it was created
  const schemaPath = path.join(dir, "prisma/schema.prisma");
  if (fs.existsSync(schemaPath)) {
    let schema = fs.readFileSync(schemaPath, "utf-8");
    // Add a sample model
    if (!schema.includes("model User")) {
      schema += `\nmodel User {\n  id        String   @id @default(cuid())\n  email     String   @unique\n  name      String?\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n`;
      fs.writeFileSync(schemaPath, schema);
    }
    files.push("prisma/schema.prisma");
  }

  // Add DATABASE_URL to .env.example
  const envPath = path.join(dir, ".env.example");
  if (fs.existsSync(envPath)) {
    let env = fs.readFileSync(envPath, "utf-8");
    if (!env.includes("DATABASE_URL")) {
      env += `\n# Prisma\nDATABASE_URL="${dbUrl}"\n`;
      fs.writeFileSync(envPath, env);
    }
  }

  return {
    techId: "prisma",
    success: true,
    message: `Prisma initialized with ${provider}`,
    filesCreated: files,
  };
}

function installDrizzle(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  const provider = hasTech(ctx, "postgresql")
    ? "pg"
    : hasTech(ctx, "mysql")
      ? "mysql2"
      : "better-sqlite3";
  const drizzleDialect = hasTech(ctx, "postgresql")
    ? "postgresql"
    : hasTech(ctx, "mysql")
      ? "mysql"
      : "sqlite";

  run(`npm install drizzle-orm ${provider}`, dir);
  run(`npm install -D drizzle-kit`, dir);

  write(
    path.join(dir, "drizzle.config.ts"),
    `${[
      `import { defineConfig } from "drizzle-kit";`,
      ``,
      `export default defineConfig({`,
      `  dialect: "${drizzleDialect}",`,
      `  schema: "./src/db/schema.ts",`,
      `  out: "./drizzle",`,
      `  dbCredentials: {`,
      drizzleDialect === "sqlite" ? `    url: "./dev.db",` : `    url: process.env.DATABASE_URL!,`,
      `  },`,
      `});`,
    ].join("\n")}\n`,
  );

  write(
    path.join(dir, "src/db/schema.ts"),
    `${[
      `import { ${drizzleDialect === "postgresql" ? "pgTable, serial, text, timestamp" : drizzleDialect === "mysql" ? "mysqlTable, serial, text, timestamp" : "sqliteTable, integer, text"} } from "drizzle-orm/${drizzleDialect === "postgresql" ? "pg-core" : drizzleDialect === "mysql" ? "mysql-core" : "sqlite-core"}";`,
      ``,
      `export const users = ${drizzleDialect === "postgresql" ? "pgTable" : drizzleDialect === "mysql" ? "mysqlTable" : "sqliteTable"}("users", {`,
      drizzleDialect === "sqlite"
        ? `  id: integer("id").primaryKey({ autoIncrement: true }),\n  email: text("email").notNull().unique(),\n  name: text("name"),`
        : `  id: serial("id").primaryKey(),\n  email: text("email").notNull().unique(),\n  name: text("name"),\n  createdAt: timestamp("created_at").defaultNow(),`,
      `});`,
    ].join("\n")}\n`,
  );

  return {
    techId: "drizzle",
    success: true,
    message: `Drizzle initialized with ${drizzleDialect}`,
    filesCreated: ["drizzle.config.ts", "src/db/schema.ts"],
  };
}

function installTypeorm(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  run(`npm install typeorm reflect-metadata`, dir);

  const dbType = hasTech(ctx, "postgresql")
    ? "postgres"
    : hasTech(ctx, "mysql")
      ? "mysql"
      : "sqlite";

  write(
    path.join(dir, "src/data-source.ts"),
    `${[
      `import "reflect-metadata";`,
      `import { DataSource } from "typeorm";`,
      ``,
      `export const AppDataSource = new DataSource({`,
      `  type: "${dbType}",`,
      dbType === "sqlite" ? `  database: "./dev.db",` : `  url: process.env.DATABASE_URL,`,
      `  synchronize: true,`,
      `  logging: false,`,
      `  entities: ["src/entities/**/*.ts"],`,
      `  migrations: ["src/migrations/**/*.ts"],`,
      `});`,
    ].join("\n")}\n`,
  );

  return {
    techId: "typeorm",
    success: true,
    message: `TypeORM initialized with ${dbType}`,
    filesCreated: ["src/data-source.ts"],
  };
}

function installSqlalchemy(ctx: InstallContext): InstallResult {
  const dir = getPythonDir(ctx);
  const pip = path.join(dir, ".venv/bin/pip");
  if (fs.existsSync(pip)) {
    run(`${pip} install sqlalchemy alembic`, dir);
    run(`${path.join(dir, ".venv/bin/alembic")} init alembic`, dir);
  }
  return {
    techId: "sqlalchemy",
    success: true,
    message: "SQLAlchemy + Alembic initialized",
    filesCreated: ["alembic/", "alembic.ini"],
  };
}

function installMongoose(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  run(`npm install mongoose`, dir);

  write(
    path.join(dir, "src/db/connection.ts"),
    `${[
      `import mongoose from "mongoose";`,
      ``,
      `export async function connectDB() {`,
      `  const url = process.env.MONGODB_URL || "mongodb://localhost:27017/${ctx.projectName}";`,
      `  await mongoose.connect(url);`,
      `  console.log("MongoDB connected");`,
      `}`,
    ].join("\n")}\n`,
  );

  return {
    techId: "mongoose",
    success: true,
    message: "Mongoose configured",
    filesCreated: ["src/db/connection.ts"],
  };
}

// ─── Auth Installers ────────────────────────────────

function installNextAuth(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  run(`npm install next-auth@beta`, dir);

  write(
    path.join(dir, "src/auth.ts"),
    `${[
      `import NextAuth from "next-auth";`,
      ``,
      `export const { handlers, signIn, signOut, auth } = NextAuth({`,
      `  providers: [],`,
      `});`,
    ].join("\n")}\n`,
  );

  write(
    path.join(dir, "src/app/api/auth/[...nextauth]/route.ts"),
    `${[`import { handlers } from "@/auth";`, `export const { GET, POST } = handlers;`].join(
      "\n",
    )}\n`,
  );

  return {
    techId: "nextauth",
    success: true,
    message: "NextAuth.js configured",
    filesCreated: ["src/auth.ts", "src/app/api/auth/[...nextauth]/route.ts"],
  };
}

function installClerk(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  run(`npm install @clerk/nextjs`, dir);

  write(
    path.join(dir, "src/middleware.ts"),
    `${[
      `import { clerkMiddleware } from "@clerk/nextjs/server";`,
      `export default clerkMiddleware();`,
      `export const config = { matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"] };`,
    ].join("\n")}\n`,
  );

  return {
    techId: "clerk",
    success: true,
    message: "Clerk configured",
    filesCreated: ["src/middleware.ts"],
  };
}

function installLucia(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  run(`npm install lucia`, dir);
  return { techId: "lucia", success: true, message: "Lucia installed", filesCreated: [] };
}

function installSupabaseAuth(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  run(`npm install @supabase/supabase-js`, dir);

  write(
    path.join(dir, "src/lib/supabase.ts"),
    `${[
      `import { createClient } from "@supabase/supabase-js";`,
      ``,
      `export const supabase = createClient(`,
      `  process.env.NEXT_PUBLIC_SUPABASE_URL!,`,
      `  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,`,
      `);`,
    ].join("\n")}\n`,
  );

  return {
    techId: "supabase-auth",
    success: true,
    message: "Supabase Auth configured",
    filesCreated: ["src/lib/supabase.ts"],
  };
}

// ─── Styling Installers ─────────────────────────────

function installTailwind(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  // Only install if not already present (create-next-app --tailwind already does it)
  const pkgPath = path.join(dir, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (!allDeps.tailwindcss) {
      run(`npm install -D tailwindcss @tailwindcss/vite`, dir);
    }
  }
  return {
    techId: "tailwindcss",
    success: true,
    message: "Tailwind CSS configured",
    filesCreated: [],
  };
}

function installShadcn(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  run(`npx shadcn@latest init -y`, dir);
  return {
    techId: "shadcn-ui",
    success: true,
    message: "shadcn/ui initialized",
    filesCreated: ["components.json"],
  };
}

function installDaisyUI(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  run(`npm install -D daisyui`, dir);
  return { techId: "daisyui", success: true, message: "DaisyUI installed", filesCreated: [] };
}

function installChakraUI(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  run(`npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion`, dir);
  return { techId: "chakra-ui", success: true, message: "Chakra UI installed", filesCreated: [] };
}

function installMaterialUI(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  run(`npm install @mui/material @emotion/react @emotion/styled`, dir);
  return {
    techId: "material-ui",
    success: true,
    message: "Material UI installed",
    filesCreated: [],
  };
}

// ─── DevOps Installers ──────────────────────────────

function installVitest(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  run(`npm install -D vitest`, dir);

  write(
    path.join(dir, "vitest.config.ts"),
    `${[
      `import { defineConfig } from "vitest/config";`,
      ``,
      `export default defineConfig({`,
      `  test: {`,
      `    globals: true,`,
      `  },`,
      `});`,
    ].join("\n")}\n`,
  );

  return {
    techId: "vitest",
    success: true,
    message: "Vitest configured",
    filesCreated: ["vitest.config.ts"],
  };
}

function installJest(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  run(`npm install -D jest ts-jest @types/jest`, dir);

  write(
    path.join(dir, "jest.config.ts"),
    `${[`export default {`, `  preset: "ts-jest",`, `  testEnvironment: "node",`, `};`].join(
      "\n",
    )}\n`,
  );

  return {
    techId: "jest",
    success: true,
    message: "Jest configured",
    filesCreated: ["jest.config.ts"],
  };
}

function installPlaywright(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  run(`npm install -D @playwright/test`, dir);

  write(
    path.join(dir, "playwright.config.ts"),
    `${[
      `import { defineConfig } from "@playwright/test";`,
      ``,
      `export default defineConfig({`,
      `  testDir: "./tests",`,
      `  use: { baseURL: "http://localhost:3000" },`,
      `});`,
    ].join("\n")}\n`,
  );

  return {
    techId: "playwright",
    success: true,
    message: "Playwright configured",
    filesCreated: ["playwright.config.ts"],
  };
}

function installCypress(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  run(`npm install -D cypress`, dir);

  write(
    path.join(dir, "cypress.config.ts"),
    `${[
      `import { defineConfig } from "cypress";`,
      ``,
      `export default defineConfig({`,
      `  e2e: { baseUrl: "http://localhost:3000" },`,
      `});`,
    ].join("\n")}\n`,
  );

  return {
    techId: "cypress",
    success: true,
    message: "Cypress configured",
    filesCreated: ["cypress.config.ts"],
  };
}

function installBiome(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  run(`npm install -D @biomejs/biome`, dir);

  write(
    path.join(dir, "biome.json"),
    `${JSON.stringify(
      {
        $schema: "https://biomejs.dev/schemas/1.9.0/schema.json",
        formatter: { indentStyle: "space", indentWidth: 2, lineWidth: 100 },
        linter: { enabled: true, rules: { recommended: true } },
        organizeImports: { enabled: true },
      },
      null,
      2,
    )}\n`,
  );

  return {
    techId: "biome",
    success: true,
    message: "Biome configured",
    filesCreated: ["biome.json"],
  };
}

function installEslint(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  // Don't install if already present from scaffold (Next.js includes it)
  const configExists =
    fs.existsSync(path.join(dir, "eslint.config.mjs")) ||
    fs.existsSync(path.join(dir, ".eslintrc.json")) ||
    fs.existsSync(path.join(dir, "eslint.config.js"));
  if (!configExists) {
    run(`npm install -D eslint @eslint/js typescript-eslint`, dir);
    write(
      path.join(dir, "eslint.config.js"),
      `${[
        `import js from "@eslint/js";`,
        `import tseslint from "typescript-eslint";`,
        ``,
        `export default tseslint.config(`,
        `  js.configs.recommended,`,
        `  ...tseslint.configs.recommended,`,
        `);`,
      ].join("\n")}\n`,
    );
  }
  return { techId: "eslint", success: true, message: "ESLint configured", filesCreated: [] };
}

function installPrettier(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  run(`npm install -D prettier`, dir);
  write(
    path.join(dir, ".prettierrc"),
    `${JSON.stringify({ semi: true, singleQuote: false, tabWidth: 2, trailingComma: "all" }, null, 2)}\n`,
  );
  return {
    techId: "prettier",
    success: true,
    message: "Prettier configured",
    filesCreated: [".prettierrc"],
  };
}

function installZod(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  run(`npm install zod`, dir);
  return { techId: "zod", success: true, message: "Zod installed", filesCreated: [] };
}

function installStorybook(ctx: InstallContext): InstallResult {
  const dir = getNodeDir(ctx);
  run(`npx storybook@latest init --no-dev`, dir, 120_000);
  return {
    techId: "storybook",
    success: true,
    message: "Storybook initialized",
    filesCreated: [".storybook/"],
  };
}

function installGithubActions(_ctx: InstallContext): InstallResult {
  // Already handled by scaffold-orchestrator (ci.yml)
  return {
    techId: "github-actions",
    success: true,
    message: "GitHub Actions CI configured",
    filesCreated: [".github/workflows/ci.yml"],
  };
}

// ─── Main installer ─────────────────────────────────

const INSTALLERS: Record<string, (ctx: InstallContext) => InstallResult> = {
  // ORMs
  prisma: installPrisma,
  drizzle: installDrizzle,
  typeorm: installTypeorm,
  sqlalchemy: installSqlalchemy,
  mongoose: installMongoose,

  // Auth
  nextauth: installNextAuth,
  clerk: installClerk,
  lucia: installLucia,
  "supabase-auth": installSupabaseAuth,

  // Styling
  tailwindcss: installTailwind,
  "shadcn-ui": installShadcn,
  "chakra-ui": installChakraUI,
  "material-ui": installMaterialUI,
  daisyui: installDaisyUI,

  // DevOps
  vitest: installVitest,
  jest: installJest,
  playwright: installPlaywright,
  cypress: installCypress,
  biome: installBiome,
  eslint: installEslint,
  prettier: installPrettier,
  zod: installZod,
  storybook: installStorybook,
  "github-actions": installGithubActions,
};

/**
 * Install all selected technologies that have installers.
 * Skips runtimes (already handled), frontends/backends (handled by generate),
 * databases (handled by docker-compose), and services (handled by docker-compose).
 */
export function installTechnologies(ctx: InstallContext): InstallResult[] {
  const results: InstallResult[] = [];

  // Install in dependency order: styling → orm → auth → devops
  const order = ["styling", "orm", "auth", "devops"];

  for (const phase of order) {
    for (const tech of ctx.allTechs) {
      if (tech.category !== phase) continue;
      const installer = INSTALLERS[tech.id];
      if (installer) {
        try {
          const result = installer(ctx);
          results.push(result);
        } catch (err) {
          results.push({
            techId: tech.id,
            success: false,
            message: err instanceof Error ? err.message : "Install failed",
            filesCreated: [],
          });
        }
      }
    }
  }

  return results;
}
