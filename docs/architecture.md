# Architecture

`repo-health-mcp-typescript` is a narrow stdio MCP server. It exposes one tool,
`repo_health_summary`, that reads deterministic health signals from a local checkout path.

## Boundaries

- The MCP transport is stdio only, so the server can run inside local agent clients without an HTTP listener.
- The tool accepts a local directory path and resolves it before inspection.
- Git state is read through `git` subprocesses scoped with `-C` to the resolved repository root.
- Project metadata is read from local files only. No network calls, package installs, or repository mutations happen during a summary.

## Health Model

The summary is intentionally small:

- git repository detection, branch, short commit, and porcelain working-tree counts
- optional project metadata from `package.json`
- expected repository-file presence checks for README, license, package metadata, TypeScript config,
  and CI workflows
- an `ok` or `attention` health level with deterministic reasons

Only repository-generic risks drive the health level: not being inside git, no commit, a dirty
working tree, or missing baseline README/license/workflow files. Node/TypeScript files and npm
scripts stay visible as metadata when present without making clean non-Node repositories unhealthy.

This keeps the tool useful for an agent deciding where to start without pretending to replace a full
CI run.

See [repo-health-summary-contract.md](repo-health-summary-contract.md) for the dedicated public
output contract with field-level semantics and the current health reason strings.
