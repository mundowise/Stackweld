/**
 * stackpilot ai — AI-powered utilities.
 * These are utility features, NOT the source of truth for compatibility.
 * Uses the Anthropic API for natural language processing.
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import Anthropic from "@anthropic-ai/sdk";
import { getStackEngine, getRulesEngine } from "../ui/context.js";

function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

function requireApiKey(): Anthropic {
  const client = getClient();
  if (!client) {
    console.error(
      chalk.red("ANTHROPIC_API_KEY not set."),
    );
    console.log(
      chalk.dim("Set it: export ANTHROPIC_API_KEY=sk-ant-..."),
    );
    process.exit(1);
  }
  return client;
}

async function ask(client: Anthropic, systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });
  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

export const aiCommand = new Command("ai")
  .description("AI-powered utilities (requires ANTHROPIC_API_KEY)")
  .addCommand(
    new Command("suggest")
      .description("Suggest a stack from a natural language description")
      .argument("<description>", "What you want to build")
      .action(async (description: string) => {
        const client = requireApiKey();
        const rules = getRulesEngine();
        const allTechs = rules.getAllTechnologies();
        const techList = allTechs.map((t) => `${t.id} (${t.name}, ${t.category})`).join("\n");

        const spinner = ora("Thinking...").start();

        try {
          const result = await ask(
            client,
            `You are StackPilot AI. You suggest technology stacks from a catalog.
Available technologies (use ONLY these IDs):
${techList}

Respond with:
1. A stack name
2. Profile (rapid/standard/production/enterprise/lightweight)
3. Technology IDs as a comma-separated list
4. Brief explanation of why each technology was chosen

Be concise. Only suggest technologies from the list above.`,
            `I want to build: ${description}`,
          );

          spinner.stop();
          console.log(chalk.bold("\nSuggested Stack:\n"));
          console.log(result);
        } catch (err) {
          spinner.fail("AI request failed");
          console.error(chalk.dim(err instanceof Error ? err.message : String(err)));
        }
      }),
  )
  .addCommand(
    new Command("readme")
      .description("Generate a README from a saved stack")
      .argument("<stack-id>", "Stack ID")
      .action(async (stackId: string) => {
        const client = requireApiKey();
        const engine = getStackEngine();
        const rules = getRulesEngine();
        const stack = engine.get(stackId);

        if (!stack) {
          console.error(chalk.red(`Stack "${stackId}" not found.`));
          process.exit(1);
        }

        const techDetails = stack.technologies
          .map((st) => {
            const tech = rules.getTechnology(st.technologyId);
            return tech
              ? `- ${tech.name} v${st.version} (${tech.category}): ${tech.description}`
              : `- ${st.technologyId} v${st.version}`;
          })
          .join("\n");

        const spinner = ora("Generating README...").start();

        try {
          const result = await ask(
            client,
            `You generate professional README.md files for software projects. Write clean, practical Markdown. No emojis.`,
            `Generate a README.md for a project called "${stack.name}" (${stack.description || "no description"}).
Profile: ${stack.profile}
Technologies:
${techDetails}

Include: project description, tech stack table, getting started (with docker compose up, env setup), development commands, and project structure suggestions.`,
          );

          spinner.stop();
          console.log(result);
        } catch (err) {
          spinner.fail("AI request failed");
          console.error(chalk.dim(err instanceof Error ? err.message : String(err)));
        }
      }),
  )
  .addCommand(
    new Command("explain")
      .description("Explain the decisions in a stack")
      .argument("<stack-id>", "Stack ID")
      .action(async (stackId: string) => {
        const client = requireApiKey();
        const engine = getStackEngine();
        const rules = getRulesEngine();
        const stack = engine.get(stackId);

        if (!stack) {
          console.error(chalk.red(`Stack "${stackId}" not found.`));
          process.exit(1);
        }

        const techDetails = stack.technologies
          .map((st) => {
            const tech = rules.getTechnology(st.technologyId);
            return tech ? `${tech.name} (${tech.category})` : st.technologyId;
          })
          .join(", ");

        const spinner = ora("Analyzing stack...").start();

        try {
          const result = await ask(
            client,
            `You are a senior software architect. Explain technology choices concisely. No emojis.`,
            `Explain the architecture decisions in this stack:
Name: ${stack.name}
Profile: ${stack.profile}
Technologies: ${techDetails}

For each technology, explain:
1. Why it was likely chosen
2. How it fits with the other pieces
3. Any trade-offs to be aware of

Be concise and practical.`,
          );

          spinner.stop();
          console.log(chalk.bold("\nStack Analysis:\n"));
          console.log(result);
        } catch (err) {
          spinner.fail("AI request failed");
          console.error(chalk.dim(err instanceof Error ? err.message : String(err)));
        }
      }),
  );
