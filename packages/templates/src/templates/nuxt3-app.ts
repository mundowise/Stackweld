import type { Template } from "@stackpilot/core";

export const nuxt3App: Template = {
  id: "nuxt3-app",
  name: "Nuxt 3 App",
  description: "Full-stack Nuxt 3 application with Vue, Tailwind CSS, and PostgreSQL",
  technologyIds: ["nuxt", "vue", "nodejs", "typescript", "tailwindcss", "postgresql"],
  profile: "standard",
  scaffoldSteps: [
    {
      name: "Create Nuxt 3 project",
      command: "npx nuxi@latest init {{projectName}}",
    },
    {
      name: "Install Tailwind CSS module",
      command: "npm install -D @nuxtjs/tailwindcss",
      workingDir: "{{projectName}}",
    },
    {
      name: "Install database dependencies",
      command: "npm install postgres drizzle-orm && npm install -D drizzle-kit",
      workingDir: "{{projectName}}",
    },
  ],
  overrides: [
    {
      path: ".env.example",
      content: [
        "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/{{projectName}}",
        "NUXT_PUBLIC_APP_NAME={{projectName}}",
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
      name: "Prepare Nuxt",
      command: "cd {{projectName}} && npx nuxi prepare",
      description: "Generate Nuxt types and .nuxt directory",
      requiresConfirmation: false,
    },
  ],
  variables: {
    projectName: "my-nuxt3-app",
  },
};
