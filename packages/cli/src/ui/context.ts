/**
 * Shared CLI context — initializes engine instances once.
 * All initialization is lazy with proper error handling.
 */

import type { Technology } from "@stackweld/core";
import { RulesEngine, RuntimeManager, ScaffoldOrchestrator, StackEngine } from "@stackweld/core";
import { loadAllTechnologies } from "@stackweld/registry";
import chalk from "chalk";

let _techs: Technology[] | null = null;
let _rulesEngine: RulesEngine | null = null;
let _stackEngine: StackEngine | null = null;
let _scaffoldOrchestrator: ScaffoldOrchestrator | null = null;
let _runtimeManager: RuntimeManager | null = null;

function getTechs(): Technology[] {
  if (!_techs) {
    try {
      _techs = loadAllTechnologies();
    } catch (err) {
      console.error(chalk.red("\u2716 Failed to load technology registry."));
      if (err instanceof Error) {
        console.error(chalk.dim(`  ${err.message}`));
      }
      console.error(chalk.dim("  Make sure @stackweld/registry is built: pnpm build"));
      process.exit(1);
    }
  }
  return _techs;
}

export function getRulesEngine(): RulesEngine {
  if (!_rulesEngine) {
    try {
      _rulesEngine = new RulesEngine(getTechs());
    } catch (err) {
      console.error(chalk.red("\u2716 Failed to initialize rules engine."));
      if (err instanceof Error) console.error(chalk.dim(`  ${err.message}`));
      process.exit(1);
    }
  }
  return _rulesEngine;
}

export function getStackEngine(): StackEngine {
  if (!_stackEngine) {
    try {
      _stackEngine = new StackEngine(getRulesEngine());
    } catch (err) {
      console.error(chalk.red("\u2716 Failed to initialize stack engine."));
      if (err instanceof Error) {
        console.error(chalk.dim(`  ${err.message}`));
      }
      if (String(err).includes("SQLITE") || String(err).includes("database")) {
        console.error(chalk.dim("  The local database could not be created or opened."));
        console.error(
          chalk.dim("  Check write permissions in your home directory (~/.stackweld/)."),
        );
      }
      process.exit(1);
    }
  }
  return _stackEngine;
}

export function getScaffoldOrchestrator(): ScaffoldOrchestrator {
  if (!_scaffoldOrchestrator) {
    try {
      _scaffoldOrchestrator = new ScaffoldOrchestrator(getTechs());
    } catch (err) {
      console.error(chalk.red("\u2716 Failed to initialize scaffold orchestrator."));
      if (err instanceof Error) console.error(chalk.dim(`  ${err.message}`));
      process.exit(1);
    }
  }
  return _scaffoldOrchestrator;
}

export function getRuntimeManager(): RuntimeManager {
  if (!_runtimeManager) {
    try {
      _runtimeManager = new RuntimeManager(getTechs());
    } catch (err) {
      console.error(chalk.red("\u2716 Failed to initialize runtime manager."));
      if (err instanceof Error) console.error(chalk.dim(`  ${err.message}`));
      process.exit(1);
    }
  }
  return _runtimeManager;
}
