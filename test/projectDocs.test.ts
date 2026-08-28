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

const healthSignalProposalIssueForm = {
  file: ".github/ISSUE_TEMPLATE/feature.yml",
  supportLink: "[health signal proposal issue form](.github/ISSUE_TEMPLATE/feature.yml)",
  requiredText: [
    "name: Health signal proposal",
    "Propose a focused repository-health signal for repo_health_summary.",
    "Use this form for proposed `repo_health_summary` signals, not reproducible bugs.",
    "Adoption or debugging problem",
    "Proposed signal name",
    "Expected output area",
    "health.reasons",
    "expectedFiles",
    "Proposed output shape",
    "Deterministic test case",
    "False-positive or ecosystem risk",
    "Documentation impact",
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
    "Node/TypeScript files or npm scripts stay visible in `project`, but they do not make a clean",
    "path is not inside a git repository",
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
    "Review `README.md`, `CHANGELOG.md`, `docs/mcp-client-setup.md`, and",
    "Update `package.json` and `package-lock.json` to the intended version.",
    "Update `CHANGELOG.md` with user-visible changes, validation performed, and any migration notes.",
    "Draft release notes from the matching `CHANGELOG.md` entry.",
    "npm run fmt:check",
    "npm run lint",
    "npm test",
    "npm run build",
    "npm pack --dry-run",
    "The dry-run package output should include `dist`, `README.md`, `CHANGELOG.md`, and `docs`.",
    "## Post-Publish Install Check",
    "upload the packed npm `.tgz` artifact, not only source",
    'npm install --global --prefix "$INSTALL_PREFIX" repo-health-mcp-typescript@<version>',
    'npm install --global --prefix "$INSTALL_PREFIX" ./repo-health-mcp-typescript-<version>.tgz',
    "Create tags only from the validated `main` commit:",
    "git tag v0.1.1",
  ],
} as const;

const changelog = {
  file: "CHANGELOG.md",
  link: "[CHANGELOG.md](CHANGELOG.md)",
  requiredText: [
    "# Changelog",
    "Release history for `repo-health-mcp-typescript`.",
    "## Unreleased",
    "Add this first-class release history surface, README navigation, release-checklist guidance, and",
    "## 0.1.0 - Initial Public Baseline",
    "deterministic `repo_health_summary` tool",
    "output contract, MCP client setup, first-summary path, packaged install flow, and",
    "published artifact install flow",
    "contributor, security, support, bug-report, and health-signal proposal surfaces",
    "Package the built `repo-health-mcp` executable with `dist`, `README.md`, and `docs`",
    "Keep clean non-Node repositories from being marked unhealthy",
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
    "When `project.scripts` is present, use it to identify likely validation commands.",
    '"level": "attention"',
    "git working tree has uncommitted changes",
    "missing expected file: .github/workflows",
    "For `attention`, read `health.reasons` first.",
    "[repo-health-summary-contract.md](repo-health-summary-contract.md)",
    "[../SUPPORT.md](../SUPPORT.md)",
  ],
} as const;

const packagedInstallQuickstart = {
  file: "docs/packaged-install-quickstart.md",
  link: "[docs/packaged-install-quickstart.md](docs/packaged-install-quickstart.md)",
  supportLink: "[docs/packaged-install-quickstart.md](docs/packaged-install-quickstart.md)",
  requiredText: [
    "# Packaged Install Quickstart",
    "npm ci",
    "npm run build",
    "PACKAGE_TARBALL=$(npm pack --silent)",
    "npm pack --dry-run",
    'npm install --global --prefix "$INSTALL_PREFIX" "./$PACKAGE_TARBALL"',
    '"$INSTALL_PREFIX/bin/repo-health-mcp"',
    '"command": "/absolute/path/to/.tmp/repo-health-mcp-install/bin/repo-health-mcp"',
    '"args": []',
    "repo_health_summary",
    '"checkoutPath": "/absolute/path/to/target-repository"',
    "[first-summary-quickstart.md](first-summary-quickstart.md)",
    "[repo-health-summary-contract.md](repo-health-summary-contract.md)",
  ],
} as const;

const publishedReleaseInstallQuickstart = {
  file: "docs/published-release-install-quickstart.md",
  link: "[docs/published-release-install-quickstart.md](docs/published-release-install-quickstart.md)",
  supportLink:
    "[docs/published-release-install-quickstart.md](docs/published-release-install-quickstart.md)",
  requiredText: [
    "# Published Release Install Quickstart",
    "npm view repo-health-mcp-typescript@0.1.0 version",
    "https://github.com/tempmail-new/repo-health-mcp-typescript/releases/download/v0.1.0/repo-health-mcp-typescript-0.1.0.tgz",
    "[packaged-install-quickstart.md](packaged-install-quickstart.md)",
    'npm install --global --prefix "$INSTALL_PREFIX" repo-health-mcp-typescript@0.1.0',
    'npm install --global --prefix "$INSTALL_PREFIX" ./repo-health-mcp-typescript-0.1.0.tgz',
    '"$INSTALL_PREFIX/bin/repo-health-mcp"',
    '"command": "/home/you/.local/repo-health-mcp/bin/repo-health-mcp"',
    '"args": []',
    "repo_health_summary",
    '"checkoutPath": "/absolute/path/to/target-repository"',
    "version satisfies `>=22.12.0`",
    "[first-summary-quickstart.md](first-summary-quickstart.md)",
    "[release-checklist.md](release-checklist.md)",
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
    const [readme, checklist, packageManifest] = await Promise.all([
      readFile("README.md", "utf8"),
      readFile(releaseChecklist.file, "utf8"),
      readFile("package.json", "utf8"),
    ]);

    expect(readme).toContain(releaseChecklist.link);
    expect(packageManifest).toContain('"CHANGELOG.md"');

    for (const requiredText of releaseChecklist.requiredText) {
      expect(checklist).toContain(requiredText);
    }
  });
});

describe("changelog docs", () => {
  it("keeps release history linked from README and release guidance", async () => {
    const [readme, checklist, history] = await Promise.all([
      readFile("README.md", "utf8"),
      readFile(releaseChecklist.file, "utf8"),
      readFile(changelog.file, "utf8"),
    ]);

    expect(readme).toContain(changelog.link);
    expect(checklist).toContain("CHANGELOG.md");

    for (const requiredText of changelog.requiredText) {
      expect(history).toContain(requiredText);
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

describe("packaged install quickstart docs", () => {
  it("keeps README and support navigation linked to the packed artifact install path", async () => {
    const [readme, support, quickstart] = await Promise.all([
      readFile("README.md", "utf8"),
      readFile("SUPPORT.md", "utf8"),
      readFile(packagedInstallQuickstart.file, "utf8"),
    ]);

    expect(readme).toContain(packagedInstallQuickstart.link);
    expect(support).toContain(packagedInstallQuickstart.supportLink);

    for (const requiredText of packagedInstallQuickstart.requiredText) {
      expect(quickstart).toContain(requiredText);
    }
  });
});

describe("published release install quickstart docs", () => {
  it("keeps README and support navigation linked to published artifact install paths", async () => {
    const [readme, support, quickstart] = await Promise.all([
      readFile("README.md", "utf8"),
      readFile("SUPPORT.md", "utf8"),
      readFile(publishedReleaseInstallQuickstart.file, "utf8"),
    ]);

    expect(readme).toContain(publishedReleaseInstallQuickstart.link);
    expect(support).toContain(publishedReleaseInstallQuickstart.supportLink);

    for (const requiredText of publishedReleaseInstallQuickstart.requiredText) {
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

  it("keeps new health-signal proposals routed through the issue form", async () => {
    const [support, issueForm] = await Promise.all([
      readFile("SUPPORT.md", "utf8"),
      readFile(healthSignalProposalIssueForm.file, "utf8"),
    ]);

    expect(support).toContain(healthSignalProposalIssueForm.supportLink);

    for (const requiredText of healthSignalProposalIssueForm.requiredText) {
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
