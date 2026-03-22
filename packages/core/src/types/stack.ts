/**
 * Stack Definition — Abstract definition of a development stack.
 * Not yet a project on disk.
 */

export interface StackTechnology {
  technologyId: string;
  version: string;
  port?: number;
  config?: Record<string, unknown>;
}

export type StackProfile = "rapid" | "standard" | "production" | "enterprise" | "lightweight";

export interface StackDefinition {
  id: string;
  name: string;
  description: string;
  profile: StackProfile;
  technologies: StackTechnology[];
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  version: number; // Auto-incremented
  tags: string[];
}

export interface StackVersion {
  version: number;
  timestamp: string;
  changelog: string; // Human-readable diff description
  snapshot: StackDefinition; // Full snapshot at this version
}
