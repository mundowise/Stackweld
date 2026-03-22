/**
 * stackpilot export <stack-id> — Export a stack definition to YAML or JSON.
 */

import { Command } from "commander";
import chalk from "chalk";
import * as fs from "fs";
import { stringify as yamlStringify } from "yaml";
import { getStackEngine } from "../ui/context.js";

export const exportCommand = new Command("export")
  .description("Export a stack definition to YAML or JSON")
  .argument("<id>", "Stack ID")
  .option("-f, --format <fmt>", "Output format: json or yaml", "yaml")
  .option("-o, --output <file>", "Output file (default: stdout)")
  .action((id: string, opts) => {
    const engine = getStackEngine();
    const stack = engine.get(id);

    if (!stack) {
      console.error(chalk.red(`Stack "${id}" not found.`));
      process.exit(1);
    }

    // Build portable export object (without internal IDs)
    const exportData = {
      name: stack.name,
      description: stack.description,
      profile: stack.profile,
      version: stack.version,
      tags: stack.tags,
      technologies: stack.technologies.map((t) => ({
        id: t.technologyId,
        version: t.version,
        port: t.port,
      })),
      exportedAt: new Date().toISOString(),
      exportedBy: "stackpilot",
    };

    let output: string;
    if (opts.format === "json") {
      output = JSON.stringify(exportData, null, 2);
    } else {
      output = yamlStringify(exportData);
    }

    if (opts.output) {
      fs.writeFileSync(opts.output, output, "utf-8");
      console.log(chalk.green(`✓ Exported to ${opts.output}`));
    } else {
      console.log(output);
    }
  });
