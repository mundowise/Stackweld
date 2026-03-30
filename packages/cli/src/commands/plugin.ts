/**
 * stackpilot plugin — Manage StackPilot plugins.
 *
 * Subcommands: list, install, remove, info.
 */

import {
  getPluginDir,
  getPluginInfo,
  installPlugin,
  listPlugins,
  removePlugin,
} from "@stackpilot/core";
import chalk from "chalk";
import { Command } from "commander";
import { box, emptyState, formatJson, gradientHeader, table } from "../ui/format.js";

// ─── plugin list ──────────────────────────────────────

const pluginListCommand = new Command("list")
  .description("List installed plugins")
  .option("--json", "Output as JSON")
  .action((opts) => {
    const plugins = listPlugins();

    if (opts.json) {
      console.log(formatJson(plugins));
      return;
    }

    console.log(`\n  ${gradientHeader("StackPilot")} ${chalk.dim("/ Plugins")}\n`);

    if (plugins.length === 0) {
      console.log(
        emptyState("No plugins installed.", "Install one with: stackpilot plugin install <path>"),
      );
      return;
    }

    const data = plugins.map((p) => ({
      name: p.name,
      version: p.version,
      type: p.type,
      description: p.description.length > 40 ? `${p.description.slice(0, 37)}...` : p.description,
    }));

    const tbl = table(data, [
      { header: "Name", key: "name", color: (v) => chalk.cyan(v) },
      { header: "Version", key: "version" },
      { header: "Type", key: "type", color: (v) => chalk.yellow(v) },
      { header: "Description", key: "description", color: (v) => chalk.dim(v) },
    ]);

    console.log(`  ${chalk.dim("Plugin directory:")} ${getPluginDir()}\n`);
    console.log(tbl);
    console.log(`\n  ${chalk.dim(`${plugins.length} plugin(s) installed.`)}\n`);
  });

// ─── plugin install ───────────────────────────────────

const pluginInstallCommand = new Command("install")
  .description("Install a plugin from a local directory")
  .argument("<path>", "Path to plugin directory")
  .option("--json", "Output as JSON")
  .action((pluginPath: string, opts) => {
    try {
      const manifest = installPlugin(pluginPath);

      if (opts.json) {
        console.log(formatJson({ installed: true, plugin: manifest }));
        return;
      }

      console.log(`\n  ${gradientHeader("StackPilot")} ${chalk.dim("/ Plugin Install")}\n`);
      console.log(
        `  ${chalk.green("\u2714")} Plugin ${chalk.cyan.bold(manifest.name)} v${manifest.version} installed successfully.`,
      );
      console.log(`  ${chalk.dim("Type:")} ${manifest.type}`);
      console.log(`  ${chalk.dim("Description:")} ${manifest.description}`);
      console.log(`  ${chalk.dim("Location:")} ${getPluginDir()}/${manifest.name}`);
      console.log("");
    } catch (err) {
      if (opts.json) {
        console.log(
          formatJson({ installed: false, error: err instanceof Error ? err.message : String(err) }),
        );
        process.exit(1);
      }
      console.error(chalk.red(`\u2716 ${err instanceof Error ? err.message : String(err)}`));
      process.exit(1);
    }
  });

// ─── plugin remove ────────────────────────────────────

const pluginRemoveCommand = new Command("remove")
  .description("Remove an installed plugin")
  .argument("<name>", "Plugin name")
  .option("--json", "Output as JSON")
  .action((name: string, opts) => {
    try {
      removePlugin(name);

      if (opts.json) {
        console.log(formatJson({ removed: true, name }));
        return;
      }

      console.log(`\n  ${chalk.green("\u2714")} Plugin ${chalk.cyan.bold(name)} removed.\n`);
    } catch (err) {
      if (opts.json) {
        console.log(
          formatJson({ removed: false, error: err instanceof Error ? err.message : String(err) }),
        );
        process.exit(1);
      }
      console.error(chalk.red(`\u2716 ${err instanceof Error ? err.message : String(err)}`));
      process.exit(1);
    }
  });

// ─── plugin info ──────────────────────────────────────

const pluginInfoCommand = new Command("info")
  .description("Show details about an installed plugin")
  .argument("<name>", "Plugin name")
  .option("--json", "Output as JSON")
  .action((name: string, opts) => {
    const manifest = getPluginInfo(name);

    if (!manifest) {
      if (opts.json) {
        console.log(formatJson({ found: false, name }));
        process.exit(1);
      }
      console.error(chalk.red(`\u2716 Plugin "${name}" not found.`));
      console.error(chalk.dim("  Run: stackpilot plugin list"));
      process.exit(1);
    }

    if (opts.json) {
      console.log(formatJson(manifest));
      return;
    }

    const lines = [
      `${chalk.dim("Name:")}        ${chalk.cyan.bold(manifest.name)}`,
      `${chalk.dim("Version:")}     ${manifest.version}`,
      `${chalk.dim("Type:")}        ${chalk.yellow(manifest.type)}`,
      `${chalk.dim("Description:")} ${manifest.description}`,
      `${chalk.dim("Entry:")}       ${manifest.main}`,
      `${chalk.dim("Location:")}    ${getPluginDir()}/${manifest.name}`,
    ].join("\n");

    console.log(`\n  ${gradientHeader("StackPilot")} ${chalk.dim("/ Plugin Info")}\n`);
    console.log(box(lines, `Plugin: ${manifest.name}`));
    console.log("");
  });

// ─── Main plugin command ──────────────────────────────

export const pluginCommand = new Command("plugin")
  .description("Manage StackPilot plugins")
  .addCommand(pluginListCommand)
  .addCommand(pluginInstallCommand)
  .addCommand(pluginRemoveCommand)
  .addCommand(pluginInfoCommand);
