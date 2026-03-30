/**
 * Stack Engine — CRUD operations for stack definitions.
 * Handles creation, validation, versioning, and persistence.
 */

import { randomUUID } from "node:crypto";
import { getDatabase } from "../db/database.js";
import type {
  StackDefinition,
  StackProfile,
  StackTechnology,
  StackVersion,
  ValidationResult,
} from "../types/index.js";
import type { RulesEngine } from "./rules-engine.js";

export class StackEngine {
  private rules: RulesEngine;

  constructor(rules: RulesEngine) {
    this.rules = rules;
  }

  /**
   * Create a new stack definition.
   * Validates technologies and auto-resolves dependencies.
   */
  create(opts: {
    name: string;
    description?: string;
    profile?: StackProfile;
    technologies: StackTechnology[];
    tags?: string[];
  }): { stack: StackDefinition; validation: ValidationResult } {
    const validation = this.rules.validate(opts.technologies);

    // Add auto-resolved dependencies
    const allTechs = [...opts.technologies];
    for (const depId of validation.resolvedDependencies) {
      const tech = this.rules.getTechnology(depId);
      if (tech) {
        allTechs.push({
          technologyId: depId,
          version: tech.defaultVersion,
          port: validation.portAssignments[depId],
        });
      }
    }

    // Apply port assignments to existing techs
    for (const t of allTechs) {
      if (validation.portAssignments[t.technologyId]) {
        t.port = validation.portAssignments[t.technologyId];
      }
    }

    const now = new Date().toISOString();
    const stack: StackDefinition = {
      id: randomUUID(),
      name: opts.name,
      description: opts.description || "",
      profile: opts.profile || "standard",
      technologies: allTechs,
      createdAt: now,
      updatedAt: now,
      version: 1,
      tags: opts.tags || [],
    };

    if (validation.valid) {
      this.persist(stack);
    }

    return { stack, validation };
  }

  /**
   * Get a stack by ID.
   */
  get(id: string): StackDefinition | null {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM stacks WHERE id = ?").get(id) as
      | Record<string, unknown>
      | undefined;
    if (!row) return null;

    const techRows = db
      .prepare("SELECT * FROM stack_technologies WHERE stack_id = ?")
      .all(id) as Record<string, unknown>[];

    return {
      id: row.id as string,
      name: row.name as string,
      description: row.description as string,
      profile: row.profile as StackProfile,
      version: row.version as number,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      tags: JSON.parse(row.tags as string),
      technologies: techRows.map((t) => ({
        technologyId: t.technology_id as string,
        version: t.version as string,
        port: t.port as number | undefined,
        config: JSON.parse((t.config as string) || "{}"),
      })),
    };
  }

  /**
   * List all stacks.
   */
  list(): StackDefinition[] {
    const db = getDatabase();
    const rows = db.prepare("SELECT id FROM stacks ORDER BY updated_at DESC").all() as {
      id: string;
    }[];
    return rows.map((r) => this.get(r.id)!).filter(Boolean);
  }

  /**
   * Delete a stack.
   */
  delete(id: string): boolean {
    const db = getDatabase();
    const result = db.prepare("DELETE FROM stacks WHERE id = ?").run(id);
    return result.changes > 0;
  }

  /**
   * Update a stack. Auto-increments version and saves snapshot.
   */
  update(
    id: string,
    changes: Partial<
      Pick<StackDefinition, "name" | "description" | "profile" | "technologies" | "tags">
    >,
  ): {
    stack: StackDefinition;
    validation: ValidationResult;
  } | null {
    const existing = this.get(id);
    if (!existing) return null;

    const techs = changes.technologies || existing.technologies;
    const validation = this.rules.validate(techs);

    const now = new Date().toISOString();
    const newVersion = existing.version + 1;

    const db = getDatabase();
    db.prepare(`
      UPDATE stacks SET
        name = ?, description = ?, profile = ?, version = ?,
        updated_at = ?, tags = ?
      WHERE id = ?
    `).run(
      changes.name || existing.name,
      changes.description ?? existing.description,
      changes.profile || existing.profile,
      newVersion,
      now,
      JSON.stringify(changes.tags || existing.tags),
      id,
    );

    // Replace technologies
    db.prepare("DELETE FROM stack_technologies WHERE stack_id = ?").run(id);
    for (const t of techs) {
      db.prepare(`
        INSERT INTO stack_technologies (stack_id, technology_id, version, port, config)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, t.technologyId, t.version, t.port || null, JSON.stringify(t.config || {}));
    }

    // Save version snapshot
    const updatedStack = this.get(id)!;
    this.saveVersionSnapshot(updatedStack, `Updated to v${newVersion}`);

    return { stack: updatedStack, validation };
  }

  /**
   * Get version history for a stack.
   */
  getVersionHistory(stackId: string): StackVersion[] {
    const db = getDatabase();
    const rows = db
      .prepare("SELECT * FROM stack_versions WHERE stack_id = ? ORDER BY version DESC")
      .all(stackId) as Record<string, unknown>[];

    return rows.map((r) => ({
      version: r.version as number,
      timestamp: r.created_at as string,
      changelog: r.changelog as string,
      snapshot: JSON.parse(r.snapshot as string),
    }));
  }

  /**
   * Rollback to a specific version.
   */
  rollback(stackId: string, targetVersion: number): StackDefinition | null {
    const db = getDatabase();
    const versionRow = db
      .prepare("SELECT snapshot FROM stack_versions WHERE stack_id = ? AND version = ?")
      .get(stackId, targetVersion) as { snapshot: string } | undefined;

    if (!versionRow) return null;

    const snapshot = JSON.parse(versionRow.snapshot) as StackDefinition;
    this.update(stackId, {
      name: snapshot.name,
      description: snapshot.description,
      profile: snapshot.profile,
      technologies: snapshot.technologies,
      tags: snapshot.tags,
    });

    return this.get(stackId);
  }

  // ─── Private ────────────────────────────────────────────

  private persist(stack: StackDefinition): void {
    const db = getDatabase();

    db.prepare(`
      INSERT INTO stacks (id, name, description, profile, version, created_at, updated_at, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      stack.id,
      stack.name,
      stack.description,
      stack.profile,
      stack.version,
      stack.createdAt,
      stack.updatedAt,
      JSON.stringify(stack.tags),
    );

    for (const t of stack.technologies) {
      db.prepare(`
        INSERT INTO stack_technologies (stack_id, technology_id, version, port, config)
        VALUES (?, ?, ?, ?, ?)
      `).run(stack.id, t.technologyId, t.version, t.port || null, JSON.stringify(t.config || {}));
    }

    this.saveVersionSnapshot(stack, "Initial creation");
  }

  private saveVersionSnapshot(stack: StackDefinition, changelog: string): void {
    const db = getDatabase();
    db.prepare(`
      INSERT OR REPLACE INTO stack_versions (stack_id, version, changelog, snapshot)
      VALUES (?, ?, ?, ?)
    `).run(stack.id, stack.version, changelog, JSON.stringify(stack));
  }
}
