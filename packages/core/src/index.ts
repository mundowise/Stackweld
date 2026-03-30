// Types

// Database
export { closeDatabase, getDatabase, getDefaultDbPath } from "./db/database.js";
export type {
  CompatibilityFactor,
  CompatibilityResult,
  StackScoreResult,
} from "./engine/compatibility-scorer.js";
export { scoreCompatibility, scoreStack } from "./engine/compatibility-scorer.js";
export type { ComposePreviewResult } from "./engine/compose-generator.js";
export { generateComposePreview } from "./engine/compose-generator.js";
export type { CostEstimate, CostItem } from "./engine/cost-estimator.js";
export { estimateCost } from "./engine/cost-estimator.js";
export type { EnvDangerousVar, EnvSyncResult, EnvVar } from "./engine/env-analyzer.js";
export { checkDangerous, parseEnvFile, syncEnv } from "./engine/env-analyzer.js";
export type { HealthCheck, HealthReport } from "./engine/health-checker.js";
export { checkProjectHealth } from "./engine/health-checker.js";
export type { DeployTarget, InfraOutput } from "./engine/infra-generator.js";
export { generateInfra } from "./engine/infra-generator.js";
export type { MigrationPlan, MigrationStep } from "./engine/migration-planner.js";
export { planMigration } from "./engine/migration-planner.js";
export type {
  PerformanceProfile,
  TechPerformance,
} from "./engine/performance-profiler.js";
export { profilePerformance } from "./engine/performance-profiler.js";
export type {
  PluginCommand,
  PluginManifest,
  StackPilotPlugin,
} from "./engine/plugin-loader.js";
export {
  getPluginDir,
  getPluginInfo,
  installPlugin,
  listPlugins,
  loadPlugin,
  loadPluginTechnologies,
  removePlugin,
} from "./engine/plugin-loader.js";
export type { UserPreferences } from "./engine/preferences.js";
export {
  getDefaultPreferences,
  getPreference,
  getPreferenceKeys,
  getPreferences,
  resetPreferences,
  setPreference,
} from "./engine/preferences.js";
// Engine
export { RulesEngine } from "./engine/rules-engine.js";
export type { RuntimeOptions } from "./engine/runtime-manager.js";
export { RuntimeManager } from "./engine/runtime-manager.js";
export type { ScaffoldOutput } from "./engine/scaffold-orchestrator.js";
export { ScaffoldOrchestrator } from "./engine/scaffold-orchestrator.js";
export type { DetectedStack, DetectedTech } from "./engine/stack-detector.js";
export { detectStack } from "./engine/stack-detector.js";
export type { DiffChange, DiffItem, StackDiff } from "./engine/stack-differ.js";
export { diffStacks } from "./engine/stack-differ.js";
export { StackEngine } from "./engine/stack-engine.js";
export type { ShareableStack } from "./engine/stack-serializer.js";
export {
  deserializeStack,
  extractFromShareUrl,
  generateShareUrl,
  serializeStack,
} from "./engine/stack-serializer.js";
export type {
  LintResult,
  LintViolation,
  LintWarning,
  StackStandards,
} from "./engine/standards-linter.js";
export { lintStack, loadStandards } from "./engine/standards-linter.js";
export type { InstallContext, InstallResult } from "./engine/tech-installer.js";
export { installTechnologies } from "./engine/tech-installer.js";
export * from "./types/index.js";
