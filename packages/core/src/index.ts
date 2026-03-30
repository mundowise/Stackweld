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
export { scoreCompatibility, scoreStack } from "./engine/compatibility-scorer.js";
export type {
  CompatibilityResult,
  CompatibilityFactor,
  StackScoreResult,
} from "./engine/compatibility-scorer.js";
export { parseEnvFile, syncEnv, checkDangerous } from "./engine/env-analyzer.js";
export type { EnvVar, EnvSyncResult, EnvDangerousVar } from "./engine/env-analyzer.js";
export { detectStack } from "./engine/stack-detector.js";
export type { DetectedStack, DetectedTech } from "./engine/stack-detector.js";
export { generateComposePreview } from "./engine/compose-generator.js";
export type { ComposePreviewResult } from "./engine/compose-generator.js";
export {
  serializeStack,
  deserializeStack,
  generateShareUrl,
  extractFromShareUrl,
} from "./engine/stack-serializer.js";
export type { ShareableStack } from "./engine/stack-serializer.js";
export { checkProjectHealth } from "./engine/health-checker.js";
export type { HealthReport, HealthCheck } from "./engine/health-checker.js";
export { diffStacks } from "./engine/stack-differ.js";
export type { StackDiff, DiffItem, DiffChange } from "./engine/stack-differ.js";

// Database
export { getDatabase, closeDatabase, getDefaultDbPath } from "./db/database.js";
