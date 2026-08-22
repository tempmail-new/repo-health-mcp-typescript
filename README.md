# repo-health-mcp-typescript

TypeScript stdio MCP server for deterministic local repository health summaries.

## Tool

`repo_health_summary` accepts a local checkout directory and returns a compact JSON summary:

- git repository root, branch, short commit, dirty state, and porcelain counts
- project name, package manager, npm scripts, and expected repository files
- health level plus deterministic reasons when the checkout needs attention

The tool reads local files and git metadata only. It does not install dependencies, call remote services,
or mutate the target checkout.

For the exact returned JSON shape and health semantics, see
[docs/repo-health-summary-contract.md](docs/repo-health-summary-contract.md).
For a shortest path from a built server to one interpreted result, see
[docs/first-summary-quickstart.md](docs/first-summary-quickstart.md).

## Run

```bash
npm ci
npm run build
npm start
```

During development:

```bash
npm run dev
```

For MCP client configuration, see [docs/mcp-client-setup.md](docs/mcp-client-setup.md).

## Validation

```bash
npm run fmt:check
npm run lint
npm test
npm run build
```

## Project Maintenance

- See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, validation order, and contribution hygiene.
- See [docs/release-checklist.md](docs/release-checklist.md) for versioning, validation, package
  dry-run, and tagging expectations.
- See [SECURITY.md](SECURITY.md) for supported security reporting scope and private disclosure guidance.
- See [SUPPORT.md](SUPPORT.md) for usage questions, bug reports, feature proposals, and security routing.

## Architecture

See [docs/architecture.md](docs/architecture.md) for the stdio transport boundary, local checkout
inspection model, and health summary contract.
