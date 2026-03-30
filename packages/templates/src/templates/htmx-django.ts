import type { Template } from "@stackpilot/core";

export const htmxDjango: Template = {
  id: "htmx-django",
  name: "HTMX + Django",
  description:
    "Server-rendered Django app with HTMX for interactivity, Tailwind CSS, and PostgreSQL — minimal JavaScript",
  technologyIds: ["htmx", "django", "python", "postgresql", "tailwindcss"],
  profile: "lightweight",
  scaffoldSteps: [
    {
      name: "Create project directory",
      command: "mkdir -p {{projectName}}",
    },
    {
      name: "Setup Python virtual environment",
      command: "python3 -m venv {{projectName}}/.venv",
    },
    {
      name: "Install Python dependencies",
      command:
        "{{projectName}}/.venv/bin/pip install django psycopg2-binary django-htmx python-dotenv gunicorn whitenoise",
    },
    {
      name: "Create Django project",
      command: "{{projectName}}/.venv/bin/django-admin startproject config {{projectName}}",
    },
    {
      name: "Install Tailwind standalone CLI",
      command:
        "cd {{projectName}} && mkdir -p static/css && curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64 && chmod +x tailwindcss-linux-x64",
    },
  ],
  overrides: [
    {
      path: ".env.example",
      content: [
        "DEBUG=True",
        "SECRET_KEY=change-me-in-production",
        "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/{{projectName}}",
        "ALLOWED_HOSTS=localhost,127.0.0.1",
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
      path: "requirements.txt",
      content: [
        "django>=5.1",
        "psycopg2-binary>=2.9",
        "django-htmx>=1.19",
        "python-dotenv>=1.0",
        "gunicorn>=22.0",
        "whitenoise>=6.7",
      ].join("\n"),
    },
  ],
  hooks: [
    {
      timing: "post-scaffold",
      name: "Run initial migrations",
      command: "cd {{projectName}} && .venv/bin/python manage.py migrate",
      description: "Run Django migrations (requires running PostgreSQL)",
      requiresConfirmation: true,
    },
    {
      timing: "post-scaffold",
      name: "Freeze requirements",
      command: "cd {{projectName}} && .venv/bin/pip freeze > requirements.lock",
      description: "Generate locked requirements file",
      requiresConfirmation: false,
    },
  ],
  variables: {
    projectName: "my-htmx-app",
  },
};
