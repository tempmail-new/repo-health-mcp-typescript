# MCP Client Setup

This quickstart wires a local checkout of `repo-health-mcp-typescript` into an MCP client that
supports stdio servers.

## Build The Server

From this repository:

```bash
npm ci
npm run build
```

The built server entry point is `dist/server.js`.

## Add A Client Entry

Use an absolute path to your built checkout in the client configuration:

```json
{
  "mcpServers": {
    "repo-health": {
      "command": "node",
      "args": ["/absolute/path/to/repo-health-mcp-typescript/dist/server.js"]
    }
  }
}
```

Restart the client after changing its MCP configuration so it can launch the stdio process.

## Use The Tool

Ask the client to call `repo_health_summary` with the checkout to inspect:

```json
{
  "checkoutPath": "/absolute/path/to/target-repository"
}
```

Use absolute checkout paths when possible. Relative `checkoutPath` values resolve from the server
process, which may not be the same directory as the client interface.
