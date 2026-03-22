/**
 * Rules Engine — Validates technology compatibility.
 * Source of truth for what can coexist in a stack.
 */

import type { Technology, ValidationResult, ValidationIssue, StackTechnology } from "../types/index.js";

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

    // 2. Check requires — resolve missing dependencies
    for (const sel of selected) {
      const tech = this.techMap.get(sel.technologyId);
      if (!tech) continue;

      for (const reqId of tech.requires) {
        if (!selectedIds.has(reqId)) {
          const reqTech = this.techMap.get(reqId);
          if (reqTech) {
            resolvedDependencies.push(reqId);
            selectedIds.add(reqId);
            issues.push({
              severity: "info",
              code: "AUTO_DEPENDENCY",
              message: `"${tech.name}" requires "${reqTech.name}" — added automatically`,
              technologyId: sel.technologyId,
              relatedTechnologyId: reqId,
              autoFixable: true,
              suggestedFix: `Add ${reqTech.name} to the stack`,
            });
          } else {
            issues.push({
              severity: "error",
              code: "MISSING_DEPENDENCY",
              message: `"${tech.name}" requires "${reqId}" which is not in the registry`,
              technologyId: sel.technologyId,
              relatedTechnologyId: reqId,
              autoFixable: false,
            });
          }
        }
      }
    }

    // 3. Check incompatibleWith
    for (const sel of selected) {
      const tech = this.techMap.get(sel.technologyId);
      if (!tech) continue;

      for (const incompId of tech.incompatibleWith) {
        if (selectedIds.has(incompId)) {
          const incompTech = this.techMap.get(incompId);
          issues.push({
            severity: "error",
            code: "INCOMPATIBLE",
            message: `"${tech.name}" is incompatible with "${incompTech?.name || incompId}"`,
            technologyId: sel.technologyId,
            relatedTechnologyId: incompId,
            autoFixable: false,
            suggestedFix: `Remove either ${tech.name} or ${incompTech?.name || incompId}`,
          });
        }
      }
    }

    // 4. Assign ports — detect conflicts
    const allTechIds = [...selectedIds];
    for (const techId of allTechIds) {
      const tech = this.techMap.get(techId);
      if (!tech || !tech.defaultPort) continue;

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
