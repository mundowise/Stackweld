/**
 * stackpilot logs [service] — Show logs from Docker services.
 */

import { Command } from "commander";
import chalk from "chalk";
import * as path from "path";
import { getRuntimeManager } from "../ui/context.js";

export const logsCommand = new Command("logs")
  .description("Show logs from Docker services")
  .argument("[service]", "Service name (optional, shows all if omitted)")
  .option("-p, --path <dir>", "Project directory", ".")
  .option("-n, --tail <lines>", "Number of lines to show", "50")
  .option("-f, --follow", "Follow log output")
  .action((service: string | undefined, opts) => {
    const runtime = getRuntimeManager();
    const projectDir = path.resolve(opts.path);
    const composePath = runtime.composeExists(projectDir);

    if (!composePath) {
      console.error(chalk.red("No docker-compose.yml found in " + projectDir));
      process.exit(1);
    }

    const tail = Number.parseInt(opts.tail, 10) || 50;
    const output = runtime.logs({ composePath, projectDir }, service, tail, opts.follow);
    console.log(output);
  });
