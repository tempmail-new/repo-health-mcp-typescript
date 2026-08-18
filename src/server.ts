#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { summarizeRepository } from "./repositoryHealth.js";

const server = new McpServer({
  name: "repo-health-mcp-typescript",
  version: "0.1.0",
});

server.registerTool(
  "repo_health_summary",
  {
    title: "Repository Health Summary",
    description: "Summarize deterministic local repository health signals for a checkout path.",
    inputSchema: {
      checkoutPath: z
        .string()
        .min(1)
        .describe(
          "Local checkout directory to summarize. Relative paths resolve from the server process.",
        ),
    },
  },
  async ({ checkoutPath }) => {
    const summary = await summarizeRepository(checkoutPath);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(summary, null, 2),
        },
      ],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
