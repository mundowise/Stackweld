#!/usr/bin/env node

/**
 * Stackweld CLI — The operating system for your dev stacks.
 */

import { input, Separator, select } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
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

const VERSION = "0.3.0";

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

// ─── Helpers ──────────────────────────────────────────────

function isExitSignal(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as Record<string, unknown>;
  return e.name === "ExitPromptError" || e.code === "ERR_USE_AFTER_CLOSE";
}

async function pressEnterToContinue(): Promise<void> {
  await input({ message: chalk.dim("Press Enter to continue...") });
}

async function run(args: string[]): Promise<void> {
  try {
    await program.parseAsync(["node", "stackweld", ...args]);
  } catch (err: unknown) {
    const code = (err as Record<string, unknown>)?.code;
    if (code === "commander.helpDisplayed" || code === "commander.version") return;
    if (code === "commander.missingMandatoryOptionValue" || code === "commander.missingArgument") {
      return;
    }
    throw err;
  }
}

// ─── ASCII Art Logo ──────────────────────────────────────

function printLogo(): void {
  const g = chalk.hex("#FFD700"); // gold
  const c = chalk.hex("#00E3FD"); // cyan
  const m = chalk.hex("#FF51FA"); // magenta
  const p = chalk.hex("#7C5CFC"); // purple/brand

  const logo = [
    "",
    `  ${g("\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557")} ${g("\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557")} ${g("\u2588\u2588\u2588\u2588\u2588\u2557")}  ${c("\u2588\u2588\u2588\u2588\u2588\u2588\u2557")} ${c("\u2588\u2588\u2557  \u2588\u2588\u2557")} ${c("\u2588\u2588\u2557")}    ${m("\u2588\u2588\u2557")} ${m("\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557")} ${m("\u2588\u2588\u2557")}     ${m("\u2588\u2588\u2588\u2588\u2588\u2588\u2557 ")}`,
    `  ${g("\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D")} ${g("\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D")} ${g("\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557")} ${c("\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D")} ${c("\u2588\u2588\u2551 \u2588\u2588\u2554\u255D")} ${c("\u2588\u2588\u2551")}    ${m("\u2588\u2588\u2551")} ${m("\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D")} ${m("\u2588\u2588\u2551")}     ${m("\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557")}`,
    `  ${g("\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557")}    ${g("\u2588\u2588\u2551")}   ${g("\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551")} ${c("\u2588\u2588\u2551")}      ${c("\u2588\u2588\u2588\u2588\u2588\u2554\u255D")}  ${c("\u2588\u2588\u2551")} ${c("\u2588\u2588\u2557")} ${m("\u2588\u2588\u2551")} ${m("\u2588\u2588\u2588\u2588\u2588\u2557")}   ${m("\u2588\u2588\u2551")}     ${m("\u2588\u2588\u2551  \u2588\u2588\u2551")}`,
    `  ${g("\u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551")}    ${g("\u2588\u2588\u2551")}   ${g("\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551")} ${c("\u2588\u2588\u2551")}      ${c("\u2588\u2588\u2554\u2550\u2588\u2588\u2557")}  ${c("\u2588\u2588\u2551")} ${c("\u2588\u2588\u2588\u2557")}${m("\u2588\u2588\u2551")} ${m("\u2588\u2588\u2554\u2550\u2550\u255D")}   ${m("\u2588\u2588\u2551")}     ${m("\u2588\u2588\u2551  \u2588\u2588\u2551")}`,
    `  ${g("\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551")}    ${g("\u2588\u2588\u2551")}   ${g("\u2588\u2588\u2551  \u2588\u2588\u2551")} ${c("\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2557")} ${c("\u2588\u2588\u2551  \u2588\u2588\u2557")} ${c("\u255A\u2588\u2588\u2588\u2554\u2588\u2588\u2588\u2554\u255D")} ${m("\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557")} ${m("\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557")} ${m("\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D")}`,
    `  ${g("\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D")}    ${g("\u255A\u2550\u255D")}   ${g("\u255A\u2550\u255D  \u255A\u2550\u255D")}  ${c("\u255A\u2550\u2550\u2550\u2550\u2550\u255D")} ${c("\u255A\u2550\u255D  \u255A\u2550\u255D")}  ${c("\u255A\u2550\u2550\u255D\u255A\u2550\u2550\u255D")}  ${m("\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D")} ${m("\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D")} ${m("\u255A\u2550\u2550\u2550\u2550\u2550\u255D")} `,
    "",
    `  ${p.bold("The Developer's Forge")}  ${chalk.dim(`v${VERSION}`)}`,
    `  ${chalk.dim("github.com/mundowise/Stackweld")}`,
    "",
  ];

  for (const line of logo) {
    console.log(line);
  }
}

// ─── Command List ────────────────────────────────────────

function printCommandList(): void {
  const b = chalk.hex("#7C5CFC").bold;
  const d = chalk.dim;
  const w = chalk.white;

  const categories = [
    {
      name: "Project Setup",
      commands: [
        ["init", "Create a new project interactively"],
        ["create", "Create a stack definition from options"],
        ["generate", "Generate docker-compose & configs"],
        ["scaffold", "Scaffold project files from a stack"],
        ["template", "Manage & apply stack templates"],
      ],
    },
    {
      name: "Stack Management",
      commands: [
        ["list", "List all saved stacks"],
        ["info", "Show stack or technology details"],
        ["save", "Save current stack definition"],
        ["delete", "Delete a saved stack"],
        ["clone", "Clone an existing stack"],
        ["export", "Export stack to a file"],
        ["import", "Import stack from a file"],
        ["share", "Share stack via URL"],
        ["import-url", "Import stack from a shared URL"],
        ["compare", "Compare two stacks side-by-side"],
      ],
    },
    {
      name: "Runtime & Services",
      commands: [
        ["up", "Start stack services (docker-compose up)"],
        ["down", "Stop stack services"],
        ["status", "Show running service status"],
        ["logs", "View service logs"],
        ["health", "Run health checks on services"],
        ["env", "Manage environment variables"],
      ],
    },
    {
      name: "Analysis & Intelligence",
      commands: [
        ["browse", "Browse available technologies"],
        ["analyze", "Analyze an existing project"],
        ["score", "Score compatibility between technologies"],
        ["learn", "Learn about a technology in depth"],
        ["migrate", "Get migration guide between technologies"],
        ["cost", "Estimate hosting costs for a stack"],
        ["benchmark", "Profile performance characteristics"],
        ["doctor", "Check system prerequisites"],
        ["ai", "AI-powered stack recommendations"],
      ],
    },
    {
      name: "Tools & Settings",
      commands: [
        ["config", "View/set configuration preferences"],
        ["completion", "Generate shell completions"],
        ["deploy", "Generate deploy infrastructure"],
        ["lint", "Lint stack against best practices"],
        ["preview", "Preview stack in browser"],
        ["plugin", "Manage CLI plugins"],
        ["version", "Show detailed version info"],
      ],
    },
  ];

  console.log(`\n  ${b("Available Commands")}\n`);

  for (const cat of categories) {
    console.log(`  ${chalk.yellow.bold(cat.name)}`);
    for (const [cmd, desc] of cat.commands) {
      console.log(`    ${w(`stackweld ${cmd}`)}  ${d(desc)}`);
    }
    console.log("");
  }

  console.log(`  ${d("Run")} ${w("stackweld <command> --help")} ${d("for detailed usage.")}\n`);
}

// ─── Submenus ─────────────────────────────────────────────

async function stacksSubmenu(): Promise<void> {
  const action = await select({
    message: "Manage saved stacks",
    loop: false,
    pageSize: 15,
    choices: [
      { name: "\uD83D\uDCCB List all stacks", value: "list" },
      { name: "\uD83D\uDD0D Stack/tech info", value: "info" },
      { name: "\uD83D\uDDD1\uFE0F  Delete a stack", value: "delete" },
      { name: "\uD83D\uDCC2 Clone a stack", value: "clone" },
      { name: "\uD83D\uDCE4 Export a stack", value: "export" },
      { name: "\uD83D\uDCE5 Import a stack", value: "import" },
      { name: "\uD83D\uDD17 Share a stack (URL)", value: "share" },
      { name: "\uD83D\uDD17 Import from URL", value: "import-url" },
      { name: "\uD83D\uDD0D Compare two stacks", value: "compare" },
      new Separator(),
      { name: "\u2B05\uFE0F  Back to main menu", value: "back" },
    ],
  });

  if (action === "back") return;

  switch (action) {
    case "list":
      await run(["list"]);
      break;
    case "info": {
      const id = await input({ message: "Stack or technology ID:" });
      if (id.trim()) await run(["info", id.trim()]);
      break;
    }
    case "delete": {
      const id = await input({ message: "Stack ID to delete:" });
      if (id.trim()) await run(["delete", id.trim()]);
      break;
    }
    case "clone": {
      const id = await input({ message: "Stack ID to clone:" });
      if (id.trim()) await run(["clone", id.trim()]);
      break;
    }
    case "export": {
      const id = await input({ message: "Stack ID to export:" });
      if (id.trim()) await run(["export", id.trim()]);
      break;
    }
    case "import": {
      const file = await input({ message: "File path to import:" });
      if (file.trim()) await run(["import", file.trim()]);
      break;
    }
    case "share": {
      const id = await input({ message: "Stack ID to share:" });
      if (id.trim()) await run(["share", id.trim()]);
      break;
    }
    case "import-url": {
      const url = await input({ message: "Share URL to import:" });
      if (url.trim()) await run(["import-url", url.trim()]);
      break;
    }
    case "compare": {
      const a = await input({ message: "First stack ID:" });
      const b = await input({ message: "Second stack ID:" });
      if (a.trim() && b.trim()) await run(["compare", a.trim(), b.trim()]);
      break;
    }
  }
}

async function runtimeSubmenu(): Promise<void> {
  const action = await select({
    message: "Runtime & services",
    loop: false,
    pageSize: 10,
    choices: [
      { name: "\u25B6\uFE0F  Start services (up)", value: "up" },
      { name: "\u23F9\uFE0F  Stop services (down)", value: "down" },
      { name: "\uD83D\uDFE2 Service status", value: "status" },
      { name: "\uD83D\uDCDC View logs", value: "logs" },
      { name: "\uD83C\uDFE5 Health checks", value: "health" },
      { name: "\uD83D\uDD10 Environment variables", value: "env" },
      new Separator(),
      { name: "\u2B05\uFE0F  Back to main menu", value: "back" },
    ],
  });

  if (action === "back") return;

  switch (action) {
    case "up":
      await run(["up"]);
      break;
    case "down":
      await run(["down"]);
      break;
    case "status":
      await run(["status"]);
      break;
    case "logs":
      await run(["logs"]);
      break;
    case "health":
      await run(["health"]);
      break;
    case "env":
      await run(["env"]);
      break;
  }
}

async function settingsSubmenu(): Promise<void> {
  const action = await select({
    message: "Settings & tools",
    loop: false,
    pageSize: 10,
    choices: [
      { name: "\u2699\uFE0F  Configuration preferences", value: "config" },
      { name: "\uD83D\uDCDD Shell completions (bash/zsh/fish)", value: "completion" },
      { name: "\uD83D\uDD0C Manage plugins", value: "plugins" },
      { name: "\uD83D\uDE80 Generate deploy infrastructure", value: "deploy" },
      { name: "\uD83D\uDCCF Lint stack against standards", value: "lint" },
      { name: "\uD83D\uDD0D Preview stack in browser", value: "preview" },
      new Separator(),
      { name: "\u2B05\uFE0F  Back to main menu", value: "back" },
    ],
  });

  if (action === "back") return;

  switch (action) {
    case "config":
      await run(["config", "list"]);
      break;
    case "completion": {
      const shell = await select({
        message: "Shell type:",
        loop: false,
        choices: [
          { name: "bash", value: "bash" },
          { name: "zsh", value: "zsh" },
          { name: "fish", value: "fish" },
        ],
      });
      await run(["completion", shell]);
      break;
    }
    case "plugins":
      await run(["plugin", "list"]);
      break;
    case "deploy": {
      const id = await input({ message: "Stack ID to deploy:" });
      if (id.trim()) await run(["deploy", id.trim()]);
      break;
    }
    case "lint":
      await run(["lint"]);
      break;
    case "preview":
      await run(["preview"]);
      break;
  }
}

// ─── Interactive Menu ─────────────────────────────────────

async function interactiveMenu(): Promise<void> {
  program.exitOverride();

  console.clear();
  printLogo();

  while (true) {
    let choice: string;

    try {
      choice = await select({
        message: "What would you like to do?",
        loop: false,
        pageSize: 20,
        choices: [
          { name: "\uD83D\uDE80 Create a new project", value: "init" },
          { name: "\uD83D\uDCCB Browse technologies", value: "browse" },
          { name: "\uD83D\uDD0D Analyze an existing project", value: "analyze" },
          { name: "\uD83C\uDFE5 Check system health (doctor)", value: "doctor" },
          { name: "\uD83D\uDCCA Score compatibility", value: "score" },
          { name: "\uD83D\uDCDA Learn about a technology", value: "learn" },
          { name: "\uD83D\uDD04 Migrate between technologies", value: "migrate" },
          { name: "\uD83D\uDCB0 Estimate hosting costs", value: "cost" },
          { name: "\u26A1 Performance profile", value: "benchmark" },
          { name: "\uD83E\uDD16 AI stack recommendations", value: "ai" },
          new Separator(),
          { name: "\uD83D\uDCE6 Manage saved stacks", value: "stacks" },
          { name: "\uD83D\uDDA5\uFE0F  Runtime & services", value: "runtime" },
          { name: "\u2699\uFE0F  Settings & tools", value: "settings" },
          new Separator(),
          { name: "\uD83D\uDCD6 Show all commands", value: "commands" },
          { name: "\u274C Exit", value: "exit" },
        ],
      });
    } catch (err: unknown) {
      if (isExitSignal(err)) {
        console.log(chalk.dim("\n  Goodbye!\n"));
        process.exit(0);
      }
      throw err;
    }

    if (choice === "exit") {
      console.log(chalk.dim("\n  Goodbye!\n"));
      process.exit(0);
    }

    if (choice === "commands") {
      printCommandList();
      try {
        await pressEnterToContinue();
      } catch (err: unknown) {
        if (isExitSignal(err)) {
          console.log(chalk.dim("\n  Goodbye!\n"));
          process.exit(0);
        }
      }
      console.clear();
      printLogo();
      continue;
    }

    console.log("");

    try {
      switch (choice) {
        case "init":
          await run(["init"]);
          break;

        case "browse":
          await run(["browse"]);
          break;

        case "analyze": {
          const path = await input({ message: "Project path to analyze:", default: process.cwd() });
          await run(["analyze", path]);
          break;
        }

        case "doctor":
          await run(["doctor"]);
          break;

        case "score": {
          const techA = await input({ message: "First technology ID (e.g. react, nextjs):" });
          const techB = await input({
            message: "Second technology ID (optional, Enter to skip):",
          });
          const scoreArgs = ["score", techA.trim()];
          if (techB.trim()) scoreArgs.push(techB.trim());
          await run(scoreArgs);
          break;
        }

        case "learn": {
          const tech = await input({ message: "Technology ID (e.g. nextjs, react, docker):" });
          if (tech.trim()) await run(["learn", tech.trim()]);
          break;
        }

        case "migrate": {
          const from = await input({ message: "Migrate FROM (technology ID):" });
          const to = await input({ message: "Migrate TO (technology ID):" });
          if (from.trim() && to.trim()) {
            await run(["migrate", "--from", from.trim(), "--to", to.trim()]);
          }
          break;
        }

        case "cost": {
          const stackId = await input({ message: "Stack ID to estimate costs:" });
          if (stackId.trim()) await run(["cost", stackId.trim()]);
          break;
        }

        case "benchmark": {
          const stackId = await input({ message: "Stack ID to profile:" });
          if (stackId.trim()) await run(["benchmark", stackId.trim()]);
          break;
        }

        case "ai":
          await run(["ai"]);
          break;

        case "stacks":
          await stacksSubmenu();
          break;

        case "runtime":
          await runtimeSubmenu();
          break;

        case "settings":
          await settingsSubmenu();
          break;
      }
    } catch (err: unknown) {
      if (isExitSignal(err)) {
        console.log(chalk.dim("\n  Goodbye!\n"));
        process.exit(0);
      }
      console.error(chalk.red(`\n  \u2716 ${err instanceof Error ? err.message : String(err)}\n`));
    }

    console.log("");
    try {
      await pressEnterToContinue();
    } catch (err: unknown) {
      if (isExitSignal(err)) {
        console.log(chalk.dim("\n  Goodbye!\n"));
        process.exit(0);
      }
    }
    console.clear();
    printLogo();
  }
}

// ─── Entry Point ──────────────────────────────────────────

if (process.argv.length <= 2) {
  interactiveMenu().catch(() => process.exit(0));
} else {
  program.parseAsync(process.argv).catch((err) => {
    if (err && err.code === "commander.unknownCommand") {
      const cmd = process.argv[2];
      console.error(chalk.red(`\u2716 Unknown command: "${cmd}"`));
      console.error(
        chalk.dim(`  Run ${chalk.white("stackweld --help")} to see available commands.`),
      );
      process.exit(1);
    }
    console.error(chalk.red(`\u2716 ${err instanceof Error ? err.message : String(err)}`));
    process.exit(1);
  });
}
