/**
 * Stack Comparison — Diff two stack definitions by technology.
 */

import type { StackDefinition } from "../types/stack.js";

// ─── Types ────────────────────────────────────────────

export interface StackDiff {
  added: DiffItem[];
  removed: DiffItem[];
  changed: DiffChange[];
  unchanged: string[];
  summary: string;
}

export interface DiffItem {
  technologyId: string;
  name: string;
  version?: string;
  port?: number;
}

export interface DiffChange {
  technologyId: string;
  name: string;
  field: string;
  from: string;
  to: string;
}

// ─── Main Function ────────────────────────────────────

export function diffStacks(stackA: StackDefinition, stackB: StackDefinition): StackDiff {
  const techMapA = new Map(stackA.technologies.map((t) => [t.technologyId, t]));
  const techMapB = new Map(stackB.technologies.map((t) => [t.technologyId, t]));

  const added: DiffItem[] = [];
  const removed: DiffItem[] = [];
  const changed: DiffChange[] = [];
  const unchanged: string[] = [];

  // Find removed (in A but not B) and changed/unchanged
  for (const [id, techA] of techMapA) {
    const techB = techMapB.get(id);
    if (!techB) {
      removed.push({
        technologyId: id,
        name: id,
        version: techA.version,
        port: techA.port,
      });
      continue;
    }

    let hasChanges = false;

    if (techA.version !== techB.version) {
      changed.push({
        technologyId: id,
        name: id,
        field: "version",
        from: techA.version,
        to: techB.version,
      });
      hasChanges = true;
    }

    if (techA.port !== techB.port) {
      changed.push({
        technologyId: id,
        name: id,
        field: "port",
        from: techA.port !== undefined ? String(techA.port) : "none",
        to: techB.port !== undefined ? String(techB.port) : "none",
      });
      hasChanges = true;
    }

    const configA = JSON.stringify(techA.config ?? {});
    const configB = JSON.stringify(techB.config ?? {});
    if (configA !== configB) {
      changed.push({
        technologyId: id,
        name: id,
        field: "config",
        from: configA,
        to: configB,
      });
      hasChanges = true;
    }

    if (!hasChanges) {
      unchanged.push(id);
    }
  }

  // Find added (in B but not A)
  for (const [id, techB] of techMapB) {
    if (!techMapA.has(id)) {
      added.push({
        technologyId: id,
        name: id,
        version: techB.version,
        port: techB.port,
      });
    }
  }

  const parts: string[] = [];
  if (added.length > 0) parts.push(`+${added.length} added`);
  if (removed.length > 0) parts.push(`-${removed.length} removed`);
  if (changed.length > 0) parts.push(`~${changed.length} changed`);
  if (unchanged.length > 0) parts.push(`${unchanged.length} unchanged`);
  const summary = parts.join(", ");

  return { added, removed, changed, unchanged, summary };
}
