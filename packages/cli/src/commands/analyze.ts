/**
 * stackweld analyze [path] — Detect the technology stack of a project.
 */

import * as path from "node:path";
import type { DetectedTech } from "@stackweld/core";
import { detectStack } from "@stackweld/core";
import chalk from "chalk";
import { Command } from "commander";
import { getStackEngine } from "../ui/context.js";
import { box, error, formatJson, success } from "../ui/format.js";

const PROJECT_TYPE_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  fullstack: "Full-Stack",
  monorepo: "Monorepo",
  library: "Library",
  unknown: "Unknown",
};

export const analyzeCommand = new Command("analyze")
  .description("Detect the technology stack of a project")
  .argument("[path]", "Project directory to analyze", process.cwd())
  .option("--import", "Save detected stack to the database")
  .option("--json", "Output as JSON")
  .action((targetPath: string, opts) => {
    const projectDir = path.resolve(targetPath);

    let result;
    try {
      result = detectStack(projectDir);
    } catch (err) {
      console.error(
        error(`Failed to analyze project: ${err instanceof Error ? err.message : String(err)}`),
      );
      process.exit(1);
    }

    if (opts.json) {
      console.log(formatJson(result));
      return;
    }

    const lines: string[] = [];

    // Project type
    const typeLabel = PROJECT_TYPE_LABELS[result.projectType] || result.projectType;
    lines.push(
      `${chalk.dim("Project Type:")} ${chalk.bold(typeLabel)} ${chalk.dim(`(${result.confidence}%)`)}`,
    );
    lines.push("");

    // Technologies
    if (result.technologies.length > 0) {
      lines.push(chalk.bold("Detected Technologies:"));
      for (const tech of result.technologies) {
        const version = tech.version ? ` ${tech.version}` : "";
        const via = chalk.dim(`(${tech.detectedVia})`);
        lines.push(
          `${chalk.green("\u2714")}  ${chalk.cyan(tech.name)}${chalk.dim(version)}  ${via}`,
        );
      }
    } else {
      lines.push(chalk.dim("No technologies detected."));
    }
    lines.push("");

    // Package managers
    if (result.packageManagers.length > 0) {
      lines.push(`${chalk.dim("Package Managers:")} ${result.packageManagers.join(", ")}`);
      lines.push("");
    }

    // Summary
    const count = result.technologies.length;
    lines.push(
      `${count} ${count === 1 ? "technology" : "technologies"} ${chalk.dim("\u2022")} Confidence: ${result.confidence}%`,
    );

    if (!opts.import) {
      lines.push("");
      lines.push(chalk.dim("Run with --import to save as a stack"));
    }

    console.log(box(lines.join("\n"), `Stack Detection: ${projectDir}`));

    // Import mode
    if (opts.import) {
      try {
        const engine = getStackEngine();
        const stackTechs = result.technologies.map((t: DetectedTech) => ({
          technologyId: t.id,
          version: t.version || "latest",
        }));

        const dirName = path.basename(projectDir);
        const { stack } = engine.create({
          name: dirName,
          profile: "standard",
          technologies: stackTechs,
        });

        console.log(success(`Stack saved: ${stack.name} (${stack.id})`));
      } catch (err) {
        console.error(
          error(`Failed to save stack: ${err instanceof Error ? err.message : String(err)}`),
        );
        process.exit(1);
      }
    }
  });
