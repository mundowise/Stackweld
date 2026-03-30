/**
 * stackpilot version — Stack version management.
 */

import chalk from "chalk";
import { Command } from "commander";
import { getStackEngine } from "../ui/context.js";
import { formatJson } from "../ui/format.js";

export const versionCommand = new Command("version")
  .description("Manage stack versions")
  .addCommand(
    new Command("list")
      .description("Show version history for a stack")
      .argument("<stack-id>", "Stack ID")
      .option("--json", "Output as JSON")
      .action((stackId: string, opts) => {
        const engine = getStackEngine();
        const stack = engine.get(stackId);

        if (!stack) {
          console.error(chalk.red(`Stack "${stackId}" not found.`));
          process.exit(1);
        }

        const history = engine.getVersionHistory(stackId);

        if (opts.json) {
          console.log(formatJson(history));
          return;
        }

        console.log(chalk.bold(`Version history for "${stack.name}":\n`));
        for (const v of history) {
          console.log(
            `  ${chalk.cyan(`v${v.version}`)} ${chalk.dim(v.timestamp)} — ${v.changelog}`,
          );
        }
      }),
  )
  .addCommand(
    new Command("rollback")
      .description("Rollback a stack to a previous version")
      .argument("<stack-id>", "Stack ID")
      .requiredOption("--to <version>", "Target version number")
      .action((stackId: string, opts) => {
        const engine = getStackEngine();
        const targetVersion = Number.parseInt(opts.to, 10);

        if (Number.isNaN(targetVersion)) {
          console.error(chalk.red("Invalid version number."));
          process.exit(1);
        }

        const result = engine.rollback(stackId, targetVersion);
        if (!result) {
          console.error(chalk.red(`Could not rollback to version ${targetVersion}.`));
          process.exit(1);
        }

        console.log(chalk.green(`✓ Rolled back to v${targetVersion}`));
      }),
  )
  .addCommand(
    new Command("diff")
      .description("Compare two versions of a stack")
      .argument("<stack-id>", "Stack ID")
      .argument("<version-a>", "First version")
      .argument("<version-b>", "Second version")
      .action((stackId: string, vA: string, vB: string) => {
        const engine = getStackEngine();
        const history = engine.getVersionHistory(stackId);

        const a = Number.parseInt(vA, 10);
        const b = Number.parseInt(vB, 10);

        const snapshotA = history.find((h) => h.version === a);
        const snapshotB = history.find((h) => h.version === b);

        if (!snapshotA || !snapshotB) {
          console.error(chalk.red("One or both versions not found."));
          process.exit(1);
        }

        const techsA = new Set(snapshotA.snapshot.technologies.map((t) => t.technologyId));
        const techsB = new Set(snapshotB.snapshot.technologies.map((t) => t.technologyId));

        const added = [...techsB].filter((t) => !techsA.has(t));
        const removed = [...techsA].filter((t) => !techsB.has(t));
        const common = [...techsA].filter((t) => techsB.has(t));

        console.log(chalk.bold(`Diff: v${a} → v${b}\n`));

        if (added.length > 0) {
          console.log(chalk.green("  Added:"));
          for (const t of added) console.log(chalk.green(`    + ${t}`));
        }
        if (removed.length > 0) {
          console.log(chalk.red("  Removed:"));
          for (const t of removed) console.log(chalk.red(`    - ${t}`));
        }

        // Check version changes
        for (const tid of common) {
          const versionA = snapshotA.snapshot.technologies.find(
            (t) => t.technologyId === tid,
          )?.version;
          const versionB = snapshotB.snapshot.technologies.find(
            (t) => t.technologyId === tid,
          )?.version;
          if (versionA !== versionB) {
            console.log(chalk.yellow(`  Changed: ${tid} ${versionA} → ${versionB}`));
          }
        }

        if (added.length === 0 && removed.length === 0) {
          console.log(chalk.dim("  No technology changes between versions."));
        }

        // Profile/name changes
        if (snapshotA.snapshot.profile !== snapshotB.snapshot.profile) {
          console.log(
            chalk.yellow(
              `  Profile: ${snapshotA.snapshot.profile} → ${snapshotB.snapshot.profile}`,
            ),
          );
        }
        if (snapshotA.snapshot.name !== snapshotB.snapshot.name) {
          console.log(
            chalk.yellow(`  Name: ${snapshotA.snapshot.name} → ${snapshotB.snapshot.name}`),
          );
        }
      }),
  );
