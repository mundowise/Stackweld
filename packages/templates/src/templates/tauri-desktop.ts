import type { Template } from "@stackpilot/core";

export const tauriDesktop: Template = {
  id: "tauri-desktop",
  name: "Tauri Desktop",
  description: "Cross-platform desktop app with Tauri, React, TypeScript, Tailwind CSS, and SQLite",
  technologyIds: ["react", "nodejs", "typescript", "tailwindcss", "sqlite"],
  profile: "standard",
  scaffoldSteps: [
    {
      name: "Create Vite + React project",
      command: "npx create-vite@latest {{projectName}} -- --template react-ts",
    },
    {
      name: "Install Tailwind",
      command: "cd {{projectName}} && npm install -D tailwindcss @tailwindcss/vite",
    },
    {
      name: "Install Tauri CLI",
      command: "cd {{projectName}} && npm install -D @tauri-apps/cli",
    },
    {
      name: "Install Tauri API",
      command: "cd {{projectName}} && npm install @tauri-apps/api",
    },
    {
      name: "Initialize Tauri",
      command:
        "cd {{projectName}} && npx tauri init --app-name {{projectName}} --window-title {{projectName}} --dist-dir ../dist --dev-path http://localhost:5173 --ci",
    },
  ],
  overrides: [
    {
      path: ".env.example",
      content: ["VITE_APP_NAME={{projectName}}", "VITE_APP_VERSION=0.1.0"].join("\n"),
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
      name: "Verify Rust toolchain",
      command: "rustup show",
      description: "Verify Rust is installed (required by Tauri)",
      requiresConfirmation: true,
    },
  ],
  variables: {
    projectName: "my-tauri-app",
  },
};
