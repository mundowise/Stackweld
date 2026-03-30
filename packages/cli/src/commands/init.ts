/**
 * stackweld init — Initialize Stackweld in the current directory or interactively create a new stack.
 */

import { checkbox, confirm, input, select } from "@inquirer/prompts";
import type { StackProfile, StackTechnology } from "@stackweld/core";
import { getAllTemplates } from "@stackweld/templates";
import chalk from "chalk";
import { Command } from "commander";
import { getRulesEngine, getStackEngine } from "../ui/context.js";
import {
  formatStackSummary,
  formatValidation,
  gradientHeader,
  nextSteps,
  stepIndicator,
  warning,
} from "../ui/format.js";

export const initCommand = new Command("init")
  .description("Create a new stack interactively")
  .option("--template <id>", "Start from a template")
  .option("--json", "Output result as JSON")
  .action(async (opts) => {
    console.log(`\n  ${gradientHeader("Stackweld")} ${chalk.dim("/ New Stack Wizard")}\n`);

    const rules = getRulesEngine();
    const engine = getStackEngine();

    // ── Step 1: Choose mode ──
    console.log(stepIndicator(1, 5, "Choose how to start"));
    const mode = opts.template
      ? "template"
      : await select({
          message: "How do you want to start?",
          choices: [
            { name: "From scratch — pick technologies one by one", value: "scratch" },
            { name: "From a template — use a pre-built stack", value: "template" },
          ],
        });

    let technologies: StackTechnology[] = [];
    let profile: StackProfile = "standard";
    let stackName = "";

    if (mode === "template") {
      // ── Step 2: Select template ──
      console.log(`\n${stepIndicator(2, 5, "Select template")}`);
      const templates = getAllTemplates();

      if (templates.length === 0) {
        console.log(warning("No templates available. Run from scratch instead."));
        return;
      }

      const templateId =
        opts.template ||
        (await select({
          message: "Choose a template:",
          choices: templates.map((t) => ({
            name: `${chalk.cyan(t.name)} ${chalk.dim("—")} ${t.description}`,
            value: t.id,
          })),
        }));

      const template = templates.find((t) => t.id === templateId);
      if (!template) {
        console.error(chalk.red(`\u2716 Template "${templateId}" not found.`));
        console.error(chalk.dim(`  Available templates: ${templates.map((t) => t.id).join(", ")}`));
        process.exit(1);
      }

      // ── Step 3: Name ──
      console.log(`\n${stepIndicator(3, 5, "Name your project")}`);
      stackName = await input({
        message: "Project name:",
        default: template.variables.projectName || "my-project",
        validate: (v) => (v.trim().length > 0 ? true : "Name cannot be empty"),
      });

      technologies = template.technologyIds.map((tid) => {
        const tech = rules.getTechnology(tid);
        return {
          technologyId: tid,
          version: tech?.defaultVersion || "latest",
        };
      });
      profile = template.profile as StackProfile;

      // Steps 4-5 skipped for template mode
      console.log(`\n${stepIndicator(4, 5, chalk.dim("Profile: ") + profile)}`);
      console.log(
        `${stepIndicator(5, 5, `${chalk.dim("Technologies: ") + technologies.length} from template`)}`,
      );
    } else {
      // ── Step 2: Name ──
      console.log(`\n${stepIndicator(2, 5, "Name your stack")}`);
      stackName = await input({
        message: "Stack name:",
        default: "my-stack",
        validate: (v) => (v.trim().length > 0 ? true : "Name cannot be empty"),
      });

      // ── Step 3: Profile ──
      console.log(`\n${stepIndicator(3, 5, "Choose a project profile")}`);
      profile = (await select({
        message: "Project profile:",
        choices: [
          {
            name: `${chalk.cyan("Rapid")}      ${chalk.dim("— Quick prototyping, minimal config")}`,
            value: "rapid",
          },
          {
            name: `${chalk.cyan("Standard")}   ${chalk.dim("— Balanced defaults for most projects")}`,
            value: "standard",
          },
          {
            name: `${chalk.cyan("Production")} ${chalk.dim("— Battle-tested, monitoring included")}`,
            value: "production",
          },
          {
            name: `${chalk.cyan("Enterprise")} ${chalk.dim("— Full compliance, audit, security")}`,
            value: "enterprise",
          },
          {
            name: `${chalk.cyan("Lightweight")}${chalk.dim("— Minimal footprint")}`,
            value: "lightweight",
          },
        ],
      })) as StackProfile;

      // ── Step 4: Technologies ──
      console.log(`\n${stepIndicator(4, 5, "Select technologies by category")}`);
      const categories = [
        "runtime",
        "frontend",
        "backend",
        "database",
        "orm",
        "auth",
        "styling",
        "service",
        "devops",
      ] as const;

      for (const category of categories) {
        const available = rules.getByCategory(category);
        if (available.length === 0) continue;

        const selected = await checkbox({
          message: `${chalk.cyan(category)} technologies:`,
          choices: available.map((t) => ({
            name: `${t.name} ${chalk.dim(`(${t.defaultVersion})`)}`,
            value: t.id,
          })),
        });

        for (const id of selected) {
          const tech = rules.getTechnology(id);
          if (tech) {
            technologies.push({
              technologyId: id,
              version: tech.defaultVersion,
            });
          }
        }
      }

      // ── Step 5: Confirm ──
      console.log(`\n${stepIndicator(5, 5, "Review and confirm")}`);
    }

    if (technologies.length === 0) {
      console.log(warning("No technologies selected. Aborting."));
      return;
    }

    // Show summary before creating
    console.log("");
    console.log(chalk.bold("  Summary:"));
    console.log(`  ${chalk.dim("Name:")}     ${chalk.cyan(stackName)}`);
    console.log(`  ${chalk.dim("Profile:")}  ${profile}`);
    console.log(
      `  ${chalk.dim("Techs:")}    ${technologies.map((t) => t.technologyId).join(", ")}`,
    );
    console.log("");

    if (mode !== "template") {
      const proceed = await confirm({
        message: "Create this stack?",
        default: true,
      });
      if (!proceed) {
        console.log(chalk.dim("  Cancelled."));
        return;
      }
    }

    const { stack, validation } = engine.create({
      name: stackName,
      profile,
      technologies,
    });

    console.log("");
    console.log(formatValidation(validation));
    console.log("");

    if (opts.json) {
      console.log(JSON.stringify({ stack, validation }, null, 2));
    } else {
      console.log(formatStackSummary(stack));
      console.log(
        nextSteps([
          `stackweld scaffold ${stack.id} --path .`,
          `stackweld generate --name ${stackName} --path . --techs ${technologies.map((t) => t.technologyId).join(",")}`,
          `stackweld info ${stack.id}`,
        ]),
      );
    }
  });
