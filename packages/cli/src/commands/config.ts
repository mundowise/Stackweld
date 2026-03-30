/**
 * stackweld config — Manage user preferences.
 */

import type { UserPreferences } from "@stackweld/core";
import {
  getDefaultPreferences,
  getPreferenceKeys,
  getPreferences,
  resetPreferences,
  setPreference,
} from "@stackweld/core";
import chalk from "chalk";
import { Command } from "commander";
import { formatJson } from "../ui/format.js";

export const configCommand = new Command("config")
  .description("Manage user preferences")
  .addCommand(
    new Command("list")
      .description("Show all preferences")
      .option("--json", "Output as JSON")
      .action((opts) => {
        const prefs = getPreferences();
        const defaults = getDefaultPreferences();

        if (opts.json) {
          console.log(formatJson(prefs));
          return;
        }

        console.log(chalk.bold("Preferences:\n"));
        for (const key of getPreferenceKeys()) {
          const value = prefs[key];
          const isDefault = value === defaults[key];
          console.log(`  ${chalk.cyan(key)}: ${value} ${isDefault ? chalk.dim("(default)") : ""}`);
        }
      }),
  )
  .addCommand(
    new Command("set")
      .description("Set a preference")
      .argument("<key>", "Preference key")
      .argument("<value>", "Preference value")
      .action((key: string, value: string) => {
        const validKeys = getPreferenceKeys();
        if (!validKeys.includes(key as keyof UserPreferences)) {
          console.error(chalk.red(`Invalid key "${key}". Valid keys: ${validKeys.join(", ")}`));
          process.exit(1);
        }

        setPreference(key as keyof UserPreferences, value);
        console.log(chalk.green(`✓ Set ${key} = ${value}`));
      }),
  )
  .addCommand(
    new Command("get")
      .description("Get a preference value")
      .argument("<key>", "Preference key")
      .action((key: string) => {
        const prefs = getPreferences();
        const validKeys = getPreferenceKeys();
        if (!validKeys.includes(key as keyof UserPreferences)) {
          console.error(chalk.red(`Invalid key "${key}".`));
          process.exit(1);
        }
        console.log(prefs[key as keyof UserPreferences]);
      }),
  )
  .addCommand(
    new Command("reset").description("Reset all preferences to defaults").action(() => {
      resetPreferences();
      console.log(chalk.green("✓ Preferences reset to defaults."));
    }),
  );
