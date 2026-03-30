import { loadAllTechnologies } from "@stackpilot/registry";
import { describe, expect, it } from "vitest";
import {
  findTemplatesByTechnologies,
  getAllTemplates,
  getTemplate,
  listTemplateIds,
} from "../index.js";

describe("Templates Registry", () => {
  it("has 5 built-in templates", () => {
    const templates = getAllTemplates();
    expect(templates.length).toBe(20);
  });

  it("each template has required fields", () => {
    const templates = getAllTemplates();
    for (const t of templates) {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.technologyIds.length).toBeGreaterThan(0);
      expect(t.profile).toBeTruthy();
      expect(Array.isArray(t.scaffoldSteps)).toBe(true);
      expect(Array.isArray(t.overrides)).toBe(true);
      expect(Array.isArray(t.hooks)).toBe(true);
      expect(t.variables).toBeDefined();
    }
  });

  it("gets template by ID", () => {
    const t = getTemplate("t3-stack");
    expect(t).not.toBeNull();
    expect(t?.name).toBe("T3 Stack");
  });

  it("returns null for unknown template", () => {
    expect(getTemplate("nonexistent")).toBeNull();
  });

  it("lists template IDs", () => {
    const ids = listTemplateIds();
    expect(ids).toContain("t3-stack");
    expect(ids).toContain("django-rest-api");
    expect(ids).toContain("fastapi-react");
    expect(ids).toContain("go-microservice");
    expect(ids).toContain("astro-landing");
    expect(ids).toContain("sveltekit-fullstack");
    expect(ids).toContain("nuxt3-app");
    expect(ids).toContain("express-api");
    expect(ids).toContain("hono-microservice");
    expect(ids).toContain("django-react");
  });

  it("finds templates by technology", () => {
    const results = findTemplatesByTechnologies(["nextjs"]);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((t) => t.id === "t3-stack")).toBe(true);
  });

  it("all template technologyIds exist in registry", () => {
    const templates = getAllTemplates();
    const techs = loadAllTechnologies();
    const techIds = new Set(techs.map((t) => t.id));

    for (const template of templates) {
      for (const tid of template.technologyIds) {
        expect(
          techIds.has(tid),
          `Template "${template.id}" references unknown technology "${tid}"`,
        ).toBe(true);
      }
    }
  });

  it("scaffold steps have name and command", () => {
    const templates = getAllTemplates();
    for (const t of templates) {
      for (const step of t.scaffoldSteps) {
        expect(step.name).toBeTruthy();
        expect(step.command).toBeTruthy();
      }
    }
  });

  it("hooks have required fields", () => {
    const templates = getAllTemplates();
    for (const t of templates) {
      for (const hook of t.hooks) {
        expect(hook.timing).toBeTruthy();
        expect(hook.name).toBeTruthy();
        expect(hook.command).toBeTruthy();
        expect(hook.description).toBeTruthy();
        expect(typeof hook.requiresConfirmation).toBe("boolean");
      }
    }
  });
});
