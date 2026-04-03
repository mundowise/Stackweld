# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.3.x   | :white_check_mark: |
| 0.2.x   | :x:                |
| 0.1.x   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in Stackweld, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, email us at **security@xplustechnologies.com** with:

1. A description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)

We will acknowledge your report within 48 hours and provide a timeline for a fix.

## Security Considerations

Stackweld is a local-first development tool. It:

- Stores all data in a local SQLite database (`~/.stackweld/stackweld.db`)
- Does not transmit stack data to any external service
- Does not collect telemetry or usage analytics
- Does not require authentication for local use
- Only makes external API calls when explicitly using `stackweld ai` commands (requires user-provided API key)

### Shell Execution Security

Stackweld executes external commands to scaffold projects (e.g., `npx create-next-app`, `cargo init`). All command execution follows these rules:

- **`execFileSync` is used exclusively** — no shell interpolation, preventing command injection
- Scaffold commands are validated against an **allowlist of safe binaries** (`npx`, `npm`, `pnpm`, `bun`, `cargo`, `go`, `python3`, etc.)
- Project names are validated with a strict regex (`^[a-zA-Z0-9_.-]+$`) before use in any command
- Docker service names are validated before passing to `docker compose` commands
- All exec calls must use `execFileSync` with array arguments — this is enforced in code review

### API Key Security

If you use the AI features (`stackweld ai`), your Anthropic API key is:
- Stored in the `ANTHROPIC_API_KEY` environment variable (never persisted to disk by Stackweld)
- Sent only to the Anthropic API endpoint
- Never logged, cached, or transmitted elsewhere

### Generated Secrets

Stackweld generates cryptographically secure random secrets (via `crypto.randomBytes`) for all `.env.example` files. Default weak passwords like `postgres` or `root` are never used in generated configurations. Rotate all secrets before deploying to production.

### Docker Security

When using runtime features (`stackweld up`), Stackweld generates Docker Compose files. Review the generated `docker-compose.yml` before running in production environments.

### Plugin Security

The plugin system currently loads plugins as **static JSON data only** — no dynamic code execution. Plugin `handler` fields are reserved for future use and are not executed. Before any future dynamic plugin execution is implemented, a sandboxing model will be established.
