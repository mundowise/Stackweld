/**
 * stackweld info <id> — Show detailed information about a stack or technology.
 */

import chalk from "chalk";
import { Command } from "commander";
import { getRulesEngine, getStackEngine } from "../ui/context.js";
import { formatJson, formatStackRow, formatTechnology } from "../ui/format.js";

export const infoCommand = new Command("info")
  .description("Show details about a stack or technology")
  .argument("<id>", "Stack ID or technology ID")
  .option("--json", "Output as JSON")
  .action((id: string, opts) => {
    const engine = getStackEngine();
    const rules = getRulesEngine();

    // Try stack first
    const stack = engine.get(id);
    if (stack) {
      if (opts.json) {
        console.log(formatJson(stack));
      } else {
        console.log(formatStackRow(stack));

        // Show individual tech details
        console.log(chalk.bold("\nTechnologies:"));
        for (const t of stack.technologies) {
          const tech = rules.getTechnology(t.technologyId);
          if (tech) {
            console.log(
              `  ${chalk.cyan(tech.name)} ${chalk.dim(`v${t.version}`)} ${t.port ? chalk.dim(`:${t.port}`) : ""}`,
            );
          }
        }

        // Show version history
        const history = engine.getVersionHistory(stack.id);
        if (history.length > 1) {
          console.log(chalk.bold("\nVersion history:"));
          for (const v of history.slice(0, 5)) {
            console.log(`  ${chalk.dim(`v${v.version}`)} ${chalk.dim(v.timestamp)} ${v.changelog}`);
          }
        }
      }
      return;
    }

    // Try technology
    const tech = rules.getTechnology(id);
    if (tech) {
      if (opts.json) {
        console.log(formatJson(tech));
      } else {
        console.log(formatTechnology(tech));
      }
      return;
    }

    console.error(chalk.red(`"${id}" not found as stack or technology.`));
    process.exit(1);
  });
