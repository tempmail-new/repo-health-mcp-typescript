# repo-health-mcp-typescript

TypeScript stdio MCP server for deterministic local repository health summaries.

## Tool

`repo_health_summary` accepts a local checkout directory and returns a compact JSON summary:

- git repository root, branch, short commit, dirty state, and porcelain counts
- project name, package manager, npm scripts, and expected repository files
- health level plus deterministic reasons when the checkout needs attention

The tool reads local files and git metadata only. It does not install dependencies, call remote services,
or mutate the target checkout.

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

## Validation

```bash
npm run fmt:check
npm run lint
npm test
npm run build
```

## Architecture

See [docs/architecture.md](docs/architecture.md) for the stdio transport boundary, local checkout
inspection model, and health summary contract.
