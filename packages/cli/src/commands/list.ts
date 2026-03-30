/**
 * stackweld list — List saved stacks.
 */

import chalk from "chalk";
import { Command } from "commander";
import { getStackEngine } from "../ui/context.js";
import { emptyState, formatJson, formatStackTable } from "../ui/format.js";

export const listCommand = new Command("list")
  .aliases(["ls"])
  .description("List all saved stacks")
  .option("--json", "Output as JSON")
  .action((opts) => {
    const engine = getStackEngine();
    const stacks = engine.list();

    if (stacks.length === 0) {
      console.log(emptyState("No stacks saved yet.", "Run `stackweld init` to create one."));
      return;
    }

    if (opts.json) {
      console.log(formatJson(stacks));
      return;
    }

    console.log(chalk.bold(`\n  ${stacks.length} stack(s)\n`));
    console.log(formatStackTable(stacks));
    console.log("");
  });
