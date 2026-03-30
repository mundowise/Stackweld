/**
 * Performance Profiler — Estimates performance characteristics of a tech stack.
 */

import type { Technology, TechnologyCategory } from "../types/technology.js";

// ─── Types ────────────────────────────────────────────

export interface TechPerformance {
  id: string;
  name: string;
  category: TechnologyCategory;
  perf: "fast" | "moderate" | "heavy";
  note: string;
}

export interface PerformanceProfile {
  stackName: string;
  rating: "blazing" | "fast" | "moderate" | "heavy";
  estimatedReqPerSec: string;
  estimatedColdStart: string;
  estimatedMemory: string;
  notes: string[];
  techProfiles: TechPerformance[];
}

// ─── Knowledge Maps ───────────────────────────────────

const RUNTIME_PERF: Record<string, { perf: TechPerformance["perf"]; note: string }> = {
  go: { perf: "fast", note: "Compiled, goroutines, minimal GC pause" },
  rust: { perf: "fast", note: "Zero-cost abstractions, no GC" },
  bun: { perf: "fast", note: "Native-speed JS runtime with built-in bundler" },
  nodejs: { perf: "moderate", note: "V8 JIT, single-threaded event loop" },
  deno: { perf: "moderate", note: "V8 JIT, secure by default" },
  python: { perf: "heavy", note: "Interpreted, GIL limits concurrency" },
  php: { perf: "heavy", note: "Process-per-request model, opcache helps" },
};

const FRAMEWORK_PERF: Record<string, { perf: TechPerformance["perf"]; note: string }> = {
  fastify: { perf: "fast", note: "Schema-based serialization, low overhead" },
  hono: { perf: "fast", note: "Ultra-lightweight, works on edge runtimes" },
  gin: { perf: "fast", note: "High-performance Go HTTP framework" },
  echo: { perf: "fast", note: "Minimal Go framework, fast router" },
  fastapi: { perf: "fast", note: "Async Python with Starlette + Pydantic" },
  actix: { perf: "fast", note: "Rust actor framework, top benchmark scores" },
  express: { perf: "moderate", note: "Mature middleware stack, moderate throughput" },
  nestjs: { perf: "moderate", note: "Decorator-heavy, adds abstraction overhead" },
  django: { perf: "moderate", note: "Batteries-included, ORM adds overhead" },
  flask: { perf: "moderate", note: "Minimal but synchronous by default" },
  nextjs: { perf: "moderate", note: "SSR/SSG adds build complexity" },
  nuxt: { perf: "moderate", note: "Vue SSR framework, similar profile to Next" },
  remix: { perf: "moderate", note: "Nested routes, server-first rendering" },
  laravel: { perf: "moderate", note: "Full PHP framework, Eloquent ORM overhead" },
  sveltekit: { perf: "moderate", note: "Compiled output is fast, SSR moderate" },
};

const DATABASE_PERF: Record<string, { perf: TechPerformance["perf"]; note: string }> = {
  redis: { perf: "fast", note: "In-memory, sub-millisecond latency" },
  sqlite: { perf: "fast", note: "Embedded, zero network overhead" },
  postgresql: { perf: "moderate", note: "ACID-compliant, excellent query planner" },
  mysql: { perf: "moderate", note: "Widely optimized, good read performance" },
  mongodb: { perf: "moderate", note: "Document store, flexible but heavier writes" },
  mariadb: { perf: "moderate", note: "MySQL fork, comparable performance" },
};

const SERVICE_PERF: Record<string, { perf: TechPerformance["perf"]; note: string }> = {
  grafana: { perf: "heavy", note: "Dashboard rendering, query aggregation" },
  prometheus: { perf: "heavy", note: "Time-series storage, scraping overhead" },
  elasticsearch: { perf: "heavy", note: "JVM-based, memory-intensive indexing" },
  rabbitmq: { perf: "moderate", note: "Erlang-based message broker" },
  kafka: { perf: "moderate", note: "High-throughput streaming, JVM overhead" },
  nginx: { perf: "fast", note: "Event-driven, very low resource usage" },
  traefik: { perf: "fast", note: "Go-based reverse proxy, auto-discovery" },
};

const ALL_PERF_MAPS: Record<
  string,
  Record<string, { perf: TechPerformance["perf"]; note: string }>
> = {
  runtime: RUNTIME_PERF,
  backend: FRAMEWORK_PERF,
  frontend: FRAMEWORK_PERF,
  database: DATABASE_PERF,
  service: SERVICE_PERF,
};

// ─── Benchmark Estimates ──────────────────────────────

interface BenchmarkKey {
  runtime?: string;
  framework?: string;
  database?: string;
}

const BENCHMARKS: Array<{
  match: BenchmarkKey;
  reqPerSec: string;
  coldStart: string;
  memory: string;
}> = [
  {
    match: { runtime: "rust", framework: "actix", database: "postgresql" },
    reqPerSec: "~30k req/s",
    coldStart: "~50ms",
    memory: "~32MB",
  },
  {
    match: { runtime: "go", framework: "gin", database: "postgresql" },
    reqPerSec: "~25k req/s",
    coldStart: "~80ms",
    memory: "~48MB",
  },
  {
    match: { runtime: "go", framework: "echo", database: "postgresql" },
    reqPerSec: "~25k req/s",
    coldStart: "~80ms",
    memory: "~48MB",
  },
  {
    match: { runtime: "bun", framework: "hono", database: "postgresql" },
    reqPerSec: "~20k req/s",
    coldStart: "~100ms",
    memory: "~64MB",
  },
  {
    match: { runtime: "nodejs", framework: "fastify", database: "postgresql" },
    reqPerSec: "~15k req/s",
    coldStart: "~200ms",
    memory: "~128MB",
  },
  {
    match: { runtime: "nodejs", framework: "express", database: "postgresql" },
    reqPerSec: "~8k req/s",
    coldStart: "~300ms",
    memory: "~128MB",
  },
  {
    match: { runtime: "nodejs", framework: "nestjs", database: "postgresql" },
    reqPerSec: "~6k req/s",
    coldStart: "~500ms",
    memory: "~192MB",
  },
  {
    match: { runtime: "python", framework: "fastapi", database: "postgresql" },
    reqPerSec: "~5k req/s",
    coldStart: "~400ms",
    memory: "~128MB",
  },
  {
    match: { runtime: "python", framework: "django", database: "postgresql" },
    reqPerSec: "~2k req/s",
    coldStart: "~600ms",
    memory: "~192MB",
  },
  {
    match: { runtime: "python", framework: "flask", database: "postgresql" },
    reqPerSec: "~3k req/s",
    coldStart: "~400ms",
    memory: "~128MB",
  },
  {
    match: { runtime: "php", framework: "laravel", database: "mysql" },
    reqPerSec: "~1.5k req/s",
    coldStart: "~500ms",
    memory: "~192MB",
  },
  // Partial matches (no database)
  {
    match: { runtime: "go", framework: "gin" },
    reqPerSec: "~40k req/s",
    coldStart: "~50ms",
    memory: "~32MB",
  },
  {
    match: { runtime: "rust", framework: "actix" },
    reqPerSec: "~50k req/s",
    coldStart: "~30ms",
    memory: "~16MB",
  },
  {
    match: { runtime: "nodejs", framework: "fastify" },
    reqPerSec: "~25k req/s",
    coldStart: "~150ms",
    memory: "~96MB",
  },
  {
    match: { runtime: "nodejs", framework: "express" },
    reqPerSec: "~12k req/s",
    coldStart: "~200ms",
    memory: "~96MB",
  },
  {
    match: { runtime: "python", framework: "fastapi" },
    reqPerSec: "~8k req/s",
    coldStart: "~300ms",
    memory: "~96MB",
  },
];

// ─── Rating Logic ─────────────────────────────────────

const PERF_RANK: Record<TechPerformance["perf"], number> = {
  fast: 3,
  moderate: 2,
  heavy: 1,
};

function perfToRating(perf: TechPerformance["perf"]): PerformanceProfile["rating"] {
  switch (perf) {
    case "fast":
      return "blazing";
    case "moderate":
      return "fast";
    case "heavy":
      return "moderate";
  }
}

function worstPerf(perfs: TechPerformance["perf"][]): TechPerformance["perf"] {
  if (perfs.length === 0) return "moderate";
  let worst: TechPerformance["perf"] = "fast";
  for (const p of perfs) {
    if (PERF_RANK[p] < PERF_RANK[worst]) worst = p;
  }
  return worst;
}

// ─── Main Function ────────────────────────────────────

export function profilePerformance(technologies: Technology[]): PerformanceProfile {
  const techProfiles: TechPerformance[] = [];
  const criticalPerfs: TechPerformance["perf"][] = [];
  const notes: string[] = [];

  // Identify key components
  let runtimeId: string | undefined;
  let frameworkId: string | undefined;
  let databaseId: string | undefined;

  for (const tech of technologies) {
    const perfMap = ALL_PERF_MAPS[tech.category];
    const entry = perfMap?.[tech.id];

    if (entry) {
      techProfiles.push({
        id: tech.id,
        name: tech.name,
        category: tech.category,
        perf: entry.perf,
        note: entry.note,
      });

      // Track critical path components
      if (
        tech.category === "runtime" ||
        tech.category === "backend" ||
        tech.category === "database"
      ) {
        criticalPerfs.push(entry.perf);
      }
    } else {
      // Unknown tech — assume moderate
      techProfiles.push({
        id: tech.id,
        name: tech.name,
        category: tech.category,
        perf: "moderate",
        note: "No benchmark data available",
      });
    }

    if (tech.category === "runtime") runtimeId = tech.id;
    if (tech.category === "backend") frameworkId = tech.id;
    if (tech.category === "database") databaseId = tech.id;
  }

  // Overall rating based on slowest critical-path component
  const worst = worstPerf(criticalPerfs);
  const rating = criticalPerfs.length > 0 ? perfToRating(worst) : "moderate";

  // Build stack name
  const stackName = technologies.map((t) => t.name).join(" + ");

  // Find matching benchmark
  let estimatedReqPerSec = "Varies by implementation";
  let estimatedColdStart = "N/A";
  let estimatedMemory = "N/A";

  // Try exact match first, then partial
  const matchKey: BenchmarkKey = {
    runtime: runtimeId,
    framework: frameworkId,
    database: databaseId,
  };

  let bestMatch: (typeof BENCHMARKS)[number] | undefined;
  let bestMatchScore = 0;

  for (const bench of BENCHMARKS) {
    let score = 0;
    let valid = true;

    for (const [key, value] of Object.entries(bench.match)) {
      const actual = matchKey[key as keyof BenchmarkKey];
      if (value && actual === value) {
        score++;
      } else if (value) {
        valid = false;
        break;
      }
    }

    if (valid && score > bestMatchScore) {
      bestMatch = bench;
      bestMatchScore = score;
    }
  }

  if (bestMatch) {
    estimatedReqPerSec = bestMatch.reqPerSec;
    estimatedColdStart = bestMatch.coldStart;
    estimatedMemory = bestMatch.memory;
  }

  // Generate notes
  const fastTechs = techProfiles.filter((t) => t.perf === "fast");
  const heavyTechs = techProfiles.filter((t) => t.perf === "heavy");

  if (fastTechs.length > 0 && heavyTechs.length === 0) {
    notes.push("All components are high-performance — excellent stack choice.");
  }
  if (heavyTechs.length > 0) {
    notes.push(`Bottleneck: ${heavyTechs.map((t) => t.name).join(", ")} may limit throughput.`);
  }
  if (runtimeId && !frameworkId) {
    notes.push("No framework detected — raw runtime performance may differ with framework choice.");
  }
  if (!databaseId) {
    notes.push("No database detected — estimates assume compute-only workload.");
  }
  if (rating === "blazing") {
    notes.push("This stack is suitable for high-traffic production workloads.");
  }

  return {
    stackName,
    rating,
    estimatedReqPerSec,
    estimatedColdStart,
    estimatedMemory,
    notes,
    techProfiles,
  };
}
