// Types
export * from "./types/index.js";

// Engine
export { RulesEngine } from "./engine/rules-engine.js";
export { StackEngine } from "./engine/stack-engine.js";
export { ScaffoldOrchestrator } from "./engine/scaffold-orchestrator.js";
export type { ScaffoldOutput } from "./engine/scaffold-orchestrator.js";
export { RuntimeManager } from "./engine/runtime-manager.js";
export type { RuntimeOptions } from "./engine/runtime-manager.js";
export {
  getPreferences,
  getPreference,
  setPreference,
  resetPreferences,
  getPreferenceKeys,
  getDefaultPreferences,
} from "./engine/preferences.js";
export type { UserPreferences } from "./engine/preferences.js";
export { installTechnologies } from "./engine/tech-installer.js";
export type { InstallContext, InstallResult } from "./engine/tech-installer.js";

// Database
export { getDatabase, closeDatabase, getDefaultDbPath } from "./db/database.js";
