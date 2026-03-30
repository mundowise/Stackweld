/**
 * stackpilot import <file> — Import a stack definition from YAML or JSON.
 */

import * as fs from "node:fs";
import type { StackProfile, StackTechnology } from "@stackpilot/core";
import chalk from "chalk";
import { Command } from "commander";
import { parse as yamlParse } from "yaml";
import { getStackEngine } from "../ui/context.js";
import { formatStackRow, formatValidation } from "../ui/format.js";

interface ImportedStack {
  name: string;
  description?: string;
  profile?: string;
  tags?: string[];
  technologies: Array<{
    id: string;
    version: string;
    port?: number;
  }>;
}

export const importCommand = new Command("import")
  .description("Import a stack definition from a YAML or JSON file")
  .argument("<file>", "Path to the YAML or JSON file")
  .option("--json", "Output result as JSON")
  .action((file: string, opts) => {
    if (!fs.existsSync(file)) {
      console.error(chalk.red(`File not found: ${file}`));
      process.exit(1);
    }

    const raw = fs.readFileSync(file, "utf-8");
    let data: ImportedStack;

    // Detect format
    if (file.endsWith(".json")) {
      try {
        data = JSON.parse(raw);
      } catch {
        console.error(chalk.red("Invalid JSON file."));
        process.exit(1);
      }
    } else {
      // Try YAML (also handles JSON since JSON is valid YAML)
      try {
        data = yamlParse(raw);
      } catch {
        console.error(chalk.red("Invalid YAML/JSON file."));
        process.exit(1);
      }
    }

    if (!data.name || !data.technologies || !Array.isArray(data.technologies)) {
      console.error(chalk.red("Invalid stack file. Required: name, technologies array."));
      process.exit(1);
    }

    const engine = getStackEngine();

    const technologies: StackTechnology[] = data.technologies.map((t) => ({
      technologyId: t.id,
      version: t.version,
      port: t.port,
    }));

    const { stack, validation } = engine.create({
      name: data.name,
      description: data.description,
      profile: (data.profile as StackProfile) || "standard",
      technologies,
      tags: data.tags,
    });

    console.log(formatValidation(validation));
    console.log("");

    if (opts.json) {
      console.log(JSON.stringify({ stack, validation }, null, 2));
    } else {
      console.log(formatStackRow(stack));
      console.log(chalk.green(`\n✓ Imported "${stack.name}" successfully`));
    }
  });
