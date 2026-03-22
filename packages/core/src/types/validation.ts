/**
 * Validation — Results from the rules engine.
 */

export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  severity: ValidationSeverity;
  code: string; // e.g. "MISSING_DEPENDENCY", "PORT_CONFLICT", "INCOMPATIBLE"
  message: string;
  technologyId?: string;
  relatedTechnologyId?: string;
  autoFixable: boolean;
  suggestedFix?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  resolvedDependencies: string[]; // IDs auto-added
  portAssignments: Record<string, number>; // technologyId -> assigned port
}
