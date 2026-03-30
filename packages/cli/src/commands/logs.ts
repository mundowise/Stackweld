/**
 * stackpilot logs [service] — Show logs from Docker services.
 */

import * as path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import { getRuntimeManager } from "../ui/context.js";
import { error } from "../ui/format.js";

export const logsCommand = new Command("logs")
  .description("Show logs from Docker services")
  .argument("[service]", "Service name (optional, shows all if omitted)")
  .option("-p, --path <dir>", "Project directory", ".")
  .option("-n, --tail <lines>", "Number of lines to show", "50")
  .option("-f, --follow", "Follow log output")
  .action((service: string | undefined, opts) => {
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
      console.error(chalk.dim("  Run `stackpilot scaffold` to generate one from a stack."));
      process.exit(1);
    }

    const tail = Number.parseInt(opts.tail, 10) || 50;
    const output = runtime.logs({ composePath, projectDir }, service, tail, opts.follow);

    if (!output || output.trim().length === 0) {
      console.log(chalk.dim(service ? `No logs for service "${service}".` : "No logs available."));
      return;
    }

    console.log(output);
  });
