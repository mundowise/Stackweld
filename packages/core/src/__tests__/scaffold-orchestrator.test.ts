import { describe, it, expect } from "vitest";
import { ScaffoldOrchestrator } from "../engine/scaffold-orchestrator.js";
import type { StackDefinition, Technology } from "../types/index.js";

const mockTechs: Technology[] = [
  {
    id: "nodejs",
    name: "Node.js",
    category: "runtime",
    description: "JavaScript runtime",
    website: "https://nodejs.org",
    versions: [{ version: "22" }],
    defaultVersion: "22",
    defaultPort: 3000,
    requires: [],
    incompatibleWith: [],
    suggestedWith: [],
    envVars: { NODE_ENV: "development", PORT: "3000" },
    configFiles: ["package.json"],
    lastVerified: "2026-03-22",
    tags: ["nodejs"],
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "database",
    description: "Relational database",
    website: "https://postgresql.org",
    versions: [{ version: "17" }],
    defaultVersion: "17",
    defaultPort: 5432,
    requires: [],
    incompatibleWith: [],
    suggestedWith: [],
    dockerImage: "postgres:17",
    healthCheck: {
      command: "pg_isready -U postgres",
      interval: "5s",
      timeout: "5s",
      retries: 5,
    },
    envVars: {
      POSTGRES_USER: "postgres",
      POSTGRES_PASSWORD: "postgres",
      POSTGRES_DB: "app",
    },
    configFiles: [],
    lastVerified: "2026-03-22",
    tags: ["postgresql"],
  },
  {
    id: "redis",
    name: "Redis",
    category: "database",
    description: "In-memory store",
    website: "https://redis.io",
    versions: [{ version: "7" }],
    defaultVersion: "7",
    defaultPort: 6379,
    requires: [],
    incompatibleWith: [],
    suggestedWith: [],
    dockerImage: "redis:7-alpine",
    healthCheck: {
      command: "redis-cli ping",
      interval: "5s",
      timeout: "5s",
      retries: 5,
    },
    envVars: { REDIS_URL: "redis://localhost:6379/0" },
    configFiles: [],
    lastVerified: "2026-03-22",
    tags: ["redis"],
  },
];

const mockStack: StackDefinition = {
  id: "test-stack",
  name: "Test Stack",
  description: "A test stack",
  profile: "standard",
  technologies: [
    { technologyId: "nodejs", version: "22", port: 3000 },
    { technologyId: "postgresql", version: "17", port: 5432 },
    { technologyId: "redis", version: "7", port: 6379 },
  ],
  createdAt: "2026-03-22T00:00:00Z",
  updatedAt: "2026-03-22T00:00:00Z",
  version: 1,
  tags: ["test"],
};

describe("ScaffoldOrchestrator", () => {
  const orchestrator = new ScaffoldOrchestrator(mockTechs);

  it("generates all scaffold files", () => {
    const output = orchestrator.generate(mockStack);
    expect(output.dockerCompose).not.toBeNull();
    expect(output.envExample).toBeTruthy();
    expect(output.readme).toBeTruthy();
    expect(output.gitignore).toBeTruthy();
    expect(output.devcontainer).toBeTruthy();
  });

  it("generates docker-compose with correct services", () => {
    const compose = orchestrator.generateDockerCompose(mockStack, mockTechs);
    expect(compose).toContain("postgresql:");
    expect(compose).toContain("image: postgres:17");
    expect(compose).toContain("redis:");
    expect(compose).toContain("image: redis:7-alpine");
    expect(compose).toContain("5432:5432");
    expect(compose).toContain("6379:6379");
    expect(compose).toContain("pg_isready");
    expect(compose).toContain("redis-cli ping");
    expect(compose).toContain("volumes:");
    // Should NOT include nodejs (no docker image)
    expect(compose).not.toContain("nodejs:");
  });

  it("generates .env.example with all env vars", () => {
    const env = orchestrator.generateEnvExample(mockStack, mockTechs);
    expect(env).toContain("NODE_ENV=development");
    expect(env).toContain("POSTGRES_USER=postgres");
    expect(env).toContain("REDIS_URL=redis://localhost:6379/0");
  });

  it("generates README with stack table", () => {
    const readme = orchestrator.generateReadme(mockStack, mockTechs);
    expect(readme).toContain("# Test Stack");
    expect(readme).toContain("Node.js");
    expect(readme).toContain("PostgreSQL");
    expect(readme).toContain("docker compose up");
  });

  it("generates .gitignore with relevant patterns", () => {
    const gitignore = orchestrator.generateGitignore(mockTechs);
    expect(gitignore).toContain("node_modules/");
    expect(gitignore).toContain(".env");
    expect(gitignore).toContain("*.db");
  });

  it("generates devcontainer.json", () => {
    const devcontainer = JSON.parse(
      orchestrator.generateDevcontainer(mockStack, mockTechs),
    );
    expect(devcontainer.name).toBe("Test Stack");
    expect(devcontainer.forwardPorts).toContain(3000);
    expect(devcontainer.forwardPorts).toContain(5432);
    expect(devcontainer.features).toHaveProperty(
      "ghcr.io/devcontainers/features/node:1",
    );
    expect(devcontainer.features).toHaveProperty(
      "ghcr.io/devcontainers/features/docker-in-docker:2",
    );
  });

  it("returns null docker-compose when no docker services", () => {
    const noDockerStack: StackDefinition = {
      ...mockStack,
      technologies: [{ technologyId: "nodejs", version: "22", port: 3000 }],
    };
    const output = orchestrator.generate(noDockerStack);
    expect(output.dockerCompose).toBeNull();
  });
});
