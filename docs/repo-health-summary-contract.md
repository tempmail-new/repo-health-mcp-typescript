# repo_health_summary Output Contract

`repo_health_summary` returns one text MCP content item. The text is pretty-printed JSON for a
repository health summary with `schemaVersion` set to `"1"`.

## Input

```json
{
  "checkoutPath": "/absolute/path/to/target-repository"
}
```

`checkoutPath` must point to a local directory. Relative paths are accepted, but they resolve from
the server process, not from the MCP client interface.

## Output Shape

```json
{
  "schemaVersion": "1",
  "checkoutPath": "/resolved/real/path/to/target-repository",
  "repositoryRoot": "/resolved/real/path/to/git-root",
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
    "packageManager": "npm@10.9.0",
    "scripts": ["build", "lint", "test"],
    "expectedFiles": [
      {
        "path": "README.md",
        "present": true
      },
      {
        "path": "LICENSE",
        "present": true
      },
      {
        "path": "package.json",
        "present": true
      },
      {
        "path": "tsconfig.json",
        "present": true
      },
      {
        "path": ".github/workflows",
        "present": true
      }
    ]
  },
  "health": {
    "level": "ok",
    "reasons": []
  }
}
```

`repositoryRoot`, `git.branch`, `git.head`, `project.name`, and `project.packageManager` can be
`null` when the signal is not available. `repositoryRoot` is `null` when `checkoutPath` is not inside
a git repository.

## Field Semantics

| Field                    | Semantics                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| `schemaVersion`          | Contract version for this summary shape. Current value is `"1"`.                                      |
| `checkoutPath`           | Resolved real path for the requested local directory.                                                 |
| `repositoryRoot`         | Resolved git root for the checkout, or `null` outside a git repository.                               |
| `git.isRepository`       | Whether the checkout resolves inside a git repository.                                                |
| `git.branch`             | Current branch name, or `null` for detached or unavailable branch state.                              |
| `git.head`               | Short 12-character commit hash, or `null` when no commit is available.                                |
| `git.dirty`              | `true` when staged, unstaged, untracked, or conflicted counts are non-zero.                           |
| `git.staged`             | Count of porcelain status entries with staged changes.                                                |
| `git.unstaged`           | Count of porcelain status entries with unstaged changes.                                              |
| `git.untracked`          | Count of untracked porcelain status entries.                                                          |
| `git.conflicted`         | Count of porcelain status entries with merge-conflict statuses.                                       |
| `project.name`           | `package.json` `name`, or `null` when absent or invalid.                                              |
| `project.packageManager` | `package.json` `packageManager`, or `null` when absent or invalid.                                    |
| `project.scripts`        | Sorted npm script names from `package.json`.                                                          |
| `project.expectedFiles`  | Presence checks for `README.md`, `LICENSE`, `package.json`, `tsconfig.json`, and `.github/workflows`. |
| `health.level`           | `"ok"` when there are no reasons, otherwise `"attention"`.                                            |
| `health.reasons`         | Sorted deterministic reason strings describing missing or risky signals.                              |

## Health Reasons

The current health model reports `"attention"` when any of these reasons apply:

- `path is not inside a git repository`
- `git working tree has uncommitted changes`
- `git repository has no commits`
- `missing npm script: build`
- `missing npm script: lint`
- `missing npm script: test`
- `missing expected file: README.md`
- `missing expected file: LICENSE`
- `missing expected file: package.json`
- `missing expected file: tsconfig.json`
- `missing expected file: .github/workflows`

Reason strings are sorted before they are returned, so callers can compare summaries
deterministically.
