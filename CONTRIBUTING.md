# Contributing

Thanks for helping improve `repo-health-mcp-typescript`. Keep changes small, deterministic, and tied
to the local repository-health workflow.

## Local Setup

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

Run the same checks before opening a pull request:

```bash
npm run fmt:check
npm run lint
npm test
npm run build
```

Use `npm run fmt` when formatting fails.

## Contribution Guidelines

- Keep the MCP tool local-only: do not add network calls, dependency installation, or checkout
  mutation to repository inspection.
- Prefer deterministic output and tests over heuristics that depend on machine-specific state.
- Document any new summary fields in the README and architecture note.
- Do not commit credentials, personal access tokens, private repository paths, or generated local
  state.
