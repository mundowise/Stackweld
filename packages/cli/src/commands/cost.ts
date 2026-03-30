/**
 * stackpilot cost <stackId> — Estimate monthly hosting costs for a saved stack.
 */

import { estimateCost } from "@stackpilot/core";
import chalk from "chalk";
import { Command } from "commander";
import { getRulesEngine, getStackEngine } from "../ui/context.js";
import { box, formatJson, gradientHeader, table } from "../ui/format.js";

const TIER_COLORS: Record<string, (s: string) => string> = {
  free: (s) => chalk.green.bold(s),
  budget: (s) => chalk.cyan.bold(s),
  standard: (s) => chalk.yellow.bold(s),
  premium: (s) => chalk.magenta.bold(s),
};

const TIER_ICONS: Record<string, string> = {
  free: "\u2728",
  budget: "\uD83D\uDCB0",
  standard: "\uD83D\uDCB3",
  premium: "\uD83D\uDC8E",
};

export const costCommand = new Command("cost")
  .description("Estimate monthly hosting costs for a saved stack")
  .argument("<stack-id>", "Stack ID to estimate costs for")
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

    const estimate = estimateCost(technologies);

    if (opts.json) {
      console.log(formatJson(estimate));
      return;
    }

    // ── Format output ──
    const tierColor = TIER_COLORS[estimate.tier] || chalk.white;
    const tierIcon = TIER_ICONS[estimate.tier] || "";

    const lines: string[] = [];
    lines.push("");

    // Cost range
    const { min, max, currency } = estimate.monthly;
    const rangeStr = min === max ? `$${min}/mo` : `$${min} - $${max}/mo`;
    lines.push(
      `  ${chalk.dim("Estimated:")}  ${chalk.bold.green(rangeStr)} ${chalk.dim(`(${currency})`)}`,
    );
    lines.push(
      `  ${chalk.dim("Tier:")}       ${tierIcon} ${tierColor(estimate.tier.toUpperCase())}`,
    );
    lines.push("");

    // Breakdown table
    // Deduplicate by service+provider for display
    const seen = new Set<string>();
    const uniqueItems = estimate.breakdown.filter((item) => {
      const key = `${item.service}|${item.provider}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const tableData = uniqueItems.map((item) => ({
      service: item.service,
      provider: item.provider,
      cost: item.monthlyCost,
      notes: item.notes.length > 35 ? `${item.notes.slice(0, 32)}...` : item.notes,
    }));

    if (tableData.length > 0) {
      lines.push(`  ${chalk.bold("Cost Breakdown:")}`);
      lines.push("");

      const tbl = table(tableData, [
        { header: "Service", key: "service", color: (v) => chalk.cyan(v) },
        { header: "Provider", key: "provider" },
        { header: "Cost", key: "cost", color: (v) => chalk.green(v) },
        { header: "Notes", key: "notes", color: (v) => chalk.dim(v) },
      ]);

      // Indent table lines
      for (const line of tbl.split("\n")) {
        lines.push(`  ${line}`);
      }
      lines.push("");
    }

    // Notes
    if (estimate.notes.length > 0) {
      lines.push(`  ${chalk.bold("Notes:")}`);
      for (const note of estimate.notes) {
        lines.push(`  ${chalk.dim("\u2192")} ${chalk.dim(note)}`);
      }
      lines.push("");
    }

    console.log(`\n  ${gradientHeader("StackPilot")} ${chalk.dim("/ Cost Estimator")}\n`);
    console.log(box(lines.join("\n"), `Cost Estimate: ${stack.name}`));
    console.log("");
  });
