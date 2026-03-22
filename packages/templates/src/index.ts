/**
 * @stackpilot/templates — Built-in template registry.
 * Each template is a preconfigured stack recipe with scaffold steps,
 * file overrides, and lifecycle hooks.
 */

import type { Template } from "@stackpilot/core";

import { t3Stack } from "./templates/t3-stack.js";
import { djangoRestApi } from "./templates/django-rest-api.js";
import { fastapiReact } from "./templates/fastapi-react.js";
import { goMicroservice } from "./templates/go-microservice.js";
import { astroLanding } from "./templates/astro-landing.js";
import { sveltekitFullstack } from "./templates/sveltekit-fullstack.js";
import { nuxt3App } from "./templates/nuxt3-app.js";
import { expressApi } from "./templates/express-api.js";
import { honoMicroservice } from "./templates/hono-microservice.js";
import { djangoReact } from "./templates/django-react.js";
import { mernStack } from "./templates/mern-stack.js";
import { saasStarter } from "./templates/saas-starter.js";
import { nestjsApi } from "./templates/nestjs-api.js";
import { remixFullstack } from "./templates/remix-fullstack.js";
import { solidstartApp } from "./templates/solidstart-app.js";
import { laravelApp } from "./templates/laravel-app.js";
import { pythonAiLab } from "./templates/python-ai-lab.js";
import { tauriDesktop } from "./templates/tauri-desktop.js";
import { monorepoStarter } from "./templates/monorepo-starter.js";
import { htmxDjango } from "./templates/htmx-django.js";

const templates: Template[] = [
  t3Stack,
  djangoRestApi,
  fastapiReact,
  goMicroservice,
  astroLanding,
  sveltekitFullstack,
  nuxt3App,
  expressApi,
  honoMicroservice,
  djangoReact,
  mernStack,
  saasStarter,
  nestjsApi,
  remixFullstack,
  solidstartApp,
  laravelApp,
  pythonAiLab,
  tauriDesktop,
  monorepoStarter,
  htmxDjango,
];

const templateMap = new Map(templates.map((t) => [t.id, t]));

/** Get all available templates. */
export function getAllTemplates(): Template[] {
  return [...templates];
}

/** Get a template by ID. */
export function getTemplate(id: string): Template | null {
  return templateMap.get(id) ?? null;
}

/** List all template IDs. */
export function listTemplateIds(): string[] {
  return templates.map((t) => t.id);
}

/** Find templates that match a given set of technology IDs. */
export function findTemplatesByTechnologies(
  technologyIds: string[],
): Template[] {
  const idSet = new Set(technologyIds);
  return templates.filter((t) =>
    t.technologyIds.some((tid) => idSet.has(tid)),
  );
}

// Re-export individual templates
export {
  t3Stack,
  djangoRestApi,
  fastapiReact,
  goMicroservice,
  astroLanding,
  sveltekitFullstack,
  nuxt3App,
  expressApi,
  honoMicroservice,
  djangoReact,
  mernStack,
  saasStarter,
  nestjsApi,
  remixFullstack,
  solidstartApp,
  laravelApp,
  pythonAiLab,
  tauriDesktop,
  monorepoStarter,
  htmxDjango,
};
