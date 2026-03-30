/**
 * stackpilot health [path] — Check project health across multiple dimensions.
 */

import type { HealthCheck, HealthReport } from "@stackpilot/core";
import { checkProjectHealth } from "@stackpilot/core";
import chalk from "chalk";
import { Command } from "commander";
import * as path from "path";
import { box, formatJson, gradientHeader } from "../ui/format.js";

function statusIcon(status: HealthCheck["status"]): string {
  switch (status) {
    case "pass":
      return chalk.green("\u2713");
    case "warn":
      return chalk.yellow("\u26A0");
    case "fail":
      return chalk.red("\u2717");
  }
}

function overallLabel(overall: HealthReport["overall"]): string {
  switch (overall) {
    case "healthy":
      return chalk.green.bold("HEALTHY");
    case "warning":
      return chalk.yellow.bold("WARNING");
    case "critical":
      return chalk.red.bold("CRITICAL");
  }
}

export const healthCommand = new Command("health")
  .description("Check project health and best practices")
  .argument("[path]", "Project path to check", ".")
  .option("--json", "Output as JSON")
  .action((targetPath: string, opts) => {
    const report = checkProjectHealth(targetPath);

    if (opts.json) {
      console.log(formatJson(report));
      return;
    }

    const resolvedPath = path.resolve(targetPath);
    const { summary } = report;
    const totalChecks = summary.passed + summary.warnings + summary.critical;

    // Build content lines
    const lines: string[] = [];
    lines.push("");
    lines.push(`  Overall: ${overallLabel(report.overall)} (${summary.passed}/${totalChecks} passed)`);
    lines.push("");

    // Group: passes first, then warns, then fails
    const sorted = [...report.checks].sort((a, b) => {
      const order = { pass: 0, warn: 1, fail: 2 };
      return order[a.status] - order[b.status];
    });

    for (const check of sorted) {
      const icon = statusIcon(check.status);
      lines.push(`  ${icon} ${check.message}`);
      if (check.suggestion) {
        lines.push(`    ${chalk.dim(check.suggestion)}`);
      }
    }

    lines.push("");
    lines.push(
      `  ${chalk.green(String(summary.passed) + " passed")} ${chalk.dim("\u00B7")} ` +
        `${chalk.yellow(String(summary.warnings) + " warnings")} ${chalk.dim("\u00B7")} ` +
        `${chalk.red(String(summary.critical) + " critical")}`,
    );
    lines.push("");

    console.log(`\n  ${gradientHeader("StackPilot")} ${chalk.dim("/ Health Report")}\n`);
    console.log(box(lines.join("\n"), `Health Report: ${resolvedPath}`));
    console.log("");
  });
