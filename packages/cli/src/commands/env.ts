/**
 * stackweld env [sync|check] — Environment variable sync and safety checks.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { checkDangerous, parseEnvFile, syncEnv } from "@stackweld/core";
import chalk from "chalk";
import { Command } from "commander";
import { box, error, formatJson } from "../ui/format.js";

export const envCommand = new Command("env")
  .description("Sync .env files and check for dangerous values")
  .argument("[action]", "Action: sync (default) or check", "sync")
  .option("--path <dir>", "Project directory", process.cwd())
  .option("--json", "Output as JSON")
  .action((action: string, opts) => {
    const projectDir = path.resolve(opts.path);

    if (action === "check") {
      runCheck(projectDir, opts.json);
    } else if (action === "sync") {
      runSync(projectDir, opts.json);
    } else {
      console.error(error(`Unknown action: "${action}". Use "sync" or "check".`));
      process.exit(1);
    }
  });

function runSync(projectDir: string, json: boolean): void {
  const examplePath = path.join(projectDir, ".env.example");
  const envPath = path.join(projectDir, ".env");

  if (!fs.existsSync(examplePath)) {
    console.error(error(`No .env.example found in ${projectDir}`));
    process.exit(1);
  }

  if (!fs.existsSync(envPath)) {
    console.error(error(`No .env found in ${projectDir}`));
    console.error(chalk.dim("  Create one from the example: cp .env.example .env"));
    process.exit(1);
  }

  let exampleContent: string;
  let envContent: string;
  try {
    exampleContent = fs.readFileSync(examplePath, "utf-8");
    envContent = fs.readFileSync(envPath, "utf-8");
  } catch (err) {
    console.error(
      error(`Failed to read env files: ${err instanceof Error ? err.message : String(err)}`),
    );
    process.exit(1);
  }

  const result = syncEnv(exampleContent, envContent);

  if (json) {
    console.log(formatJson(result));
    return;
  }

  const lines: string[] = [];

  lines.push(`${chalk.dim(".env.example:")} ${result.total.example} variables`);
  lines.push(`${chalk.dim(".env:")}         ${result.total.actual} variables`);
  lines.push("");

  // Missing
  if (result.missing.length > 0) {
    lines.push(chalk.red(`\u2716 Missing in .env (${result.missing.length}):`));
    for (const key of result.missing) {
      lines.push(`  ${chalk.red(key)}`);
    }
  } else {
    lines.push(chalk.green("\u2714 No missing variables"));
  }
  lines.push("");

  // Extra
  if (result.extra.length > 0) {
    lines.push(chalk.yellow(`\u26A0 Extra in .env (${result.extra.length}):`));
    for (const key of result.extra) {
      lines.push(`  ${chalk.yellow(key)}`);
    }
  } else {
    lines.push(chalk.dim("\u26A0 Extra in .env (0)"));
  }
  lines.push("");

  // Dangerous
  if (result.dangerous.length > 0) {
    lines.push(chalk.yellow(`\u26A0 Dangerous values (${result.dangerous.length}):`));
    for (const d of result.dangerous) {
      lines.push(`  ${chalk.yellow(d.key)} = ${chalk.dim(`"${d.value}"`)}`);
      lines.push(`    ${chalk.dim("\u2192")} ${d.reason}`);
    }
  } else {
    lines.push(chalk.green("\u2714 No dangerous values detected"));
  }

  console.log(box(lines.join("\n"), "Environment Sync Report"));
}

function runCheck(projectDir: string, json: boolean): void {
  const envPath = path.join(projectDir, ".env");

  if (!fs.existsSync(envPath)) {
    console.error(error(`No .env found in ${projectDir}`));
    process.exit(1);
  }

  let envContent: string;
  try {
    envContent = fs.readFileSync(envPath, "utf-8");
  } catch (err) {
    console.error(
      error(`Failed to read .env: ${err instanceof Error ? err.message : String(err)}`),
    );
    process.exit(1);
  }

  const vars = parseEnvFile(envContent);
  const dangerous = checkDangerous(vars);

  if (json) {
    console.log(formatJson({ total: vars.length, dangerous }));
    return;
  }

  const lines: string[] = [];
  lines.push(`${chalk.dim("Variables:")} ${vars.length}`);
  lines.push("");

  if (dangerous.length > 0) {
    lines.push(chalk.yellow(`\u26A0 Dangerous values (${dangerous.length}):`));
    for (const d of dangerous) {
      lines.push(`  ${chalk.yellow(d.key)} = ${chalk.dim(`"${d.value}"`)}`);
      lines.push(`    ${chalk.dim("\u2192")} ${d.reason}`);
    }
  } else {
    lines.push(chalk.green("\u2714 No dangerous values detected"));
  }

  console.log(box(lines.join("\n"), "Environment Check"));
}
