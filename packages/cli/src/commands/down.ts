/**
 * stackpilot down — Stop Docker services.
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import * as path from "path";
import { getRuntimeManager } from "../ui/context.js";

export const downCommand = new Command("down")
  .description("Stop Docker services")
  .option("-p, --path <dir>", "Project directory", ".")
  .option("--volumes", "Remove volumes on down")
  .action((opts) => {
    const runtime = getRuntimeManager();
    const projectDir = path.resolve(opts.path);
    const composePath = runtime.composeExists(projectDir);

    if (!composePath) {
      console.error(chalk.red("No docker-compose.yml found in " + projectDir));
      process.exit(1);
    }

    const spinner = ora("Stopping services...").start();
    const result = runtime.down({ composePath, projectDir }, opts.volumes);

    if (result.success) {
      spinner.succeed("Services stopped");
    } else {
      spinner.fail("Failed to stop services");
      console.error(chalk.dim(result.output.slice(0, 300)));
    }
  });
