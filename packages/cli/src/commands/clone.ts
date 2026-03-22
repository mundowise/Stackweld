import { Command } from "commander";
import chalk from "chalk";
import { input } from "@inquirer/prompts";
import { getStackEngine } from "../ui/context.js";
import { formatStackRow } from "../ui/format.js";

export const cloneCommand = new Command("clone")
  .description("Duplicate a saved stack")
  .argument("<stack-id>", "Stack ID to clone")
  .option("--name <name>", "Name for the cloned stack")
  .action(async (stackId: string, opts) => {
    const engine = getStackEngine();
    const source = engine.get(stackId);

    if (!source) {
      console.error(chalk.red(`Stack "${stackId}" not found.`));
      process.exit(1);
    }

    const name = opts.name || await input({
      message: "Name for the cloned stack:",
      default: `${source.name} (copy)`,
    });

    const { stack, validation } = engine.create({
      name,
      description: source.description,
      profile: source.profile as any,
      technologies: source.technologies,
      tags: [...source.tags, "cloned"],
    });

    if (validation.valid) {
      console.log(chalk.green(`✓ Cloned "${source.name}" as "${name}"`));
      console.log(formatStackRow(stack));
    } else {
      console.error(chalk.red("Clone failed validation."));
    }
  });
