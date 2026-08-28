# Changelog

Release history for `repo-health-mcp-typescript`. Keep entries user-facing and update this file before
tagging a release.

## Unreleased

- Add this first-class release history surface, README navigation, release-checklist guidance, and
  deterministic docs regression coverage.

## 0.1.0 - Initial Public Baseline

- Add the TypeScript stdio MCP server with the deterministic `repo_health_summary` tool for local
  checkout inspection.
- Document the output contract, MCP client setup, first-summary path, packaged install flow, and
  published artifact install flow.
- Add contributor, security, support, bug-report, and health-signal proposal surfaces for GitHub
  visitors.
- Package the built `repo-health-mcp` executable with `dist`, `README.md`, and `docs` for release
  consumption.
- Keep clean non-Node repositories from being marked unhealthy solely for missing Node or TypeScript
  project files while preserving those signals as metadata.
