/**
 * Environment Analyzer — Sync .env files and detect dangerous values.
 */

export interface EnvVar {
  key: string;
  value: string;
  line: number;
}

export interface EnvSyncResult {
  missing: string[];
  extra: string[];
  dangerous: EnvDangerousVar[];
  total: { example: number; actual: number };
}

export interface EnvDangerousVar {
  key: string;
  value: string;
  reason: string;
}

// ─── Dangerous value patterns ──────────────────────────

const PLACEHOLDER_PATTERNS = [
  /change[-_]?me/i,
  /changeme/i,
  /replace/i,
  /your[-_]/i,
  /xxx/i,
  /todo/i,
];

const SENSITIVE_KEY_PATTERNS = [/SECRET/i, /KEY/i, /PASSWORD/i, /TOKEN/i];
const MIN_SECRET_LENGTH = 16;

const DEFAULT_PASSWORDS = new Set(["postgres", "admin", "root", "password", "123456"]);

// ─── Public functions ──────────────────────────────────

/**
 * Parse a .env file content into an array of key/value pairs.
 * Skips blank lines and comments (lines starting with #).
 */
export function parseEnvFile(content: string): EnvVar[] {
  const vars: EnvVar[] = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (raw === "" || raw.startsWith("#")) continue;

    const eqIndex = raw.indexOf("=");
    if (eqIndex === -1) continue;

    const key = raw.slice(0, eqIndex).trim();
    let value = raw.slice(eqIndex + 1).trim();

    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) {
      vars.push({ key, value, line: i + 1 });
    }
  }

  return vars;
}

/**
 * Compare .env.example against .env and detect mismatches.
 */
export function syncEnv(exampleContent: string, actualContent: string): EnvSyncResult {
  const exampleVars = parseEnvFile(exampleContent);
  const actualVars = parseEnvFile(actualContent);

  const exampleKeys = new Set(exampleVars.map((v) => v.key));
  const actualKeys = new Set(actualVars.map((v) => v.key));

  const missing: string[] = [];
  for (const key of exampleKeys) {
    if (!actualKeys.has(key)) {
      missing.push(key);
    }
  }

  const extra: string[] = [];
  for (const key of actualKeys) {
    if (!exampleKeys.has(key)) {
      extra.push(key);
    }
  }

  const dangerous = checkDangerous(actualVars);

  return {
    missing,
    extra,
    dangerous,
    total: { example: exampleVars.length, actual: actualVars.length },
  };
}

/**
 * Detect environment variables with insecure or placeholder values.
 */
export function checkDangerous(vars: EnvVar[]): EnvDangerousVar[] {
  const results: EnvDangerousVar[] = [];

  for (const v of vars) {
    const reason = detectDanger(v);
    if (reason) {
      results.push({ key: v.key, value: v.value, reason });
    }
  }

  return results;
}

function detectDanger(v: EnvVar): string | null {
  // Check placeholder patterns
  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(v.value)) {
      return "Placeholder detected";
    }
  }

  // Check default passwords
  if (DEFAULT_PASSWORDS.has(v.value.toLowerCase())) {
    return "Default password";
  }

  // Check DEBUG enabled
  if (v.key.toUpperCase().includes("DEBUG") && (v.value === "true" || v.value === "1")) {
    return "Debug enabled";
  }

  // Check short secrets
  const isSensitiveKey = SENSITIVE_KEY_PATTERNS.some((p) => p.test(v.key));
  if (isSensitiveKey && v.value.length > 0 && v.value.length < MIN_SECRET_LENGTH) {
    return `Secret too short (${v.value.length} chars, minimum ${MIN_SECRET_LENGTH})`;
  }

  // Check DATABASE_URL with localhost
  if (v.key === "DATABASE_URL" && v.value.includes("localhost")) {
    return "Database URL points to localhost";
  }

  return null;
}
