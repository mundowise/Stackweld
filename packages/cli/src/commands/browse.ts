/**
 * stackpilot browse — Browse the technology catalog and templates.
 */

import { Command } from "commander";
import chalk from "chalk";
import { select } from "@inquirer/prompts";
import { getRulesEngine } from "../ui/context.js";
import { formatTechnology, formatTemplate, formatJson } from "../ui/format.js";
import { getAllTemplates } from "@stackpilot/templates";

export const browseCommand = new Command("browse")
  .description("Browse the technology catalog and templates")
  .option("--category <cat>", "Filter by category")
  .option("--templates", "Show templates only")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const rules = getRulesEngine();

    if (opts.templates) {
      const templates = getAllTemplates();
      if (opts.json) {
        console.log(formatJson(templates));
        return;
      }
      console.log(chalk.bold(`${templates.length} template(s):\n`));
      for (const t of templates) {
        console.log(formatTemplate(t));
        console.log("");
      }
      return;
    }

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

    const category = opts.category || await select({
      message: "Browse by category:",
      choices: [
        { name: "All technologies", value: "all" },
        ...categories.map((c) => ({ name: c, value: c })),
        { name: "Templates", value: "templates" },
      ],
    });

    if (category === "templates") {
      const templates = getAllTemplates();
      if (opts.json) {
        console.log(formatJson(templates));
        return;
      }
      for (const t of templates) {
        console.log(formatTemplate(t));
        console.log("");
      }
      return;
    }

    const techs =
      category === "all"
        ? rules.getAllTechnologies()
        : rules.getByCategory(category);

    if (opts.json) {
      console.log(formatJson(techs));
      return;
    }

    if (techs.length === 0) {
      console.log(chalk.dim("No technologies in this category."));
      return;
    }

    console.log(chalk.bold(`\n${techs.length} technology(ies):\n`));
    for (const tech of techs) {
      console.log(formatTechnology(tech));
      console.log("");
    }
  });
