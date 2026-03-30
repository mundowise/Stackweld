import type { Template } from "@stackpilot/core";

export const honoMicroservice: Template = {
  id: "hono-microservice",
  name: "Hono Microservice",
  description: "Lightweight Hono microservice with Bun runtime, PostgreSQL, and Docker",
  technologyIds: ["hono", "nodejs", "typescript", "postgresql", "docker"],
  profile: "lightweight",
  scaffoldSteps: [
    {
      name: "Create Hono project",
      command: "npm create hono@latest {{projectName}} -- --template bun",
    },
    {
      name: "Install database dependencies",
      command: "cd {{projectName}} && bun add postgres dotenv",
    },
  ],
  overrides: [
    {
      path: ".env.example",
      content: [
        "PORT=3000",
        "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/{{projectName}}",
      ].join("\n"),
    },
    {
      path: "docker-compose.yml",
      content: [
        "services:",
        "  db:",
        "    image: postgres:17",
        "    restart: unless-stopped",
        "    ports:",
        '      - "5432:5432"',
        "    environment:",
        "      POSTGRES_USER: postgres",
        "      POSTGRES_PASSWORD: postgres",
        "      POSTGRES_DB: {{projectName}}",
        "    volumes:",
        "      - pgdata:/var/lib/postgresql/data",
        "    healthcheck:",
        '      test: ["CMD-SHELL", "pg_isready -U postgres"]',
        "      interval: 5s",
        "      timeout: 5s",
        "      retries: 5",
        "",
        "volumes:",
        "  pgdata:",
      ].join("\n"),
    },
    {
      path: "Dockerfile",
      content: [
        "FROM oven/bun:1 AS builder",
        "WORKDIR /app",
        "COPY package.json bun.lockb ./",
        "RUN bun install --frozen-lockfile",
        "COPY . .",
        "",
        "FROM oven/bun:1-slim",
        "WORKDIR /app",
        "COPY --from=builder /app .",
        "EXPOSE 3000",
        'CMD ["bun", "run", "src/index.ts"]',
      ].join("\n"),
    },
  ],
  hooks: [
    {
      timing: "post-scaffold",
      name: "Install dependencies",
      command: "cd {{projectName}} && bun install",
      description: "Install all Bun dependencies",
      requiresConfirmation: false,
    },
  ],
  variables: {
    projectName: "my-hono-service",
  },
};
