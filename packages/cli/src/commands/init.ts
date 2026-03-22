/**
 * stackpilot init — Initialize StackPilot in the current directory or interactively create a new stack.
 */

import { Command } from "commander";
import chalk from "chalk";
import { select, input, checkbox } from "@inquirer/prompts";
import { getStackEngine, getRulesEngine } from "../ui/context.js";
import { formatValidation, formatStackRow } from "../ui/format.js";
import type { StackProfile, StackTechnology } from "@stackpilot/core";
import { getAllTemplates } from "@stackpilot/templates";

export const initCommand = new Command("init")
  .description("Create a new stack interactively")
  .option("--template <id>", "Start from a template")
  .option("--json", "Output result as JSON")
  .action(async (opts) => {
    const rules = getRulesEngine();
    const engine = getStackEngine();

    // Choose mode
    const mode = opts.template
      ? "template"
      : await select({
          message: "How do you want to start?",
          choices: [
            { name: "From scratch", value: "scratch" },
            { name: "From a template", value: "template" },
          ],
        });

    let technologies: StackTechnology[] = [];
    let profile: StackProfile = "standard";
    let stackName = "";

    if (mode === "template") {
      const templates = getAllTemplates();
      const templateId =
        opts.template ||
        (await select({
          message: "Choose a template:",
          choices: templates.map((t) => ({
            name: `${t.name} — ${t.description}`,
            value: t.id,
          })),
        }));

      const template = templates.find((t) => t.id === templateId);
      if (!template) {
        console.error(chalk.red(`Template "${templateId}" not found.`));
        process.exit(1);
      }

      stackName = await input({
        message: "Project name:",
        default: template.variables.projectName || "my-project",
      });

      technologies = template.technologyIds.map((tid) => {
        const tech = rules.getTechnology(tid);
        return {
          technologyId: tid,
          version: tech?.defaultVersion || "latest",
        };
      });
      profile = template.profile as StackProfile;
    } else {
      stackName = await input({
        message: "Stack name:",
        default: "my-stack",
      });

      profile = (await select({
        message: "Project profile:",
        choices: [
          { name: "Rapid — Quick prototyping", value: "rapid" },
          { name: "Standard — Balanced", value: "standard" },
          { name: "Production — Battle-tested", value: "production" },
          { name: "Enterprise — Full compliance", value: "enterprise" },
          { name: "Lightweight — Minimal", value: "lightweight" },
        ],
      })) as StackProfile;

      // Select technologies by category
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
          message: `Select ${category} technologies:`,
          choices: available.map((t) => ({
            name: `${t.name} (${t.defaultVersion})`,
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
    }

    if (technologies.length === 0) {
      console.log(chalk.yellow("No technologies selected. Aborting."));
      return;
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
      console.log(formatStackRow(stack));
    }
  });
