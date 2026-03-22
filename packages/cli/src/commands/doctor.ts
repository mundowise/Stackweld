/**
 * stackpilot doctor — Detect system capabilities and issues.
 */

import { Command } from "commander";
import chalk from "chalk";
import { execSync } from "child_process";
import * as os from "os";
import { formatJson } from "../ui/format.js";

interface CheckResult {
  name: string;
  status: "ok" | "warning" | "error" | "not_found";
  version?: string;
  message?: string;
}

function check(name: string, command: string): CheckResult {
  try {
    const output = execSync(command, { stdio: "pipe", timeout: 5000 })
      .toString()
      .trim();
    // Extract version-like string
    const versionMatch = output.match(/(\d+\.\d+[\.\d]*)/);
    return {
      name,
      status: "ok",
      version: versionMatch?.[1] || output.slice(0, 50),
    };
  } catch {
    return { name, status: "not_found", message: `${name} not found` };
  }
}

export const doctorCommand = new Command("doctor")
  .description("Check system requirements and environment")
  .option("--json", "Output as JSON")
  .option("--suggest", "Suggest fixes for issues")
  .action((opts) => {
    const results: CheckResult[] = [];

    // System info
    const sysInfo = {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      cpus: os.cpus().length,
      memory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
      freeMemory: `${Math.round(os.freemem() / 1024 / 1024 / 1024)}GB`,
      hostname: os.hostname(),
    };

    // Check runtimes
    results.push(check("Node.js", "node --version"));
    results.push(check("npm", "npm --version"));
    results.push(check("pnpm", "pnpm --version"));
    results.push(check("Python", "python3 --version"));
    results.push(check("Go", "go version"));
    results.push(check("Rust", "rustc --version"));
    results.push(check("Bun", "bun --version"));

    // Check Docker
    results.push(check("Docker", "docker --version"));
    results.push(check("Docker Compose", "docker compose version"));

    // Check Git
    results.push(check("Git", "git --version"));

    // Check ports
    const portChecks: CheckResult[] = [];
    const commonPorts = [3000, 5432, 6379, 8000, 8080, 27017];
    for (const port of commonPorts) {
      try {
        execSync(`lsof -i :${port} -sTCP:LISTEN 2>/dev/null || ss -tlnp 2>/dev/null | grep :${port}`, {
          stdio: "pipe",
          timeout: 2000,
        });
        portChecks.push({
          name: `Port ${port}`,
          status: "warning",
          message: `Port ${port} is in use`,
        });
      } catch {
        portChecks.push({ name: `Port ${port}`, status: "ok" });
      }
    }

    // Disk space
    let diskInfo: CheckResult;
    try {
      const df = execSync("df -h . | tail -1", { stdio: "pipe" })
        .toString()
        .trim();
      const parts = df.split(/\s+/);
      diskInfo = {
        name: "Disk Space",
        status: "ok",
        version: `${parts[3]} available of ${parts[1]}`,
      };
    } catch {
      diskInfo = { name: "Disk Space", status: "warning", message: "Could not check" };
    }

    if (opts.json) {
      console.log(
        formatJson({ system: sysInfo, tools: results, ports: portChecks, disk: diskInfo }),
      );
      return;
    }

    // Output
    console.log(chalk.bold("\nSystem:"));
    console.log(
      `  ${chalk.dim("OS:")} ${sysInfo.platform} ${sysInfo.arch} (${sysInfo.release})`,
    );
    console.log(`  ${chalk.dim("CPUs:")} ${sysInfo.cpus}`);
    console.log(
      `  ${chalk.dim("Memory:")} ${sysInfo.freeMemory} free / ${sysInfo.memory} total`,
    );
    console.log(`  ${chalk.dim("Disk:")} ${diskInfo.version || diskInfo.message}`);

    console.log(chalk.bold("\nTools:"));
    for (const r of results) {
      const icon =
        r.status === "ok"
          ? chalk.green("✓")
          : r.status === "not_found"
            ? chalk.red("✗")
            : chalk.yellow("⚠");
      const detail = r.version
        ? chalk.dim(r.version)
        : chalk.dim(r.message || "");
      console.log(`  ${icon} ${r.name} ${detail}`);

      if (opts.suggest && r.status === "not_found") {
        const suggestions: Record<string, string> = {
          "Docker": "Install Docker: https://docs.docker.com/get-docker/",
          "Docker Compose": "Docker Compose is included with Docker Desktop",
          "Python": "Install Python: https://python.org",
          "Go": "Install Go: https://go.dev/dl/",
          "Rust": "Install Rust: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh",
          "Bun": "Install Bun: curl -fsSL https://bun.sh/install | bash",
          "pnpm": "Install pnpm: npm install -g pnpm",
        };
        if (suggestions[r.name]) {
          console.log(`    ${chalk.dim("→ " + suggestions[r.name])}`);
        }
      }
    }

    console.log(chalk.bold("\nPorts:"));
    for (const p of portChecks) {
      const icon =
        p.status === "ok" ? chalk.green("✓") : chalk.yellow("⚠");
      console.log(
        `  ${icon} ${p.name} ${p.status === "warning" ? chalk.yellow(p.message!) : chalk.dim("available")}`,
      );
    }

    // WSL detection
    if (sysInfo.release.includes("microsoft") || sysInfo.release.includes("WSL")) {
      console.log(
        chalk.yellow("\n⚠ WSL detected. Docker Desktop for Windows integration recommended."),
      );
    }

    console.log("");
  });
