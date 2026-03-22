import type { Template } from "@stackpilot/core";

export const fastapiReact: Template = {
  id: "fastapi-react",
  name: "FastAPI + React",
  description:
    "Full-stack app with FastAPI backend, React frontend, PostgreSQL, and Docker",
  technologyIds: [
    "fastapi",
    "python",
    "react",
    "nodejs",
    "typescript",
    "postgresql",
    "tailwindcss",
  ],
  profile: "standard",
  scaffoldSteps: [
    {
      name: "Create project directory",
      command: "mkdir -p {{projectName}}/{backend,frontend}",
    },
    {
      name: "Setup Python backend",
      command:
        "python3 -m venv {{projectName}}/backend/.venv && {{projectName}}/backend/.venv/bin/pip install fastapi uvicorn sqlalchemy psycopg2-binary alembic python-dotenv",
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
        "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/{{projectName}}",
        "BACKEND_HOST=0.0.0.0",
        "BACKEND_PORT=8000",
        "CORS_ORIGINS=http://localhost:5173",
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
        "volumes:",
        "  pgdata:",
      ].join("\n"),
    },
    {
      path: "backend/requirements.txt",
      content: [
        "fastapi>=0.115",
        "uvicorn[standard]>=0.30",
        "sqlalchemy>=2.0",
        "psycopg2-binary>=2.9",
        "alembic>=1.13",
        "python-dotenv>=1.0",
      ].join("\n"),
    },
    {
      path: "backend/main.py",
      content: [
        "from fastapi import FastAPI",
        "from fastapi.middleware.cors import CORSMiddleware",
        "import os",
        "",
        "app = FastAPI(title=\"{{projectName}}\")",
        "",
        "app.add_middleware(",
        "    CORSMiddleware,",
        '    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),',
        "    allow_credentials=True,",
        '    allow_methods=["*"],',
        '    allow_headers=["*"],',
        ")",
        "",
        "",
        '@app.get("/health")',
        "def health():",
        '    return {"status": "ok"}',
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
  ],
  variables: {
    projectName: "my-fullstack-app",
  },
};
