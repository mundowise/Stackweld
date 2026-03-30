import type { Template } from "@stackweld/core";

export const djangoRestApi: Template = {
  id: "django-rest-api",
  name: "Django REST API",
  description:
    "Production-ready REST API with Django, Django REST Framework, PostgreSQL, and Redis",
  technologyIds: ["django", "python", "postgresql", "redis"],
  profile: "standard",
  scaffoldSteps: [
    {
      name: "Create virtual environment",
      command: "python3 -m venv {{projectName}}/.venv",
    },
    {
      name: "Create Django project",
      command:
        "{{projectName}}/.venv/bin/pip install django djangorestframework && {{projectName}}/.venv/bin/django-admin startproject config {{projectName}}",
    },
    {
      name: "Install additional dependencies",
      command:
        "{{projectName}}/.venv/bin/pip install psycopg2-binary django-redis django-cors-headers python-dotenv",
    },
  ],
  overrides: [
    {
      path: ".env.example",
      content: [
        "DEBUG=True",
        "SECRET_KEY=change-me-in-production",
        "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/{{projectName}}",
        "REDIS_URL=redis://localhost:6379/0",
        "ALLOWED_HOSTS=localhost,127.0.0.1",
        "CORS_ALLOWED_ORIGINS=http://localhost:3000",
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
        "  redis:",
        "    image: redis:7-alpine",
        "    restart: unless-stopped",
        "    ports:",
        '      - "6379:6379"',
        "    healthcheck:",
        '      test: ["CMD", "redis-cli", "ping"]',
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
        "djangorestframework>=3.15",
        "psycopg2-binary>=2.9",
        "django-redis>=5.4",
        "django-cors-headers>=4.4",
        "python-dotenv>=1.0",
        "gunicorn>=22.0",
      ].join("\n"),
    },
  ],
  hooks: [
    {
      timing: "post-scaffold",
      name: "Freeze requirements",
      command: "cd {{projectName}} && .venv/bin/pip freeze > requirements.lock",
      description: "Generate locked requirements file",
      requiresConfirmation: false,
    },
  ],
  variables: {
    projectName: "my-django-api",
  },
};
