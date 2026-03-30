/**
 * stackweld status — Show status of Docker services.
 */

import * as path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import { getRuntimeManager } from "../ui/context.js";
import { emptyState, error, formatJson, formatServiceStatus } from "../ui/format.js";

export const statusCommand = new Command("status")
  .description("Show status of running services")
  .option("-p, --path <dir>", "Project directory", ".")
  .option("--json", "Output as JSON")
  .action((opts) => {
    const runtime = getRuntimeManager();
    const projectDir = path.resolve(opts.path);

    if (!runtime.isDockerAvailable()) {
      console.error(error("Docker is not available."));
      console.error(chalk.dim("  Install Docker: https://docs.docker.com/get-docker/"));
      process.exit(1);
    }

    const composePath = runtime.composeExists(projectDir);
    if (!composePath) {
      console.error(error(`No docker-compose.yml found in ${projectDir}`));
      process.exit(1);
    }

    const services = runtime.status({ composePath, projectDir });

    if (opts.json) {
      console.log(formatJson(services));
      return;
    }

    if (services.length === 0) {
      console.log(emptyState("No services running.", "Run `stackweld up` to start services."));
      return;
    }

    console.log(chalk.bold(`\n  Services (${services.length})\n`));
    console.log(formatServiceStatus(services));
    console.log("");
  });
