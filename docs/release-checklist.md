# Release Checklist

Use this checklist for every tagged release. Releases should come from a validated `main` commit and
keep the published package, README, and MCP behavior in sync.

## Versioning

- Follow semantic versioning.
- Use a patch version for documentation fixes, dependency maintenance, and behavior-preserving
  implementation fixes.
- Use a minor version for backward-compatible tool output additions or new documented MCP behavior.
- Use a major version for breaking changes to the `repo_health_summary` input shape, output contract,
  health semantics, Node.js engine floor, or package entry points.

## Pre-Release

1. Confirm the branch is up to date with `origin/main`.
2. Review `README.md`, `docs/mcp-client-setup.md`, and `docs/repo-health-summary-contract.md` for
   any release-facing drift.
3. Update `package.json` and `package-lock.json` to the intended version.
4. Add release notes that call out user-visible changes, validation performed, and any migration
   notes.

## Validation

Run the full local validation suite before tagging:

```bash
npm run fmt:check
npm run lint
npm test
npm run build
npm pack --dry-run
```

The dry-run package output should include `dist`, `README.md`, and `docs`. Do not tag a release from
a commit that fails local validation or hosted CI.

## Tagging

Create tags only from the validated `main` commit:

```bash
git tag v0.1.1
git push origin v0.1.1
```

After pushing, confirm the release notes, package contents, and README links still describe the
shipped version.
