/**
 * Stack Detector — Analyze a project directory to detect its technology stack.
 */

import * as fs from "node:fs";
import * as path from "node:path";

export interface DetectedStack {
  technologies: DetectedTech[];
  confidence: number;
  projectType: "frontend" | "backend" | "fullstack" | "monorepo" | "library" | "unknown";
  packageManagers: string[];
}

export interface DetectedTech {
  id: string;
  name: string;
  confidence: number;
  detectedVia: string;
  version?: string;
}

// ─── Dependency → Registry ID mappings ─────────────────

const NPM_DEPENDENCY_MAP: Record<string, { id: string; name: string }> = {
  next: { id: "nextjs", name: "Next.js" },
  react: { id: "react", name: "React" },
  vue: { id: "vue", name: "Vue" },
  "@angular/core": { id: "angular", name: "Angular" },
  express: { id: "express", name: "Express" },
  fastify: { id: "fastify", name: "Fastify" },
  "@nestjs/core": { id: "nestjs", name: "NestJS" },
  prisma: { id: "prisma", name: "Prisma" },
  "drizzle-orm": { id: "drizzle", name: "Drizzle ORM" },
  typeorm: { id: "typeorm", name: "TypeORM" },
  tailwindcss: { id: "tailwindcss", name: "Tailwind CSS" },
  "@chakra-ui/react": { id: "chakra-ui", name: "Chakra UI" },
  typescript: { id: "typescript", name: "TypeScript" },
  vitest: { id: "vitest", name: "Vitest" },
  jest: { id: "jest", name: "Jest" },
  "next-auth": { id: "nextauth", name: "NextAuth.js" },
  "@clerk/nextjs": { id: "clerk", name: "Clerk" },
};

const PYTHON_DEPENDENCY_MAP: Record<string, { id: string; name: string }> = {
  fastapi: { id: "fastapi", name: "FastAPI" },
  django: { id: "django", name: "Django" },
  flask: { id: "flask", name: "Flask" },
  sqlalchemy: { id: "sqlalchemy", name: "SQLAlchemy" },
};

const GO_DEPENDENCY_MAP: Record<string, { id: string; name: string }> = {
  "github.com/gin-gonic/gin": { id: "gin", name: "Gin" },
  "github.com/labstack/echo": { id: "echo", name: "Echo" },
};

const DOCKER_IMAGE_MAP: Record<string, { id: string; name: string }> = {
  postgres: { id: "postgresql", name: "PostgreSQL" },
  mysql: { id: "mysql", name: "MySQL" },
  mongo: { id: "mongodb", name: "MongoDB" },
  redis: { id: "redis", name: "Redis" },
  rabbitmq: { id: "rabbitmq", name: "RabbitMQ" },
  nginx: { id: "nginx", name: "Nginx" },
};

// ─── Helpers ───────────────────────────────────────────

function readFileOr(filePath: string): string | null {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf-8");
    }
  } catch {
    // Ignore read errors
  }
  return null;
}

function extractVersion(value: string): string | undefined {
  const match = value.replace(/[\^~>=<]/g, "").match(/(\d+[.\d]*)/);
  return match?.[1];
}

// ─── Main detection ────────────────────────────────────

/**
 * Detect the technology stack of a project at the given path.
 */
export function detectStack(projectPath: string): DetectedStack {
  const techs: DetectedTech[] = [];
  const packageManagers: string[] = [];
  let hasFrontend = false;
  let hasBackend = false;
  let isMonorepo = false;

  // ── Package managers ──
  if (fs.existsSync(path.join(projectPath, "pnpm-lock.yaml"))) packageManagers.push("pnpm");
  if (fs.existsSync(path.join(projectPath, "yarn.lock"))) packageManagers.push("yarn");
  if (fs.existsSync(path.join(projectPath, "package-lock.json"))) packageManagers.push("npm");
  if (fs.existsSync(path.join(projectPath, "bun.lockb"))) packageManagers.push("bun");

  // ── 1. package.json ──
  const pkgContent = readFileOr(path.join(projectPath, "package.json"));
  if (pkgContent) {
    try {
      const pkg = JSON.parse(pkgContent);
      const allDeps: Record<string, string> = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
      };

      for (const [dep, version] of Object.entries(allDeps)) {
        const mapping = NPM_DEPENDENCY_MAP[dep];
        if (mapping) {
          const isDevDep = dep in (pkg.devDependencies || {});
          techs.push({
            id: mapping.id,
            name: mapping.name,
            confidence: 95,
            detectedVia: isDevDep ? "devDependencies" : "package.json",
            version: extractVersion(version),
          });

          // Track frontend/backend
          if (["react", "vue", "angular", "nextjs"].includes(mapping.id)) {
            hasFrontend = true;
          }
          if (["express", "fastify", "nestjs"].includes(mapping.id)) {
            hasBackend = true;
          }
          // Next.js is fullstack
          if (mapping.id === "nextjs") {
            hasBackend = true;
          }
        }
      }
    } catch {
      // Invalid JSON, skip
    }
  }

  // ── 2. requirements.txt ──
  const reqContent = readFileOr(path.join(projectPath, "requirements.txt"));
  if (reqContent) {
    packageManagers.push("pip");
    const lines = reqContent.split("\n");
    for (const line of lines) {
      const dep = line
        .trim()
        .split(/[=<>!~]/)[0]
        .toLowerCase();
      const mapping = PYTHON_DEPENDENCY_MAP[dep];
      if (mapping) {
        const versionMatch = line.match(/==(\d+[.\d]*)/);
        techs.push({
          id: mapping.id,
          name: mapping.name,
          confidence: 95,
          detectedVia: "requirements.txt",
          version: versionMatch?.[1],
        });
        hasBackend = true;
      }
    }
  }

  // ── 2b. pyproject.toml ──
  const pyprojectContent = readFileOr(path.join(projectPath, "pyproject.toml"));
  if (pyprojectContent) {
    if (!packageManagers.includes("pip")) packageManagers.push("pip");
    for (const [dep, mapping] of Object.entries(PYTHON_DEPENDENCY_MAP)) {
      if (pyprojectContent.includes(`"${dep}`) || pyprojectContent.includes(`'${dep}`)) {
        const versionMatch = pyprojectContent.match(new RegExp(`["']${dep}[><=~!]*([\\d.]+)?["']`));
        techs.push({
          id: mapping.id,
          name: mapping.name,
          confidence: 85,
          detectedVia: "pyproject.toml",
          version: versionMatch?.[1],
        });
        hasBackend = true;
      }
    }
  }

  // ── 3. go.mod ──
  const goModContent = readFileOr(path.join(projectPath, "go.mod"));
  if (goModContent) {
    packageManagers.push("go");
    for (const [dep, mapping] of Object.entries(GO_DEPENDENCY_MAP)) {
      if (goModContent.includes(dep)) {
        const versionMatch = goModContent.match(
          new RegExp(`${dep.replace(/\//g, "\\/")}\\s+v(\\d+[.\\d]*)`),
        );
        techs.push({
          id: mapping.id,
          name: mapping.name,
          confidence: 95,
          detectedVia: "go.mod",
          version: versionMatch?.[1],
        });
        hasBackend = true;
      }
    }
  }

  // ── 4. Cargo.toml ──
  const cargoContent = readFileOr(path.join(projectPath, "Cargo.toml"));
  if (cargoContent) {
    packageManagers.push("cargo");
    techs.push({
      id: "rust",
      name: "Rust",
      confidence: 95,
      detectedVia: "Cargo.toml",
    });
    hasBackend = true;
  }

  // ── 5. docker-compose.yml / docker-compose.yaml ──
  for (const composeName of [
    "docker-compose.yml",
    "docker-compose.yaml",
    "compose.yml",
    "compose.yaml",
  ]) {
    const composeContent = readFileOr(path.join(projectPath, composeName));
    if (composeContent) {
      for (const [imageKey, mapping] of Object.entries(DOCKER_IMAGE_MAP)) {
        const imagePattern = new RegExp(`image:\\s*["']?[^\\n]*${imageKey}`, "i");
        if (imagePattern.test(composeContent)) {
          const versionMatch = composeContent.match(new RegExp(`${imageKey}:(\\d+[.\\d]*)`, "i"));
          techs.push({
            id: mapping.id,
            name: mapping.name,
            confidence: 90,
            detectedVia: composeName,
            version: versionMatch?.[1],
          });
        }
      }
      break; // Only process the first compose file found
    }
  }

  // ── 6. Dockerfile ──
  const dockerfileContent = readFileOr(path.join(projectPath, "Dockerfile"));
  if (dockerfileContent) {
    techs.push({
      id: "docker",
      name: "Docker",
      confidence: 95,
      detectedVia: "Dockerfile",
    });
  }

  // ── 7. .github/workflows ──
  const workflowsDir = path.join(projectPath, ".github", "workflows");
  try {
    if (fs.existsSync(workflowsDir) && fs.statSync(workflowsDir).isDirectory()) {
      const files = fs.readdirSync(workflowsDir);
      const ymlFiles = files.filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));
      if (ymlFiles.length > 0) {
        techs.push({
          id: "github-actions",
          name: "GitHub Actions",
          confidence: 95,
          detectedVia: ".github/workflows",
        });
      }
    }
  } catch {
    // Ignore
  }

  // ── 8. turbo.json ──
  if (fs.existsSync(path.join(projectPath, "turbo.json"))) {
    techs.push({
      id: "turborepo",
      name: "Turborepo",
      confidence: 95,
      detectedVia: "turbo.json",
    });
    isMonorepo = true;
  }

  // ── 9. pnpm-workspace.yaml ──
  if (fs.existsSync(path.join(projectPath, "pnpm-workspace.yaml"))) {
    isMonorepo = true;
    // Only add if turborepo not already detected (they often coexist)
    if (!techs.some((t) => t.id === "turborepo")) {
      techs.push({
        id: "pnpm-workspace",
        name: "pnpm Workspace",
        confidence: 90,
        detectedVia: "pnpm-workspace.yaml",
      });
    }
  }

  // ── Determine project type ──
  let projectType: DetectedStack["projectType"] = "unknown";
  if (isMonorepo) {
    projectType = "monorepo";
  } else if (hasFrontend && hasBackend) {
    projectType = "fullstack";
  } else if (hasFrontend) {
    projectType = "frontend";
  } else if (hasBackend) {
    projectType = "backend";
  } else if (pkgContent) {
    // Has package.json but no clear frontend/backend → likely a library
    try {
      const pkg = JSON.parse(pkgContent);
      if (pkg.main || pkg.exports || pkg.types) {
        projectType = "library";
      }
    } catch {
      // Ignore
    }
  }

  // ── Deduplicate techs (keep highest confidence) ──
  const techMap = new Map<string, DetectedTech>();
  for (const tech of techs) {
    const existing = techMap.get(tech.id);
    if (!existing || tech.confidence > existing.confidence) {
      techMap.set(tech.id, tech);
    }
  }
  const deduped = Array.from(techMap.values());

  // ── Calculate overall confidence ──
  const confidence =
    deduped.length > 0
      ? Math.round(deduped.reduce((sum, t) => sum + t.confidence, 0) / deduped.length)
      : 0;

  return {
    technologies: deduped,
    confidence,
    projectType,
    packageManagers: [...new Set(packageManagers)],
  };
}
