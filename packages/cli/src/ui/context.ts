/**
 * Shared CLI context — initializes engine instances once.
 */

import {
  RulesEngine,
  StackEngine,
  ScaffoldOrchestrator,
  RuntimeManager,
} from "@stackpilot/core";
import { loadAllTechnologies } from "@stackpilot/registry";
import type { Technology } from "@stackpilot/core";

let _techs: Technology[] | null = null;
let _rulesEngine: RulesEngine | null = null;
let _stackEngine: StackEngine | null = null;
let _scaffoldOrchestrator: ScaffoldOrchestrator | null = null;
let _runtimeManager: RuntimeManager | null = null;

function getTechs(): Technology[] {
  if (!_techs) _techs = loadAllTechnologies();
  return _techs;
}

export function getRulesEngine(): RulesEngine {
  if (!_rulesEngine) _rulesEngine = new RulesEngine(getTechs());
  return _rulesEngine;
}

export function getStackEngine(): StackEngine {
  if (!_stackEngine) _stackEngine = new StackEngine(getRulesEngine());
  return _stackEngine;
}

export function getScaffoldOrchestrator(): ScaffoldOrchestrator {
  if (!_scaffoldOrchestrator)
    _scaffoldOrchestrator = new ScaffoldOrchestrator(getTechs());
  return _scaffoldOrchestrator;
}

export function getRuntimeManager(): RuntimeManager {
  if (!_runtimeManager) _runtimeManager = new RuntimeManager(getTechs());
  return _runtimeManager;
}
