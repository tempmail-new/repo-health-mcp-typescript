# Published Release Install Quickstart

This quickstart wires `repo-health-mcp-typescript` from a published package artifact instead of a
source checkout, local build, or local `npm pack` output.

Use the version you intend to run. The examples use `0.1.0` and tag `v0.1.0`.

## Choose An Artifact

Use the npm registry path when a package version has been published:

```bash
npm view repo-health-mcp-typescript@0.1.0 version
```

Use the GitHub release-asset path when the release publishes the packed npm tarball:

```bash
curl -fL -o repo-health-mcp-typescript-0.1.0.tgz \
  https://github.com/tempmail-new/repo-health-mcp-typescript/releases/download/v0.1.0/repo-health-mcp-typescript-0.1.0.tgz
```

The installable artifact should be the same npm-packed `.tgz` shape checked by
[packaged-install-quickstart.md](packaged-install-quickstart.md): compiled `dist`, `README.md`,
and `docs`.

## Install From Npm Registry

Install the published package into a controlled prefix:

```bash
INSTALL_PREFIX="$HOME/.local/repo-health-mcp"
rm -rf "$INSTALL_PREFIX"
npm install --global --prefix "$INSTALL_PREFIX" repo-health-mcp-typescript@0.1.0
```

The installed executable is:

```bash
"$INSTALL_PREFIX/bin/repo-health-mcp"
```

## Install From GitHub Release Asset

Install the downloaded release tarball into the same kind of controlled prefix:

```bash
INSTALL_PREFIX="$HOME/.local/repo-health-mcp"
rm -rf "$INSTALL_PREFIX"
npm install --global --prefix "$INSTALL_PREFIX" ./repo-health-mcp-typescript-0.1.0.tgz
```

Prefer a release asset ending in `.tgz` over a repository source archive. Source archives such as
`v0.1.0.zip` are useful for inspection, but they are not the documented install artifact unless the
release notes explicitly say they include a built package.

## Add A Client Entry

Point the MCP client at the installed binary:

```json
{
  "mcpServers": {
    "repo-health": {
      "command": "/home/you/.local/repo-health-mcp/bin/repo-health-mcp",
      "args": []
    }
  }
}
```

Restart the client after changing its MCP configuration.

## Call The Tool

Ask the client to call `repo_health_summary` with an absolute checkout path:

```json
{
  "checkoutPath": "/absolute/path/to/target-repository"
}
```

If the client cannot start the server, check that the configured `command` path exists, the Node.js
version satisfies `>=22.12.0`, and the installed package version matches the intended release.

For interpreting the response, continue with
[first-summary-quickstart.md](first-summary-quickstart.md). For release validation and artifact
expectations, see [release-checklist.md](release-checklist.md).
