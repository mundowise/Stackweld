/**
 * stackpilot save — Save the current stack state (creates version snapshot).
 */

import { Command } from "commander";
import chalk from "chalk";
import { input } from "@inquirer/prompts";
import { getStackEngine } from "../ui/context.js";

export const saveCommand = new Command("save")
  .description("Save a version snapshot of a stack")
  .argument("<stack-id>", "Stack ID")
  .option("-m, --message <msg>", "Version changelog message")
  .action(async (stackId: string, opts) => {
    const engine = getStackEngine();
    const stack = engine.get(stackId);

    if (!stack) {
      console.error(chalk.red(`Stack "${stackId}" not found.`));
      process.exit(1);
    }

    const message =
      opts.message ||
      (await input({
        message: "Changelog message:",
        default: `Snapshot v${stack.version}`,
      }));

    // Trigger an update with no changes to create a new version snapshot
    const result = engine.update(stackId, {});
    if (!result) {
      console.error(chalk.red("Failed to save stack."));
      process.exit(1);
    }

    console.log(
      chalk.green(
        `✓ Saved "${stack.name}" as v${result.stack.version}: ${message}`,
      ),
    );
  });
