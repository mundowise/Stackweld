/**
 * stackweld migrate --from <techId> --to <techId> — Generate a migration plan between technologies.
 */

import { planMigration } from "@stackweld/core";
import chalk from "chalk";
import { Command } from "commander";
import { getRulesEngine } from "../ui/context.js";
import { box } from "../ui/format.js";

const DIFFICULTY_COLORS: Record<string, (s: string) => string> = {
  easy: chalk.green,
  moderate: chalk.yellow,
  hard: chalk.red,
  expert: chalk.magenta,
};

export const migrateCommand = new Command("migrate")
  .description("Generate a migration plan between two technologies")
  .requiredOption("--from <techId>", "Source technology ID")
  .requiredOption("--to <techId>", "Target technology ID")
  .option("--json", "Output as JSON")
  .action((opts) => {
    const rules = getRulesEngine();
    const techs = rules.getAllTechnologies();

    const fromId: string = opts.from;
    const toId: string = opts.to;

    if (fromId === toId) {
      console.error(chalk.red("\u2716 Source and target technologies must be different."));
      process.exit(1);
    }

    const plan = planMigration(fromId, toId, techs);

    if (opts.json) {
      console.log(JSON.stringify(plan, null, 2));
      return;
    }

    const diffColor = DIFFICULTY_COLORS[plan.difficulty] ?? chalk.white;
    const lines: string[] = [];

    lines.push("");

    for (const step of plan.steps) {
      lines.push(chalk.bold(`  Step ${step.order}: ${step.title}`));
      lines.push(`  ${chalk.dim(step.description)}`);

      if (step.commands && step.commands.length > 0) {
        for (const cmd of step.commands) {
          lines.push(`  ${chalk.cyan(cmd)}`);
        }
      }

      if (step.files && step.files.length > 0) {
        lines.push(`  ${chalk.dim("Files:")} ${step.files.join(", ")}`);
      }

      lines.push("");
    }

    const title = `Migration Plan: ${plan.from.name} \u2192 ${plan.to.name}`;
    const subtitle = `Difficulty: ${diffColor(plan.difficulty.charAt(0).toUpperCase() + plan.difficulty.slice(1))} ${chalk.dim("\u00B7")} Est: ${plan.estimatedTime}`;

    // Build a custom header with title + subtitle
    const header = `${title}\n  ${subtitle}`;
    console.log(box(lines.join("\n"), header));
    console.log("");
  });
