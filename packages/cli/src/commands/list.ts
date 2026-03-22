/**
 * stackpilot list — List saved stacks.
 */

import { Command } from "commander";
import chalk from "chalk";
import { getStackEngine } from "../ui/context.js";
import { formatStackRow, formatJson } from "../ui/format.js";

export const listCommand = new Command("list")
  .aliases(["ls"])
  .description("List all saved stacks")
  .option("--json", "Output as JSON")
  .action((opts) => {
    const engine = getStackEngine();
    const stacks = engine.list();

    if (stacks.length === 0) {
      console.log(chalk.dim("No stacks found. Run `stackpilot init` to create one."));
      return;
    }

    if (opts.json) {
      console.log(formatJson(stacks));
      return;
    }

    console.log(chalk.bold(`${stacks.length} stack(s):\n`));
    for (const stack of stacks) {
      console.log(formatStackRow(stack));
      console.log("");
    }
  });
