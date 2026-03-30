import type { Template } from "@stackpilot/core";

export const t3Stack: Template = {
  id: "t3-stack",
  name: "T3 Stack",
  description: "Full-stack TypeScript app with Next.js, tRPC, Prisma, Tailwind CSS, and NextAuth",
  technologyIds: [
    "nextjs",
    "react",
    "nodejs",
    "typescript",
    "tailwindcss",
    "prisma",
    "postgresql",
    "nextauth",
  ],
  profile: "standard",
  scaffoldSteps: [
    {
      name: "Create Next.js app",
      command:
        "npx create-next-app@latest {{projectName}} --typescript --tailwind --eslint --app --src-dir --import-alias '@/*'",
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
    {
      name: "Install NextAuth",
      command: "npm install next-auth@beta",
      workingDir: "{{projectName}}",
    },
  ],
  overrides: [
    {
      path: ".env.example",
      content: [
        "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/{{projectName}}",
        "NEXTAUTH_SECRET=your-secret-key-change-me",
        "NEXTAUTH_URL=http://localhost:3000",
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
    projectName: "my-t3-app",
  },
};
