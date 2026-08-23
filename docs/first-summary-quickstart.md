# First Summary Quickstart

This quickstart takes a built `repo-health-mcp-typescript` checkout to one interpreted
`repo_health_summary` result for a local repository.

## Prepare The Server

From this repository:

```bash
npm ci
npm run build
```

Add the built stdio server to an MCP client by following
[mcp-client-setup.md](mcp-client-setup.md). Restart the client after updating its configuration.

## Call The Tool

Ask the MCP client to call `repo_health_summary` with the checkout you want to inspect:

```json
{
  "checkoutPath": "/absolute/path/to/target-repository"
}
```

Use an absolute `checkoutPath` for the first run. Relative paths resolve from the server process,
which may not be the same directory as the client interface.

## Read An `ok` Result

An `ok` result means the current checks found no missing baseline signals:

```json
{
  "schemaVersion": "1",
  "git": {
    "isRepository": true,
    "branch": "main",
    "head": "99b478ab29a5",
    "dirty": false,
    "staged": 0,
    "unstaged": 0,
    "untracked": 0,
    "conflicted": 0
  },
  "project": {
    "name": "example-service",
    "scripts": ["build", "lint", "test"]
  },
  "health": {
    "level": "ok",
    "reasons": []
  }
}
```

For an `ok` repository, start with `git.branch` and `git.head` to anchor any follow-up work to the
inspected commit. When `project.scripts` is present, use it to identify likely validation commands.

## Read An `attention` Result

An `attention` result means at least one deterministic reason needs review:

```json
{
  "git": {
    "isRepository": true,
    "dirty": true,
    "staged": 0,
    "unstaged": 1,
    "untracked": 0,
    "conflicted": 0
  },
  "project": {
    "scripts": ["test"]
  },
  "health": {
    "level": "attention",
    "reasons": [
      "git working tree has uncommitted changes",
      "missing expected file: .github/workflows"
    ]
  }
}
```

For `attention`, read `health.reasons` first. Dirty or conflicted git signals tell you to inspect
the working tree before changing files. Missing expected-file reasons tell you which generic
repository baseline is absent before relying on validation output.

## Jump Next

- For the complete JSON field reference, see
  [repo-health-summary-contract.md](repo-health-summary-contract.md).
- For MCP client wiring details, see [mcp-client-setup.md](mcp-client-setup.md).
- For bug reports or usage questions, see [../SUPPORT.md](../SUPPORT.md).
