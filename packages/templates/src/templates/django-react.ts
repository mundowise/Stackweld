import type { Template } from "@stackpilot/core";

export const djangoReact: Template = {
  id: "django-react",
  name: "Django + React",
  description:
    "Full-stack app with Django backend, React frontend, PostgreSQL, Redis, Tailwind CSS, and Docker",
  technologyIds: [
    "django",
    "python",
    "react",
    "nodejs",
    "typescript",
    "postgresql",
    "redis",
    "tailwindcss",
  ],
  profile: "production",
  scaffoldSteps: [
    {
      name: "Create project directory",
      command: "mkdir -p {{projectName}}/{backend,frontend}",
    },
    {
      name: "Setup Python backend",
      command:
        "python3 -m venv {{projectName}}/backend/.venv && {{projectName}}/backend/.venv/bin/pip install django djangorestframework psycopg2-binary django-redis django-cors-headers python-dotenv gunicorn",
    },
    {
      name: "Create Django project",
      command:
        "{{projectName}}/backend/.venv/bin/django-admin startproject config {{projectName}}/backend",
    },
    {
      name: "Create React frontend",
      command:
        "npx create-vite@latest {{projectName}}/frontend -- --template react-ts",
    },
    {
      name: "Install Tailwind in frontend",
      command:
        "cd {{projectName}}/frontend && npm install -D tailwindcss @tailwindcss/vite",
    },
  ],
  overrides: [
    {
      path: ".env.example",
      content: [
        "# Backend",
        "DEBUG=True",
        "SECRET_KEY=change-me-in-production",
        "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/{{projectName}}",
        "REDIS_URL=redis://localhost:6379/0",
        "ALLOWED_HOSTS=localhost,127.0.0.1",
        "CORS_ALLOWED_ORIGINS=http://localhost:5173",
        "",
        "# Frontend",
        "VITE_API_URL=http://localhost:8000",
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
      path: "backend/requirements.txt",
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
      name: "Install frontend dependencies",
      command: "cd {{projectName}}/frontend && npm install",
      description: "Install npm dependencies for the React frontend",
      requiresConfirmation: false,
    },
    {
      timing: "post-scaffold",
      name: "Freeze backend requirements",
      command:
        "cd {{projectName}}/backend && .venv/bin/pip freeze > requirements.lock",
      description: "Generate locked requirements file for the backend",
      requiresConfirmation: false,
    },
  ],
  variables: {
    projectName: "my-django-react-app",
  },
};
