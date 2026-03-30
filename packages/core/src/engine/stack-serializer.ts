/**
 * Stack Serializer — Compress/decompress stack definitions into URL-safe strings.
 * Uses zlib deflate + base64url encoding. No server needed.
 */

import { deflateSync, inflateSync } from "zlib";

export interface ShareableStack {
  name: string;
  profile: string;
  technologies: Array<{ id: string; version?: string; port?: number }>;
}

const DEFAULT_BASE_URL = "https://stackpilot.dev/s/#";

/**
 * Compress a stack into a URL-safe base64 string.
 * Flow: JSON → deflate → base64url
 */
export function serializeStack(stack: ShareableStack): string {
  const json = JSON.stringify({
    n: stack.name,
    p: stack.profile,
    t: stack.technologies.map((t) => {
      const entry: Record<string, unknown> = { i: t.id };
      if (t.version) entry.v = t.version;
      if (t.port) entry.p = t.port;
      return entry;
    }),
  });

  const compressed = deflateSync(Buffer.from(json, "utf-8"));
  return toBase64Url(compressed);
}

/**
 * Decompress from a base64url string back to a stack definition.
 * Flow: base64url → inflate → JSON
 */
export function deserializeStack(encoded: string): ShareableStack {
  const buffer = fromBase64Url(encoded);
  const json = inflateSync(buffer).toString("utf-8");

  const data = JSON.parse(json) as {
    n: string;
    p: string;
    t: Array<{ i: string; v?: string; p?: number }>;
  };

  return {
    name: data.n,
    profile: data.p,
    technologies: data.t.map((t) => ({
      id: t.i,
      version: t.v,
      port: t.p,
    })),
  };
}

/**
 * Generate a full shareable URL for a stack.
 */
export function generateShareUrl(
  stack: ShareableStack,
  baseUrl: string = DEFAULT_BASE_URL,
): string {
  return `${baseUrl}${serializeStack(stack)}`;
}

/**
 * Extract the encoded payload from a share URL.
 */
export function extractFromShareUrl(url: string): string {
  const hashIndex = url.indexOf("#");
  if (hashIndex === -1) {
    throw new Error("Invalid share URL: no hash fragment found.");
  }
  return url.substring(hashIndex + 1);
}

// ─── Base64url helpers ────────────────────────────────

function toBase64Url(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(str: string): Buffer {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  // Add padding
  const pad = base64.length % 4;
  if (pad === 2) base64 += "==";
  else if (pad === 3) base64 += "=";
  return Buffer.from(base64, "base64");
}
