# Security Policy

## Supported Scope

Security reports should focus on this repository's MCP server, local checkout inspection behavior,
published package metadata, and validation workflow.

The tool is intended to read local files and git metadata only. It should not mutate inspected
checkouts, install dependencies, or call remote services while summarizing repository health.

## Reporting A Vulnerability

Please do not disclose suspected vulnerabilities in public issues or pull requests.

Report privately through GitHub's private vulnerability reporting for this repository when available.
Include:

- affected version or commit
- reproduction steps
- expected and actual behavior
- any known impact to local files, credentials, or inspected repositories

Avoid sharing real secrets, private tokens, or sensitive repository content in the report. Redacted
examples are preferred.

## Response Expectations

Security reports are triaged for reproducibility, impact, and whether the behavior fits the supported
scope. Fixes should include tests or documentation updates when they change the public contract.
