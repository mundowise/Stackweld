/**
 * Stack Health Monitor — Checks project health across multiple dimensions.
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

// ─── Types ────────────────────────────────────────────

export interface HealthReport {
  overall: "healthy" | "warning" | "critical";
  checks: HealthCheck[];
  summary: { passed: number; warnings: number; critical: number };
}

export interface HealthCheck {
  name: string;
  status: "pass" | "warn" | "fail";
  message: string;
  suggestion?: string;
}

// ─── Helpers ──────────────────────────────────────────

function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

function readFileContent(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function execQuiet(command: string, cwd?: string): string | null {
  try {
    return execSync(command, { stdio: "pipe", timeout: 10000, cwd }).toString().trim();
  } catch {
    return null;
  }
}

function getDirSizeMB(dirPath: string): number | null {
  const result = execQuiet(`du -sm "${dirPath}" 2>/dev/null`);
  if (!result) return null;
  const match = result.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// ─── Individual Checks ───────────────────────────────

function checkLockFile(projectPath: string): HealthCheck {
  const lockFiles = ["pnpm-lock.yaml", "package-lock.json", "yarn.lock", "bun.lockb"];
  for (const lockFile of lockFiles) {
    if (fileExists(path.join(projectPath, lockFile))) {
      return {
        name: "Lock file present",
        status: "pass",
        message: `${lockFile} found`,
      };
    }
  }
  if (fileExists(path.join(projectPath, "package.json"))) {
    return {
      name: "Lock file present",
      status: "warn",
      message: "No lock file found (pnpm-lock.yaml, package-lock.json, yarn.lock)",
      suggestion: "Run your package manager install to generate a lock file",
    };
  }
  return {
    name: "Lock file present",
    status: "pass",
    message: "No package.json — lock file not applicable",
  };
}

function checkEnvExample(projectPath: string): HealthCheck {
  const hasEnv = fileExists(path.join(projectPath, ".env"));
  const hasExample = fileExists(path.join(projectPath, ".env.example"));

  if (hasEnv && !hasExample) {
    return {
      name: ".env.example exists",
      status: "warn",
      message: ".env exists but no .env.example for reference",
      suggestion: "Create .env.example with placeholder values for team onboarding",
    };
  }
  if (hasExample) {
    return {
      name: ".env.example exists",
      status: "pass",
      message: ".env.example found",
    };
  }
  return {
    name: ".env.example exists",
    status: "pass",
    message: "No .env file — .env.example not needed",
  };
}

function checkGitignore(projectPath: string): HealthCheck {
  const isGitRepo = fileExists(path.join(projectPath, ".git"));
  const hasGitignore = fileExists(path.join(projectPath, ".gitignore"));

  if (isGitRepo && !hasGitignore) {
    return {
      name: ".gitignore exists",
      status: "warn",
      message: "Git repo without .gitignore",
      suggestion: "Create a .gitignore to prevent committing unwanted files",
    };
  }
  if (hasGitignore) {
    return {
      name: ".gitignore exists",
      status: "pass",
      message: ".gitignore found",
    };
  }
  return {
    name: ".gitignore exists",
    status: "pass",
    message: "Not a git repo — .gitignore not applicable",
  };
}

function checkNodeModulesSize(projectPath: string): HealthCheck {
  const nmPath = path.join(projectPath, "node_modules");
  if (!fileExists(nmPath)) {
    return {
      name: "node_modules size",
      status: "pass",
      message: "No node_modules directory",
    };
  }
  const sizeMB = getDirSizeMB(nmPath);
  if (sizeMB === null) {
    return {
      name: "node_modules size",
      status: "pass",
      message: "Could not determine node_modules size",
    };
  }
  if (sizeMB > 500) {
    return {
      name: "node_modules size",
      status: "warn",
      message: `node_modules: ${sizeMB}MB (consider cleaning)`,
      suggestion: "Run `npx npkill` or reinstall with fewer dependencies",
    };
  }
  return {
    name: "node_modules size",
    status: "pass",
    message: `node_modules: ${sizeMB}MB`,
  };
}

function checkDockerAvailable(projectPath: string): HealthCheck {
  const hasCompose =
    fileExists(path.join(projectPath, "docker-compose.yml")) ||
    fileExists(path.join(projectPath, "docker-compose.yaml")) ||
    fileExists(path.join(projectPath, "compose.yml")) ||
    fileExists(path.join(projectPath, "compose.yaml"));

  if (!hasCompose) {
    return {
      name: "Docker available",
      status: "pass",
      message: "No docker-compose file — Docker check not applicable",
    };
  }
  const dockerVersion = execQuiet("docker --version");
  if (!dockerVersion) {
    return {
      name: "Docker available",
      status: "warn",
      message: "docker-compose file found but Docker is not available",
      suggestion: "Install Docker: https://docs.docker.com/get-docker/",
    };
  }
  return {
    name: "Docker available",
    status: "pass",
    message: "Docker available for docker-compose project",
  };
}

function checkTypeScriptStrict(projectPath: string): HealthCheck {
  const tsconfigPath = path.join(projectPath, "tsconfig.json");
  if (!fileExists(tsconfigPath)) {
    return {
      name: "TypeScript strict mode",
      status: "pass",
      message: "No tsconfig.json — TypeScript check not applicable",
    };
  }
  const content = readFileContent(tsconfigPath);
  if (!content) {
    return {
      name: "TypeScript strict mode",
      status: "pass",
      message: "Could not read tsconfig.json",
    };
  }
  try {
    // Strip comments for basic JSON parsing
    const stripped = content.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    const config = JSON.parse(stripped);
    if (config.compilerOptions?.strict === true) {
      return {
        name: "TypeScript strict mode",
        status: "pass",
        message: "strict: true enabled",
      };
    }
    return {
      name: "TypeScript strict mode",
      status: "warn",
      message: "TypeScript strict mode is not enabled",
      suggestion: 'Set "strict": true in tsconfig.json compilerOptions',
    };
  } catch {
    return {
      name: "TypeScript strict mode",
      status: "pass",
      message: "Could not parse tsconfig.json",
    };
  }
}

function checkGitClean(projectPath: string): HealthCheck {
  const isGitRepo = fileExists(path.join(projectPath, ".git"));
  if (!isGitRepo) {
    return {
      name: "Git status clean",
      status: "pass",
      message: "Not a git repo",
    };
  }
  const output = execQuiet("git status --porcelain", projectPath);
  if (output === null) {
    return {
      name: "Git status clean",
      status: "pass",
      message: "Could not check git status",
    };
  }
  if (output.length === 0) {
    return {
      name: "Git status clean",
      status: "pass",
      message: "Working tree is clean",
    };
  }
  const changedFiles = output.split("\n").length;
  return {
    name: "Git status clean",
    status: "warn",
    message: `${changedFiles} uncommitted change(s)`,
    suggestion: "Commit or stash your changes",
  };
}

function checkEnvNotCommitted(projectPath: string): HealthCheck {
  const gitignorePath = path.join(projectPath, ".gitignore");
  const hasEnv = fileExists(path.join(projectPath, ".env"));
  const isGitRepo = fileExists(path.join(projectPath, ".git"));

  if (!hasEnv || !isGitRepo) {
    return {
      name: ".env not committed",
      status: "pass",
      message: "No .env or not a git repo",
    };
  }

  const gitignoreContent = readFileContent(gitignorePath);
  if (!gitignoreContent) {
    return {
      name: ".env not committed",
      status: "fail",
      message: ".env exists but no .gitignore found — secrets may be committed",
      suggestion: 'Create .gitignore with ".env" entry',
    };
  }

  const lines = gitignoreContent.split("\n").map((l) => l.trim());
  const envIgnored = lines.some(
    (line) => line === ".env" || line === ".env*" || line === "*.env" || line === ".env.*",
  );
  if (!envIgnored) {
    return {
      name: ".env not committed",
      status: "fail",
      message: ".env exists but is not listed in .gitignore",
      suggestion: "Add .env to your .gitignore immediately",
    };
  }
  return {
    name: ".env not committed",
    status: "pass",
    message: ".env is listed in .gitignore",
  };
}

function checkNoSecretsInCode(projectPath: string): HealthCheck {
  const srcDir = path.join(projectPath, "src");
  if (!fileExists(srcDir)) {
    return {
      name: "No secrets in code",
      status: "pass",
      message: "No src/ directory to scan",
    };
  }

  const secretPatterns = [
    "sk-[a-zA-Z0-9]{20,}",
    "sk_live_[a-zA-Z0-9]+",
    "AKIA[A-Z0-9]{16}",
    "ghp_[a-zA-Z0-9]{36}",
    "gho_[a-zA-Z0-9]{36}",
    "glpat-[a-zA-Z0-9\\-_]{20}",
    "xox[bpors]-[a-zA-Z0-9\\-]+",
  ];

  const pattern = secretPatterns.join("|");
  const result = execQuiet(
    `grep -rEl '${pattern}' "${srcDir}" --include='*.ts' --include='*.js' --include='*.tsx' --include='*.jsx' --include='*.py' --include='*.go' --include='*.rs' 2>/dev/null`,
  );

  if (result && result.length > 0) {
    const files = result.split("\n").filter(Boolean);
    return {
      name: "No secrets in code",
      status: "fail",
      message: `Potential secrets found in ${files.length} file(s)`,
      suggestion: "Move secrets to environment variables and rotate compromised keys",
    };
  }
  return {
    name: "No secrets in code",
    status: "pass",
    message: "No secret patterns detected in src/",
  };
}

function checkPackageJson(projectPath: string): HealthCheck {
  const pkgPath = path.join(projectPath, "package.json");
  if (!fileExists(pkgPath)) {
    return {
      name: "package.json present",
      status: "pass",
      message: "No package.json — not a Node.js project",
    };
  }
  // Check if lock file exists alongside it (already handled in checkLockFile)
  // Here we just verify package.json is valid
  const content = readFileContent(pkgPath);
  if (!content) {
    return {
      name: "package.json present",
      status: "warn",
      message: "Could not read package.json",
    };
  }
  try {
    JSON.parse(content);
    return {
      name: "package.json present",
      status: "pass",
      message: "package.json is valid JSON",
    };
  } catch {
    return {
      name: "package.json present",
      status: "warn",
      message: "package.json contains invalid JSON",
      suggestion: "Fix the JSON syntax in package.json",
    };
  }
}

// ─── Main Function ────────────────────────────────────

export function checkProjectHealth(projectPath: string): HealthReport {
  const resolvedPath = path.resolve(projectPath);

  const checks: HealthCheck[] = [
    checkPackageJson(resolvedPath),
    checkLockFile(resolvedPath),
    checkGitignore(resolvedPath),
    checkEnvExample(resolvedPath),
    checkEnvNotCommitted(resolvedPath),
    checkNoSecretsInCode(resolvedPath),
    checkTypeScriptStrict(resolvedPath),
    checkDockerAvailable(resolvedPath),
    checkNodeModulesSize(resolvedPath),
    checkGitClean(resolvedPath),
  ];

  const passed = checks.filter((c) => c.status === "pass").length;
  const warnings = checks.filter((c) => c.status === "warn").length;
  const critical = checks.filter((c) => c.status === "fail").length;

  let overall: HealthReport["overall"] = "healthy";
  if (critical > 0) overall = "critical";
  else if (warnings > 0) overall = "warning";

  return {
    overall,
    checks,
    summary: { passed, warnings, critical },
  };
}
