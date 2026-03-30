/**
 * stackpilot learn <technology> — Show learning resources for a technology.
 */

import type { LearningResource } from "@stackpilot/registry";
import { getLearningResources } from "@stackpilot/registry";
import chalk from "chalk";
import { Command } from "commander";
import { getRulesEngine } from "../ui/context.js";
import { box } from "../ui/format.js";

const DIFFICULTY_ICONS: Record<string, string> = {
  beginner: "\u{1F4D6}", // open book
  intermediate: "\u{1F4DA}", // books
  advanced: "\u{1F393}", // graduation cap
};

const DIFFICULTY_ORDER: Record<string, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const learnCommand = new Command("learn")
  .description("Show learning resources for a technology")
  .argument("<technology>", "Technology ID (e.g. nextjs, react, docker)")
  .option("--json", "Output as JSON")
  .action((technologyId: string, opts) => {
    const rules = getRulesEngine();
    const tech = rules.getTechnology(technologyId);
    const resources = getLearningResources(technologyId);

    const displayName = tech?.name ?? technologyId;

    if (!resources || resources.length === 0) {
      if (opts.json) {
        console.log(JSON.stringify({ technology: technologyId, resources: [] }, null, 2));
        return;
      }

      console.log("");
      console.log(chalk.yellow(`  No learning resources found for "${technologyId}".`));
      console.log("");
      console.log(chalk.dim("  Try searching the official website or documentation."));
      if (tech?.website) {
        console.log(chalk.dim(`  Website: ${chalk.cyan(tech.website)}`));
      }
      console.log("");
      return;
    }

    if (opts.json) {
      console.log(
        JSON.stringify({ technology: technologyId, name: displayName, resources }, null, 2),
      );
      return;
    }

    // Group resources by difficulty
    const grouped: Record<string, LearningResource[]> = {};
    for (const resource of resources) {
      if (!grouped[resource.difficulty]) {
        grouped[resource.difficulty] = [];
      }
      grouped[resource.difficulty].push(resource);
    }

    const lines: string[] = [];
    lines.push("");

    let counter = 1;
    const difficulties = Object.keys(grouped).sort(
      (a, b) => (DIFFICULTY_ORDER[a] ?? 99) - (DIFFICULTY_ORDER[b] ?? 99),
    );

    for (const difficulty of difficulties) {
      const icon = DIFFICULTY_ICONS[difficulty] ?? "";
      const label = DIFFICULTY_LABELS[difficulty] ?? difficulty;
      lines.push(`  ${icon} ${chalk.bold(label)}`);

      for (const resource of grouped[difficulty]) {
        lines.push(`  ${chalk.white(`${counter}.`)} ${resource.title}`);
        lines.push(`     ${chalk.cyan(resource.url)}`);
        counter++;
      }
      lines.push("");
    }

    // Check for missing difficulty levels and show placeholder
    for (const diff of ["beginner", "intermediate", "advanced"]) {
      if (!grouped[diff]) {
        const icon = DIFFICULTY_ICONS[diff] ?? "";
        const label = DIFFICULTY_LABELS[diff] ?? diff;
        lines.push(`  ${icon} ${chalk.bold(label)}`);
        lines.push(chalk.dim(`  (No ${diff} resources yet)`));
        lines.push("");
      }
    }

    lines.push(`  ${chalk.dim("Tip: Start with #1, then build a")}`);
    lines.push(`  ${chalk.dim("project before moving to intermediate.")}`);
    lines.push("");

    console.log(box(lines.join("\n"), `Learning Path: ${displayName}`));
    console.log("");
  });
