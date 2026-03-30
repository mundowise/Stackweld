/**
 * JSON Schema for technology YAML files.
 * Validated with ajv on load.
 */

export const technologySchema = {
  type: "object",
  required: [
    "id",
    "name",
    "category",
    "description",
    "website",
    "versions",
    "defaultVersion",
    "requires",
    "incompatibleWith",
    "suggestedWith",
    "envVars",
    "configFiles",
    "lastVerified",
    "tags",
  ],
  properties: {
    id: { type: "string", pattern: "^[a-z][a-z0-9-]*$" },
    name: { type: "string", minLength: 1 },
    category: {
      type: "string",
      enum: [
        "runtime",
        "frontend",
        "backend",
        "database",
        "orm",
        "auth",
        "styling",
        "service",
        "devops",
      ],
    },
    description: { type: "string" },
    website: { type: "string" },
    versions: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["version"],
        properties: {
          version: { type: "string" },
          eol: { type: "string" },
          lts: { type: "boolean" },
        },
      },
    },
    defaultVersion: { type: "string" },
    defaultPort: { type: "integer", minimum: 1, maximum: 65535 },
    requires: { type: "array", items: { type: "string" } },
    incompatibleWith: { type: "array", items: { type: "string" } },
    suggestedWith: { type: "array", items: { type: "string" } },
    officialScaffold: { type: ["string", "null"] },
    dockerImage: { type: ["string", "null"] },
    healthCheck: {
      type: "object",
      properties: {
        command: { type: "string" },
        endpoint: { type: "string" },
        interval: { type: "string" },
        timeout: { type: "string" },
        retries: { type: "integer" },
      },
    },
    envVars: { type: "object", additionalProperties: { type: "string" } },
    configFiles: { type: "array", items: { type: "string" } },
    lastVerified: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
  },
  additionalProperties: false,
} as const;
