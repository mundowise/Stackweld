/**
 * stackpilot score <techA> [techB] — Show compatibility score between technologies.
 *
 * Two techs: detailed compatibility report.
 * One tech: top 5 best and top 3 worst pairings from the catalog.
 */

import { scoreCompatibility } from "@stackpilot/core";
import chalk from "chalk";
import { Command } from "commander";
import { getRulesEngine } from "../ui/context.js";
import { box } from "../ui/format.js";

export const scoreCommand = new Command("score")
  .description("Show compatibility score between technologies")
  .argument("<techA>", "First technology ID")
  .argument("[techB]", "Second technology ID (optional)")
  .option("--json", "Output as JSON")
  .action((techA: string, techB: string | undefined, opts) => {
    const rules = getRulesEngine();

    const a = rules.getTechnology(techA);
    if (!a) {
      console.error(chalk.red(`\u2716 Technology "${techA}" not found in the registry.`));
      process.exit(1);
    }

    if (techB) {
      // ── Two-tech mode: detailed compatibility ──
      const b = rules.getTechnology(techB);
      if (!b) {
        console.error(chalk.red(`\u2716 Technology "${techB}" not found in the registry.`));
        process.exit(1);
      }

      const result = scoreCompatibility(a, b);

      if (opts.json) {
        console.log(JSON.stringify({ techA: a.id, techB: b.id, ...result }, null, 2));
        return;
      }

      const barWidth = 20;
      const filled = Math.round((result.score / 100) * barWidth);
      const empty = barWidth - filled;
      const barColor =
        result.score >= 75 ? chalk.green : result.score >= 45 ? chalk.yellow : chalk.red;
      const bar = barColor("\u2588".repeat(filled)) + chalk.dim("\u2591".repeat(empty));

      const lines: string[] = [];
      lines.push("");
      lines.push(`        ${bar}  ${chalk.bold(String(result.score))}/100`);
      lines.push(`             Grade: ${chalk.yellow.bold(result.grade)}`);
      lines.push("");

      if (result.factors.length > 0) {
        lines.push("  Factors:");
        for (const f of result.factors) {
          const icon = f.points >= 0 ? chalk.green("\u2713") : chalk.red("\u2717");
          const sign = f.points >= 0 ? "+" : "";
          const pointStr =
            f.points >= 0 ? chalk.green(`${sign}${f.points}`) : chalk.red(`${f.points}`);
          lines.push(`  ${icon} ${pointStr}  ${f.description}`);
        }
        lines.push("");
      }

      lines.push(`  ${chalk.dim(`"${result.recommendation}"`)}`);
      lines.push("");

      const title = `Compatibility Score: ${a.name} + ${b.name}`;
      console.log(box(lines.join("\n"), title));
    } else {
      // ── Single-tech mode: best & worst pairings ──
      const allTechs = rules.getAllTechnologies().filter((t) => t.id !== a.id);
      const scored = allTechs.map((t) => ({
        tech: t,
        result: scoreCompatibility(a, t),
      }));

      scored.sort((x, y) => y.result.score - x.result.score);

      if (opts.json) {
        const data = scored.map((s) => ({
          id: s.tech.id,
          name: s.tech.name,
          score: s.result.score,
          grade: s.result.grade,
        }));
        console.log(JSON.stringify({ technology: a.id, pairings: data }, null, 2));
        return;
      }

      console.log("");
      console.log(chalk.bold.cyan(`  ${a.name}`) + chalk.dim(` (${a.id})`));
      console.log(chalk.dim(`  ${a.category} — ${a.description}`));
      console.log("");

      // Top 5 best
      console.log(chalk.green.bold("  Top 5 Best Pairings:"));
      console.log("");
      const best = scored.slice(0, 5);
      for (const item of best) {
        const barWidth = 15;
        const filled = Math.round((item.result.score / 100) * barWidth);
        const empty = barWidth - filled;
        const bar = chalk.green("\u2588".repeat(filled)) + chalk.dim("\u2591".repeat(empty));
        console.log(
          `    ${bar} ${chalk.bold(String(item.result.score).padStart(3))}/100  ` +
            `${chalk.yellow(item.result.grade)}  ${chalk.cyan(item.tech.name)} ${chalk.dim(`(${item.tech.category})`)}`,
        );
      }
      console.log("");

      // Top 3 worst
      console.log(chalk.red.bold("  Top 3 Worst Pairings:"));
      console.log("");
      const worst = scored.slice(-3).reverse();
      for (const item of worst) {
        const barWidth = 15;
        const filled = Math.round((item.result.score / 100) * barWidth);
        const empty = barWidth - filled;
        const bar = chalk.red("\u2588".repeat(filled)) + chalk.dim("\u2591".repeat(empty));
        console.log(
          `    ${bar} ${chalk.bold(String(item.result.score).padStart(3))}/100  ` +
            `${chalk.yellow(item.result.grade)}  ${chalk.cyan(item.tech.name)} ${chalk.dim(`(${item.tech.category})`)}`,
        );
      }
      console.log("");
    }
  });
