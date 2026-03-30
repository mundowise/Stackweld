import type { Template } from "@stackpilot/core";

export const remixFullstack: Template = {
  id: "remix-fullstack",
  name: "Remix Fullstack",
  description: "Full-stack Remix app with Prisma, PostgreSQL, Tailwind CSS, and TypeScript",
  technologyIds: ["remix", "react", "nodejs", "typescript", "tailwindcss", "prisma", "postgresql"],
  profile: "standard",
  scaffoldSteps: [
    {
      name: "Create Remix project",
      command: "npx create-remix@latest {{projectName}} --yes",
    },
    {
      name: "Install Prisma",
      command: "cd {{projectName}} && npm install prisma @prisma/client",
    },
    {
      name: "Initialize Prisma",
      command: "cd {{projectName}} && npx prisma init --datasource-provider postgresql",
    },
    {
      name: "Install Tailwind",
      command: "cd {{projectName}} && npm install -D tailwindcss @tailwindcss/vite",
    },
  ],
  overrides: [
    {
      path: ".env.example",
      content: [
        "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/{{projectName}}",
        "SESSION_SECRET=your-secret-key-change-me",
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
  ],
  hooks: [
    {
      timing: "post-scaffold",
      name: "Install dependencies",
      command: "cd {{projectName}} && npm install",
      description: "Install all npm dependencies",
      requiresConfirmation: false,
    },
    {
      timing: "post-scaffold",
      name: "Generate Prisma client",
      command: "cd {{projectName}} && npx prisma generate",
      description: "Generate the Prisma client from schema",
      requiresConfirmation: false,
    },
  ],
  variables: {
    projectName: "my-remix-app",
  },
};
