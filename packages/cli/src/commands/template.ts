import { Command } from "commander";
import chalk from "chalk";
import { randomUUID } from "crypto";
import { input } from "@inquirer/prompts";
import { getAllTemplates, getTemplate } from "@stackpilot/templates";
import { getStackEngine, getRulesEngine } from "../ui/context.js";
import { getDatabase } from "@stackpilot/core";
import { formatTemplate, formatStackRow, formatValidation, formatJson } from "../ui/format.js";

export const templateCommand = new Command("template")
  .description("Manage templates")
  .addCommand(
    new Command("list")
      .description("List all available templates")
      .option("--json", "Output as JSON")
      .action((opts) => {
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
      }),
  )
  .addCommand(
    new Command("use")
      .description("Create a stack from a template")
      .argument("<template-id>", "Template ID")
      .option("--name <name>", "Stack name")
      .option("--json", "Output as JSON")
      .action(async (templateId: string, opts) => {
        const template = getTemplate(templateId);
        if (!template) {
          console.error(chalk.red(`Template "${templateId}" not found.`));
          console.log(chalk.dim("Available: " + getAllTemplates().map(t => t.id).join(", ")));
          process.exit(1);
        }

        const rules = getRulesEngine();
        const engine = getStackEngine();

        const name = opts.name || await input({
          message: "Stack name:",
          default: template.variables.projectName || template.name,
        });

        const technologies = template.technologyIds.map(tid => {
          const tech = rules.getTechnology(tid);
          return { technologyId: tid, version: tech?.defaultVersion || "latest" };
        });

        const { stack, validation } = engine.create({
          name,
          description: template.description,
          profile: template.profile as any,
          technologies,
          tags: ["template:" + template.id],
        });

        console.log(formatValidation(validation));
        console.log("");

        if (opts.json) {
          console.log(JSON.stringify({ stack, validation }, null, 2));
        } else {
          console.log(formatStackRow(stack));
          if (validation.valid) {
            console.log(chalk.green(`\n✓ Created from template "${template.name}"`));
          }
        }
      }),
  )
  .addCommand(
    new Command("save")
      .description("Save a stack as a reusable custom template")
      .argument("<stack-id>", "Stack ID to save as template")
      .option("--name <name>", "Template name")
      .action(async (stackId: string, opts) => {
        const engine = getStackEngine();
        const stack = engine.get(stackId);

        if (!stack) {
          console.error(chalk.red(`Stack "${stackId}" not found.`));
          process.exit(1);
        }

        const name = opts.name || await input({
          message: "Template name:",
          default: `${stack.name} Template`,
        });

        const db = getDatabase();
        const id = randomUUID();
        const techIds = stack.technologies.map(t => t.technologyId);

        db.prepare(
          "INSERT INTO custom_templates (id, name, description, profile, technology_ids) VALUES (?, ?, ?, ?, ?)"
        ).run(id, name, stack.description, stack.profile, JSON.stringify(techIds));

        console.log(chalk.green(`\n✓ Template "${name}" saved`));
        console.log(chalk.dim(`  ID: ${id}`));
        console.log(chalk.dim(`  Technologies: ${techIds.join(", ")}`));
        console.log(chalk.dim(`  Profile: ${stack.profile}`));
        console.log(chalk.dim(`\nUse it: stackpilot template use-custom ${id}`));
      }),
  )
  .addCommand(
    new Command("saved")
      .description("List saved custom templates")
      .option("--json", "Output as JSON")
      .action((opts) => {
        const db = getDatabase();
        const rows = db.prepare("SELECT * FROM custom_templates ORDER BY created_at DESC").all() as any[];

        if (rows.length === 0) {
          console.log(chalk.dim("No custom templates saved yet. Use `stackpilot template save <stack-id>`."));
          return;
        }

        if (opts.json) {
          console.log(formatJson(rows.map(r => ({ ...r, technology_ids: JSON.parse(r.technology_ids) }))));
          return;
        }

        console.log(chalk.bold(`${rows.length} custom template(s):\n`));
        for (const row of rows) {
          const techIds = JSON.parse(row.technology_ids);
          console.log(`${chalk.bold.magenta(row.name)} ${chalk.dim(`(${row.id})`)}`);
          console.log(`  ${chalk.dim("Profile:")} ${row.profile}`);
          console.log(`  ${chalk.dim("Technologies:")} ${techIds.join(", ")}`);
          console.log(`  ${chalk.dim("Created:")} ${row.created_at}`);
          console.log("");
        }
      }),
  )
  .addCommand(
    new Command("use-custom")
      .description("Create a stack from a saved custom template")
      .argument("<template-id>", "Custom template ID")
      .option("--name <name>", "Stack name")
      .action(async (templateId: string, opts) => {
        const db = getDatabase();
        const row = db.prepare("SELECT * FROM custom_templates WHERE id = ?").get(templateId) as any;

        if (!row) {
          console.error(chalk.red(`Custom template "${templateId}" not found.`));
          process.exit(1);
        }

        const rules = getRulesEngine();
        const engine = getStackEngine();
        const techIds = JSON.parse(row.technology_ids);

        const name = opts.name || await input({
          message: "Stack name:",
          default: row.name.replace(" Template", ""),
        });

        const technologies = techIds.map((tid: string) => {
          const tech = rules.getTechnology(tid);
          return { technologyId: tid, version: tech?.defaultVersion || "latest" };
        });

        const { stack, validation } = engine.create({
          name,
          description: row.description,
          profile: row.profile,
          technologies,
          tags: ["custom-template:" + row.name],
        });

        console.log(formatValidation(validation));
        console.log("");
        console.log(formatStackRow(stack));
        if (validation.valid) {
          console.log(chalk.green(`\n✓ Created from custom template "${row.name}"`));
        }
      }),
  );
