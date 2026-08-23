import { execFile } from "node:child_process";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { describe, expect, it } from "vitest";

import { summarizeRepository } from "../src/repositoryHealth.js";

const execFileAsync = promisify(execFile);

describe("summarizeRepository", () => {
  it("summarizes a clean generic repository without Node metadata as ok", async () => {
    const repo = await createRepository();

    await writeFile(path.join(repo, "README.md"), "# Example\n");
    await writeFile(path.join(repo, "LICENSE"), "MIT\n");
    await mkdir(path.join(repo, ".github", "workflows"), { recursive: true });
    await writeFile(path.join(repo, ".github", "workflows", "validate.yml"), "name: validate\n");
    await git(repo, ["add", "."]);
    await git(repo, ["commit", "-m", "test: seed generic repository"]);

    const summary = await summarizeRepository(repo);

    expect(summary.project).toMatchObject({
      name: null,
      packageManager: null,
      scripts: [],
      expectedFiles: [
        { path: "README.md", present: true },
        { path: "LICENSE", present: true },
        { path: "package.json", present: false },
        { path: "tsconfig.json", present: false },
        { path: ".github/workflows", present: true },
      ],
    });
    expect(summary.health).toEqual({
      level: "ok",
      reasons: [],
    });
  });

  it("summarizes a clean TypeScript repository with deterministic signals", async () => {
    const repo = await createRepository();

    await writeFile(
      path.join(repo, "package.json"),
      JSON.stringify(
        {
          name: "example-service",
          scripts: {
            test: "vitest run",
            lint: "eslint .",
            build: "tsc -p tsconfig.json",
          },
        },
        null,
        2,
      ),
    );
    await writeFile(path.join(repo, "README.md"), "# Example\n");
    await writeFile(path.join(repo, "LICENSE"), "MIT\n");
    await writeFile(path.join(repo, "tsconfig.json"), "{}\n");
    await mkdir(path.join(repo, ".github", "workflows"), { recursive: true });
    await writeFile(path.join(repo, ".github", "workflows", "validate.yml"), "name: validate\n");
    await git(repo, ["add", "."]);
    await git(repo, ["commit", "-m", "test: seed repository"]);

    const summary = await summarizeRepository(repo);

    expect(summary.schemaVersion).toBe("1");
    expect(summary.git).toMatchObject({
      isRepository: true,
      branch: "main",
      dirty: false,
      staged: 0,
      unstaged: 0,
      untracked: 0,
      conflicted: 0,
    });
    expect(summary.git.head).toHaveLength(12);
    expect(summary.project).toMatchObject({
      name: "example-service",
      scripts: ["build", "lint", "test"],
    });
    expect(summary.health).toEqual({
      level: "ok",
      reasons: [],
    });
  });

  it("keeps partial npm scripts as metadata instead of health requirements", async () => {
    const repo = await createRepository();

    await writeFile(
      path.join(repo, "package.json"),
      JSON.stringify(
        {
          name: "node-service",
          scripts: {
            test: "vitest run",
          },
        },
        null,
        2,
      ),
    );
    await writeFile(path.join(repo, "README.md"), "# Node Service\n");
    await writeFile(path.join(repo, "LICENSE"), "MIT\n");
    await mkdir(path.join(repo, ".github", "workflows"), { recursive: true });
    await writeFile(path.join(repo, ".github", "workflows", "validate.yml"), "name: validate\n");
    await git(repo, ["add", "."]);
    await git(repo, ["commit", "-m", "test: seed node repository"]);

    const summary = await summarizeRepository(repo);

    expect(summary.project).toMatchObject({
      name: "node-service",
      scripts: ["test"],
    });
    expect(summary.health).toEqual({
      level: "ok",
      reasons: [],
    });
  });

  it("reports dirty working tree counts and missing generic repository surfaces", async () => {
    const repo = await createRepository();

    await writeFile(
      path.join(repo, "package.json"),
      JSON.stringify({ name: "incomplete-service", scripts: { test: "vitest run" } }, null, 2),
    );
    await writeFile(path.join(repo, "README.md"), "# Incomplete\n");
    await git(repo, ["add", "README.md"]);
    await writeFile(path.join(repo, "scratch.txt"), "local note\n");

    const summary = await summarizeRepository(repo);

    expect(summary.git.dirty).toBe(true);
    expect(summary.git.staged).toBe(1);
    expect(summary.git.untracked).toBe(2);
    expect(summary.health.level).toBe("attention");
    expect(summary.health.reasons).toEqual([
      "git repository has no commits",
      "git working tree has uncommitted changes",
      "missing expected file: .github/workflows",
      "missing expected file: LICENSE",
    ]);
  });
});

async function createRepository(): Promise<string> {
  const repo = await mkdtemp(path.join(os.tmpdir(), "repo-health-mcp-"));

  await git(repo, ["init"]);
  await git(repo, ["checkout", "-b", "main"]);
  await git(repo, ["config", "user.name", "Test User"]);
  await git(repo, ["config", "user.email", "test@example.com"]);

  return repo;
}

async function git(repo: string, args: string[]): Promise<void> {
  await execFileAsync("git", ["-C", repo, ...args]);
}
