/**
 * stackweld scaffold <stack-id> — Generate project files from a saved stack.
 * Generates docker-compose.yml, .env.example, README.md, .gitignore, devcontainer.json.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import { getScaffoldOrchestrator, getStackEngine } from "../ui/context.js";

export const scaffoldCommand = new Command("scaffold")
  .description("Generate project files from a saved stack")
  .argument("<stack-id>", "Stack ID")
  .option("-p, --path <dir>", "Output directory", ".")
  .option("--dry-run", "Show what would be generated without writing")
  .option("--git", "Initialize Git repository with initial commit")
  .option("--json", "Output generated files as JSON")
  .action((stackId: string, opts) => {
    const engine = getStackEngine();
    const orchestrator = getScaffoldOrchestrator();

    const stack = engine.get(stackId);
    if (!stack) {
      console.error(chalk.red(`Stack "${stackId}" not found.`));
      process.exit(1);
    }

    const output = orchestrator.generate(stack);
    const targetDir = path.resolve(opts.path);

    if (opts.json) {
      console.log(JSON.stringify(output, null, 2));
      return;
    }

    const files: Array<{ path: string; content: string }> = [];

    if (output.dockerCompose) {
      files.push({ path: "docker-compose.yml", content: output.dockerCompose });
    }
    files.push({ path: ".env.example", content: output.envExample });
    files.push({ path: "README.md", content: output.readme });
    files.push({ path: ".gitignore", content: output.gitignore });
    files.push({
      path: ".devcontainer/devcontainer.json",
      content: output.devcontainer,
    });
    files.push({ path: "scripts/dev.sh", content: output.devScript });
    files.push({ path: "scripts/setup.sh", content: output.setupScript });
    files.push({ path: "Makefile", content: output.makefile });
    files.push({
      path: ".vscode/settings.json",
      content: output.vscodeSettings,
    });
    files.push({
      path: ".github/workflows/ci.yml",
      content: output.ciWorkflow,
    });

    // Create all required directories (including empty ones like src/, tests/)
    for (const dir of output.directories) {
      const dirPath = path.join(targetDir, dir);
      if (opts.dryRun) {
        console.log(chalk.dim(`[dry-run] ${dir}/`));
      } else if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }

    for (const file of files) {
      const filePath = path.join(targetDir, file.path);

      if (opts.dryRun) {
        console.log(chalk.dim(`[dry-run] ${file.path}`));
        continue;
      }

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, file.content, "utf-8");

      // Make shell scripts executable
      if (file.path.endsWith(".sh")) {
        fs.chmodSync(filePath, 0o755);
      }

      console.log(chalk.green(`  ✓ ${file.path}`));
    }

    if (!opts.dryRun) {
      console.log("");
      console.log(chalk.green(`✓ Generated ${files.length} files for "${stack.name}"`));

      // Git init
      if (opts.git) {
        const gitResult = orchestrator.initGit(targetDir, stack);
        if (gitResult.success) {
          console.log(chalk.green(`  ✓ ${gitResult.message}`));
        } else {
          console.log(chalk.yellow(`  ⚠ Git: ${gitResult.message}`));
        }
      }

      if (output.scaffoldCommands.length > 0) {
        console.log(chalk.bold("\nOfficial scaffold commands available:"));
        for (const cmd of output.scaffoldCommands) {
          console.log(`  ${chalk.dim("→")} ${cmd.name}: ${chalk.cyan(cmd.command)}`);
        }
      }
    }
  });
