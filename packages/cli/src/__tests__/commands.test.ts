import { describe, expect, it } from "vitest";
import {
  banner,
  box,
  emptyState,
  error,
  info,
  progressBar,
  stepIndicator,
  success,
  table,
  warning,
} from "../ui/format.js";

// Helper to strip ANSI escape codes for content assertions
function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

// ─── format.ts utility functions ─────────────────────────

describe("format.ts utility functions", () => {
  describe("success()", () => {
    it("returns string containing green checkmark", () => {
      const result = success("done");
      const plain = stripAnsi(result);
      expect(plain).toContain("\u2714");
      expect(plain).toContain("done");
    });

    it("includes the message text", () => {
      const result = success("All tests passed");
      expect(stripAnsi(result)).toContain("All tests passed");
    });
  });

  describe("error()", () => {
    it("returns string containing red X", () => {
      const result = error("failed");
      const plain = stripAnsi(result);
      expect(plain).toContain("\u2716");
      expect(plain).toContain("failed");
    });

    it("includes the message text", () => {
      const result = error("Build failed");
      expect(stripAnsi(result)).toContain("Build failed");
    });
  });

  describe("warning()", () => {
    it("returns string containing warning triangle", () => {
      const result = warning("careful");
      const plain = stripAnsi(result);
      expect(plain).toContain("\u26A0");
      expect(plain).toContain("careful");
    });
  });

  describe("info()", () => {
    it("returns string containing info symbol", () => {
      const result = info("note");
      const plain = stripAnsi(result);
      expect(plain).toContain("\u2139");
      expect(plain).toContain("note");
    });
  });

  describe("banner()", () => {
    it("returns formatted banner with version", () => {
      const result = banner("1.0.0");
      const plain = stripAnsi(result);
      expect(plain).toContain("StackPilot");
      expect(plain).toContain("v1.0.0");
    });

    it("includes tagline", () => {
      const result = banner("2.0.0");
      const plain = stripAnsi(result);
      expect(plain).toContain("operating system for your dev stacks");
    });

    it("returns multi-line output", () => {
      const result = banner("1.0.0");
      const lines = result.split("\n");
      expect(lines.length).toBeGreaterThan(1);
    });
  });

  describe("box()", () => {
    it("draws Unicode box around content", () => {
      const result = box("hello");
      expect(result).toContain("\u256D"); // top-left corner
      expect(result).toContain("\u256E"); // top-right corner
      expect(result).toContain("\u2570"); // bottom-left corner
      expect(result).toContain("\u256F"); // bottom-right corner
      expect(result).toContain("\u2502"); // vertical bar
      expect(result).toContain("\u2500"); // horizontal bar
    });

    it("includes the content inside the box", () => {
      const result = box("test content");
      const plain = stripAnsi(result);
      expect(plain).toContain("test content");
    });

    it("supports an optional title", () => {
      const result = box("body", "Title");
      const plain = stripAnsi(result);
      expect(plain).toContain("Title");
      expect(plain).toContain("body");
    });

    it("handles multi-line content", () => {
      const result = box("line1\nline2\nline3");
      const plain = stripAnsi(result);
      expect(plain).toContain("line1");
      expect(plain).toContain("line2");
      expect(plain).toContain("line3");
    });
  });

  describe("table()", () => {
    it("formats data in aligned columns", () => {
      const data = [
        { name: "Next.js", category: "frontend" },
        { name: "PostgreSQL", category: "database" },
      ];
      const columns = [
        { header: "Name", key: "name" },
        { header: "Category", key: "category" },
      ];
      const result = table(data, columns);
      const plain = stripAnsi(result);
      expect(plain).toContain("Name");
      expect(plain).toContain("Category");
      expect(plain).toContain("Next.js");
      expect(plain).toContain("PostgreSQL");
      expect(plain).toContain("frontend");
      expect(plain).toContain("database");
    });

    it("returns empty string for empty data", () => {
      const result = table([], [{ header: "Name", key: "name" }]);
      expect(result).toBe("");
    });

    it("includes a separator line between header and data", () => {
      const data = [{ name: "test" }];
      const columns = [{ header: "Name", key: "name" }];
      const result = table(data, columns);
      const plain = stripAnsi(result);
      const lines = plain.split("\n");
      // line 0 = header, line 1 = separator, line 2+ = data
      expect(lines.length).toBeGreaterThanOrEqual(3);
      expect(lines[1]).toMatch(/\u2500+/);
    });

    it("handles missing keys gracefully", () => {
      const data = [{ name: "test" }];
      const columns = [
        { header: "Name", key: "name" },
        { header: "Missing", key: "nonexistent" },
      ];
      const result = table(data, columns);
      // Should not throw, just produce empty value
      expect(stripAnsi(result)).toContain("Name");
    });
  });

  describe("stepIndicator()", () => {
    it("shows correct step count", () => {
      const result = stepIndicator(2, 5, "Processing");
      const plain = stripAnsi(result);
      expect(plain).toContain("[2/5]");
      expect(plain).toContain("Processing");
    });

    it("works with step 1 of 1", () => {
      const result = stepIndicator(1, 1, "Only step");
      const plain = stripAnsi(result);
      expect(plain).toContain("[1/1]");
      expect(plain).toContain("Only step");
    });
  });

  describe("emptyState()", () => {
    it("returns formatted empty message", () => {
      const result = emptyState("No items found");
      const plain = stripAnsi(result);
      expect(plain).toContain("No items found");
    });

    it("includes hint when provided", () => {
      const result = emptyState("No stacks", "Run stackpilot create to get started");
      const plain = stripAnsi(result);
      expect(plain).toContain("No stacks");
      expect(plain).toContain("Run stackpilot create to get started");
    });

    it("works without hint", () => {
      const result = emptyState("Empty");
      const plain = stripAnsi(result);
      expect(plain).toContain("Empty");
      // Should not throw
    });
  });

  describe("progressBar()", () => {
    it("shows 0% for zero progress", () => {
      const result = progressBar(0, 10);
      const plain = stripAnsi(result);
      expect(plain).toContain("0%");
    });

    it("shows 50% for half progress", () => {
      const result = progressBar(5, 10);
      const plain = stripAnsi(result);
      expect(plain).toContain("50%");
    });

    it("shows 100% for complete progress", () => {
      const result = progressBar(10, 10);
      const plain = stripAnsi(result);
      expect(plain).toContain("100%");
    });

    it("caps at 100% when current exceeds total", () => {
      const result = progressBar(15, 10);
      const plain = stripAnsi(result);
      expect(plain).toContain("100%");
    });

    it("contains filled and empty bar characters", () => {
      const result = progressBar(5, 10, 20);
      // Should contain both filled (\u2588) and empty (\u2591) blocks
      expect(result).toContain("\u2588");
      expect(result).toContain("\u2591");
    });

    it("respects custom width", () => {
      const result = progressBar(5, 10, 40);
      // The bar portion should contain 40 total bar characters
      const filled = (result.match(/\u2588/g) || []).length;
      const empty = (result.match(/\u2591/g) || []).length;
      expect(filled + empty).toBe(40);
    });
  });
});

// ─── Input validation (from generate.ts) ────────────────

import * as nodePath from "node:path";

describe("Input validation for project names", () => {
  // Replicate the validation logic from generate.ts (lines 426-429):
  // const safeName = path.basename(opts.name);
  // if (safeName !== opts.name || !/^[a-zA-Z0-9_.\-]+$/.test(safeName))
  const path = nodePath;

  function isValidProjectName(name: string): boolean {
    const safeName = path.basename(name);
    return safeName === name && /^[a-zA-Z0-9_.-]+$/.test(safeName);
  }

  describe("rejects path traversal attempts", () => {
    it("rejects ../evil", () => {
      expect(isValidProjectName("../evil")).toBe(false);
    });

    it("rejects ../../etc/passwd", () => {
      expect(isValidProjectName("../../etc/passwd")).toBe(false);
    });

    it("rejects subdir/project", () => {
      expect(isValidProjectName("subdir/project")).toBe(false);
    });
  });

  describe("rejects shell injection characters", () => {
    it("rejects names with semicolons", () => {
      expect(isValidProjectName("project;rm -rf")).toBe(false);
    });

    it("rejects names with pipes", () => {
      expect(isValidProjectName("project|evil")).toBe(false);
    });

    it("rejects names with dollar signs", () => {
      expect(isValidProjectName("project$HOME")).toBe(false);
    });

    it("rejects names with backticks", () => {
      expect(isValidProjectName("project`whoami`")).toBe(false);
    });

    it("rejects names with spaces", () => {
      expect(isValidProjectName("my project")).toBe(false);
    });

    it("rejects empty string", () => {
      expect(isValidProjectName("")).toBe(false);
    });
  });

  describe("accepts valid project names", () => {
    it("accepts my-project", () => {
      expect(isValidProjectName("my-project")).toBe(true);
    });

    it("accepts test_app", () => {
      expect(isValidProjectName("test_app")).toBe(true);
    });

    it("accepts app1", () => {
      expect(isValidProjectName("app1")).toBe(true);
    });

    it("accepts names with dots", () => {
      expect(isValidProjectName("my.app")).toBe(true);
    });

    it("accepts uppercase letters", () => {
      expect(isValidProjectName("MyProject")).toBe(true);
    });

    it("accepts single character", () => {
      expect(isValidProjectName("a")).toBe(true);
    });

    it("accepts numbers only", () => {
      expect(isValidProjectName("123")).toBe(true);
    });
  });
});
