import { describe, expect, it } from "vitest";
import { listTechnologyIds, loadAllTechnologies, loadTechnology } from "../loader.js";

describe("Registry Loader", () => {
  it("loads all 50 technologies", () => {
    const techs = loadAllTechnologies();
    expect(techs.length).toBeGreaterThanOrEqual(80);
  });

  it("every technology has required fields", () => {
    const techs = loadAllTechnologies();
    for (const tech of techs) {
      expect(tech.id).toBeTruthy();
      expect(tech.name).toBeTruthy();
      expect(tech.category).toBeTruthy();
      expect(tech.versions.length).toBeGreaterThan(0);
      expect(tech.defaultVersion).toBeTruthy();
      expect(Array.isArray(tech.requires)).toBe(true);
      expect(Array.isArray(tech.incompatibleWith)).toBe(true);
      expect(Array.isArray(tech.suggestedWith)).toBe(true);
      expect(Array.isArray(tech.tags)).toBe(true);
    }
  });

  it("loads a specific technology by ID", () => {
    const tech = loadTechnology("nextjs");
    expect(tech).not.toBeNull();
    expect(tech?.name).toBe("Next.js");
    expect(tech?.category).toBe("frontend");
    expect(tech?.requires).toContain("nodejs");
  });

  it("returns null for unknown technology", () => {
    const tech = loadTechnology("nonexistent");
    expect(tech).toBeNull();
  });

  it("lists all technology IDs", () => {
    const ids = listTechnologyIds();
    expect(ids.length).toBeGreaterThanOrEqual(80);
    expect(ids).toContain("nextjs");
    expect(ids).toContain("postgresql");
    expect(ids).toContain("prisma");
    expect(ids).toContain("tailwindcss");
  });

  it("has no broken cross-references", () => {
    const techs = loadAllTechnologies();
    const idSet = new Set(techs.map((t) => t.id));

    for (const tech of techs) {
      for (const ref of [...tech.requires, ...tech.incompatibleWith, ...tech.suggestedWith]) {
        expect(idSet.has(ref), `${tech.id} references unknown "${ref}"`).toBe(true);
      }
    }
  });

  it("covers all 9 categories", () => {
    const techs = loadAllTechnologies();
    const categories = new Set(techs.map((t) => t.category));
    expect(categories).toContain("runtime");
    expect(categories).toContain("frontend");
    expect(categories).toContain("backend");
    expect(categories).toContain("database");
    expect(categories).toContain("orm");
    expect(categories).toContain("auth");
    expect(categories).toContain("styling");
    expect(categories).toContain("service");
    expect(categories).toContain("devops");
  });

  it("incompatibleWith is symmetric", () => {
    const techs = loadAllTechnologies();
    const techMap = new Map(techs.map((t) => [t.id, t]));

    for (const tech of techs) {
      for (const incompId of tech.incompatibleWith) {
        const other = techMap.get(incompId);
        if (other) {
          expect(
            other.incompatibleWith.includes(tech.id),
            `${tech.id} says incompatible with ${incompId}, but ${incompId} doesn't list ${tech.id}`,
          ).toBe(true);
        }
      }
    }
  });

  it("all technologies have unique IDs", () => {
    const techs = loadAllTechnologies();
    const ids = techs.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(
      uniqueIds.size,
      `Found duplicate IDs: ${ids.filter((id, i) => ids.indexOf(id) !== i).join(", ")}`,
    ).toBe(ids.length);
  });

  it("all requires references point to existing technology IDs", () => {
    const techs = loadAllTechnologies();
    const idSet = new Set(techs.map((t) => t.id));

    for (const tech of techs) {
      for (const reqId of tech.requires) {
        expect(
          idSet.has(reqId),
          `${tech.id} requires "${reqId}" which does not exist in the registry`,
        ).toBe(true);
      }
    }
  });

  it("all incompatibleWith references point to existing technology IDs", () => {
    const techs = loadAllTechnologies();
    const idSet = new Set(techs.map((t) => t.id));

    for (const tech of techs) {
      for (const incompId of tech.incompatibleWith) {
        expect(
          idSet.has(incompId),
          `${tech.id} lists incompatibleWith "${incompId}" which does not exist in the registry`,
        ).toBe(true);
      }
    }
  });

  it("no technology is incompatible with itself", () => {
    const techs = loadAllTechnologies();

    for (const tech of techs) {
      expect(
        tech.incompatibleWith.includes(tech.id),
        `${tech.id} is listed as incompatible with itself`,
      ).toBe(false);
    }
  });

  it("all technologies have at least one version defined", () => {
    const techs = loadAllTechnologies();

    for (const tech of techs) {
      expect(tech.versions.length, `${tech.id} has no versions defined`).toBeGreaterThan(0);
    }
  });

  it("bidirectional incompatibilities are symmetric (if A lists B, B lists A)", () => {
    const techs = loadAllTechnologies();
    const techMap = new Map(techs.map((t) => [t.id, t]));
    const asymmetric: string[] = [];

    for (const tech of techs) {
      for (const incompId of tech.incompatibleWith) {
        const other = techMap.get(incompId);
        if (other && !other.incompatibleWith.includes(tech.id)) {
          asymmetric.push(`${tech.id} -> ${incompId}`);
        }
      }
    }

    expect(asymmetric, `Asymmetric incompatibilities found: ${asymmetric.join(", ")}`).toEqual([]);
  });
});
