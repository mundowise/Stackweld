/**
 * Rules Engine — Validates technology compatibility.
 * Source of truth for what can coexist in a stack.
 */

import type {
  StackTechnology,
  Technology,
  ValidationIssue,
  ValidationResult,
} from "../types/index.js";

export class RulesEngine {
  private techMap: Map<string, Technology>;

  constructor(technologies: Technology[]) {
    this.techMap = new Map(technologies.map((t) => [t.id, t]));
  }

  /**
   * Validate a set of selected technologies.
   * Returns issues, auto-resolved dependencies, and port assignments.
   */
  validate(selected: StackTechnology[]): ValidationResult {
    const issues: ValidationIssue[] = [];
    const resolvedDependencies: string[] = [];
    const portAssignments: Record<string, number> = {};
    const usedPorts = new Set<number>();

    const selectedIds = new Set(selected.map((s) => s.technologyId));

    // 1. Check each technology exists in the registry
    for (const sel of selected) {
      if (!this.techMap.has(sel.technologyId)) {
        issues.push({
          severity: "error",
          code: "UNKNOWN_TECHNOLOGY",
          message: `Technology "${sel.technologyId}" not found in the registry`,
          technologyId: sel.technologyId,
          autoFixable: false,
        });
      }
    }

    // 2. Check requires — resolve missing dependencies RECURSIVELY
    // Use a queue to process newly resolved dependencies until no more are needed
    const toProcess = [...selectedIds];
    const processed = new Set<string>();

    while (toProcess.length > 0) {
      const currentId = toProcess.shift()!;
      if (processed.has(currentId)) continue;
      processed.add(currentId);

      const tech = this.techMap.get(currentId);
      if (!tech) continue;

      for (const reqId of tech.requires) {
        if (!selectedIds.has(reqId)) {
          const reqTech = this.techMap.get(reqId);
          if (reqTech) {
            resolvedDependencies.push(reqId);
            selectedIds.add(reqId);
            // Queue the newly added dependency so its own requires are checked
            toProcess.push(reqId);
            issues.push({
              severity: "info",
              code: "AUTO_DEPENDENCY",
              message: `"${tech.name}" requires "${reqTech.name}" — added automatically`,
              technologyId: currentId,
              relatedTechnologyId: reqId,
              autoFixable: true,
              suggestedFix: `Add ${reqTech.name} to the stack`,
            });
          } else {
            issues.push({
              severity: "error",
              code: "MISSING_DEPENDENCY",
              message: `"${tech.name}" requires "${reqId}" which is not in the registry`,
              technologyId: currentId,
              relatedTechnologyId: reqId,
              autoFixable: false,
            });
          }
        }
      }
    }

    // 3. Check incompatibleWith BIDIRECTIONALLY
    // Track reported pairs to avoid duplicate issues (A-B and B-A)
    const reportedPairs = new Set<string>();
    const allIds = [...selectedIds];

    for (const techId of allIds) {
      const tech = this.techMap.get(techId);
      if (!tech) continue;

      for (const otherId of allIds) {
        if (techId === otherId) continue;

        const pairKey = [techId, otherId].sort().join(":");
        if (reportedPairs.has(pairKey)) continue;

        const otherTech = this.techMap.get(otherId);
        if (!otherTech) continue;

        // Bidirectional: incompatible if EITHER side lists the other
        const aListsB = tech.incompatibleWith.includes(otherId);
        const bListsA = otherTech.incompatibleWith.includes(techId);

        if (aListsB || bListsA) {
          reportedPairs.add(pairKey);
          issues.push({
            severity: "error",
            code: "INCOMPATIBLE",
            message: `"${tech.name}" is incompatible with "${otherTech.name}"`,
            technologyId: techId,
            relatedTechnologyId: otherId,
            autoFixable: false,
            suggestedFix: `Remove either "${tech.name}" or "${otherTech.name}" from the stack`,
          });
        }
      }
    }

    // 4. Assign ports deterministically — sort by ID for stable ordering
    const sortedTechIds = [...selectedIds].sort();
    for (const techId of sortedTechIds) {
      const tech = this.techMap.get(techId);
      if (!tech?.defaultPort) continue;

      let port = tech.defaultPort;

      // Find a free port if default is taken
      if (usedPorts.has(port)) {
        const originalPort = port;
        while (usedPorts.has(port)) {
          port++;
        }
        issues.push({
          severity: "warning",
          code: "PORT_CONFLICT",
          message: `Port ${originalPort} for "${tech.name}" conflicts — reassigned to ${port}`,
          technologyId: techId,
          autoFixable: true,
          suggestedFix: `Using port ${port} instead of ${originalPort}`,
        });
      }

      usedPorts.add(port);
      portAssignments[techId] = port;
    }

    const hasErrors = issues.some((i) => i.severity === "error");

    return {
      valid: !hasErrors,
      issues,
      resolvedDependencies,
      portAssignments,
    };
  }

  /**
   * Get suggested technologies for a given set.
   */
  getSuggestions(selectedIds: string[]): Technology[] {
    const selected = new Set(selectedIds);
    const suggestions = new Set<string>();

    for (const id of selectedIds) {
      const tech = this.techMap.get(id);
      if (!tech) continue;
      for (const sugId of tech.suggestedWith) {
        if (!selected.has(sugId) && this.techMap.has(sugId)) {
          suggestions.add(sugId);
        }
      }
    }

    return [...suggestions].map((id) => this.techMap.get(id)!);
  }

  /**
   * Get a technology by ID.
   */
  getTechnology(id: string): Technology | undefined {
    return this.techMap.get(id);
  }

  /**
   * Get all technologies.
   */
  getAllTechnologies(): Technology[] {
    return [...this.techMap.values()];
  }

  /**
   * Get technologies by category.
   */
  getByCategory(category: string): Technology[] {
    return [...this.techMap.values()].filter((t) => t.category === category);
  }
}
