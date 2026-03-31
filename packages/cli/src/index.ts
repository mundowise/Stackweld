#!/usr/bin/env node

/**
 * Stackweld CLI — The operating system for your dev stacks.
 */

import chalk from "chalk";
import { Command } from "commander";
import { select, input } from "@inquirer/prompts";
import { aiCommand } from "./commands/ai.js";
import { analyzeCommand } from "./commands/analyze.js";
import { benchmarkCommand } from "./commands/benchmark.js";
import { browseCommand } from "./commands/browse.js";
import { cloneCommand } from "./commands/clone.js";
import { compareCommand } from "./commands/compare.js";
import { completionCommand } from "./commands/completion.js";
import { configCommand } from "./commands/config.js";
import { costCommand } from "./commands/cost.js";
import { createCommand } from "./commands/create.js";
import { deleteCommand } from "./commands/delete.js";
import { deployCommand } from "./commands/deploy.js";
import { doctorCommand } from "./commands/doctor.js";
import { downCommand } from "./commands/down.js";
import { envCommand } from "./commands/env.js";
import { exportCommand } from "./commands/export-stack.js";
import { generateCommand } from "./commands/generate.js";
import { healthCommand } from "./commands/health.js";
import { importCommand } from "./commands/import-stack.js";
import { infoCommand } from "./commands/info.js";
import { initCommand } from "./commands/init.js";
import { learnCommand } from "./commands/learn.js";
import { lintCommand } from "./commands/lint.js";
import { listCommand } from "./commands/list.js";
import { logsCommand } from "./commands/logs.js";
import { migrateCommand } from "./commands/migrate.js";
import { pluginCommand } from "./commands/plugin.js";
import { previewCommand } from "./commands/preview.js";
import { saveCommand } from "./commands/save.js";
import { scaffoldCommand } from "./commands/scaffold.js";
import { scoreCommand } from "./commands/score.js";
import { importUrlCommand, shareCommand } from "./commands/share.js";
import { statusCommand } from "./commands/status.js";
import { templateCommand } from "./commands/template.js";
import { upCommand } from "./commands/up.js";
import { versionCommand } from "./commands/version-cmd.js";
import { banner } from "./ui/format.js";

const VERSION = "0.2.1";

const program = new Command();

program
  .name("stackweld")
  .description("The operating system for your dev stacks")
  .version(VERSION, "-V, --version", "Show version number")
  .addCommand(initCommand)
  .addCommand(createCommand)
  .addCommand(generateCommand)
  .addCommand(listCommand)
  .addCommand(infoCommand)
  .addCommand(browseCommand)
  .addCommand(doctorCommand)
  .addCommand(upCommand)
  .addCommand(downCommand)
  .addCommand(statusCommand)
  .addCommand(logsCommand)
  .addCommand(scaffoldCommand)
  .addCommand(saveCommand)
  .addCommand(deleteCommand)
  .addCommand(cloneCommand)
  .addCommand(exportCommand)
  .addCommand(importCommand)
  .addCommand(templateCommand)
  .addCommand(configCommand)
  .addCommand(completionCommand)
  .addCommand(aiCommand)
  .addCommand(scoreCommand)
  .addCommand(analyzeCommand)
  .addCommand(envCommand)
  .addCommand(previewCommand)
  .addCommand(shareCommand)
  .addCommand(importUrlCommand)
  .addCommand(healthCommand)
  .addCommand(compareCommand)
  .addCommand(migrateCommand)
  .addCommand(learnCommand)
  .addCommand(deployCommand)
  .addCommand(lintCommand)
  .addCommand(benchmarkCommand)
  .addCommand(costCommand)
  .addCommand(pluginCommand)
  .addCommand(versionCommand);

// ── Interactive Menu ───────────────────────────────────────────────
async function interactiveMenu(): Promise<void> {
  console.clear();
  console.log(banner(VERSION));

  while (true) {
    try {
      const action = await select({
        message: chalk.bold("What would you like to do?"),
        choices: [
          { name: `${chalk.green("🚀")} Create a new project`,           value: "create" },
          { name: `${chalk.cyan("📋")} Browse technologies (83)`,        value: "browse" },
          { name: `${chalk.yellow("📊")} Score compatibility`,             value: "score" },
          { name: `${chalk.blue("🔍")} Analyze an existing project`,     value: "analyze" },
          { name: `${chalk.magenta("🏥")} System health check (doctor)`,   value: "doctor" },
          { name: `${chalk.cyan("📚")} Learn about a technology`,        value: "learn" },
          { name: `${chalk.yellow("🔄")} Migrate between technologies`,    value: "migrate" },
          { name: `${chalk.green("💰")} Estimate hosting costs`,          value: "cost-ask" },
          { name: `${chalk.blue("⚡")} Performance profile`,              value: "bench-ask" },
          { name: `${chalk.cyan("🩺")} Check project health`,            value: "health" },
          { name: `${chalk.yellow("🌐")} Environment sync (.env)`,        value: "env" },
          new (await import("@inquirer/prompts")).Separator(),
          { name: `${chalk.dim("📦")} Manage saved stacks`,             value: "stacks" },
          { name: `${chalk.dim("🐳")} Docker runtime`,                  value: "docker" },
          { name: `${chalk.dim("⚙️")}  Settings & tools`,                value: "settings" },
          new (await import("@inquirer/prompts")).Separator(),
          { name: `${chalk.red("❌")} Exit`,                             value: "exit" },
        ],
      });

      if (action === "exit") {
        console.log(chalk.dim("\n  Goodbye! 👋\n"));
        process.exit(0);
      }

      console.log("");

      switch (action) {
        case "create":
          await program.parseAsync(["node", "stackweld", "init"]);
          break;

        case "browse":
          await program.parseAsync(["node", "stackweld", "browse"]);
          break;

        case "score": {
          const techA = await input({ message: "First technology ID:" });
          const techB = await input({ message: "Second technology ID (or Enter to see best/worst):" });
          const args = ["node", "stackweld", "score", techA];
          if (techB) args.push(techB);
          await program.parseAsync(args);
          break;
        }

        case "analyze": {
          const path = await input({ message: "Project path:", default: "." });
          await program.parseAsync(["node", "stackweld", "analyze", path]);
          break;
        }

        case "doctor":
          await program.parseAsync(["node", "stackweld", "doctor"]);
          break;

        case "learn": {
          const tech = await input({ message: "Technology to learn about:" });
          await program.parseAsync(["node", "stackweld", "learn", tech]);
          break;
        }

        case "migrate": {
          const from = await input({ message: "Migrate FROM (technology ID):" });
          const to = await input({ message: "Migrate TO (technology ID):" });
          await program.parseAsync(["node", "stackweld", "migrate", "--from", from, "--to", to]);
          break;
        }

        case "cost-ask": {
          const stackId = await input({ message: "Stack ID:" });
          await program.parseAsync(["node", "stackweld", "cost", stackId]);
          break;
        }

        case "bench-ask": {
          const stackId = await input({ message: "Stack ID:" });
          await program.parseAsync(["node", "stackweld", "benchmark", stackId]);
          break;
        }

        case "health": {
          const path = await input({ message: "Project path:", default: "." });
          await program.parseAsync(["node", "stackweld", "health", path]);
          break;
        }

        case "env": {
          const subAction = await select({
            message: "Environment action:",
            choices: [
              { name: "Sync .env.example with .env", value: "sync" },
              { name: "Check for dangerous values", value: "check" },
            ],
          });
          const path = await input({ message: "Project path:", default: "." });
          await program.parseAsync(["node", "stackweld", "env", subAction, "--path", path]);
          break;
        }

        case "stacks": {
          const subAction = await select({
            message: "Stack management:",
            choices: [
              { name: "📋 List all stacks", value: "list" },
              { name: "🔍 Stack info", value: "info" },
              { name: "🗑️  Delete a stack", value: "delete" },
              { name: "📤 Export a stack", value: "export" },
              { name: "📥 Import a stack", value: "import" },
              { name: "🔗 Share via URL", value: "share" },
              { name: "📑 Compare two stacks", value: "compare" },
              { name: "📋 Clone a stack", value: "clone" },
              { name: "⬅️  Back", value: "back" },
            ],
          });
          if (subAction === "back") break;
          if (subAction === "list") {
            await program.parseAsync(["node", "stackweld", "list"]);
          } else if (subAction === "info") {
            const id = await input({ message: "Stack ID:" });
            await program.parseAsync(["node", "stackweld", "info", id]);
          } else if (subAction === "delete") {
            const id = await input({ message: "Stack ID to delete:" });
            await program.parseAsync(["node", "stackweld", "delete", id]);
          } else if (subAction === "export") {
            const id = await input({ message: "Stack ID:" });
            await program.parseAsync(["node", "stackweld", "export", id]);
          } else if (subAction === "import") {
            const file = await input({ message: "File path:" });
            await program.parseAsync(["node", "stackweld", "import", file]);
          } else if (subAction === "share") {
            const id = await input({ message: "Stack ID:" });
            await program.parseAsync(["node", "stackweld", "share", id]);
          } else if (subAction === "compare") {
            const a = await input({ message: "First stack ID:" });
            const b = await input({ message: "Second stack ID:" });
            await program.parseAsync(["node", "stackweld", "compare", a, b]);
          } else if (subAction === "clone") {
            const id = await input({ message: "Stack ID to clone:" });
            await program.parseAsync(["node", "stackweld", "clone", id]);
          }
          break;
        }

        case "docker": {
          const subAction = await select({
            message: "Docker runtime:",
            choices: [
              { name: "▶️  Start services (up)", value: "up" },
              { name: "⏹️  Stop services (down)", value: "down" },
              { name: "📊 Service status", value: "status" },
              { name: "📜 View logs", value: "logs" },
              { name: "⬅️  Back", value: "back" },
            ],
          });
          if (subAction === "back") break;
          await program.parseAsync(["node", "stackweld", subAction]);
          break;
        }

        case "settings": {
          const subAction = await select({
            message: "Settings & tools:",
            choices: [
              { name: "⚙️  Configuration", value: "config" },
              { name: "🔌 Plugins", value: "plugin" },
              { name: "🏗️  Deploy (generate IaC)", value: "deploy-ask" },
              { name: "✅ Lint (team standards)", value: "lint" },
              { name: "📝 Templates", value: "template" },
              { name: "🤖 AI assistant", value: "ai" },
              { name: "⬅️  Back", value: "back" },
            ],
          });
          if (subAction === "back") break;
          if (subAction === "deploy-ask") {
            const id = await input({ message: "Stack ID:" });
            const target = await select({
              message: "Deploy target:",
              choices: [
                { name: "VPS (Docker + nginx)", value: "vps" },
                { name: "AWS (ECS Fargate)", value: "aws" },
                { name: "GCP (Cloud Run)", value: "gcp" },
              ],
            });
            await program.parseAsync(["node", "stackweld", "deploy", id, "--target", target]);
          } else if (subAction === "config") {
            await program.parseAsync(["node", "stackweld", "config", "list"]);
          } else if (subAction === "plugin") {
            await program.parseAsync(["node", "stackweld", "plugin", "list"]);
          } else {
            await program.parseAsync(["node", "stackweld", subAction]);
          }
          break;
        }
      }

      // Pause before showing menu again
      console.log("");
      await input({ message: chalk.dim("Press Enter to continue...") });
      console.clear();
      console.log(banner(VERSION));

    } catch (err: unknown) {
      // Handle Ctrl+C gracefully
      if (err && typeof err === "object" && "name" in err && (err as { name: string }).name === "ExitPromptError") {
        console.log(chalk.dim("\n  Goodbye! 👋\n"));
        process.exit(0);
      }
      throw err;
    }
  }
}

// ── Entry Point ───────────────────────────────────────────────────
if (process.argv.length <= 2) {
  interactiveMenu().catch(() => process.exit(0));
} else {
  program.parse();
}
