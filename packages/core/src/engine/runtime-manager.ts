/**
 * Runtime Manager — Manages Docker Compose lifecycle for stacks.
 * Handles up, down, status, logs, and health check waiting.
 */

import { execSync, spawn, type ChildProcess } from "child_process";
import * as fs from "fs";
import * as path from "path";
import type {
  RuntimeState,
  ServiceStatus,
  StackDefinition,
  Technology,
} from "../types/index.js";

export interface RuntimeOptions {
  composePath: string;
  projectDir: string;
}

export class RuntimeManager {
  private technologies: Map<string, Technology>;

  constructor(technologies: Technology[]) {
    this.technologies = new Map(technologies.map((t) => [t.id, t]));
  }

  /**
   * Start all services with docker compose up.
   */
  up(opts: RuntimeOptions, detach = true): { success: boolean; output: string } {
    const flags = detach ? "-d" : "";
    try {
      const output = execSync(
        `docker compose -f "${opts.composePath}" up ${flags}`,
        { cwd: opts.projectDir, stdio: "pipe", timeout: 120_000 },
      ).toString();
      return { success: true, output };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, output: message };
    }
  }

  /**
   * Stop all services.
   */
  down(opts: RuntimeOptions, volumes = false): { success: boolean; output: string } {
    try {
      const volumesFlag = volumes ? " --volumes" : "";
      const output = execSync(
        `docker compose -f "${opts.composePath}" down${volumesFlag}`,
        { cwd: opts.projectDir, stdio: "pipe", timeout: 60_000 },
      ).toString();
      return { success: true, output };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, output: message };
    }
  }

  /**
   * Get status of all services in the compose file.
   */
  status(opts: RuntimeOptions): ServiceStatus[] {
    try {
      const raw = execSync(
        `docker compose -f "${opts.composePath}" ps --format json`,
        { cwd: opts.projectDir, stdio: "pipe", timeout: 10_000 },
      ).toString();

      const services: ServiceStatus[] = [];
      const lines = raw.trim().split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const container = JSON.parse(line);
          const serviceName = container.Service || container.Name || "unknown";
          const state = container.State || "unknown";
          const health = container.Health || "";

          // Try to find matching technology
          const tech = this.technologies.get(serviceName);

          let statusValue: ServiceStatus["status"];
          if (state === "running" && health === "healthy") {
            statusValue = "healthy";
          } else if (state === "running" && health === "unhealthy") {
            statusValue = "unhealthy";
          } else if (state === "running") {
            statusValue = "running";
          } else if (state === "exited") {
            statusValue = "exited";
          } else {
            statusValue = "stopped";
          }

          // Extract port from Publishers
          let port: number | undefined;
          if (container.Publishers && Array.isArray(container.Publishers)) {
            const pub = container.Publishers.find(
              (p: Record<string, unknown>) => p.PublishedPort,
            );
            if (pub) port = pub.PublishedPort as number;
          }

          services.push({
            name: serviceName,
            technologyId: tech?.id || serviceName,
            containerId: container.ID,
            status: statusValue,
            port,
            healthCheck: health === "healthy"
              ? "passing"
              : health === "unhealthy"
                ? "failing"
                : "none",
          });
        } catch {
          // Skip malformed JSON lines
        }
      }

      return services;
    } catch {
      return [];
    }
  }

  /**
   * Get logs for a specific service or all services.
   */
  logs(
    opts: RuntimeOptions,
    service?: string,
    tail = 50,
    follow = false,
  ): string {
    try {
      const serviceArg = service || "";
      const followFlag = follow ? " -f" : "";
      return execSync(
        `docker compose -f "${opts.composePath}" logs --tail ${tail}${followFlag} ${serviceArg}`,
        { cwd: opts.projectDir, stdio: follow ? "inherit" : "pipe", timeout: follow ? 0 : 10_000 },
      ).toString();
    } catch (err) {
      return err instanceof Error ? err.message : String(err);
    }
  }

  /**
   * Wait for all services to be healthy.
   */
  async waitForHealthy(
    opts: RuntimeOptions,
    timeoutMs = 60_000,
    intervalMs = 2_000,
  ): Promise<{ healthy: boolean; services: ServiceStatus[] }> {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      const services = this.status(opts);
      const hasServices = services.length > 0;
      const allHealthy = services.every(
        (s) =>
          s.status === "healthy" ||
          s.status === "running" ||
          s.healthCheck === "none",
      );

      if (hasServices && allHealthy) {
        return { healthy: true, services };
      }

      // Check for exited containers (failed)
      const failed = services.filter((s) => s.status === "exited");
      if (failed.length > 0) {
        return { healthy: false, services };
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    return { healthy: false, services: this.status(opts) };
  }

  /**
   * Build RuntimeState from current container status.
   */
  getRuntimeState(
    projectId: string,
    opts: RuntimeOptions,
  ): RuntimeState {
    return {
      projectId,
      services: this.status(opts),
      composePath: opts.composePath,
      lastChecked: new Date().toISOString(),
    };
  }

  /**
   * Check if docker compose file exists at path.
   */
  composeExists(projectDir: string): string | null {
    const candidates = [
      "docker-compose.yml",
      "docker-compose.yaml",
      "compose.yml",
      "compose.yaml",
    ];
    for (const name of candidates) {
      const p = path.join(projectDir, name);
      if (fs.existsSync(p)) return p;
    }
    return null;
  }

  /**
   * Check if Docker is available.
   */
  isDockerAvailable(): boolean {
    try {
      execSync("docker info", { stdio: "pipe", timeout: 5_000 });
      return true;
    } catch {
      return false;
    }
  }
}
