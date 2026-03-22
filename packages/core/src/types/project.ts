/**
 * Project Instance — A stack materialized on disk.
 * Created by the Scaffold Orchestrator.
 */

export interface ProjectInstance {
  id: string;
  stackId: string;
  name: string;
  path: string; // Absolute path on disk
  createdAt: string;
  lastOpenedAt?: string;
  templateId?: string; // Template used to create it
}

/**
 * Runtime State — Live state of a running project.
 * Containers, ports, health checks, processes.
 */

export interface ServiceStatus {
  name: string;
  technologyId: string;
  containerId?: string;
  status: "running" | "healthy" | "unhealthy" | "exited" | "stopped" | "not_started";
  port?: number;
  healthCheck?: "passing" | "failing" | "none";
  uptime?: number; // seconds
}

export interface RuntimeState {
  projectId: string;
  services: ServiceStatus[];
  composePath?: string; // Path to docker-compose.yml
  lastChecked: string;
}
