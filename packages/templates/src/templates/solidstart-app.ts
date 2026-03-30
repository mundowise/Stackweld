import type { Template } from "@stackweld/core";

export const solidstartApp: Template = {
  id: "solidstart-app",
  name: "SolidStart App",
  description: "Full-stack SolidStart application with TypeScript, Tailwind CSS, and PostgreSQL",
  technologyIds: ["solidjs", "nodejs", "typescript", "tailwindcss", "postgresql"],
  profile: "standard",
  scaffoldSteps: [
    {
      name: "Create SolidStart project",
      command: "mkdir -p {{projectName}} && cd {{projectName}} && npm init solid@latest . -- --yes",
    },
    {
      name: "Install Tailwind",
      command: "cd {{projectName}} && npm install -D tailwindcss @tailwindcss/vite",
    },
    {
      name: "Install PostgreSQL client",
      command: "cd {{projectName}} && npm install postgres",
    },
    {
      name: "Install dotenv",
      command: "cd {{projectName}} && npm install dotenv",
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
  ],
  variables: {
    projectName: "my-solidstart-app",
  },
};
