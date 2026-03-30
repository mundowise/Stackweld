/**
 * stackweld up — Start Docker services for the current project.
 */

import * as path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import { getRuntimeManager } from "../ui/context.js";
import { error, formatServiceStatus } from "../ui/format.js";

export const upCommand = new Command("up")
  .description("Start Docker services")
  .option("-p, --path <dir>", "Project directory", ".")
  .option("--no-wait", "Don't wait for health checks")
  .option("--timeout <ms>", "Health check timeout in ms", "60000")
  .action(async (opts) => {
    const runtime = getRuntimeManager();
    const projectDir = path.resolve(opts.path);

    if (!runtime.isDockerAvailable()) {
      console.error(error("Docker is not available."));
      console.error(chalk.dim("  Install Docker: https://docs.docker.com/get-docker/"));
      console.error(chalk.dim("  Run `stackweld doctor` to check your environment."));
      process.exit(1);
    }

    const composePath = runtime.composeExists(projectDir);
    if (!composePath) {
      console.error(error(`No docker-compose.yml found in ${projectDir}`));
      console.error(chalk.dim("  Run `stackweld scaffold` to generate one from a stack."));
      process.exit(1);
    }

    const runtimeOpts = { composePath, projectDir };

    const spinner = ora("Starting services...").start();
    const result = runtime.up(runtimeOpts);

    if (!result.success) {
      spinner.fail("Failed to start services");
      console.error(chalk.red(result.output.slice(0, 500)));
      process.exit(1);
    }

    spinner.succeed("Services started");

    if (opts.wait !== false) {
      const waitSpinner = ora("Waiting for health checks...").start();
      const timeout = Number.parseInt(opts.timeout, 10) || 60_000;
      const health = await runtime.waitForHealthy(runtimeOpts, timeout);

      if (health.healthy) {
        waitSpinner.succeed("All services healthy");
      } else {
        waitSpinner.warn("Some services may not be healthy yet");
      }

      console.log("");
      console.log(formatServiceStatus(health.services));
      console.log("");
    }
  });
