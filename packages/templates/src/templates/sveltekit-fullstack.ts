import type { Template } from "@stackpilot/core";

export const sveltekitFullstack: Template = {
  id: "sveltekit-fullstack",
  name: "SvelteKit Full-Stack",
  description: "Full-stack SvelteKit app with Prisma ORM, PostgreSQL, and Tailwind CSS",
  technologyIds: [
    "sveltekit",
    "svelte",
    "nodejs",
    "typescript",
    "tailwindcss",
    "prisma",
    "postgresql",
  ],
  profile: "standard",
  scaffoldSteps: [
    {
      name: "Create SvelteKit project",
      command: "npx sv create {{projectName}} --template minimal --types ts",
    },
    {
      name: "Install Tailwind CSS",
      command: "cd {{projectName}} && npx sv add tailwindcss",
    },
    {
      name: "Install Prisma",
      command: "npm install prisma @prisma/client",
      workingDir: "{{projectName}}",
    },
    {
      name: "Initialize Prisma",
      command: "npx prisma init --datasource-provider postgresql",
      workingDir: "{{projectName}}",
    },
  ],
  overrides: [
    {
      path: ".env.example",
      content: [
        "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/{{projectName}}",
        "PUBLIC_APP_NAME={{projectName}}",
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
    projectName: "my-sveltekit-app",
  },
};
