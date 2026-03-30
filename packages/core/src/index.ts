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
export { planMigration } from "./engine/migration-planner.js";
export type { MigrationPlan, MigrationStep } from "./engine/migration-planner.js";
export { generateInfra } from "./engine/infra-generator.js";
export type { DeployTarget, InfraOutput } from "./engine/infra-generator.js";
export { lintStack, loadStandards } from "./engine/standards-linter.js";
export type {
  StackStandards,
  LintResult,
  LintViolation,
  LintWarning,
} from "./engine/standards-linter.js";
export { profilePerformance } from "./engine/performance-profiler.js";
export type {
  PerformanceProfile,
  TechPerformance,
} from "./engine/performance-profiler.js";
export { estimateCost } from "./engine/cost-estimator.js";
export type { CostEstimate, CostItem } from "./engine/cost-estimator.js";
export {
  getPluginDir,
  listPlugins,
  installPlugin,
  removePlugin,
  loadPlugin,
  getPluginInfo,
  loadPluginTechnologies,
} from "./engine/plugin-loader.js";
export type {
  StackPilotPlugin,
  PluginCommand,
  PluginManifest,
} from "./engine/plugin-loader.js";

// Database
export { getDatabase, closeDatabase, getDefaultDbPath } from "./db/database.js";
