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

const summaryContract = {
  file: "docs/repo-health-summary-contract.md",
  link: "[docs/repo-health-summary-contract.md](docs/repo-health-summary-contract.md)",
  architectureLink: "[repo-health-summary-contract.md](repo-health-summary-contract.md)",
  requiredText: [
    "# repo_health_summary Output Contract",
    '"schemaVersion": "1"',
    '"checkoutPath": "/resolved/real/path/to/target-repository"',
    '"repositoryRoot": "/resolved/real/path/to/git-root"',
    '"isRepository": true',
    '"dirty": false',
    '"expectedFiles"',
    '"level": "ok"',
    '"reasons": []',
    "`repositoryRoot`, `git.branch`, `git.head`, `project.name`, and `project.packageManager` can be",
    "`git.conflicted`",
    "Count of porcelain status entries with merge-conflict statuses.",
    "`health.level`",
    '`"ok"` when there are no reasons, otherwise `"attention"`.',
    "path is not inside a git repository",
    "missing npm script: build",
    "missing expected file: .github/workflows",
    "Reason strings are sorted before they are returned",
  ],
} as const;

const releaseChecklist = {
  file: "docs/release-checklist.md",
  link: "[docs/release-checklist.md](docs/release-checklist.md)",
  requiredText: [
    "# Release Checklist",
    "Follow semantic versioning.",
    "Use a patch version for documentation fixes, dependency maintenance, and behavior-preserving",
    "Use a minor version for backward-compatible tool output additions or new documented MCP behavior.",
    "Use a major version for breaking changes to the `repo_health_summary` input shape, output contract,",
    "Confirm the branch is up to date with `origin/main`.",
    "Update `package.json` and `package-lock.json` to the intended version.",
    "release notes that call out user-visible changes, validation performed, and any migration",
    "npm run fmt:check",
    "npm run lint",
    "npm test",
    "npm run build",
    "npm pack --dry-run",
    "The dry-run package output should include `dist`, `README.md`, and `docs`.",
    "Create tags only from the validated `main` commit:",
    "git tag v0.1.1",
  ],
} as const;

const firstSummaryQuickstart = {
  file: "docs/first-summary-quickstart.md",
  link: "[docs/first-summary-quickstart.md](docs/first-summary-quickstart.md)",
  requiredText: [
    "# First Summary Quickstart",
    "npm ci",
    "npm run build",
    "[mcp-client-setup.md](mcp-client-setup.md)",
    "repo_health_summary",
    '"checkoutPath": "/absolute/path/to/target-repository"',
    '"level": "ok"',
    '"reasons": []',
    "For an `ok` repository, start with `project.scripts`",
    '"level": "attention"',
    "git working tree has uncommitted changes",
    "missing npm script: build",
    "For `attention`, read `health.reasons` first.",
    "[repo-health-summary-contract.md](repo-health-summary-contract.md)",
    "[../SUPPORT.md](../SUPPORT.md)",
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

describe("release checklist docs", () => {
  it("keeps the README linked to versioning and package validation expectations", async () => {
    const [readme, checklist] = await Promise.all([
      readFile("README.md", "utf8"),
      readFile(releaseChecklist.file, "utf8"),
    ]);

    expect(readme).toContain(releaseChecklist.link);

    for (const requiredText of releaseChecklist.requiredText) {
      expect(checklist).toContain(requiredText);
    }
  });
});

describe("first summary quickstart docs", () => {
  it("keeps the README linked to the first interpreted tool result path", async () => {
    const [readme, quickstart] = await Promise.all([
      readFile("README.md", "utf8"),
      readFile(firstSummaryQuickstart.file, "utf8"),
    ]);

    expect(readme).toContain(firstSummaryQuickstart.link);

    for (const requiredText of firstSummaryQuickstart.requiredText) {
      expect(quickstart).toContain(requiredText);
    }
  });
});

describe("repo_health_summary contract docs", () => {
  it("keeps the README and architecture docs linked to the output contract", async () => {
    const [readme, architecture, contract] = await Promise.all([
      readFile("README.md", "utf8"),
      readFile("docs/architecture.md", "utf8"),
      readFile(summaryContract.file, "utf8"),
    ]);

    expect(readme).toContain(summaryContract.link);
    expect(architecture).toContain(summaryContract.architectureLink);

    for (const requiredText of summaryContract.requiredText) {
      expect(contract).toContain(requiredText);
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
