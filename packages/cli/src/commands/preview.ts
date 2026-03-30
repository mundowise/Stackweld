/**
 * stackpilot preview <stackId> — Show the docker-compose.yml that would be generated.
 * Does not create any files on disk.
 */

import { generateComposePreview } from "@stackpilot/core";
import chalk from "chalk";
import { Command } from "commander";
import { getRulesEngine, getStackEngine } from "../ui/context.js";
import { box, info, sectionHeader, warning } from "../ui/format.js";

export const previewCommand = new Command("preview")
  .description("Preview the docker-compose.yml for a saved stack")
  .argument("<id>", "Stack ID")
  .option("--raw", "Output raw YAML without formatting")
  .action((id: string, opts) => {
    const engine = getStackEngine();
    const rules = getRulesEngine();
    const stack = engine.get(id);

    if (!stack) {
      console.error(chalk.red(`Stack "${id}" not found.`));
      process.exit(1);
    }

    // Resolve full technology objects with stack-level port overrides
    const technologies = stack.technologies
      .map((st) => {
        const tech = rules.getTechnology(st.technologyId);
        if (!tech) return null;
        return {
          id: tech.id,
          name: tech.name,
          category: tech.category,
          dockerImage: tech.dockerImage,
          defaultPort: tech.defaultPort,
          envVars: tech.envVars,
          healthCheck: tech.healthCheck,
          port: st.port,
        };
      })
      .filter((t): t is NonNullable<typeof t> => t != null);

    const dockerTechs = technologies.filter((t) => t.dockerImage);

    if (dockerTechs.length === 0) {
      console.log(warning("No Docker services in this stack."));
      console.log(
        chalk.dim("  This stack only contains runtimes/frameworks that run locally."),
      );
      process.exit(0);
    }

    const result = generateComposePreview(technologies, stack.name);

    if (opts.raw) {
      console.log(result.yaml);
      return;
    }

    // Syntax-highlighted YAML in a box
    const highlighted = highlightYaml(result.yaml);
    console.log("");
    console.log(box(highlighted, `docker-compose.yml  ${chalk.dim(stack.name)}`));

    // Service summary
    console.log(sectionHeader("Services:"));
    for (const svc of result.services) {
      const port = result.ports[svc];
      const portStr = port ? chalk.dim(`:${port}`) : "";
      console.log(`  ${chalk.green("\u25CF")} ${chalk.cyan(svc)}${portStr}`);
    }

    if (result.volumes.length > 0) {
      console.log(sectionHeader("Volumes:"));
      for (const vol of result.volumes) {
        console.log(`  ${chalk.dim("\u25CB")} ${vol}`);
      }
    }

    console.log("");
    console.log(info("This is a preview. No files were created."));
    console.log(
      chalk.dim(`  Use ${chalk.white("stackpilot scaffold " + id)} to generate project files.`),
    );
    console.log("");
  });

/**
 * Basic YAML syntax highlighting for terminal output.
 */
function highlightYaml(yaml: string): string {
  return yaml
    .split("\n")
    .map((line) => {
      // Comments
      if (line.trimStart().startsWith("#")) {
        return chalk.dim(line);
      }
      // Key: value lines
      const match = line.match(/^(\s*)([\w.-]+)(:)(.*)/);
      if (match) {
        const [, indent, key, colon, value] = match;
        return `${indent}${chalk.cyan(key)}${chalk.dim(colon)}${chalk.yellow(value)}`;
      }
      // List items
      const listMatch = line.match(/^(\s*)(- )(.*)/);
      if (listMatch) {
        const [, indent, dash, value] = listMatch;
        return `${indent}${chalk.dim(dash)}${chalk.yellow(value)}`;
      }
      return line;
    })
    .join("\n");
}
