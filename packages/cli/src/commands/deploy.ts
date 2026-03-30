/**
 * stackpilot deploy <stackId> --target <vps|aws|gcp> — Generate infrastructure files.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { DeployTarget } from "@stackpilot/core";
import { generateInfra } from "@stackpilot/core";
import chalk from "chalk";
import { Command } from "commander";
import { getRulesEngine, getStackEngine } from "../ui/context.js";
import { box, formatJson, gradientHeader, nextSteps } from "../ui/format.js";

const VALID_TARGETS = new Set<DeployTarget>(["vps", "aws", "gcp"]);

export const deployCommand = new Command("deploy")
  .description("Generate infrastructure-as-code files for a saved stack")
  .argument("<stack-id>", "Stack ID to generate infra for")
  .requiredOption("-t, --target <target>", "Deploy target: vps, aws, or gcp")
  .option("-o, --output <dir>", "Output directory", ".")
  .option("--json", "Output as JSON")
  .option("--dry-run", "Show what would be generated without writing files")
  .action((stackId: string, opts) => {
    const target = opts.target as DeployTarget;
    if (!VALID_TARGETS.has(target)) {
      console.error(chalk.red(`\u2716 Invalid target "${opts.target}". Use: vps, aws, or gcp`));
      process.exit(1);
    }

    const engine = getStackEngine();
    const rules = getRulesEngine();
    const stack = engine.get(stackId);

    if (!stack) {
      console.error(chalk.red(`\u2716 Stack "${stackId}" not found.`));
      console.error(chalk.dim("  Run: stackpilot list"));
      process.exit(1);
    }

    // Resolve full technology data for each stack technology
    const technologies = stack.technologies.map((st) => {
      const tech = rules.getTechnology(st.technologyId);
      return {
        id: st.technologyId,
        name: tech?.name || st.technologyId,
        category: tech?.category || "runtime",
        dockerImage: tech?.dockerImage,
        defaultPort: st.port || tech?.defaultPort,
      };
    });

    const result = generateInfra(technologies, stack.name, target);

    if (opts.json) {
      console.log(formatJson(result));
      return;
    }

    console.log(`\n  ${gradientHeader("StackPilot")} ${chalk.dim("/ Deploy")}\n`);

    // Build content
    const lines: string[] = [];
    lines.push("");
    lines.push(`  ${chalk.dim("Stack:")}    ${chalk.cyan.bold(stack.name)}`);
    lines.push(`  ${chalk.dim("Target:")}   ${chalk.yellow(target.toUpperCase())}`);
    lines.push(`  ${chalk.dim("Files:")}    ${result.files.length}`);
    lines.push("");

    for (const file of result.files) {
      const sizeKB = (Buffer.byteLength(file.content, "utf-8") / 1024).toFixed(1);
      lines.push(
        `  ${chalk.green("\u2713")} ${chalk.white(file.path)} ${chalk.dim(`(${sizeKB}KB)`)}`,
      );
    }
    lines.push("");

    console.log(box(lines.join("\n"), `Infrastructure: ${target.toUpperCase()}`));

    // Write files unless dry-run
    if (!opts.dryRun) {
      const outputDir = path.resolve(opts.output);
      let written = 0;

      for (const file of result.files) {
        const filePath = path.join(outputDir, file.path);
        const dirName = path.dirname(filePath);

        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName, { recursive: true });
        }

        fs.writeFileSync(filePath, file.content, "utf-8");

        // Make shell scripts executable
        if (file.path.endsWith(".sh")) {
          fs.chmodSync(filePath, 0o755);
        }
        written++;
      }

      console.log(chalk.green(`  \u2713 ${written} file(s) written to ${outputDir}`));
    } else {
      console.log(chalk.yellow("  Dry run — no files written."));
    }

    // Show instructions
    if (result.instructions.length > 0) {
      console.log(nextSteps(result.instructions));
    }
  });
