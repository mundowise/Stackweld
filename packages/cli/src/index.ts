#!/usr/bin/env node

/**
 * Stackweld CLI — The operating system for your dev stacks.
 */

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
import { banner } from "./ui/format.js";

// Read version from package.json at build time; fallback for development
const VERSION = "0.2.0";

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

// Show banner when run without arguments
if (process.argv.length <= 2) {
  console.log(banner(VERSION));
  console.log(chalk.bold("  Commands:"));
  console.log("");
  console.log(chalk.cyan("    Setup"));
  console.log(`${chalk.dim("      init            ")}Create a new stack interactively`);
  console.log(`${chalk.dim("      generate        ")}Scaffold a full project (one-shot)`);
  console.log(`${chalk.dim("      create          ")}Scaffold from a stack or template`);
  console.log(`${chalk.dim("      doctor          ")}Check system requirements`);
  console.log("");
  console.log(chalk.cyan("    Stacks"));
  console.log(`${chalk.dim("      list            ")}List all saved stacks`);
  console.log(`${chalk.dim("      info <id>       ")}Show stack or technology details`);
  console.log(`${chalk.dim("      browse          ")}Browse technology catalog`);
  console.log(`${chalk.dim("      save            ")}Save a version snapshot`);
  console.log(`${chalk.dim("      delete          ")}Delete a saved stack`);
  console.log(`${chalk.dim("      clone           ")}Duplicate a stack`);
  console.log(`${chalk.dim("      export/import   ")}Export or import stack definitions`);
  console.log(`${chalk.dim("      share <id>      ")}Generate a shareable URL for a stack`);
  console.log(`${chalk.dim("      import-url <url> ")}Import a stack from a share URL`);
  console.log(`${chalk.dim("      preview <id>    ")}Preview docker-compose.yml for a stack`);
  console.log("");
  console.log(chalk.cyan("    Runtime"));
  console.log(`${chalk.dim("      up              ")}Start Docker services`);
  console.log(`${chalk.dim("      down            ")}Stop Docker services`);
  console.log(`${chalk.dim("      status          ")}Show service status`);
  console.log(`${chalk.dim("      logs            ")}Show service logs`);
  console.log("");
  console.log(chalk.cyan("    Analysis"));
  console.log(`${chalk.dim("      analyze [path]  ")}Detect project stack automatically`);
  console.log(`${chalk.dim("      health [path]   ")}Check project health and best practices`);
  console.log(`${chalk.dim("      compare <a> <b> ")}Compare two saved stacks`);
  console.log(`${chalk.dim("      env [sync|check]")} Sync .env files and check for issues`);
  console.log(`${chalk.dim("      score <a> [b]   ")}Compatibility score between technologies`);
  console.log("");
  console.log(chalk.cyan("    Deploy & Standards"));
  console.log(`${chalk.dim("      deploy <id>     ")}Generate infrastructure files (VPS/AWS/GCP)`);
  console.log(`${chalk.dim("      lint            ")}Validate stack against team standards`);
  console.log(`${chalk.dim("      benchmark <id>  ")}Show performance profile for a stack`);
  console.log(`${chalk.dim("      cost <id>       ")}Estimate monthly hosting costs`);
  console.log("");
  console.log(chalk.cyan("    Plugins"));
  console.log(`${chalk.dim("      plugin list     ")}List installed plugins`);
  console.log(`${chalk.dim("      plugin install  ")}Install a plugin from local directory`);
  console.log(`${chalk.dim("      plugin remove   ")}Remove an installed plugin`);
  console.log(`${chalk.dim("      plugin info     ")}Show plugin details`);
  console.log("");
  console.log(chalk.cyan("    Migration & Learning"));
  console.log(`${chalk.dim("      migrate         ")}Generate a migration plan between techs`);
  console.log(`${chalk.dim("      learn <tech>    ")}Show learning resources for a technology`);
  console.log("");
  console.log(chalk.cyan("    Extras"));
  console.log(`${chalk.dim("      ai suggest      ")}AI-powered stack suggestions`);
  console.log(`${chalk.dim("      template        ")}Manage templates`);
  console.log(`${chalk.dim("      config          ")}Manage preferences`);
  console.log(`${chalk.dim("      completion      ")}Generate shell completions`);
  console.log("");
  console.log(chalk.dim(`  Run ${chalk.white("stackweld <command> --help")} for detailed usage.`));
  console.log("");
  process.exit(0);
}

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
