# Packaged Install Quickstart

This quickstart proves the package can be built, packed, installed, and used from an installed
binary path instead of from a source-checkout command.

## Build A Local Package

From this repository:

```bash
npm ci
npm run build
PACKAGE_TARBALL=$(npm pack --silent)
```

The generated tarball is the same artifact shape checked by `npm pack --dry-run`: compiled
`dist` files, `README.md`, and `docs`.

## Install The Tarball

Install the packed artifact into a temporary npm prefix:

```bash
INSTALL_PREFIX="$PWD/.tmp/repo-health-mcp-install"
rm -rf "$INSTALL_PREFIX"
npm install --global --prefix "$INSTALL_PREFIX" "./$PACKAGE_TARBALL"
```

The installed executable is available at:

```bash
"$INSTALL_PREFIX/bin/repo-health-mcp"
```

Use the installed executable path as the MCP stdio server command. The server is long-running and
waits for MCP client messages on stdin, so invoke it through a client rather than expecting
terminal output from a one-shot command.

## Add A Client Entry

Use the installed binary path in the MCP client configuration:

```json
{
  "mcpServers": {
    "repo-health": {
      "command": "/absolute/path/to/.tmp/repo-health-mcp-install/bin/repo-health-mcp",
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

For interpreting the first response, continue with
[first-summary-quickstart.md](first-summary-quickstart.md). For the full output shape and health
semantics, see [repo-health-summary-contract.md](repo-health-summary-contract.md).

## Clean Up

Remove the temporary install prefix and local tarball when the proof is complete:

```bash
rm -rf "$INSTALL_PREFIX" "$PACKAGE_TARBALL"
```
