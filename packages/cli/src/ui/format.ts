/**
 * Shared formatting utilities for CLI output.
 */

import chalk from "chalk";
import type {
  StackDefinition,
  Technology,
  Template,
  ValidationResult,
} from "@stackpilot/core";

export function formatStackRow(stack: StackDefinition): string {
  const techs = stack.technologies.map((t) => t.technologyId).join(", ");
  return `${chalk.cyan(stack.name)} ${chalk.dim(`(${stack.profile})`)}  ${chalk.dim("v" + stack.version)}
  ${chalk.dim("ID:")} ${stack.id}
  ${chalk.dim("Technologies:")} ${techs}
  ${chalk.dim("Updated:")} ${stack.updatedAt}`;
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
    lines.push(
      `  ${chalk.dim("Incompatible with:")} ${tech.incompatibleWith.join(", ")}`,
    );
  }
  if (tech.suggestedWith.length > 0) {
    lines.push(
      `  ${chalk.dim("Suggested with:")} ${tech.suggestedWith.join(", ")}`,
    );
  }
  if (tech.officialScaffold) {
    lines.push(`  ${chalk.dim("Scaffold:")} ${tech.officialScaffold}`);
  }
  if (tech.dockerImage) {
    lines.push(`  ${chalk.dim("Docker:")} ${tech.dockerImage}`);
  }

  return lines.join("\n");
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
    lines.push(chalk.green("✓ Stack is valid"));
  } else {
    lines.push(chalk.red("✗ Stack has errors"));
  }

  for (const issue of result.issues) {
    const icon =
      issue.severity === "error"
        ? chalk.red("✗")
        : issue.severity === "warning"
          ? chalk.yellow("⚠")
          : chalk.blue("ℹ");
    lines.push(`  ${icon} ${issue.message}`);
    if (issue.suggestedFix) {
      lines.push(`    ${chalk.dim("Fix:")} ${issue.suggestedFix}`);
    }
  }

  if (result.resolvedDependencies.length > 0) {
    lines.push(
      `  ${chalk.dim("Auto-resolved:")} ${result.resolvedDependencies.join(", ")}`,
    );
  }

  return lines.join("\n");
}

export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}
