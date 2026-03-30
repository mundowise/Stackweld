/**
 * Compose Generator — Pure function that generates docker-compose.yml content.
 * No disk I/O — returns structured data for preview or writing.
 */

export interface ComposePreviewResult {
  yaml: string;
  services: string[];
  ports: Record<string, number>;
  volumes: string[];
}

interface ComposeTechnology {
  id: string;
  name: string;
  category?: string;
  dockerImage?: string;
  defaultPort?: number;
  envVars?: Record<string, string>;
  healthCheck?: {
    endpoint?: string;
    command?: string;
    interval?: string;
    timeout?: string;
    retries?: number;
  };
  port?: number; // Override port from stack definition
}

const DATA_MOUNTS: Record<string, string> = {
  postgresql: "/var/lib/postgresql/data",
  mysql: "/var/lib/mysql",
  mongodb: "/data/db",
  redis: "/data",
};

/**
 * Generate a docker-compose.yml preview from a list of technologies.
 * Only includes technologies that have a `dockerImage`.
 */
export function generateComposePreview(
  technologies: ComposeTechnology[],
  projectName: string,
): ComposePreviewResult {
  const services: string[] = [];
  const ports: Record<string, number> = {};
  const volumes: string[] = [];
  const lines: string[] = ["services:"];

  const networkName = `${projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-")}_net`;

  for (const tech of technologies) {
    if (!tech.dockerImage) continue;

    services.push(tech.id);
    const port = tech.port ?? tech.defaultPort;

    lines.push(`  ${tech.id}:`);
    lines.push(`    image: ${tech.dockerImage}`);
    lines.push("    restart: unless-stopped");

    // Ports
    if (port) {
      lines.push("    ports:");
      lines.push(`      - "${port}:${port}"`);
      ports[tech.id] = port;
    }

    // Environment variables
    const envVars = tech.envVars ? Object.entries(tech.envVars) : [];
    if (envVars.length > 0) {
      lines.push("    environment:");
      for (const [key, value] of envVars) {
        lines.push(`      ${key}: "${value}"`);
      }
    }

    // Health check
    if (tech.healthCheck) {
      lines.push("    healthcheck:");
      if (tech.healthCheck.command) {
        lines.push(`      test: ["CMD-SHELL", "${tech.healthCheck.command}"]`);
      } else if (tech.healthCheck.endpoint) {
        lines.push(`      test: ["CMD-SHELL", "curl -f ${tech.healthCheck.endpoint} || exit 1"]`);
      }
      if (tech.healthCheck.interval) {
        lines.push(`      interval: ${tech.healthCheck.interval}`);
      }
      if (tech.healthCheck.timeout) {
        lines.push(`      timeout: ${tech.healthCheck.timeout}`);
      }
      if (tech.healthCheck.retries) {
        lines.push(`      retries: ${tech.healthCheck.retries}`);
      }
    }

    // Volumes for databases
    const mountPath = DATA_MOUNTS[tech.id];
    if (mountPath && tech.category === "database") {
      const volName = `${tech.id}_data`;
      lines.push("    volumes:");
      lines.push(`      - ${volName}:${mountPath}`);
      volumes.push(volName);
    }

    // Network
    lines.push("    networks:");
    lines.push(`      - ${networkName}`);

    lines.push("");
  }

  // Named volumes
  if (volumes.length > 0) {
    lines.push("volumes:");
    for (const vol of volumes) {
      lines.push(`  ${vol}:`);
    }
    lines.push("");
  }

  // Network
  lines.push("networks:");
  lines.push(`  ${networkName}:`);
  lines.push("    driver: bridge");
  lines.push("");

  return {
    yaml: lines.join("\n"),
    services,
    ports,
    volumes,
  };
}
