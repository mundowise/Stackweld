/**
 * Migration Planner — Generates step-by-step migration plans between technologies.
 */

import type { Technology } from "../types/technology.js";

export interface MigrationStep {
  order: number;
  title: string;
  description: string;
  commands?: string[];
  files?: string[];
}

export interface MigrationPlan {
  from: { id: string; name: string };
  to: { id: string; name: string };
  steps: MigrationStep[];
  difficulty: "easy" | "moderate" | "hard" | "expert";
  estimatedTime: string;
}

// ─── Migration Knowledge Base ──────────────────────────

interface MigrationKnowledge {
  difficulty: MigrationPlan["difficulty"];
  estimatedTime: string;
  steps: Omit<MigrationStep, "order">[];
}

const MIGRATION_KNOWLEDGE: Record<string, MigrationKnowledge> = {
  "express->fastify": {
    difficulty: "moderate",
    estimatedTime: "4-8 hours",
    steps: [
      {
        title: "Install Fastify",
        description: "Install Fastify and its ecosystem plugins.",
        commands: [
          "npm install fastify @fastify/cors @fastify/helmet @fastify/sensible",
          "npm uninstall express cors helmet",
        ],
      },
      {
        title: "Update Server Entry",
        description:
          "Rewrite the Express app initialization to use Fastify's createServer pattern. Replace app.listen() with fastify.listen().",
        files: ["src/server.ts", "src/app.ts", "src/index.ts"],
      },
      {
        title: "Convert Route Handlers",
        description:
          "Replace Express (req, res, next) handlers with Fastify's (request, reply) pattern. Add JSON schema validation for request/response.",
        files: ["src/routes/*.ts"],
      },
      {
        title: "Update Middleware",
        description:
          "Replace Express middleware with Fastify plugins. Use fastify.register() instead of app.use().",
        files: ["src/middleware/*.ts", "src/plugins/*.ts"],
      },
      {
        title: "Update Error Handling",
        description:
          "Replace Express error middleware with Fastify's setErrorHandler() and setNotFoundHandler().",
        files: ["src/errors.ts"],
      },
      {
        title: "Run Tests",
        description: "Execute the test suite and fix any failures caused by the migration.",
        commands: ["npm test"],
      },
    ],
  },

  "express->nestjs": {
    difficulty: "hard",
    estimatedTime: "1-3 days",
    steps: [
      {
        title: "Install NestJS",
        description: "Install the NestJS CLI and core packages.",
        commands: [
          "npm install -g @nestjs/cli",
          "npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs",
        ],
      },
      {
        title: "Set Up Module Structure",
        description:
          "Create the root AppModule and restructure the project into NestJS modules. Each feature area becomes a module with its own controller and service.",
        files: ["src/app.module.ts", "src/main.ts"],
      },
      {
        title: "Convert Routes to Controllers",
        description:
          "Replace Express route handlers with NestJS controllers using decorators (@Get, @Post, etc.).",
        files: ["src/*/*.controller.ts"],
      },
      {
        title: "Extract Business Logic to Services",
        description:
          "Move business logic from route handlers into injectable service classes. Use NestJS dependency injection.",
        files: ["src/*/*.service.ts"],
      },
      {
        title: "Convert Middleware",
        description:
          "Replace Express middleware with NestJS guards, interceptors, and pipes as appropriate.",
        files: ["src/common/*.ts"],
      },
      {
        title: "Update Configuration",
        description:
          "Use @nestjs/config for environment variables. Replace any custom config loading.",
        commands: ["npm install @nestjs/config"],
        files: ["src/config/*.ts"],
      },
      {
        title: "Run Tests",
        description: "Update test setup for NestJS testing utilities and verify all tests pass.",
        commands: ["npm test"],
      },
    ],
  },

  "django->fastapi": {
    difficulty: "hard",
    estimatedTime: "2-5 days",
    steps: [
      {
        title: "Install FastAPI",
        description: "Install FastAPI, Uvicorn, and supporting libraries.",
        commands: ["pip install fastapi uvicorn[standard] pydantic sqlalchemy alembic"],
      },
      {
        title: "Create FastAPI App Entry",
        description:
          "Create the main FastAPI application file with CORS, middleware, and router includes.",
        files: ["app/main.py"],
      },
      {
        title: "Convert Models",
        description:
          "Rewrite Django ORM models as SQLAlchemy models. Create Pydantic schemas for request/response validation.",
        files: ["app/models/*.py", "app/schemas/*.py"],
      },
      {
        title: "Rewrite Views as Endpoints",
        description:
          "Convert Django views/viewsets to FastAPI async route functions. Replace DRF serializers with Pydantic models.",
        files: ["app/routers/*.py"],
      },
      {
        title: "Update Authentication",
        description:
          "Replace Django auth with FastAPI security utilities (OAuth2, JWT). Implement dependency injection for auth.",
        files: ["app/auth.py", "app/dependencies.py"],
      },
      {
        title: "Migrate Database Setup",
        description:
          "Replace Django migrations with Alembic. Set up SQLAlchemy session management.",
        commands: ["alembic init alembic", "alembic revision --autogenerate -m 'initial'"],
        files: ["alembic.ini", "alembic/env.py"],
      },
      {
        title: "Run Tests",
        description: "Rewrite tests using httpx.AsyncClient and pytest-asyncio.",
        commands: ["pip install httpx pytest-asyncio", "pytest"],
      },
    ],
  },

  "flask->fastapi": {
    difficulty: "moderate",
    estimatedTime: "4-8 hours",
    steps: [
      {
        title: "Install FastAPI",
        description: "Install FastAPI and Uvicorn.",
        commands: ["pip install fastapi uvicorn[standard] pydantic", "pip uninstall flask"],
      },
      {
        title: "Create FastAPI App",
        description: "Replace Flask() with FastAPI(). Update the application entry point.",
        files: ["app/main.py", "app/__init__.py"],
      },
      {
        title: "Convert Routes",
        description:
          "Replace @app.route() decorators with @app.get()/@app.post() etc. Add type hints and Pydantic models for request validation.",
        files: ["app/routes/*.py"],
      },
      {
        title: "Make Endpoints Async",
        description:
          "Convert synchronous route functions to async where beneficial. Update database calls accordingly.",
        files: ["app/routes/*.py"],
      },
      {
        title: "Update Extensions",
        description:
          "Replace Flask extensions (Flask-CORS, Flask-SQLAlchemy) with FastAPI equivalents or middleware.",
        files: ["app/extensions.py", "app/config.py"],
      },
      {
        title: "Run Tests",
        description: "Update test client from Flask's test_client to httpx.AsyncClient.",
        commands: ["pip install httpx pytest-asyncio", "pytest"],
      },
    ],
  },

  "react->vue": {
    difficulty: "hard",
    estimatedTime: "1-3 days",
    steps: [
      {
        title: "Install Vue",
        description: "Install Vue 3 and its ecosystem.",
        commands: [
          "npm install vue @vitejs/plugin-vue",
          "npm uninstall react react-dom @types/react @types/react-dom",
        ],
      },
      {
        title: "Update Build Config",
        description: "Replace React-specific Vite/webpack config with Vue plugin configuration.",
        files: ["vite.config.ts", "tsconfig.json"],
      },
      {
        title: "Convert Components",
        description:
          "Rewrite JSX/TSX components as Vue Single File Components (.vue). Replace props/state with Vue's defineProps/ref/reactive.",
        files: ["src/components/*.vue"],
      },
      {
        title: "Replace Hooks with Composition API",
        description:
          "Convert React hooks (useState, useEffect, useMemo) to Vue Composition API (ref, watch, computed).",
        files: ["src/composables/*.ts"],
      },
      {
        title: "Update Routing",
        description:
          "Replace react-router with vue-router. Update route definitions and navigation guards.",
        commands: ["npm install vue-router@4", "npm uninstall react-router-dom"],
        files: ["src/router/index.ts"],
      },
      {
        title: "Update State Management",
        description: "Replace Redux/Zustand with Pinia for global state management.",
        commands: ["npm install pinia"],
        files: ["src/stores/*.ts"],
      },
      {
        title: "Run Tests",
        description: "Update test setup for Vue Test Utils.",
        commands: ["npm install @vue/test-utils", "npm test"],
      },
    ],
  },

  "jest->vitest": {
    difficulty: "easy",
    estimatedTime: "1-2 hours",
    steps: [
      {
        title: "Install Vitest",
        description: "Install Vitest and remove Jest.",
        commands: [
          "npm install -D vitest @vitest/coverage-v8",
          "npm uninstall jest ts-jest @types/jest babel-jest",
        ],
      },
      {
        title: "Create Vitest Config",
        description:
          "Create vitest.config.ts or add test config to vite.config.ts. Migrate Jest config options.",
        files: ["vitest.config.ts", "vite.config.ts"],
      },
      {
        title: "Update Test Globals",
        description:
          "Replace jest.fn() with vi.fn(), jest.mock() with vi.mock(), jest.spyOn() with vi.spyOn(). Enable globals in config or add imports.",
        files: ["src/**/*.test.ts", "src/**/*.spec.ts"],
      },
      {
        title: "Update package.json Scripts",
        description: "Replace 'jest' with 'vitest' in test scripts.",
        files: ["package.json"],
      },
      {
        title: "Run Tests",
        description: "Verify all tests pass with Vitest.",
        commands: ["npx vitest run"],
      },
    ],
  },

  "prisma->drizzle": {
    difficulty: "moderate",
    estimatedTime: "4-8 hours",
    steps: [
      {
        title: "Install Drizzle",
        description: "Install Drizzle ORM and its kit.",
        commands: [
          "npm install drizzle-orm",
          "npm install -D drizzle-kit",
          "npm uninstall prisma @prisma/client",
        ],
      },
      {
        title: "Convert Schema",
        description:
          "Rewrite Prisma schema (.prisma) as Drizzle TypeScript schema definitions using table() and column helpers.",
        files: ["src/db/schema.ts"],
      },
      {
        title: "Set Up Database Client",
        description:
          "Create the Drizzle database client instance. Replace PrismaClient initialization.",
        files: ["src/db/index.ts", "src/db/client.ts"],
      },
      {
        title: "Update Queries",
        description:
          "Rewrite Prisma queries (findMany, create, update, delete) to Drizzle's SQL-like builder pattern (select, insert, update, delete).",
        files: ["src/**/*.ts"],
      },
      {
        title: "Update Migrations",
        description: "Generate Drizzle migrations from the new schema.",
        commands: ["npx drizzle-kit generate", "npx drizzle-kit migrate"],
        files: ["drizzle.config.ts"],
      },
      {
        title: "Run Tests",
        description: "Verify all database operations work correctly.",
        commands: ["npm test"],
      },
    ],
  },

  "npm->pnpm": {
    difficulty: "easy",
    estimatedTime: "30 minutes",
    steps: [
      {
        title: "Install pnpm",
        description: "Install pnpm globally if not already available.",
        commands: ["npm install -g pnpm"],
      },
      {
        title: "Remove npm Artifacts",
        description: "Delete node_modules and package-lock.json.",
        commands: ["rm -rf node_modules", "rm -f package-lock.json"],
      },
      {
        title: "Install with pnpm",
        description: "Run pnpm install to generate pnpm-lock.yaml and a new node_modules.",
        commands: ["pnpm install"],
      },
      {
        title: "Update Scripts and CI",
        description: "Replace 'npm run' with 'pnpm' in scripts, CI configs, and documentation.",
        files: ["package.json", ".github/workflows/*.yml", "Dockerfile"],
      },
      {
        title: "Verify",
        description: "Run the project to ensure everything works with pnpm.",
        commands: ["pnpm build", "pnpm test"],
      },
    ],
  },

  "javascript->typescript": {
    difficulty: "moderate",
    estimatedTime: "2-8 hours",
    steps: [
      {
        title: "Install TypeScript",
        description: "Install TypeScript and type definitions for your dependencies.",
        commands: ["npm install -D typescript @types/node"],
      },
      {
        title: "Create tsconfig.json",
        description:
          "Initialize TypeScript configuration with appropriate settings (strict mode recommended).",
        commands: ["npx tsc --init"],
        files: ["tsconfig.json"],
      },
      {
        title: "Rename Files",
        description:
          "Rename .js files to .ts (and .jsx to .tsx). Start with entry points and work outward.",
        files: ["src/**/*.ts"],
      },
      {
        title: "Add Type Annotations",
        description:
          "Add type annotations to function parameters, return types, and variables. Create interfaces for data structures.",
        files: ["src/**/*.ts"],
      },
      {
        title: "Fix Type Errors",
        description:
          "Run the TypeScript compiler and fix all type errors. Use 'any' sparingly as a last resort.",
        commands: ["npx tsc --noEmit"],
      },
      {
        title: "Update Build Scripts",
        description: "Update package.json scripts to compile TypeScript before running.",
        files: ["package.json"],
      },
      {
        title: "Run Tests",
        description: "Ensure all tests pass with the TypeScript setup.",
        commands: ["npm test"],
      },
    ],
  },
};

// ─── Planner ───────────────────────────────────────────

/**
 * Generate a migration plan between two technologies.
 * Uses known migration paths when available, otherwise generates generic steps.
 */
export function planMigration(fromId: string, toId: string, techs: Technology[]): MigrationPlan {
  const fromTech = techs.find((t) => t.id === fromId);
  const toTech = techs.find((t) => t.id === toId);

  const fromName = fromTech?.name ?? fromId;
  const toName = toTech?.name ?? toId;

  const key = `${fromId}->${toId}`;
  const knowledge = MIGRATION_KNOWLEDGE[key];

  if (knowledge) {
    return {
      from: { id: fromId, name: fromName },
      to: { id: toId, name: toName },
      steps: knowledge.steps.map((s, i) => ({ ...s, order: i + 1 })),
      difficulty: knowledge.difficulty,
      estimatedTime: knowledge.estimatedTime,
    };
  }

  // Generic migration plan for unknown pairs
  return {
    from: { id: fromId, name: fromName },
    to: { id: toId, name: toName },
    difficulty: "moderate",
    estimatedTime: "varies",
    steps: [
      {
        order: 1,
        title: `Install ${toName}`,
        description: `Install ${toName} and its required dependencies.`,
        commands: toTech?.officialScaffold ? [toTech.officialScaffold] : undefined,
      },
      {
        order: 2,
        title: `Uninstall ${fromName}`,
        description: `Remove ${fromName} and its specific dependencies that are no longer needed.`,
      },
      {
        order: 3,
        title: "Update Imports and Configuration",
        description: `Update all import statements and configuration files to use ${toName} APIs instead of ${fromName}.`,
        files: toTech?.configFiles ?? undefined,
      },
      {
        order: 4,
        title: "Rewrite Integration Code",
        description: `Rewrite code that uses ${fromName}-specific APIs to use ${toName} equivalents.`,
      },
      {
        order: 5,
        title: "Update Environment Variables",
        description: "Review and update environment variables for the new technology.",
        files: [".env", ".env.example"],
      },
      {
        order: 6,
        title: "Run Tests",
        description: "Execute the full test suite and fix any failures.",
        commands: ["npm test"],
      },
    ],
  };
}
