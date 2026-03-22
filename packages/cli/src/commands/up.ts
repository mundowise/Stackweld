/**
 * stackpilot up — Start Docker services for the current project.
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import * as path from "path";
import { getRuntimeManager } from "../ui/context.js";

export const upCommand = new Command("up")
  .description("Start Docker services")
  .option("-p, --path <dir>", "Project directory", ".")
  .option("--no-wait", "Don't wait for health checks")
  .option("--timeout <ms>", "Health check timeout in ms", "60000")
  .action(async (opts) => {
    const runtime = getRuntimeManager();
    const projectDir = path.resolve(opts.path);

    if (!runtime.isDockerAvailable()) {
      console.error(chalk.red("Docker is not available. Run `stackpilot doctor` to check."));
      process.exit(1);
    }

    const composePath = runtime.composeExists(projectDir);
    if (!composePath) {
      console.error(chalk.red("No docker-compose.yml found in " + projectDir));
      console.log(chalk.dim("Run `stackpilot scaffold` to generate one from a stack."));
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

      // Show status
      for (const svc of health.services) {
        const icon =
          svc.status === "healthy" || svc.status === "running"
            ? chalk.green("●")
            : svc.status === "exited"
              ? chalk.red("●")
              : chalk.yellow("●");
        const port = svc.port ? chalk.dim(`:${svc.port}`) : "";
        console.log(`  ${icon} ${svc.name}${port} ${chalk.dim(svc.status)}`);
      }
    }
  });
