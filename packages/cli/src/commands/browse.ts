/**
 * stackweld browse — Browse the technology catalog and templates.
 */

import { select } from "@inquirer/prompts";
import { getAllTemplates } from "@stackweld/templates";
import chalk from "chalk";
import { Command } from "commander";
import { getRulesEngine } from "../ui/context.js";
import {
  emptyState,
  formatJson,
  formatTechTable,
  formatTemplate,
  sectionHeader,
} from "../ui/format.js";

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
      if (templates.length === 0) {
        console.log(emptyState("No templates available."));
        return;
      }
      console.log(chalk.bold(`\n  ${templates.length} template(s)\n`));
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

    const category =
      opts.category ||
      (await select({
        message: "Browse by category:",
        choices: [
          { name: "All technologies", value: "all" },
          ...categories.map((c) => ({ name: c, value: c })),
          { name: "Templates", value: "templates" },
        ],
      }));

    if (category === "templates") {
      const templates = getAllTemplates();
      if (opts.json) {
        console.log(formatJson(templates));
        return;
      }
      if (templates.length === 0) {
        console.log(emptyState("No templates available."));
        return;
      }
      for (const t of templates) {
        console.log(formatTemplate(t));
        console.log("");
      }
      return;
    }

    if (category === "all") {
      // Show all technologies grouped by category
      const allTechs = rules.getAllTechnologies();
      if (opts.json) {
        console.log(formatJson(allTechs));
        return;
      }

      console.log(chalk.bold(`\n  ${allTechs.length} technologies in catalog\n`));

      for (const cat of categories) {
        const techs = rules.getByCategory(cat);
        if (techs.length === 0) continue;

        console.log(sectionHeader(`  ${cat.toUpperCase()} (${techs.length})`));
        console.log(formatTechTable(techs));
        console.log("");
      }
      return;
    }

    const techs = rules.getByCategory(category);

    if (opts.json) {
      console.log(formatJson(techs));
      return;
    }

    if (techs.length === 0) {
      console.log(emptyState("No technologies in this category."));
      return;
    }

    console.log(chalk.bold(`\n  ${techs.length} ${category} technology(ies)\n`));
    console.log(formatTechTable(techs));
    console.log("");
  });
