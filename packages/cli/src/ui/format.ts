/**
 * Shared formatting utilities for CLI output.
 * Premium visual design for Stackweld CLI.
 */

import type { StackDefinition, Technology, Template, ValidationResult } from "@stackweld/core";
import chalk from "chalk";

// ─── Constants ─────────────────────────────────────────

const ICONS = {
  success: chalk.green("\u2714"),
  error: chalk.red("\u2716"),
  warning: chalk.yellow("\u26A0"),
  info: chalk.blue("\u2139"),
  bullet: chalk.dim("\u2022"),
  arrow: chalk.dim("\u2192"),
  dot: {
    green: chalk.green("\u25CF"),
    red: chalk.red("\u25CF"),
    yellow: chalk.yellow("\u25CF"),
    blue: chalk.blue("\u25CF"),
    dim: chalk.dim("\u25CB"),
  },
} as const;

const BOX = {
  tl: "\u256D",
  tr: "\u256E",
  bl: "\u2570",
  br: "\u256F",
  h: "\u2500",
  v: "\u2502",
} as const;

const BRAND_COLOR = chalk.hex("#7C5CFC");

// ─── Message Functions ─────────────────────────────────

export function success(message: string): string {
  return `${ICONS.success} ${chalk.green(message)}`;
}

export function error(message: string): string {
  return `${ICONS.error} ${chalk.red(message)}`;
}

export function warning(message: string): string {
  return `${ICONS.warning} ${chalk.yellow(message)}`;
}

export function info(message: string): string {
  return `${ICONS.info} ${chalk.blue(message)}`;
}

export function dim(message: string): string {
  return chalk.dim(message);
}

export function label(key: string, value: string): string {
  return `  ${chalk.dim(`${key}:`)} ${value}`;
}

// ─── Banner & Headers ──────────────────────────────────

export function banner(version: string): string {
  const lines = [
    "",
    BRAND_COLOR.bold("  Stackweld") + chalk.dim(` v${version}`),
    chalk.dim("  The operating system for your dev stacks"),
    "",
  ];
  return lines.join("\n");
}

export function gradientHeader(text: string): string {
  const colors = ["#7C5CFC", "#6B8AFF", "#5CB8FF", "#4DE4FC"];
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const color = colors[Math.floor((i / text.length) * colors.length)];
    result += chalk.hex(color).bold(text[i]);
  }
  return result;
}

export function sectionHeader(title: string): string {
  return `\n${chalk.bold(title)}`;
}

// ─── Box Drawing ───────────────────────────────────────

export function box(content: string, title?: string): string {
  const lines = content.split("\n");
  const maxLen = Math.max(
    ...lines.map((l) => stripAnsi(l).length),
    title ? stripAnsi(title).length + 2 : 0,
  );
  const width = Math.min(Math.max(maxLen + 4, 40), 80);
  const innerWidth = width - 2;

  const hLine = BOX.h.repeat(innerWidth);
  const topLine = title
    ? `${BOX.tl}${BOX.h} ${chalk.bold(title)} ${BOX.h.repeat(Math.max(0, innerWidth - stripAnsi(title).length - 3))}${BOX.tr}`
    : `${BOX.tl}${hLine}${BOX.tr}`;

  const paddedLines = lines.map((line) => {
    const visLen = stripAnsi(line).length;
    const padding = Math.max(0, innerWidth - visLen - 2);
    return `${BOX.v} ${line}${" ".repeat(padding)} ${BOX.v}`;
  });

  return [topLine, ...paddedLines, `${BOX.bl}${hLine}${BOX.br}`].join("\n");
}

function stripAnsi(str: string): string {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape sequences require matching the ESC control character
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

// ─── Tables ────────────────────────────────────────────

interface TableColumn {
  header: string;
  key: string;
  align?: "left" | "right";
  color?: (v: string) => string;
}

export function table(data: Record<string, string>[], columns: TableColumn[]): string {
  if (data.length === 0) return "";

  // Compute column widths
  const widths = columns.map((col) => {
    const headerLen = col.header.length;
    const maxDataLen = Math.max(0, ...data.map((row) => (row[col.key] || "").length));
    return Math.max(headerLen, maxDataLen);
  });

  // Header
  const headerLine = columns
    .map((col, i) => chalk.bold(pad(col.header, widths[i], col.align)))
    .join("  ");

  const separator = columns.map((_, i) => chalk.dim("\u2500".repeat(widths[i]))).join("  ");

  // Rows
  const rows = data.map((row) =>
    columns
      .map((col, i) => {
        const value = row[col.key] || "";
        const padded = pad(value, widths[i], col.align);
        return col.color ? col.color(padded) : padded;
      })
      .join("  "),
  );

  return [headerLine, separator, ...rows].join("\n");
}

function pad(str: string, len: number, align: "left" | "right" = "left"): string {
  if (align === "right") return str.padStart(len);
  return str.padEnd(len);
}

// ─── Progress Indicator ────────────────────────────────

export function progressBar(current: number, total: number, width = 30): string {
  const ratio = Math.min(current / total, 1);
  const filled = Math.round(width * ratio);
  const empty = width - filled;
  const bar = chalk.green("\u2588".repeat(filled)) + chalk.dim("\u2591".repeat(empty));
  const pct = Math.round(ratio * 100);
  return `${bar} ${chalk.dim(`${pct}%`)}`;
}

export function stepIndicator(current: number, total: number, label: string): string {
  return `${chalk.dim(`[${current}/${total}]`)} ${label}`;
}

// ─── Stack Formatting ──────────────────────────────────

export function formatStackRow(stack: StackDefinition): string {
  const techs = stack.technologies.map((t) => t.technologyId).join(", ");
  return `${chalk.cyan.bold(stack.name)} ${chalk.dim(`(${stack.profile})`)}  ${chalk.dim(`v${stack.version}`)}
  ${chalk.dim("ID:")} ${stack.id}
  ${chalk.dim("Technologies:")} ${techs}
  ${chalk.dim("Updated:")} ${stack.updatedAt}`;
}

export function formatStackTable(stacks: StackDefinition[]): string {
  const data = stacks.map((s) => ({
    name: s.name,
    profile: s.profile,
    techs: s.technologies.map((t) => t.technologyId).join(", "),
    version: `v${s.version}`,
    updated: typeof s.updatedAt === "string" ? s.updatedAt.split("T")[0] : String(s.updatedAt),
  }));

  return table(data, [
    { header: "Name", key: "name", color: (v) => chalk.cyan(v) },
    { header: "Profile", key: "profile" },
    { header: "Technologies", key: "techs", color: (v) => chalk.dim(v) },
    { header: "Ver", key: "version" },
    { header: "Updated", key: "updated", color: (v) => chalk.dim(v) },
  ]);
}

export function formatStackSummary(stack: StackDefinition): string {
  const techs = stack.technologies.map((t) => t.technologyId).join(", ");
  const content = [
    `${chalk.dim("Name:")}     ${chalk.cyan.bold(stack.name)}`,
    `${chalk.dim("Profile:")}  ${stack.profile}`,
    `${chalk.dim("Version:")}  v${stack.version}`,
    `${chalk.dim("Techs:")}    ${techs}`,
    `${chalk.dim("ID:")}       ${chalk.dim(stack.id)}`,
  ].join("\n");

  return box(content, "Stack Summary");
}

export function formatTechnology(tech: Technology): string {
  const lines = [
    `${chalk.bold.cyan(tech.name)} ${chalk.dim(`(${tech.id})`)}`,
    `  ${chalk.dim("Category:")} ${tech.category}`,
    `  ${chalk.dim("Description:")} ${tech.description}`,
    `  ${chalk.dim("Default version:")} ${tech.defaultVersion}`,
  ];

  if (tech.defaultPort) {
    lines.push(`  ${chalk.dim("Default port:")} ${tech.defaultPort}`);
  }
  if (tech.requires.length > 0) {
    lines.push(`  ${chalk.dim("Requires:")} ${tech.requires.join(", ")}`);
  }
  if (tech.incompatibleWith.length > 0) {
    lines.push(`  ${chalk.dim("Incompatible with:")} ${tech.incompatibleWith.join(", ")}`);
  }
  if (tech.suggestedWith.length > 0) {
    lines.push(`  ${chalk.dim("Suggested with:")} ${tech.suggestedWith.join(", ")}`);
  }
  if (tech.officialScaffold) {
    lines.push(`  ${chalk.dim("Scaffold:")} ${tech.officialScaffold}`);
  }
  if (tech.dockerImage) {
    lines.push(`  ${chalk.dim("Docker:")} ${tech.dockerImage}`);
  }

  return lines.join("\n");
}

export function formatTechTable(techs: Technology[]): string {
  const data = techs.map((t) => ({
    name: t.name,
    id: t.id,
    category: t.category,
    version: t.defaultVersion,
    port: t.defaultPort ? String(t.defaultPort) : "-",
  }));

  return table(data, [
    { header: "Name", key: "name", color: (v) => chalk.cyan(v) },
    { header: "ID", key: "id", color: (v) => chalk.dim(v) },
    { header: "Category", key: "category" },
    { header: "Version", key: "version" },
    { header: "Port", key: "port", align: "right" },
  ]);
}

export function formatTemplate(template: Template): string {
  return `${chalk.bold.magenta(template.name)} ${chalk.dim(`(${template.id})`)}
  ${chalk.dim("Profile:")} ${template.profile}
  ${chalk.dim("Description:")} ${template.description}
  ${chalk.dim("Technologies:")} ${template.technologyIds.join(", ")}
  ${chalk.dim("Scaffold steps:")} ${template.scaffoldSteps.length}
  ${chalk.dim("Hooks:")} ${template.hooks.length}`;
}

export function formatValidation(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.valid) {
    lines.push(success("Stack is valid"));
  } else {
    lines.push(error("Stack has errors"));
  }

  for (const issue of result.issues) {
    const icon =
      issue.severity === "error"
        ? ICONS.error
        : issue.severity === "warning"
          ? ICONS.warning
          : ICONS.info;
    lines.push(`  ${icon} ${issue.message}`);
    if (issue.suggestedFix) {
      lines.push(`    ${chalk.dim("Fix:")} ${issue.suggestedFix}`);
    }
  }

  if (result.resolvedDependencies.length > 0) {
    lines.push(`  ${chalk.dim("Auto-resolved:")} ${result.resolvedDependencies.join(", ")}`);
  }

  return lines.join("\n");
}

// ─── Service Status ────────────────────────────────────

export function formatServiceStatus(
  services: Array<{ name: string; status: string; port?: number; healthCheck?: string }>,
): string {
  if (services.length === 0) return chalk.dim("No services running.");

  const lines = services.map((svc) => {
    const icon =
      svc.status === "healthy" || svc.status === "running"
        ? ICONS.dot.green
        : svc.status === "exited"
          ? ICONS.dot.red
          : ICONS.dot.yellow;
    const port = svc.port ? chalk.dim(`:${svc.port}`) : "";
    const health =
      svc.healthCheck === "passing"
        ? chalk.green(" healthy")
        : svc.healthCheck === "failing"
          ? chalk.red(" unhealthy")
          : "";
    return `  ${icon} ${chalk.cyan(svc.name)}${port} ${chalk.dim(svc.status)}${health}`;
  });

  return lines.join("\n");
}

// ─── Tool Check Status ─────────────────────────────────

export function formatToolCheck(
  name: string,
  found: boolean,
  version?: string,
  suggestion?: string,
): string {
  const icon = found ? ICONS.success : ICONS.error;
  const detail = found ? chalk.dim(version || "") : chalk.dim("not found");
  let line = `  ${icon} ${name} ${detail}`;
  if (!found && suggestion) {
    line += `\n    ${ICONS.arrow} ${chalk.dim(suggestion)}`;
  }
  return line;
}

// ─── Utility ───────────────────────────────────────────

export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function emptyState(message: string, hint?: string): string {
  const lines = [`\n  ${chalk.dim(message)}`];
  if (hint) {
    lines.push(`  ${ICONS.arrow} ${chalk.dim(hint)}`);
  }
  lines.push("");
  return lines.join("\n");
}

export function nextSteps(steps: string[]): string {
  const lines = [sectionHeader("Next steps:")];
  for (const step of steps) {
    lines.push(`  ${ICONS.arrow} ${chalk.dim(step)}`);
  }
  lines.push("");
  return lines.join("\n");
}

export { BRAND_COLOR, ICONS };
