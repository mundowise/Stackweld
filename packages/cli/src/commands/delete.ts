/**
 * stackweld delete <id> — Delete a saved stack.
 */

import { confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import { getStackEngine } from "../ui/context.js";

export const deleteCommand = new Command("delete")
  .aliases(["rm"])
  .description("Delete a saved stack")
  .argument("<id>", "Stack ID")
  .option("-f, --force", "Skip confirmation")
  .action(async (id: string, opts) => {
    const engine = getStackEngine();
    const stack = engine.get(id);

    if (!stack) {
      console.error(chalk.red(`Stack "${id}" not found.`));
      process.exit(1);
    }

    if (!opts.force) {
      const yes = await confirm({
        message: `Delete stack "${stack.name}"? This cannot be undone.`,
        default: false,
      });
      if (!yes) {
        console.log(chalk.dim("Cancelled."));
        return;
      }
    }

    engine.delete(id);
    console.log(chalk.green(`✓ Stack "${stack.name}" deleted.`));
  });
