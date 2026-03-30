/**
 * stackpilot lint — Validate a stack against team standards (.stackpilotrc).
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { LintResult, StackStandards } from "@stackpilot/core";
import { detectStack, lintStack, loadStandards } from "@stackpilot/core";
import chalk from "chalk";
import { Command } from "commander";
import { getStackEngine } from "../ui/context.js";
import { box, formatJson, gradientHeader } from "../ui/format.js";

function buildStackFromDetected(detected: ReturnType<typeof detectStack>): {
  technologies: Array<{ technologyId: string }>;
  profile: string;
  name: string;
} {
  return {
    name: "detected",
    profile: "standard",
    technologies: detected.technologies.map((t) => ({ technologyId: t.id })),
  };
}

export const lintCommand = new Command("lint")
  .description("Validate a stack against team standards (.stackpilotrc)")
  .option("-c, --config <path>", "Path to standards config file")
  .option("-s, --stack <id>", "Lint a saved stack by ID")
  .option("--json", "Output as JSON")
  .action((opts) => {
    // ── Load standards ──
    const configPath = opts.config
      ? path.resolve(opts.config)
      : path.resolve(process.cwd(), ".stackpilotrc");

    let standards: StackStandards | null = null;

    if (opts.config) {
      // Explicit config path
      if (!fs.existsSync(configPath)) {
        console.error(chalk.red(`\u2716 Config file not found: ${configPath}`));
        process.exit(1);
      }
      standards = loadStandards(path.dirname(configPath));
      if (!standards) {
        // Try reading directly if the dirname resolution didn't work
        try {
          const content = fs.readFileSync(configPath, "utf-8");
          standards = JSON.parse(content) as StackStandards;
        } catch {
          console.error(chalk.red(`\u2716 Could not parse config: ${configPath}`));
          process.exit(1);
        }
      }
    } else {
      standards = loadStandards(process.cwd());
    }

    if (!standards) {
      console.error(chalk.red("\u2716 No .stackpilotrc found in current directory."));
      console.error(chalk.dim("  Create one or use --config <path>"));
      process.exit(1);
    }

    // ── Resolve stack ──
    let stackLike: { technologies: Array<{ technologyId: string }>; profile: string; name: string };

    if (opts.stack) {
      const engine = getStackEngine();
      const saved = engine.get(opts.stack);
      if (!saved) {
        console.error(chalk.red(`\u2716 Stack "${opts.stack}" not found.`));
        console.error(chalk.dim("  Run: stackpilot list"));
        process.exit(1);
      }
      stackLike = saved;
    } else {
      // Detect from current directory
      const detected = detectStack(process.cwd());
      if (detected.technologies.length === 0) {
        console.error(
          chalk.red("\u2716 Could not detect any technologies in the current directory."),
        );
        console.error(chalk.dim("  Use --stack <id> to lint a saved stack instead."));
        process.exit(1);
      }
      stackLike = buildStackFromDetected(detected);
    }

    // ── Run lint ──
    // Cast to StackDefinition shape for the linter
    const result: LintResult = lintStack(stackLike as Parameters<typeof lintStack>[0], standards);

    if (opts.json) {
      console.log(formatJson({ standards, result }));
      return;
    }

    // ── Format output ──
    const teamName = standards.team || "Team Standards";
    const lines: string[] = [];
    lines.push("");

    let passCount = 0;
    let failCount = 0;

    // Required technologies
    if (standards.requiredTechnologies) {
      const techIds = new Set(stackLike.technologies.map((t) => t.technologyId));
      for (const req of standards.requiredTechnologies) {
        if (techIds.has(req)) {
          lines.push(`  ${chalk.green("\u2713")} Required: ${req}`);
          passCount++;
        } else {
          lines.push(`  ${chalk.red("\u2717")} Required: ${req} ${chalk.red("missing")}`);
          failCount++;
        }
      }
    }

    // Blocked technologies
    if (standards.blockedTechnologies) {
      const techIds = new Set(stackLike.technologies.map((t) => t.technologyId));
      for (const blocked of standards.blockedTechnologies) {
        if (techIds.has(blocked)) {
          lines.push(
            `  ${chalk.red("\u2717")} Blocked: ${blocked} found ${chalk.red("\u2014 remove it")}`,
          );
          failCount++;
        } else {
          lines.push(
            `  ${chalk.green("\u2713")} Blocked: ${blocked} ${chalk.dim("(not present)")}`,
          );
          passCount++;
        }
      }
    }

    // Min profile
    if (standards.minProfile) {
      const profileViolation = result.warnings.find((w) => w.rule === "minProfile");
      if (profileViolation) {
        lines.push(
          `  ${chalk.yellow("\u26A0")} Profile: ${stackLike.profile} < ${standards.minProfile}`,
        );
        failCount++;
      } else {
        lines.push(
          `  ${chalk.green("\u2713")} Profile: ${stackLike.profile} \u2265 ${standards.minProfile}`,
        );
        passCount++;
      }
    }

    // Require Docker
    if (standards.requireDocker) {
      const dockerViolation = result.violations.find((v) => v.rule === "requireDocker");
      if (dockerViolation) {
        lines.push(`  ${chalk.red("\u2717")} Docker required but missing`);
        failCount++;
      } else {
        lines.push(`  ${chalk.green("\u2713")} Docker present`);
        passCount++;
      }
    }

    // Require tests
    if (standards.requireTests) {
      const testWarning = result.warnings.find((w) => w.rule === "requireTests");
      if (testWarning) {
        lines.push(`  ${chalk.yellow("\u26A0")} No testing framework found`);
        failCount++;
      } else {
        lines.push(`  ${chalk.green("\u2713")} Tests present`);
        passCount++;
      }
    }

    // Require TypeScript
    if (standards.requireTypeScript) {
      const tsViolation = result.violations.find((v) => v.rule === "requireTypeScript");
      if (tsViolation) {
        lines.push(`  ${chalk.red("\u2717")} TypeScript required but missing`);
        failCount++;
      } else {
        lines.push(`  ${chalk.green("\u2713")} TypeScript present`);
        passCount++;
      }
    }

    // Custom rules
    if (standards.customRules) {
      for (const rule of standards.customRules) {
        const violation = result.violations.find((v) => v.rule === `custom:${rule.name}`);
        if (violation) {
          lines.push(`  ${chalk.red("\u2717")} ${rule.message}`);
          failCount++;
        } else {
          lines.push(`  ${chalk.green("\u2713")} Custom: ${rule.name}`);
          passCount++;
        }
      }
    }

    lines.push("");
    lines.push(
      `  ${chalk.green(`${String(passCount)} passed`)} ${chalk.dim("\u00B7")} ` +
        `${failCount > 0 ? chalk.red(`${String(failCount)} violation(s)`) : chalk.dim("0 violations")}`,
    );
    lines.push(
      `  Status: ${result.passed ? chalk.green.bold("PASSED") : chalk.red.bold("FAILED")}`,
    );
    lines.push("");

    console.log(`\n  ${gradientHeader("StackPilot")} ${chalk.dim("/ Lint")}\n`);
    console.log(box(lines.join("\n"), `Stack Lint: ${teamName}`));
    console.log("");

    if (!result.passed) {
      process.exit(1);
    }
  });
