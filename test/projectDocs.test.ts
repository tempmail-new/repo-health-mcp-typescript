import { access, readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

const trustSurfaceLinks = [
  { file: "CONTRIBUTING.md", link: "[CONTRIBUTING.md](CONTRIBUTING.md)" },
  { file: "SECURITY.md", link: "[SECURITY.md](SECURITY.md)" },
  { file: "SUPPORT.md", link: "[SUPPORT.md](SUPPORT.md)" },
] as const;

const clientSetupGuide = {
  file: "docs/mcp-client-setup.md",
  link: "[docs/mcp-client-setup.md](docs/mcp-client-setup.md)",
  requiredText: [
    "npm ci",
    "npm run build",
    '"mcpServers"',
    '"command": "node"',
    '"args": ["/absolute/path/to/repo-health-mcp-typescript/dist/server.js"]',
    "repo_health_summary",
    '"checkoutPath": "/absolute/path/to/target-repository"',
  ],
} as const;

const bugReportIssueForm = {
  file: ".github/ISSUE_TEMPLATE/bug.yml",
  supportLink: "[bug report issue form](.github/ISSUE_TEMPLATE/bug.yml)",
  requiredText: [
    "name: Bug report",
    "Report a reproducible repo-health-mcp-typescript bug.",
    "Follow SECURITY.md instead.",
    "Repository summary output",
    "Local path handling",
    "MCP client setup",
    "Validation workflow",
    "Node.js version",
    "Target checkout shape",
    "Minimal public reproduction",
  ],
} as const;

describe("project trust surfaces", () => {
  it("keeps root maintenance entry points linked from the README", async () => {
    const readme = await readFile("README.md", "utf8");

    for (const surface of trustSurfaceLinks) {
      await expect(access(surface.file)).resolves.toBeUndefined();
      expect(readme).toContain(surface.link);
    }
  });
});

describe("GitHub issue intake", () => {
  it("keeps reproducible bug reports routed through the issue form", async () => {
    const [support, issueForm] = await Promise.all([
      readFile("SUPPORT.md", "utf8"),
      readFile(bugReportIssueForm.file, "utf8"),
    ]);

    expect(support).toContain(bugReportIssueForm.supportLink);

    for (const requiredText of bugReportIssueForm.requiredText) {
      expect(issueForm).toContain(requiredText);
    }
  });
});

describe("MCP client setup guide", () => {
  it("keeps the README linked to a concrete stdio client configuration", async () => {
    const [readme, guide] = await Promise.all([
      readFile("README.md", "utf8"),
      readFile(clientSetupGuide.file, "utf8"),
    ]);

    expect(readme).toContain(clientSetupGuide.link);

    for (const requiredText of clientSetupGuide.requiredText) {
      expect(guide).toContain(requiredText);
    }
  });
});
