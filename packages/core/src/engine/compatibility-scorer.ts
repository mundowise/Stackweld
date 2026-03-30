/**
 * Compatibility Scorer — Calculates a 0-100 score for technology combinations.
 * Goes beyond binary compatible/incompatible to show nuanced pairing quality.
 */

import type { Technology } from "../types/index.js";

export interface CompatibilityResult {
  score: number; // 0-100
  grade: "S" | "A" | "B" | "C" | "D" | "F";
  factors: CompatibilityFactor[];
  recommendation: string;
}

export interface CompatibilityFactor {
  label: string;
  points: number;
  description: string;
}

export interface StackScoreResult {
  overall: number;
  grade: string;
  pairs: Array<{ a: string; b: string; score: number }>;
}

// ─── Complementary category pairs ─────────────────────

const COMPLEMENTARY_PAIRS: ReadonlySet<string> = new Set([
  "frontend:backend",
  "backend:frontend",
  "database:orm",
  "orm:database",
  "frontend:styling",
  "styling:frontend",
  "frontend:orm",
  "orm:frontend",
  "backend:database",
  "database:backend",
  "runtime:frontend",
  "frontend:runtime",
  "runtime:backend",
  "backend:runtime",
  "backend:auth",
  "auth:backend",
  "frontend:auth",
  "auth:frontend",
]);

// ─── Grade thresholds & recommendations ───────────────

function getGrade(score: number): "S" | "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "S";
  if (score >= 75) return "A";
  if (score >= 60) return "B";
  if (score >= 45) return "C";
  if (score >= 25) return "D";
  return "F";
}

const RECOMMENDATIONS: Record<"S" | "A" | "B" | "C" | "D" | "F", string> = {
  S: "Excellent combination — these technologies are designed to work together.",
  A: "Strong pairing with good ecosystem support.",
  B: "Compatible — works well with minor configuration needed.",
  C: "Neutral — no known issues but limited synergy.",
  D: "Weak pairing — consider alternatives.",
  F: "Incompatible — these technologies conflict.",
};

// ─── Runtime detection ────────────────────────────────

function getRuntime(tech: Technology): string | null {
  if (tech.category === "runtime") return tech.id;
  for (const req of tech.requires) {
    if (["nodejs", "python", "go", "rust", "php", "bun", "deno"].includes(req)) {
      return req;
    }
  }
  return null;
}

// ─── Core scoring ─────────────────────────────────────

/**
 * Score the compatibility between two technologies (0-100).
 */
export function scoreCompatibility(techA: Technology, techB: Technology): CompatibilityResult {
  const factors: CompatibilityFactor[] = [];
  let score = 50; // neutral baseline

  // +25 if suggested pairing (either direction)
  const aSuggestsB = techA.suggestedWith.includes(techB.id);
  const bSuggestsA = techB.suggestedWith.includes(techA.id);
  if (aSuggestsB || bSuggestsA) {
    factors.push({
      label: "Suggested pairing",
      points: 25,
      description:
        aSuggestsB && bSuggestsA
          ? `${techA.name} and ${techB.name} mutually recommend each other`
          : aSuggestsB
            ? `${techA.name} suggests ${techB.name}`
            : `${techB.name} suggests ${techA.name}`,
    });
    score += 25;
  }

  // +15 if shared runtime
  const runtimeA = getRuntime(techA);
  const runtimeB = getRuntime(techB);
  if (runtimeA && runtimeB && runtimeA === runtimeB && techA.id !== techB.id) {
    const runtimeName = runtimeA === "nodejs" ? "Node.js" : runtimeA;
    factors.push({
      label: "Shared runtime",
      points: 15,
      description: `Both use ${runtimeName}`,
    });
    score += 15;
  }

  // +10 if complementary categories
  const catPair = `${techA.category}:${techB.category}`;
  if (COMPLEMENTARY_PAIRS.has(catPair)) {
    factors.push({
      label: "Complementary categories",
      points: 10,
      description: `${techA.category} + ${techB.category}`,
    });
    score += 10;
  }

  // -50 if incompatible (either direction) — applied after positives, then clamp
  const aIncompatB = techA.incompatibleWith.includes(techB.id);
  const bIncompatA = techB.incompatibleWith.includes(techA.id);
  if (aIncompatB || bIncompatA) {
    factors.push({
      label: "Incompatible",
      points: -50,
      description:
        aIncompatB && bIncompatA
          ? `${techA.name} and ${techB.name} are mutually incompatible`
          : aIncompatB
            ? `${techA.name} lists ${techB.name} as incompatible`
            : `${techB.name} lists ${techA.name} as incompatible`,
    });
    score -= 50;
  }

  // -15 if same category AND same runtime (competing technologies)
  if (
    techA.category === techB.category &&
    techA.id !== techB.id &&
    runtimeA &&
    runtimeB &&
    runtimeA === runtimeB
  ) {
    factors.push({
      label: "Same category and runtime",
      points: -15,
      description: `Both are ${techA.category} technologies for ${runtimeA === "nodejs" ? "Node.js" : runtimeA}`,
    });
    score -= 15;
  }

  // -5 if same default port (minor conflict)
  if (
    techA.defaultPort &&
    techB.defaultPort &&
    techA.defaultPort === techB.defaultPort &&
    techA.id !== techB.id
  ) {
    factors.push({
      label: "Port conflict",
      points: -5,
      description: `Both default to port ${techA.defaultPort}`,
    });
    score -= 5;
  }

  // Clamp
  score = Math.max(0, Math.min(100, score));

  const grade = getGrade(score);

  return {
    score,
    grade,
    factors,
    recommendation: RECOMMENDATIONS[grade],
  };
}

/**
 * Score an entire stack by evaluating all unique pairs.
 */
export function scoreStack(technologies: Technology[]): StackScoreResult {
  if (technologies.length < 2) {
    return { overall: 100, grade: "S", pairs: [] };
  }

  const pairs: Array<{ a: string; b: string; score: number }> = [];

  for (let i = 0; i < technologies.length; i++) {
    for (let j = i + 1; j < technologies.length; j++) {
      const result = scoreCompatibility(technologies[i], technologies[j]);
      pairs.push({
        a: technologies[i].id,
        b: technologies[j].id,
        score: result.score,
      });
    }
  }

  const overall =
    pairs.length > 0 ? Math.round(pairs.reduce((sum, p) => sum + p.score, 0) / pairs.length) : 100;

  return {
    overall,
    grade: getGrade(overall),
    pairs,
  };
}
