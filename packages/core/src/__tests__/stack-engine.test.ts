import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { RulesEngine } from "../engine/rules-engine.js";
import { StackEngine } from "../engine/stack-engine.js";
import { getDatabase, closeDatabase } from "../db/database.js";
import type { Technology } from "../types/technology.js";

// Minimal technology fixtures for testing
function makeTech(overrides: Partial<Technology> & { id: string; name: string }): Technology {
  return {
    category: "backend",
    description: "Test technology",
    website: "https://example.com",
    versions: [{ version: "1.0.0" }],
    defaultVersion: "1.0.0",
    requires: [],
    incompatibleWith: [],
    suggestedWith: [],
    envVars: {},
    configFiles: [],
    lastVerified: "2026-01-01",
    tags: [],
    ...overrides,
  };
}

const fakeTechs: Technology[] = [
  makeTech({ id: "nodejs", name: "Node.js", category: "runtime" }),
  makeTech({ id: "express", name: "Express", category: "backend", requires: ["nodejs"] }),
  makeTech({ id: "postgresql", name: "PostgreSQL", category: "database", defaultPort: 5432 }),
  makeTech({ id: "redis", name: "Redis", category: "service", defaultPort: 6379 }),
];

let tmpDbPath: string;
let engine: StackEngine;

beforeEach(() => {
  // Use a temp file for the database so tests are isolated
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "stackpilot-test-"));
  tmpDbPath = path.join(tmpDir, "test.db");
  // Initialize the database at the temp path
  getDatabase(tmpDbPath);
  const rules = new RulesEngine(fakeTechs);
  engine = new StackEngine(rules);
});

afterEach(() => {
  closeDatabase();
  // Clean up temp file
  if (tmpDbPath && fs.existsSync(tmpDbPath)) {
    const dir = path.dirname(tmpDbPath);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("StackEngine", () => {
  describe("create()", () => {
    it("creates a stack and persists it", () => {
      const { stack, validation } = engine.create({
        name: "test-stack",
        technologies: [{ technologyId: "nodejs", version: "1.0.0" }],
      });

      expect(validation.valid).toBe(true);
      expect(stack.name).toBe("test-stack");
      expect(stack.id).toBeTruthy();
      expect(stack.version).toBe(1);

      // Verify it's actually persisted
      const retrieved = engine.get(stack.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.name).toBe("test-stack");
    });

    it("auto-resolves dependencies", () => {
      const { stack, validation } = engine.create({
        name: "express-stack",
        technologies: [{ technologyId: "express", version: "1.0.0" }],
      });

      expect(validation.valid).toBe(true);
      // express requires nodejs, which should be auto-resolved
      expect(validation.resolvedDependencies).toContain("nodejs");
      const techIds = stack.technologies.map((t) => t.technologyId);
      expect(techIds).toContain("express");
      expect(techIds).toContain("nodejs");
    });

    it("assigns ports to technologies with defaultPort", () => {
      const { stack, validation } = engine.create({
        name: "db-stack",
        technologies: [
          { technologyId: "postgresql", version: "1.0.0" },
          { technologyId: "redis", version: "1.0.0" },
        ],
      });

      expect(validation.valid).toBe(true);
      expect(validation.portAssignments["postgresql"]).toBe(5432);
      expect(validation.portAssignments["redis"]).toBe(6379);
    });

    it("sets default profile to standard", () => {
      const { stack } = engine.create({
        name: "default-profile",
        technologies: [{ technologyId: "nodejs", version: "1.0.0" }],
      });

      expect(stack.profile).toBe("standard");
    });

    it("sets tags when provided", () => {
      const { stack } = engine.create({
        name: "tagged-stack",
        technologies: [{ technologyId: "nodejs", version: "1.0.0" }],
        tags: ["test", "dev"],
      });

      expect(stack.tags).toEqual(["test", "dev"]);
    });
  });

  describe("list()", () => {
    it("returns empty array when no stacks exist", () => {
      const stacks = engine.list();
      expect(stacks).toEqual([]);
    });

    it("returns saved stacks", () => {
      engine.create({
        name: "stack-a",
        technologies: [{ technologyId: "nodejs", version: "1.0.0" }],
      });
      engine.create({
        name: "stack-b",
        technologies: [{ technologyId: "redis", version: "1.0.0" }],
      });

      const stacks = engine.list();
      expect(stacks.length).toBe(2);
      const names = stacks.map((s) => s.name);
      expect(names).toContain("stack-a");
      expect(names).toContain("stack-b");
    });
  });

  describe("get()", () => {
    it("returns correct stack by ID", () => {
      const { stack: created } = engine.create({
        name: "get-test",
        description: "Testing get",
        technologies: [{ technologyId: "nodejs", version: "1.0.0" }],
      });

      const retrieved = engine.get(created.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(created.id);
      expect(retrieved!.name).toBe("get-test");
      expect(retrieved!.description).toBe("Testing get");
    });

    it("returns null for non-existent ID", () => {
      const result = engine.get("non-existent-uuid");
      expect(result).toBeNull();
    });

    it("includes technologies in the returned stack", () => {
      const { stack: created } = engine.create({
        name: "tech-check",
        technologies: [
          { technologyId: "postgresql", version: "1.0.0" },
          { technologyId: "redis", version: "1.0.0" },
        ],
      });

      const retrieved = engine.get(created.id);
      expect(retrieved!.technologies.length).toBe(2);
      const ids = retrieved!.technologies.map((t) => t.technologyId);
      expect(ids).toContain("postgresql");
      expect(ids).toContain("redis");
    });
  });

  describe("delete()", () => {
    it("removes a stack", () => {
      const { stack } = engine.create({
        name: "to-delete",
        technologies: [{ technologyId: "nodejs", version: "1.0.0" }],
      });

      const deleted = engine.delete(stack.id);
      expect(deleted).toBe(true);

      const retrieved = engine.get(stack.id);
      expect(retrieved).toBeNull();
    });

    it("returns false for non-existent stack", () => {
      const deleted = engine.delete("non-existent-uuid");
      expect(deleted).toBe(false);
    });

    it("does not affect other stacks", () => {
      const { stack: a } = engine.create({
        name: "keep-me",
        technologies: [{ technologyId: "nodejs", version: "1.0.0" }],
      });
      const { stack: b } = engine.create({
        name: "delete-me",
        technologies: [{ technologyId: "redis", version: "1.0.0" }],
      });

      engine.delete(b.id);

      expect(engine.get(a.id)).not.toBeNull();
      expect(engine.get(b.id)).toBeNull();
    });
  });

  describe("update()", () => {
    it("modifies stack fields", () => {
      const { stack } = engine.create({
        name: "original",
        description: "original desc",
        technologies: [{ technologyId: "nodejs", version: "1.0.0" }],
      });

      const result = engine.update(stack.id, {
        name: "updated-name",
        description: "new desc",
      });

      expect(result).not.toBeNull();
      expect(result!.stack.name).toBe("updated-name");
      expect(result!.stack.description).toBe("new desc");
    });

    it("increments version number on update", () => {
      const { stack } = engine.create({
        name: "versioned",
        technologies: [{ technologyId: "nodejs", version: "1.0.0" }],
      });

      expect(stack.version).toBe(1);

      const result = engine.update(stack.id, { name: "versioned-v2" });
      expect(result!.stack.version).toBe(2);

      const result2 = engine.update(stack.id, { name: "versioned-v3" });
      expect(result2!.stack.version).toBe(3);
    });

    it("returns null for non-existent stack", () => {
      const result = engine.update("non-existent", { name: "nope" });
      expect(result).toBeNull();
    });

    it("updates technologies", () => {
      const { stack } = engine.create({
        name: "tech-update",
        technologies: [{ technologyId: "nodejs", version: "1.0.0" }],
      });

      const result = engine.update(stack.id, {
        technologies: [
          { technologyId: "nodejs", version: "1.0.0" },
          { technologyId: "redis", version: "1.0.0" },
        ],
      });

      const techIds = result!.stack.technologies.map((t) => t.technologyId);
      expect(techIds).toContain("nodejs");
      expect(techIds).toContain("redis");
    });
  });

  describe("version management", () => {
    it("saves a version snapshot on create", () => {
      const { stack } = engine.create({
        name: "versioned-stack",
        technologies: [{ technologyId: "nodejs", version: "1.0.0" }],
      });

      const history = engine.getVersionHistory(stack.id);
      expect(history.length).toBe(1);
      expect(history[0].version).toBe(1);
      expect(history[0].changelog).toBe("Initial creation");
      expect(history[0].snapshot.name).toBe("versioned-stack");
    });

    it("saves a version snapshot on update", () => {
      const { stack } = engine.create({
        name: "multi-version",
        technologies: [{ technologyId: "nodejs", version: "1.0.0" }],
      });

      engine.update(stack.id, { name: "multi-version-v2" });

      const history = engine.getVersionHistory(stack.id);
      expect(history.length).toBe(2);
      // Ordered by version DESC
      expect(history[0].version).toBe(2);
      expect(history[1].version).toBe(1);
    });

    it("returns empty history for non-existent stack", () => {
      const history = engine.getVersionHistory("non-existent");
      expect(history).toEqual([]);
    });

    it("version snapshot contains full stack data", () => {
      const { stack } = engine.create({
        name: "snapshot-check",
        description: "checking snapshots",
        technologies: [{ technologyId: "postgresql", version: "1.0.0" }],
        tags: ["prod"],
      });

      const history = engine.getVersionHistory(stack.id);
      const snapshot = history[0].snapshot;
      expect(snapshot.name).toBe("snapshot-check");
      expect(snapshot.description).toBe("checking snapshots");
      expect(snapshot.tags).toEqual(["prod"]);
    });
  });
});
