/**
 * stackpilot status — Show status of Docker services.
 */

import { Command } from "commander";
import chalk from "chalk";
import * as path from "path";
import { getRuntimeManager } from "../ui/context.js";
import { formatJson } from "../ui/format.js";

export const statusCommand = new Command("status")
  .description("Show status of running services")
  .option("-p, --path <dir>", "Project directory", ".")
  .option("--json", "Output as JSON")
  .action((opts) => {
    const runtime = getRuntimeManager();
    const projectDir = path.resolve(opts.path);
    const composePath = runtime.composeExists(projectDir);

    if (!composePath) {
      console.error(chalk.red("No docker-compose.yml found in " + projectDir));
      process.exit(1);
    }

    const services = runtime.status({ composePath, projectDir });

    if (opts.json) {
      console.log(formatJson(services));
      return;
    }

    if (services.length === 0) {
      console.log(chalk.dim("No services running."));
      return;
    }

    console.log(chalk.bold("Services:\n"));
    for (const svc of services) {
      const icon =
        svc.status === "healthy" || svc.status === "running"
          ? chalk.green("●")
          : svc.status === "exited"
            ? chalk.red("●")
            : chalk.yellow("●");
      const port = svc.port ? `:${svc.port}` : "";
      const health =
        svc.healthCheck === "passing"
          ? chalk.green("healthy")
          : svc.healthCheck === "failing"
            ? chalk.red("unhealthy")
            : "";
      console.log(
        `  ${icon} ${chalk.cyan(svc.name)}${chalk.dim(port)} ${chalk.dim(svc.status)} ${health}`,
      );
    }
  });
