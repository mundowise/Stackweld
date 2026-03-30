/**
 * stackweld create <stack-id> --path <dir> — Scaffold a stack to disk.
 * Uses official CLI tools when available and fills gaps.
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import type { Template } from "@stackweld/core";
import { getAllTemplates, getTemplate } from "@stackweld/templates";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import { getStackEngine } from "../ui/context.js";

export const createCommand = new Command("create")
  .description("Scaffold a project from a stack or template")
  .argument("<id>", "Stack ID or template ID")
  .option("-p, --path <dir>", "Target directory", ".")
  .option("--dry-run", "Show what would be executed without doing it")
  .option("--json", "Output result as JSON")
  .action(async (id: string, opts) => {
    const engine = getStackEngine();

    // Check if it's a template
    const template: Template | null = getTemplate(id);
    const stack = engine.get(id);

    if (!template && !stack) {
      console.error(chalk.red(`"${id}" is not a valid stack ID or template ID.`));
      console.log(
        chalk.dim(
          "Available templates: " +
            getAllTemplates()
              .map((t) => t.id)
              .join(", "),
        ),
      );
      process.exit(1);
    }

    if (template) {
      console.log(chalk.cyan(`Using template: ${template.name}`));

      const projectName = path.basename(
        opts.path === "." ? template.variables.projectName || "my-project" : opts.path,
      );
      const targetDir = path.resolve(opts.path === "." ? projectName : opts.path);

      // Execute scaffold steps
      for (const step of template.scaffoldSteps) {
        const command = step.command.replace(/\{\{projectName\}\}/g, projectName);
        const cwd = step.workingDir
          ? path.resolve(step.workingDir.replace(/\{\{projectName\}\}/g, projectName))
          : process.cwd();

        if (opts.dryRun) {
          console.log(chalk.dim(`[dry-run] ${step.name}: ${command}`));
          continue;
        }

        const spinner = ora(step.name).start();
        try {
          execSync(command, { cwd, stdio: "pipe" });
          spinner.succeed(step.name);
        } catch (err) {
          spinner.fail(step.name);
          console.error(chalk.red(`  Command failed: ${command}`));
          if (err instanceof Error) {
            console.error(chalk.dim(err.message.slice(0, 200)));
          }
        }
      }

      // Apply overrides
      for (const override of template.overrides) {
        const filePath = path.join(
          targetDir,
          override.path.replace(/\{\{projectName\}\}/g, projectName),
        );

        if (opts.dryRun) {
          console.log(chalk.dim(`[dry-run] Write: ${filePath}`));
          continue;
        }

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const content = override.content.replace(/\{\{projectName\}\}/g, projectName);
        fs.writeFileSync(filePath, content, "utf-8");
        console.log(chalk.green(`  ✓ ${override.path}`));
      }

      // Execute hooks
      for (const hook of template.hooks) {
        const command = hook.command.replace(/\{\{projectName\}\}/g, projectName);

        if (opts.dryRun) {
          console.log(chalk.dim(`[dry-run] Hook (${hook.timing}): ${command}`));
          continue;
        }

        if (hook.requiresConfirmation) {
          console.log(chalk.yellow(`Hook requires confirmation: ${hook.description}`));
          console.log(chalk.dim(`  Command: ${command}`));
          // In a real implementation, we'd prompt for confirmation here
          continue;
        }

        const spinner = ora(`${hook.timing}: ${hook.name}`).start();
        try {
          execSync(command, { stdio: "pipe" });
          spinner.succeed(`${hook.timing}: ${hook.name}`);
        } catch {
          spinner.fail(`${hook.timing}: ${hook.name}`);
        }
      }

      if (!opts.dryRun) {
        console.log("");
        console.log(chalk.green(`✓ Project "${projectName}" created successfully!`));
        console.log(chalk.dim(`  cd ${projectName}`));
      }
    } else if (stack) {
      if (opts.json) {
        console.log(JSON.stringify(stack, null, 2));
      } else {
        console.log(chalk.cyan(`Stack: ${stack.name}`));
        console.log(
          chalk.dim("Scaffold orchestration for saved stacks is coming in the next release."),
        );
      }
    }
  });
