/**
 * Pre-build script: reads all YAML technologies and templates,
 * generates a TypeScript module that the React app can import.
 * This avoids needing Node.js 'fs' in the browser.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const registryDir = path.join(__dirname, "../../registry/src/technologies");
const outputFile = path.join(__dirname, "../src/generated/registry-data.ts");

// Load all technologies from YAML
function loadTechnologies() {
  const techs = [];
  const categories = fs.readdirSync(registryDir);

  for (const cat of categories) {
    const catPath = path.join(registryDir, cat);
    if (!fs.statSync(catPath).isDirectory()) continue;

    const files = fs.readdirSync(catPath).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));

    for (const file of files) {
      const raw = fs.readFileSync(path.join(catPath, file), "utf-8");
      const data = parseYaml(raw);
      techs.push(data);
    }
  }

  return techs;
}

// Load templates from the built templates package
async function loadTemplates() {
  try {
    const templatesIndex = path.join(__dirname, "../../templates/dist/index.js");
    const mod = await import(templatesIndex);
    return mod.getAllTemplates();
  } catch {
    console.warn("Could not load templates from dist, using fallback");
    return [];
  }
}

async function main() {
  const technologies = loadTechnologies();
  const templates = await loadTemplates();

  const output = `// This file is generated from the YAML registry at build time.
// Regenerate: node scripts/generate-data.mjs

export const technologies = ${JSON.stringify(technologies, null, 2)} as const;

export const templates = ${JSON.stringify(
    templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      technologyIds: t.technologyIds,
      profile: t.profile,
      scaffoldSteps: t.scaffoldSteps.length,
      hooks: t.hooks.length,
      overrides: t.overrides.length,
    })),
    null,
    2,
  )} as const;

export const stats = {
  totalTechnologies: ${technologies.length},
  totalTemplates: ${templates.length},
  categories: ${JSON.stringify([...new Set(technologies.map((t) => t.category))].sort())},
  categoryCounts: ${JSON.stringify(
    technologies.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {}),
  )},
};
`;

  fs.writeFileSync(outputFile, output, "utf-8");
  console.log(
    `Generated ${outputFile} — ${technologies.length} technologies, ${templates.length} templates`,
  );
}

main();
