/**
 * stackweld doctor — Detect system capabilities and issues.
 */

import { execFileSync, execSync } from "node:child_process";
import * as os from "node:os";
import chalk from "chalk";
import { Command } from "commander";
import {
  box,
  formatJson,
  formatToolCheck,
  gradientHeader,
  ICONS,
  sectionHeader,
} from "../ui/format.js";

interface CheckResult {
  name: string;
  status: "ok" | "warning" | "error" | "not_found";
  version?: string;
  message?: string;
}

const INSTALL_SUGGESTIONS: Record<string, string> = {
  "Node.js": "https://nodejs.org  or  nvm install --lts",
  npm: "Included with Node.js",
  pnpm: "npm install -g pnpm",
  Docker: "https://docs.docker.com/get-docker/",
  "Docker Compose": "Included with Docker Desktop, or: apt install docker-compose-plugin",
  Git: "apt install git  or  https://git-scm.com",
  Python: "https://python.org  or  apt install python3",
  Go: "https://go.dev/dl/  or  snap install go",
  Rust: "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh",
  Cargo: "Included with Rust (rustup)",
  Bun: "curl -fsSL https://bun.sh/install | bash",
};

function check(name: string, command: string): CheckResult {
  try {
    const parts = command.split(/\s+/);
    const output = execFileSync(parts[0], parts.slice(1), { stdio: "pipe", timeout: 5000 })
      .toString()
      .trim();
    const versionMatch = output.match(/(\d+\.\d+[.\d]*)/);
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

    // Check runtimes & tools (including all required ones)
    results.push(check("Node.js", "node --version"));
    results.push(check("npm", "npm --version"));
    results.push(check("pnpm", "pnpm --version"));
    results.push(check("Docker", "docker --version"));
    results.push(check("Docker Compose", "docker compose version"));
    results.push(check("Git", "git --version"));
    results.push(check("Python", "python3 --version"));
    results.push(check("Go", "go version"));
    results.push(check("Rust", "rustc --version"));
    results.push(check("Cargo", "cargo --version"));
    results.push(check("Bun", "bun --version"));

    // Check ports
    const portChecks: CheckResult[] = [];
    const commonPorts = [3000, 5432, 6379, 8000, 8080, 27017];
    for (const port of commonPorts) {
      try {
        execSync(
          `lsof -i :${port} -sTCP:LISTEN 2>/dev/null || ss -tlnp 2>/dev/null | grep :${port}`,
          { stdio: "pipe", timeout: 2000 },
        );
        portChecks.push({
          name: `Port ${port}`,
          status: "warning",
          message: `in use`,
        });
      } catch {
        portChecks.push({ name: `Port ${port}`, status: "ok" });
      }
    }

    // Disk space
    let diskInfo: CheckResult;
    try {
      const df = execSync("df -h . | tail -1", { stdio: "pipe" }).toString().trim();
      const parts = df.split(/\s+/);
      diskInfo = {
        name: "Disk Space",
        status: "ok",
        version: `${parts[3]} available of ${parts[1]}`,
      };
    } catch {
      diskInfo = {
        name: "Disk Space",
        status: "warning",
        message: "Could not check",
      };
    }

    if (opts.json) {
      console.log(
        formatJson({
          system: sysInfo,
          tools: results,
          ports: portChecks,
          disk: diskInfo,
        }),
      );
      return;
    }

    // ── Output ──
    console.log(`\n  ${gradientHeader("Stackweld")} ${chalk.dim("/ System Doctor")}\n`);

    // System info box
    const sysContent = [
      `${chalk.dim("OS:")}      ${sysInfo.platform} ${sysInfo.arch} (${sysInfo.release})`,
      `${chalk.dim("CPUs:")}    ${sysInfo.cpus}`,
      `${chalk.dim("Memory:")}  ${sysInfo.freeMemory} free / ${sysInfo.memory} total`,
      `${chalk.dim("Disk:")}    ${diskInfo.version || diskInfo.message}`,
      `${chalk.dim("Host:")}    ${sysInfo.hostname}`,
    ].join("\n");
    console.log(box(sysContent, "System"));

    // Tools
    const found = results.filter((r) => r.status === "ok").length;
    const missing = results.filter((r) => r.status === "not_found").length;
    console.log(
      sectionHeader(
        `  Tools (${chalk.green(`${String(found)} found`)}, ${missing > 0 ? chalk.red(`${String(missing)} missing`) : chalk.dim("0 missing")})`,
      ),
    );
    for (const r of results) {
      console.log(
        formatToolCheck(r.name, r.status === "ok", r.version, INSTALL_SUGGESTIONS[r.name]),
      );
    }

    // Ports
    const portsInUse = portChecks.filter((p) => p.status === "warning");
    console.log(
      sectionHeader(
        `  Ports (${portsInUse.length > 0 ? chalk.yellow(`${String(portsInUse.length)} in use`) : chalk.green("all available")})`,
      ),
    );
    for (const p of portChecks) {
      const icon = p.status === "ok" ? chalk.green("\u2714") : chalk.yellow("\u26A0");
      const statusText = p.status === "warning" ? chalk.yellow(p.message!) : chalk.dim("available");
      console.log(`  ${icon} ${p.name} ${statusText}`);
    }

    // WSL detection
    if (sysInfo.release.includes("microsoft") || sysInfo.release.includes("WSL")) {
      console.log(
        `\n  ${ICONS.warning} ${chalk.yellow("WSL detected. Docker Desktop for Windows integration recommended.")}`,
      );
    }

    // Summary
    if (missing === 0) {
      console.log(
        `\n  ${chalk.green("\u2714")} ${chalk.green("All tools available. System is ready.")}\n`,
      );
    } else {
      console.log(
        `\n  ${chalk.yellow("\u26A0")} ${chalk.yellow(`${missing} tool(s) missing. Install them for full functionality.`)}\n`,
      );
    }
  });
