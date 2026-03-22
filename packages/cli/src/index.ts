#!/usr/bin/env node

/**
 * StackPilot CLI — The operating system for your dev stacks.
 */

import { Command } from "commander";
import chalk from "chalk";
import { initCommand } from "./commands/init.js";
import { createCommand } from "./commands/create.js";
import { listCommand } from "./commands/list.js";
import { infoCommand } from "./commands/info.js";
import { exportCommand } from "./commands/export-stack.js";
import { importCommand } from "./commands/import-stack.js";
import { browseCommand } from "./commands/browse.js";
import { doctorCommand } from "./commands/doctor.js";
import { deleteCommand } from "./commands/delete.js";
import { versionCommand } from "./commands/version-cmd.js";
import { upCommand } from "./commands/up.js";
import { downCommand } from "./commands/down.js";
import { statusCommand } from "./commands/status.js";
import { logsCommand } from "./commands/logs.js";
import { scaffoldCommand } from "./commands/scaffold.js";
import { saveCommand } from "./commands/save.js";
import { completionCommand } from "./commands/completion.js";
import { configCommand } from "./commands/config.js";
import { aiCommand } from "./commands/ai.js";
import { cloneCommand } from "./commands/clone.js";
import { templateCommand } from "./commands/template.js";
import { generateCommand } from "./commands/generate.js";

const program = new Command();

program
  .name("stackpilot")
  .description("The operating system for your dev stacks")
  .version("0.1.0")
  .addCommand(initCommand)
  .addCommand(createCommand)
  .addCommand(listCommand)
  .addCommand(infoCommand)
  .addCommand(exportCommand)
  .addCommand(importCommand)
  .addCommand(browseCommand)
  .addCommand(doctorCommand)
  .addCommand(deleteCommand)
  .addCommand(versionCommand)
  .addCommand(upCommand)
  .addCommand(downCommand)
  .addCommand(statusCommand)
  .addCommand(logsCommand)
  .addCommand(scaffoldCommand)
  .addCommand(saveCommand)
  .addCommand(completionCommand)
  .addCommand(configCommand)
  .addCommand(aiCommand)
  .addCommand(cloneCommand)
  .addCommand(templateCommand)
  .addCommand(generateCommand);

program.parseAsync(process.argv).catch((err) => {
  console.error(chalk.red(err.message));
  process.exit(1);
});
