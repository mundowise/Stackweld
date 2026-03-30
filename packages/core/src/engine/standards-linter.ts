/**
 * Stack Standards Linter — Validates stacks against team-defined standards.
 * Reads .stackweldrc config and checks compliance.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { StackDefinition } from "../types/index.js";

// ─── Types ────────────────────────────────────────────

export interface StackStandards {
  team?: string;
  allowedTechnologies?: string[];
  blockedTechnologies?: string[];
  requiredTechnologies?: string[];
  minProfile?: string;
  requireDocker?: boolean;
  requireTests?: boolean;
  requireTypeScript?: boolean;
  customRules?: Array<{ name: string; check: string; message: string }>;
}

export interface LintResult {
  passed: boolean;
  violations: LintViolation[];
  warnings: LintWarning[];
}

export interface LintViolation {
  rule: string;
  message: string;
  severity: "error" | "warning";
}

export type LintWarning = LintViolation;

// ─── Profile Ordering ─────────────────────────────────

const PROFILE_ORDER: Record<string, number> = {
  lightweight: 0,
  rapid: 1,
  standard: 2,
  production: 3,
  enterprise: 4,
};

function profileLevel(profile: string): number {
  return PROFILE_ORDER[profile] ?? -1;
}

// ─── Testing Frameworks ───────────────────────────────

const TESTING_FRAMEWORKS = new Set([
  "vitest",
  "jest",
  "playwright",
  "cypress",
  "mocha",
  "ava",
  "tap",
  "pytest",
  "unittest",
  "go-test",
  "cargo-test",
]);

// ─── Lint Function ────────────────────────────────────

export function lintStack(stack: StackDefinition, standards: StackStandards): LintResult {
  const violations: LintViolation[] = [];
  const warnings: LintWarning[] = [];

  const techIds = new Set(stack.technologies.map((t) => t.technologyId));

  // Allowed technologies check
  if (standards.allowedTechnologies && standards.allowedTechnologies.length > 0) {
    const allowed = new Set(standards.allowedTechnologies);
    for (const id of techIds) {
      if (!allowed.has(id)) {
        violations.push({
          rule: "allowedTechnologies",
          message: `Technology "${id}" is not in the allowed list`,
          severity: "error",
        });
      }
    }
  }

  // Blocked technologies check
  if (standards.blockedTechnologies && standards.blockedTechnologies.length > 0) {
    for (const blocked of standards.blockedTechnologies) {
      if (techIds.has(blocked)) {
        violations.push({
          rule: "blockedTechnologies",
          message: `Blocked technology "${blocked}" found — remove it`,
          severity: "error",
        });
      }
    }
  }

  // Required technologies check
  if (standards.requiredTechnologies && standards.requiredTechnologies.length > 0) {
    for (const required of standards.requiredTechnologies) {
      if (!techIds.has(required)) {
        violations.push({
          rule: "requiredTechnologies",
          message: `Required technology "${required}" is missing`,
          severity: "error",
        });
      }
    }
  }

  // Minimum profile check
  if (standards.minProfile) {
    const minLevel = profileLevel(standards.minProfile);
    const currentLevel = profileLevel(stack.profile);
    if (minLevel >= 0 && currentLevel < minLevel) {
      warnings.push({
        rule: "minProfile",
        message: `Profile "${stack.profile}" is below minimum "${standards.minProfile}"`,
        severity: "warning",
      });
    }
  }

  // Require Docker
  if (standards.requireDocker) {
    if (!techIds.has("docker") && !techIds.has("docker-compose")) {
      violations.push({
        rule: "requireDocker",
        message: "Docker is required but not present in the stack",
        severity: "error",
      });
    }
  }

  // Require tests
  if (standards.requireTests) {
    const hasTestFramework = Array.from(techIds).some((id) => TESTING_FRAMEWORKS.has(id));
    if (!hasTestFramework) {
      warnings.push({
        rule: "requireTests",
        message: "No testing framework found (vitest, jest, playwright, cypress, etc.)",
        severity: "warning",
      });
    }
  }

  // Require TypeScript
  if (standards.requireTypeScript) {
    if (!techIds.has("typescript")) {
      violations.push({
        rule: "requireTypeScript",
        message: "TypeScript is required but not present in the stack",
        severity: "error",
      });
    }
  }

  // Custom rules (simple presence/absence checks)
  if (standards.customRules) {
    for (const rule of standards.customRules) {
      if (rule.check === "present") {
        if (!techIds.has(rule.name)) {
          violations.push({
            rule: `custom:${rule.name}`,
            message: rule.message,
            severity: "error",
          });
        }
      } else if (rule.check === "absent") {
        if (techIds.has(rule.name)) {
          violations.push({
            rule: `custom:${rule.name}`,
            message: rule.message,
            severity: "error",
          });
        }
      }
    }
  }

  const hasErrors = violations.some((v) => v.severity === "error");

  return {
    passed: !hasErrors,
    violations,
    warnings,
  };
}

// ─── Config Loader ────────────────────────────────────

export function loadStandards(projectPath: string): StackStandards | null {
  const configPath = path.resolve(projectPath, ".stackweldrc");
  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(content) as StackStandards;
    return parsed;
  } catch {
    return null;
  }
}
