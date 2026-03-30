# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

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

- Stores all data in a local SQLite database
- Does not transmit stack data to any external service
- Does not collect telemetry or usage analytics
- Does not require authentication for local use
- Only makes external API calls when explicitly using `stackweld ai` commands (requires user-provided API key)

### API Key Security

If you use the AI features (`stackweld ai`), your Anthropic API key is:
- Stored in the `ANTHROPIC_API_KEY` environment variable (never persisted to disk by Stackweld)
- Sent only to the Anthropic API endpoint
- Never logged, cached, or transmitted elsewhere

### Docker Security

When using runtime features (`stackweld up`), Stackweld generates Docker Compose files. Review the generated `docker-compose.yml` before running in production environments. Default configurations use development-appropriate settings (e.g., simple passwords) that should be hardened for production use.
