/**
 * Plugin Loader — Discovers, installs, and loads StackPilot plugins.
 *
 * Plugins live in ~/.stackpilot/plugins/<name>/ and expose a
 * stackpilot.plugin.json manifest describing their capabilities.
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import type { Technology } from "../types/technology.js";
import type { Template } from "../types/template.js";

// ─── Types ────────────────────────────────────────────

export interface PluginCommand {
  name: string;
  description: string;
  handler: string;
}

export interface StackPilotPlugin {
  name: string;
  version: string;
  description: string;
  technologies?: Technology[];
  templates?: Template[];
  commands?: PluginCommand[];
}

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  main: string;
  type: "technology" | "template" | "command" | "mixed";
}

// ─── Plugin Directory ─────────────────────────────────

export function getPluginDir(): string {
  return path.join(os.homedir(), ".stackpilot", "plugins");
}

function ensurePluginDir(): void {
  const dir = getPluginDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ─── List Plugins ─────────────────────────────────────

export function listPlugins(): PluginManifest[] {
  const dir = getPluginDir();
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const manifests: PluginManifest[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const manifestPath = path.join(dir, entry.name, "stackpilot.plugin.json");
    if (!fs.existsSync(manifestPath)) continue;

    try {
      const raw = fs.readFileSync(manifestPath, "utf-8");
      const manifest = JSON.parse(raw) as PluginManifest;
      manifests.push(manifest);
    } catch {
      // Skip malformed manifests
    }
  }

  return manifests;
}

// ─── Install Plugin ───────────────────────────────────

export function installPlugin(nameOrPath: string): PluginManifest {
  ensurePluginDir();

  const sourcePath = path.resolve(nameOrPath);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Plugin source not found: ${sourcePath}`);
  }

  if (!fs.statSync(sourcePath).isDirectory()) {
    throw new Error(`Plugin source must be a directory: ${sourcePath}`);
  }

  const manifestPath = path.join(sourcePath, "stackpilot.plugin.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`No stackpilot.plugin.json found in: ${sourcePath}`);
  }

  let manifest: PluginManifest;
  try {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    manifest = JSON.parse(raw) as PluginManifest;
  } catch {
    throw new Error(`Invalid stackpilot.plugin.json in: ${sourcePath}`);
  }

  if (!manifest.name || !manifest.version || !manifest.main) {
    throw new Error("Plugin manifest must have name, version, and main fields.");
  }

  const destDir = path.join(getPluginDir(), manifest.name);

  // Remove existing installation
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }

  // Copy plugin directory
  copyDirRecursive(sourcePath, destDir);

  return manifest;
}

function copyDirRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and .git
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ─── Remove Plugin ────────────────────────────────────

export function removePlugin(name: string): void {
  const pluginDir = path.join(getPluginDir(), name);

  if (!fs.existsSync(pluginDir)) {
    throw new Error(`Plugin "${name}" is not installed.`);
  }

  fs.rmSync(pluginDir, { recursive: true, force: true });
}

// ─── Load Plugin ──────────────────────────────────────

export function loadPlugin(name: string): StackPilotPlugin | null {
  const pluginDir = path.join(getPluginDir(), name);
  const manifestPath = path.join(pluginDir, "stackpilot.plugin.json");

  if (!fs.existsSync(manifestPath)) return null;

  try {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(raw) as PluginManifest;
    const mainPath = path.join(pluginDir, manifest.main);

    if (!fs.existsSync(mainPath)) return null;

    // Read the main file and parse it as JSON data (for static plugins)
    // or return manifest-only info
    const mainRaw = fs.readFileSync(mainPath, "utf-8");
    const pluginData = JSON.parse(mainRaw) as StackPilotPlugin;

    return {
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      technologies: pluginData.technologies || [],
      templates: pluginData.templates || [],
      commands: pluginData.commands || [],
    };
  } catch {
    return null;
  }
}

// ─── Get Plugin Info ──────────────────────────────────

export function getPluginInfo(name: string): PluginManifest | null {
  const manifestPath = path.join(getPluginDir(), name, "stackpilot.plugin.json");

  if (!fs.existsSync(manifestPath)) return null;

  try {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    return JSON.parse(raw) as PluginManifest;
  } catch {
    return null;
  }
}

// ─── Load All Plugin Technologies ─────────────────────

export function loadPluginTechnologies(): Technology[] {
  const plugins = listPlugins();
  const allTechs: Technology[] = [];

  for (const manifest of plugins) {
    const plugin = loadPlugin(manifest.name);
    if (plugin?.technologies) {
      allTechs.push(...plugin.technologies);
    }
  }

  return allTechs;
}
