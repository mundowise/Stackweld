/**
 * Cost Estimator — Estimates monthly hosting costs for a tech stack.
 */

import type { Technology } from "../types/technology.js";

// ─── Types ────────────────────────────────────────────

export interface CostItem {
  service: string;
  provider: string;
  monthlyCost: string;
  notes: string;
}

export interface CostEstimate {
  monthly: { min: number; max: number; currency: string };
  breakdown: CostItem[];
  tier: "free" | "budget" | "standard" | "premium";
  notes: string[];
}

// ─── Cost Knowledge Map ───────────────────────────────

interface CostEntry {
  min: number;
  max: number;
  items: CostItem[];
}

const DATABASE_COSTS: Record<string, CostEntry> = {
  postgresql: {
    min: 0,
    max: 30,
    items: [
      {
        service: "PostgreSQL",
        provider: "Neon (free tier)",
        monthlyCost: "$0",
        notes: "500MB storage, 0.25 CU",
      },
      {
        service: "PostgreSQL",
        provider: "Supabase (free)",
        monthlyCost: "$0",
        notes: "500MB, 2 projects",
      },
      {
        service: "PostgreSQL",
        provider: "Self-hosted VPS",
        monthlyCost: "$0-5",
        notes: "Included in VPS cost",
      },
      {
        service: "PostgreSQL",
        provider: "AWS RDS",
        monthlyCost: "$15-30/mo",
        notes: "db.t3.micro, single-AZ",
      },
    ],
  },
  mysql: {
    min: 0,
    max: 25,
    items: [
      {
        service: "MySQL",
        provider: "PlanetScale (free)",
        monthlyCost: "$0",
        notes: "5GB, 1B row reads/mo",
      },
      {
        service: "MySQL",
        provider: "Self-hosted VPS",
        monthlyCost: "$0-5",
        notes: "Included in VPS cost",
      },
      { service: "MySQL", provider: "AWS RDS", monthlyCost: "$15-25/mo", notes: "db.t3.micro" },
    ],
  },
  mariadb: {
    min: 0,
    max: 25,
    items: [
      {
        service: "MariaDB",
        provider: "Self-hosted VPS",
        monthlyCost: "$0-5",
        notes: "Included in VPS cost",
      },
      { service: "MariaDB", provider: "AWS RDS", monthlyCost: "$15-25/mo", notes: "db.t3.micro" },
    ],
  },
  mongodb: {
    min: 0,
    max: 10,
    items: [
      {
        service: "MongoDB",
        provider: "Atlas (free M0)",
        monthlyCost: "$0",
        notes: "512MB, shared cluster",
      },
      {
        service: "MongoDB",
        provider: "Self-hosted VPS",
        monthlyCost: "$5-10",
        notes: "Needs 1GB+ RAM",
      },
    ],
  },
  redis: {
    min: 0,
    max: 25,
    items: [
      {
        service: "Redis",
        provider: "Upstash (free)",
        monthlyCost: "$0",
        notes: "10k commands/day",
      },
      {
        service: "Redis",
        provider: "Self-hosted VPS",
        monthlyCost: "$0-5",
        notes: "Included in VPS cost",
      },
      {
        service: "Redis",
        provider: "AWS ElastiCache",
        monthlyCost: "$10-25/mo",
        notes: "cache.t3.micro",
      },
    ],
  },
  sqlite: {
    min: 0,
    max: 0,
    items: [
      {
        service: "SQLite",
        provider: "Embedded",
        monthlyCost: "$0",
        notes: "File-based, no server needed",
      },
    ],
  },
};

const HOSTING_COSTS: Record<string, CostEntry> = {
  docker: {
    min: 5,
    max: 50,
    items: [
      {
        service: "Docker VPS",
        provider: "Basic (Hetzner/DO)",
        monthlyCost: "$5-10/mo",
        notes: "2GB RAM, shared CPU",
      },
      {
        service: "Docker VPS",
        provider: "Production",
        monthlyCost: "$20-50/mo",
        notes: "4-8GB RAM, dedicated CPU",
      },
    ],
  },
  vercel: {
    min: 0,
    max: 20,
    items: [
      {
        service: "Vercel",
        provider: "Hobby",
        monthlyCost: "$0",
        notes: "Personal projects, 100GB bandwidth",
      },
      {
        service: "Vercel",
        provider: "Pro",
        monthlyCost: "$20/mo",
        notes: "Team features, 1TB bandwidth",
      },
    ],
  },
  aws: {
    min: 25,
    max: 60,
    items: [
      {
        service: "AWS ECS Fargate",
        provider: "AWS",
        monthlyCost: "$25-60/mo",
        notes: "0.25 vCPU, 512MB task",
      },
    ],
  },
  gcp: {
    min: 0,
    max: 30,
    items: [
      {
        service: "Cloud Run",
        provider: "GCP",
        monthlyCost: "$0-30/mo",
        notes: "Pay per use, generous free tier",
      },
    ],
  },
};

// Categories that are always free (dev tools, frontend static hosting)
const FREE_CATEGORIES = new Set(["orm", "styling", "auth", "frontend"]);

const FREE_NOTES: Record<string, string> = {
  orm: "Dev dependency, no hosting cost",
  styling: "Build-time only, no hosting cost",
  auth: "Library cost is $0, auth service may cost extra",
  frontend: "Static hosting available free (Vercel, Netlify, CF Pages)",
};

// ─── Service Costs ────────────────────────────────────

const SERVICE_COSTS: Record<string, CostEntry> = {
  grafana: {
    min: 0,
    max: 10,
    items: [
      {
        service: "Grafana",
        provider: "Self-hosted",
        monthlyCost: "$0",
        notes: "OSS, included in VPS",
      },
      {
        service: "Grafana",
        provider: "Grafana Cloud (free)",
        monthlyCost: "$0",
        notes: "10k metrics, 50GB logs",
      },
    ],
  },
  prometheus: {
    min: 0,
    max: 5,
    items: [
      {
        service: "Prometheus",
        provider: "Self-hosted",
        monthlyCost: "$0",
        notes: "OSS, included in VPS",
      },
    ],
  },
  elasticsearch: {
    min: 0,
    max: 30,
    items: [
      {
        service: "Elasticsearch",
        provider: "Elastic Cloud (free)",
        monthlyCost: "$0",
        notes: "14-day trial",
      },
      {
        service: "Elasticsearch",
        provider: "Self-hosted",
        monthlyCost: "$10-30/mo",
        notes: "Needs 2-4GB RAM",
      },
    ],
  },
  rabbitmq: {
    min: 0,
    max: 20,
    items: [
      {
        service: "RabbitMQ",
        provider: "CloudAMQP (free)",
        monthlyCost: "$0",
        notes: "Little Lemur, 1M msgs/mo",
      },
      {
        service: "RabbitMQ",
        provider: "Self-hosted",
        monthlyCost: "$5-20/mo",
        notes: "Needs 512MB+ RAM",
      },
    ],
  },
  nginx: {
    min: 0,
    max: 0,
    items: [
      {
        service: "Nginx",
        provider: "Self-hosted",
        monthlyCost: "$0",
        notes: "Included in VPS, minimal resources",
      },
    ],
  },
  traefik: {
    min: 0,
    max: 0,
    items: [
      {
        service: "Traefik",
        provider: "Self-hosted",
        monthlyCost: "$0",
        notes: "Included in Docker setup",
      },
    ],
  },
};

// ─── Tier Calculation ─────────────────────────────────

function calculateTier(min: number, max: number): CostEstimate["tier"] {
  const avg = (min + max) / 2;
  if (avg === 0) return "free";
  if (avg < 20) return "budget";
  if (avg <= 60) return "standard";
  return "premium";
}

// ─── Main Function ────────────────────────────────────

export function estimateCost(technologies: Technology[]): CostEstimate {
  const breakdown: CostItem[] = [];
  let totalMin = 0;
  let totalMax = 0;
  const notes: string[] = [];

  let hasDocker = false;
  let hasHostingPlatform = false;
  let hasDatabase = false;
  let hasFrontend = false;

  for (const tech of technologies) {
    // Check for Docker
    if (tech.id === "docker" || tech.dockerImage) {
      hasDocker = true;
    }

    // Free categories
    if (FREE_CATEGORIES.has(tech.category)) {
      if (tech.category === "frontend") hasFrontend = true;
      breakdown.push({
        service: tech.name,
        provider: "N/A",
        monthlyCost: "$0",
        notes: FREE_NOTES[tech.category] || "No hosting cost",
      });
      continue;
    }

    // Database costs
    if (tech.category === "database") {
      hasDatabase = true;
      const dbCost = DATABASE_COSTS[tech.id];
      if (dbCost) {
        totalMin += dbCost.min;
        totalMax += dbCost.max;
        breakdown.push(...dbCost.items);
      } else {
        breakdown.push({
          service: tech.name,
          provider: "Self-hosted",
          monthlyCost: "$5-15/mo",
          notes: "Estimated for unknown database",
        });
        totalMin += 5;
        totalMax += 15;
      }
      continue;
    }

    // Service costs
    if (tech.category === "service") {
      const svcCost = SERVICE_COSTS[tech.id];
      if (svcCost) {
        totalMin += svcCost.min;
        totalMax += svcCost.max;
        breakdown.push(...svcCost.items);
      } else {
        breakdown.push({
          service: tech.name,
          provider: "Varies",
          monthlyCost: "$0-20/mo",
          notes: "Cost depends on provider and usage",
        });
        totalMax += 20;
      }
      continue;
    }

    // Hosting platforms (devops category)
    if (tech.category === "devops") {
      const hostCost = HOSTING_COSTS[tech.id];
      if (hostCost) {
        hasHostingPlatform = true;
        totalMin += hostCost.min;
        totalMax += hostCost.max;
        breakdown.push(...hostCost.items);
      }
      continue;
    }

    // Runtime / backend frameworks — no direct cost, but need hosting
    if (tech.category === "runtime" || tech.category === "backend") {
    }
  }

  // If there's a backend/runtime but no hosting platform, add default VPS estimate
  const hasBackend = technologies.some((t) => t.category === "runtime" || t.category === "backend");
  if (hasBackend && !hasHostingPlatform) {
    if (hasDocker) {
      totalMin += 5;
      totalMax += 50;
      breakdown.push(
        {
          service: "Docker VPS",
          provider: "Basic (Hetzner/DO)",
          monthlyCost: "$5-10/mo",
          notes: "2GB RAM, shared CPU",
        },
        {
          service: "Docker VPS",
          provider: "Production",
          monthlyCost: "$20-50/mo",
          notes: "4-8GB RAM, dedicated CPU",
        },
      );
    } else {
      totalMin += 0;
      totalMax += 20;
      breakdown.push(
        {
          service: "Hosting",
          provider: "Vercel/Netlify (free)",
          monthlyCost: "$0",
          notes: "Serverless, limited",
        },
        {
          service: "Hosting",
          provider: "VPS (basic)",
          monthlyCost: "$5-20/mo",
          notes: "Small cloud instance",
        },
      );
    }
  }

  // Frontend static hosting
  if (hasFrontend && !hasHostingPlatform) {
    breakdown.push({
      service: "Static hosting",
      provider: "Vercel/Netlify/CF Pages",
      monthlyCost: "$0",
      notes: "Free tier covers most projects",
    });
  }

  // Domain + SSL
  totalMin += 1;
  totalMax += 1;
  breakdown.push({
    service: "Domain + SSL",
    provider: "Namecheap/Cloudflare",
    monthlyCost: "~$1/mo",
    notes: "$10-15/yr domain, free SSL via Let's Encrypt",
  });

  // Notes
  if (!hasDatabase) {
    notes.push("No database detected — add one if your app needs persistence.");
  }
  if (hasDocker) {
    notes.push("Docker detected — VPS hosting recommended for full control.");
  }
  if (totalMin === 0 || (totalMin <= 1 && !hasDatabase)) {
    notes.push("This stack can run entirely on free tiers for development and small projects.");
  }
  if (totalMax > 60) {
    notes.push("Production costs can be reduced with reserved instances or spot pricing.");
  }

  const tier = calculateTier(totalMin, totalMax);

  return {
    monthly: { min: totalMin, max: totalMax, currency: "USD" },
    breakdown,
    tier,
    notes,
  };
}
