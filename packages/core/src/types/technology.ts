/**
 * Technology — Atomic unit of the registry catalog.
 * Each technology is deeply modeled with versions, ports, rules, and metadata.
 */

export type TechnologyCategory =
  | "runtime"
  | "frontend"
  | "backend"
  | "database"
  | "orm"
  | "auth"
  | "styling"
  | "service"
  | "devops";

export interface TechnologyVersion {
  version: string;
  eol?: string; // End of life date (YYYY-MM-DD)
  lts?: boolean;
}

export interface HealthCheckConfig {
  command?: string; // e.g. "pg_isready -U postgres"
  endpoint?: string; // e.g. "http://localhost:3000/health"
  interval?: string; // e.g. "5s"
  timeout?: string; // e.g. "5s"
  retries?: number;
}

export interface Technology {
  id: string; // e.g. "nextjs", "postgresql"
  name: string; // e.g. "Next.js", "PostgreSQL"
  category: TechnologyCategory;
  description: string;
  website: string;
  versions: TechnologyVersion[];
  defaultVersion: string;
  defaultPort?: number;

  // Dependency rules
  requires: string[]; // IDs of required technologies
  incompatibleWith: string[]; // IDs that cannot coexist
  suggestedWith: string[]; // IDs that work well together

  // Scaffolding
  officialScaffold?: string; // e.g. "npx create-next-app@latest"
  dockerImage?: string; // e.g. "postgres:17"
  healthCheck?: HealthCheckConfig;

  // Configuration
  envVars: Record<string, string>; // e.g. { "DATABASE_URL": "postgresql://..." }
  configFiles: string[]; // e.g. ["next.config.js", "tsconfig.json"]

  // Metadata
  lastVerified: string; // ISO date when compatibility was last verified
  tags: string[];
}
