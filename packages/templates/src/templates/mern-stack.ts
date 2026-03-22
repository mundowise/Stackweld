import type { Template } from "@stackpilot/core";

export const mernStack: Template = {
  id: "mern-stack",
  name: "MERN Stack",
  description:
    "Full-stack MERN app with React, Express, MongoDB, Node.js, TypeScript, and Tailwind CSS",
  technologyIds: [
    "react",
    "nodejs",
    "express",
    "mongodb",
    "typescript",
    "tailwindcss",
  ],
  profile: "standard",
  scaffoldSteps: [
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
    {
      name: "Create backend directory",
      command: "mkdir -p {{projectName}}/backend/src",
    },
    {
      name: "Initialize backend",
      command: "cd {{projectName}}/backend && npm init -y",
    },
    {
      name: "Install backend dependencies",
      command:
        "cd {{projectName}}/backend && npm install express cors helmet dotenv mongoose",
    },
    {
      name: "Install backend dev dependencies",
      command:
        "cd {{projectName}}/backend && npm install -D typescript @types/node @types/express @types/cors tsx",
    },
    {
      name: "Initialize TypeScript",
      command:
        "cd {{projectName}}/backend && npx tsc --init --outDir dist --rootDir src --strict --esModuleInterop --resolveJsonModule",
    },
  ],
  overrides: [
    {
      path: ".env.example",
      content: [
        "# Backend",
        "PORT=3001",
        "NODE_ENV=development",
        "MONGODB_URI=mongodb://localhost:27017/{{projectName}}",
        "CORS_ORIGIN=http://localhost:5173",
        "",
        "# Frontend",
        "VITE_API_URL=http://localhost:3001",
      ].join("\n"),
    },
    {
      path: "docker-compose.yml",
      content: [
        "services:",
        "  mongo:",
        "    image: mongo:7",
        "    restart: unless-stopped",
        "    ports:",
        '      - "27017:27017"',
        "    volumes:",
        "      - mongodata:/data/db",
        "    healthcheck:",
        '      test: ["CMD", "mongosh", "--eval", "db.adminCommand(\'ping\')"]',
        "      interval: 10s",
        "      timeout: 5s",
        "      retries: 5",
        "",
        "volumes:",
        "  mongodata:",
      ].join("\n"),
    },
    {
      path: "backend/src/index.ts",
      content: [
        'import express from "express";',
        'import cors from "cors";',
        'import helmet from "helmet";',
        'import dotenv from "dotenv";',
        'import mongoose from "mongoose";',
        "",
        "dotenv.config();",
        "",
        "const app = express();",
        "const port = process.env.PORT || 3001;",
        "",
        "app.use(helmet());",
        "app.use(cors({ origin: process.env.CORS_ORIGIN }));",
        "app.use(express.json());",
        "",
        'app.get("/health", (_req, res) => {',
        '  res.json({ status: "ok" });',
        "});",
        "",
        "mongoose",
        '  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/app")',
        "  .then(() => {",
        '    console.log("Connected to MongoDB");',
        "    app.listen(port, () => {",
        "      console.log(`Server running on port ${port}`);",
        "    });",
        "  })",
        "  .catch((err) => {",
        '    console.error("MongoDB connection error:", err);',
        "    process.exit(1);",
        "  });",
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
    projectName: "my-mern-app",
  },
};
