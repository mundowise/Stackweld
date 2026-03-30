/**
 * Registry Loader — Reads and validates technology YAML files.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { Technology } from "@stackweld/core";
import Ajv from "ajv";
import { parse as parseYaml } from "yaml";
import { technologySchema } from "./schema.js";

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(technologySchema);

// Resolve technologies directory — works from both src/ (dev) and dist/ (build)
const thisDir = path.dirname(new URL(import.meta.url).pathname);
const distTechDir = path.join(thisDir, "technologies");
const srcTechDir = path.join(thisDir, "..", "src", "technologies");
const TECH_DIR = fs.existsSync(distTechDir) ? distTechDir : srcTechDir;

/**
 * Load all technologies from the YAML registry.
 * Validates each one against the JSON Schema.
 */
export function loadAllTechnologies(): Technology[] {
  const technologies: Technology[] = [];
  const categories = fs.readdirSync(TECH_DIR);

  for (const category of categories) {
    const categoryPath = path.join(TECH_DIR, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const files = fs
      .readdirSync(categoryPath)
      .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));

    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = parseYaml(raw);

      if (!validate(data)) {
        const errors = validate.errors?.map((e) => `${e.instancePath}: ${e.message}`).join(", ");
        throw new Error(`Invalid technology file ${file}: ${errors}`);
      }

      technologies.push(data as Technology);
    }
  }

  return technologies;
}

/**
 * Load a single technology by ID.
 */
export function loadTechnology(id: string): Technology | null {
  const all = loadAllTechnologies();
  return all.find((t) => t.id === id) ?? null;
}

/**
 * Get all technology IDs.
 */
export function listTechnologyIds(): string[] {
  return loadAllTechnologies().map((t) => t.id);
}
