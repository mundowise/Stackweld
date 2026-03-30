/**
 * stackpilot compare <stackA> <stackB> — Compare two saved stacks side by side.
 */

import { diffStacks } from "@stackpilot/core";
import chalk from "chalk";
import { Command } from "commander";
import { getStackEngine } from "../ui/context.js";
import { box, formatJson, gradientHeader } from "../ui/format.js";

export const compareCommand = new Command("compare")
  .description("Compare two saved stacks")
  .argument("<stackA>", "First stack ID")
  .argument("<stackB>", "Second stack ID")
  .option("--json", "Output as JSON")
  .action((stackAId: string, stackBId: string, opts) => {
    const engine = getStackEngine();

    const stackA = engine.get(stackAId);
    if (!stackA) {
      console.error(chalk.red(`\u2716 Stack "${stackAId}" not found.`));
      console.error(chalk.dim("  Run `stackpilot list` to see available stacks."));
      process.exit(1);
    }

    const stackB = engine.get(stackBId);
    if (!stackB) {
      console.error(chalk.red(`\u2716 Stack "${stackBId}" not found.`));
      console.error(chalk.dim("  Run `stackpilot list` to see available stacks."));
      process.exit(1);
    }

    const diff = diffStacks(stackA, stackB);

    if (opts.json) {
      console.log(
        formatJson({
          stackA: { id: stackA.id, name: stackA.name },
          stackB: { id: stackB.id, name: stackB.name },
          ...diff,
        }),
      );
      return;
    }

    const lines: string[] = [];
    lines.push("");

    // Added
    if (diff.added.length > 0) {
      lines.push(chalk.green.bold(`  + Added in B (${diff.added.length}):`));
      for (const item of diff.added) {
        const ver = item.version ? ` ${item.version}` : "";
        lines.push(chalk.green(`    + ${item.name}${ver}`));
      }
      lines.push("");
    }

    // Removed
    if (diff.removed.length > 0) {
      lines.push(chalk.red.bold(`  - Removed from A (${diff.removed.length}):`));
      for (const item of diff.removed) {
        const ver = item.version ? ` ${item.version}` : "";
        lines.push(chalk.red(`    - ${item.name}${ver}`));
      }
      lines.push("");
    }

    // Changed
    if (diff.changed.length > 0) {
      // Group changes by technology
      const byTech = new Map<string, typeof diff.changed>();
      for (const change of diff.changed) {
        const existing = byTech.get(change.technologyId) || [];
        existing.push(change);
        byTech.set(change.technologyId, existing);
      }

      lines.push(chalk.yellow.bold(`  ~ Changed (${byTech.size}):`));
      for (const [, changes] of byTech) {
        for (const change of changes) {
          lines.push(
            chalk.yellow(`    ~ ${change.name}: ${change.from} \u2192 ${change.to}`) +
              chalk.dim(` (${change.field})`),
          );
        }
      }
      lines.push("");
    }

    // Unchanged
    if (diff.unchanged.length > 0) {
      lines.push(chalk.dim(`  = Unchanged (${diff.unchanged.length}):`));
      lines.push(chalk.dim(`    ${diff.unchanged.join(", ")}`));
      lines.push("");
    }

    // No differences
    if (diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0) {
      lines.push(chalk.green("  Stacks are identical."));
      lines.push("");
    }

    lines.push(`  ${chalk.dim("Summary:")} ${diff.summary}`);
    lines.push("");

    const title = `A: ${stackA.name}  vs  B: ${stackB.name}`;
    console.log(`\n  ${gradientHeader("StackPilot")} ${chalk.dim("/ Stack Comparison")}\n`);
    console.log(box(lines.join("\n"), title));
    console.log("");
  });
