/**
 * stackpilot benchmark <stackId> — Show performance profile for a saved stack.
 */

import { profilePerformance } from "@stackpilot/core";
import chalk from "chalk";
import { Command } from "commander";
import { getRulesEngine, getStackEngine } from "../ui/context.js";
import { box, formatJson, gradientHeader } from "../ui/format.js";

const RATING_COLORS: Record<string, (s: string) => string> = {
  blazing: (s) => chalk.green.bold(s),
  fast: (s) => chalk.cyan.bold(s),
  moderate: (s) => chalk.yellow.bold(s),
  heavy: (s) => chalk.red.bold(s),
};

const PERF_COLORS: Record<string, (s: string) => string> = {
  fast: (s) => chalk.green(s),
  moderate: (s) => chalk.yellow(s),
  heavy: (s) => chalk.red(s),
};

const RATING_ICONS: Record<string, string> = {
  blazing: "\u26A1",
  fast: "\u2714",
  moderate: "\u25CF",
  heavy: "\u26A0",
};

export const benchmarkCommand = new Command("benchmark")
  .description("Show performance profile for a saved stack")
  .argument("<stack-id>", "Stack ID to profile")
  .option("--json", "Output as JSON")
  .action((stackId: string, opts) => {
    const engine = getStackEngine();
    const rules = getRulesEngine();
    const stack = engine.get(stackId);

    if (!stack) {
      console.error(chalk.red(`\u2716 Stack "${stackId}" not found.`));
      console.error(chalk.dim("  Run: stackpilot list"));
      process.exit(1);
    }

    // Resolve full technology data
    const technologies = stack.technologies
      .map((st) => rules.getTechnology(st.technologyId))
      .filter((t): t is NonNullable<typeof t> => t !== undefined);

    if (technologies.length === 0) {
      console.error(chalk.red("\u2716 No technologies could be resolved for this stack."));
      process.exit(1);
    }

    const profile = profilePerformance(technologies);

    if (opts.json) {
      console.log(formatJson(profile));
      return;
    }

    // ── Format output ──
    const ratingColor = RATING_COLORS[profile.rating] || chalk.white;
    const ratingIcon = RATING_ICONS[profile.rating] || "";

    const lines: string[] = [];
    lines.push("");
    lines.push(`  ${chalk.dim("Rating:")}      ${ratingIcon} ${ratingColor(profile.rating.toUpperCase())}`);
    lines.push(`  ${chalk.dim("Req/s:")}       ${chalk.bold(profile.estimatedReqPerSec)}`);
    lines.push(`  ${chalk.dim("Cold start:")}  ${profile.estimatedColdStart}`);
    lines.push(`  ${chalk.dim("Memory:")}      ${profile.estimatedMemory}`);
    lines.push("");

    // Per-technology breakdown
    if (profile.techProfiles.length > 0) {
      lines.push(`  ${chalk.bold("Technology Breakdown:")}`);
      lines.push("");
      for (const tp of profile.techProfiles) {
        const perfColor = PERF_COLORS[tp.perf] || chalk.white;
        const perfLabel = perfColor(tp.perf.toUpperCase().padEnd(8));
        lines.push(`  ${perfLabel} ${chalk.cyan(tp.name)} ${chalk.dim(`(${tp.category})`)}`);
        lines.push(`           ${chalk.dim(tp.note)}`);
      }
      lines.push("");
    }

    // Notes
    if (profile.notes.length > 0) {
      lines.push(`  ${chalk.bold("Notes:")}`);
      for (const note of profile.notes) {
        lines.push(`  ${chalk.dim("\u2192")} ${chalk.dim(note)}`);
      }
      lines.push("");
    }

    console.log(`\n  ${gradientHeader("StackPilot")} ${chalk.dim("/ Benchmark")}\n`);
    console.log(box(lines.join("\n"), `Performance: ${stack.name}`));
    console.log("");
  });
