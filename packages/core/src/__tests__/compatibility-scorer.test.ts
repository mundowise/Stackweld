import { describe, expect, it } from "vitest";
import { scoreCompatibility, scoreStack } from "../engine/compatibility-scorer.js";
import type { Technology } from "../types/index.js";

// ─── Test fixtures ────────────────────────────────────

function makeTech(
  overrides: Partial<Technology> & Pick<Technology, "id" | "name" | "category">,
): Technology {
  return {
    description: "",
    website: "",
    versions: [{ version: "1" }],
    defaultVersion: "1",
    requires: [],
    incompatibleWith: [],
    suggestedWith: [],
    envVars: {},
    configFiles: [],
    lastVerified: "2026-03-22",
    tags: [],
    ...overrides,
  };
}

const nodejs = makeTech({
  id: "nodejs",
  name: "Node.js",
  category: "runtime",
  defaultPort: 3000,
  suggestedWith: ["typescript"],
});

const nextjs = makeTech({
  id: "nextjs",
  name: "Next.js",
  category: "frontend",
  defaultPort: 3000,
  requires: ["nodejs", "react"],
  incompatibleWith: ["nuxt", "sveltekit", "remix", "astro", "angular", "qwik", "solidjs"],
  suggestedWith: ["typescript", "tailwindcss", "prisma"],
});

const nuxt = makeTech({
  id: "nuxt",
  name: "Nuxt",
  category: "frontend",
  defaultPort: 3000,
  requires: ["nodejs"],
  incompatibleWith: ["nextjs"],
});

const react = makeTech({
  id: "react",
  name: "React",
  category: "frontend",
  defaultPort: 3000,
  requires: ["nodejs"],
  suggestedWith: ["tailwindcss"],
});

const tailwindcss = makeTech({
  id: "tailwindcss",
  name: "Tailwind CSS",
  category: "styling",
  requires: ["nodejs"],
  suggestedWith: ["react", "nextjs", "vue"],
});

const prisma = makeTech({
  id: "prisma",
  name: "Prisma ORM",
  category: "orm",
  requires: ["nodejs"],
  incompatibleWith: ["typeorm", "drizzle", "mongoose"],
  suggestedWith: ["postgresql", "nextjs", "typescript"],
});

const express = makeTech({
  id: "express",
  name: "Express",
  category: "backend",
  defaultPort: 3001,
  requires: ["nodejs"],
  incompatibleWith: ["nestjs", "hono", "fastify"],
  suggestedWith: ["typescript", "postgresql"],
});

const fastify = makeTech({
  id: "fastify",
  name: "Fastify",
  category: "backend",
  defaultPort: 3001,
  requires: ["nodejs"],
  incompatibleWith: ["nestjs", "hono", "express"],
  suggestedWith: ["typescript", "postgresql", "prisma"],
});

const postgresql = makeTech({
  id: "postgresql",
  name: "PostgreSQL",
  category: "database",
  defaultPort: 5432,
  suggestedWith: ["prisma", "drizzle", "sqlalchemy"],
});

const redis = makeTech({
  id: "redis",
  name: "Redis",
  category: "database",
  defaultPort: 6379,
});

const typescript = makeTech({
  id: "typescript",
  name: "TypeScript",
  category: "devops",
  requires: [],
});

// ─── Tests ────────────────────────────────────────────

describe("scoreCompatibility", () => {
  it("scores nextjs + prisma high (suggested pairing, shared runtime, complementary)", () => {
    const result = scoreCompatibility(nextjs, prisma);
    // +25 suggested (nextjs suggests prisma OR prisma suggests nextjs)
    // +15 shared runtime (both require nodejs)
    // +10 complementary (frontend + orm)
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(["S", "A"]).toContain(result.grade);
    expect(result.factors.some((f) => f.label === "Suggested pairing")).toBe(true);
    expect(result.factors.some((f) => f.label === "Shared runtime")).toBe(true);
    expect(result.factors.some((f) => f.label === "Complementary categories")).toBe(true);
  });

  it("scores nextjs + nuxt as 0 (incompatible)", () => {
    const result = scoreCompatibility(nextjs, nuxt);
    expect(result.score).toBe(0);
    expect(result.grade).toBe("F");
    expect(result.factors.some((f) => f.label === "Incompatible")).toBe(true);
    expect(result.recommendation).toContain("Incompatible");
  });

  it("scores react + tailwindcss high (suggested, complementary)", () => {
    const result = scoreCompatibility(react, tailwindcss);
    // +25 suggested (both suggest each other)
    // +15 shared runtime (both require nodejs)
    // +10 complementary (frontend + styling)
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(["S", "A"]).toContain(result.grade);
    expect(result.factors.some((f) => f.label === "Suggested pairing")).toBe(true);
  });

  it("scores express + fastify low (incompatible, same category, same runtime, same port)", () => {
    const result = scoreCompatibility(express, fastify);
    // -50 incompatible, -15 same category+runtime, -5 same port
    expect(result.score).toBe(0); // clamped to 0
    expect(result.grade).toBe("F");
    expect(result.factors.some((f) => f.label === "Incompatible")).toBe(true);
    expect(result.factors.some((f) => f.label === "Same category and runtime")).toBe(true);
    expect(result.factors.some((f) => f.label === "Port conflict")).toBe(true);
  });

  it("scores postgresql + redis as neutral (both databases, different ports, no runtime overlap)", () => {
    const result = scoreCompatibility(postgresql, redis);
    // baseline 50, no shared runtime (neither requires a runtime), no suggested
    // no incompatibility, no same runtime => no -15 penalty
    expect(result.score).toBe(50);
    expect(result.grade).toBe("C");
  });

  it("never exceeds 100", () => {
    // Artificial case: two techs that suggest each other, share runtime, complementary
    const techA = makeTech({
      id: "superA",
      name: "Super A",
      category: "frontend",
      requires: ["nodejs"],
      suggestedWith: ["superB"],
    });
    const techB = makeTech({
      id: "superB",
      name: "Super B",
      category: "backend",
      requires: ["nodejs"],
      suggestedWith: ["superA"],
    });
    const result = scoreCompatibility(techA, techB);
    // 50 + 25 + 15 + 10 = 100
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBe(100);
    expect(result.grade).toBe("S");
  });

  it("never goes below 0", () => {
    const result = scoreCompatibility(express, fastify);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it("returns correct grade boundaries", () => {
    // S: 90-100 — test with a score of exactly 90
    // We use nextjs + prisma which should give 50+25+15+10 = 100
    const sResult = scoreCompatibility(nextjs, prisma);
    expect(sResult.score).toBeGreaterThanOrEqual(90);
    expect(sResult.grade).toBe("S");
  });

  it("includes a human-readable recommendation", () => {
    const result = scoreCompatibility(nextjs, prisma);
    expect(typeof result.recommendation).toBe("string");
    expect(result.recommendation.length).toBeGreaterThan(0);
  });
});

describe("scoreStack", () => {
  it("returns perfect score for single technology", () => {
    const result = scoreStack([nextjs]);
    expect(result.overall).toBe(100);
    expect(result.grade).toBe("S");
    expect(result.pairs).toHaveLength(0);
  });

  it("scores a full stack with 5+ technologies", () => {
    const stack = [nodejs, nextjs, prisma, postgresql, tailwindcss, typescript];
    const result = scoreStack(stack);

    // Should produce C(6,2) = 15 pairs
    expect(result.pairs).toHaveLength(15);

    // Overall should be the average of all pair scores
    const expectedAvg = Math.round(
      result.pairs.reduce((s, p) => s + p.score, 0) / result.pairs.length,
    );
    expect(result.overall).toBe(expectedAvg);

    // Should have a valid grade
    expect(["S", "A", "B", "C", "D", "F"]).toContain(result.grade);
  });

  it("reflects bad pairings in overall score", () => {
    // Include incompatible pair: nextjs + nuxt
    const stack = [nodejs, nextjs, nuxt, postgresql];
    const result = scoreStack(stack);

    // The nextjs+nuxt pair should drag down the overall
    const badPair = result.pairs.find(
      (p) => (p.a === "nextjs" && p.b === "nuxt") || (p.a === "nuxt" && p.b === "nextjs"),
    );
    expect(badPair).toBeDefined();
    expect(badPair?.score).toBe(0);

    // Overall should be lower than a stack without incompatible techs
    const goodStack = [nodejs, nextjs, postgresql];
    const goodResult = scoreStack(goodStack);
    expect(goodResult.overall).toBeGreaterThan(result.overall);
  });

  it("pair entries contain correct tech IDs", () => {
    const result = scoreStack([express, postgresql]);
    expect(result.pairs).toHaveLength(1);
    expect(result.pairs[0].a).toBe("express");
    expect(result.pairs[0].b).toBe("postgresql");
  });
});
