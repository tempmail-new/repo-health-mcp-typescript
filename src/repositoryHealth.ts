import { access, readdir, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const GIT_STATUS_CONFLICT_PREFIXES = new Set(["DD", "AU", "UD", "UA", "DU", "AA", "UU"]);

export type HealthLevel = "ok" | "attention";

export type ExpectedFile = {
  path: string;
  present: boolean;
};

export type RepositoryHealthSummary = {
  schemaVersion: "1";
  checkoutPath: string;
  repositoryRoot: string | null;
  git: {
    isRepository: boolean;
    branch: string | null;
    head: string | null;
    dirty: boolean;
    staged: number;
    unstaged: number;
    untracked: number;
    conflicted: number;
  };
  project: {
    name: string | null;
    packageManager: string | null;
    scripts: string[];
    expectedFiles: ExpectedFile[];
  };
  health: {
    level: HealthLevel;
    reasons: string[];
  };
};

type PackageJson = {
  name?: unknown;
  packageManager?: unknown;
  scripts?: unknown;
};

export async function summarizeRepository(checkoutPath: string): Promise<RepositoryHealthSummary> {
  const resolvedCheckoutPath = await resolveCheckoutPath(checkoutPath);
  const repositoryRoot = await findRepositoryRoot(resolvedCheckoutPath);
  const root = repositoryRoot ?? resolvedCheckoutPath;
  const git = repositoryRoot
    ? await summarizeGit(repositoryRoot)
    : {
        isRepository: false,
        branch: null,
        head: null,
        dirty: false,
        staged: 0,
        unstaged: 0,
        untracked: 0,
        conflicted: 0,
      };
  const project = await summarizeProject(root);
  const reasons = buildHealthReasons(git, project);

  return {
    schemaVersion: "1",
    checkoutPath: resolvedCheckoutPath,
    repositoryRoot,
    git,
    project,
    health: {
      level: reasons.length === 0 ? "ok" : "attention",
      reasons,
    },
  };
}

async function resolveCheckoutPath(checkoutPath: string): Promise<string> {
  const trimmedPath = checkoutPath.trim();

  if (trimmedPath.length === 0) {
    throw new Error("checkoutPath must not be empty");
  }

  const absolutePath = path.resolve(trimmedPath);
  const pathStat = await stat(absolutePath);

  if (!pathStat.isDirectory()) {
    throw new Error(`checkoutPath must be a directory: ${absolutePath}`);
  }

  return realpath(absolutePath);
}

async function findRepositoryRoot(checkoutPath: string): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("git", [
      "-C",
      checkoutPath,
      "rev-parse",
      "--show-toplevel",
    ]);
    return realpath(stdout.trim());
  } catch {
    return null;
  }
}

async function summarizeGit(repositoryRoot: string): Promise<RepositoryHealthSummary["git"]> {
  const [branch, head, statusOutput] = await Promise.all([
    gitOutput(repositoryRoot, ["branch", "--show-current"]),
    gitOutput(repositoryRoot, ["rev-parse", "--short=12", "HEAD"]),
    gitOutput(repositoryRoot, ["status", "--porcelain=v1"]),
  ]);
  const counts = countStatus(statusOutput);

  return {
    isRepository: true,
    branch: branch.length > 0 ? branch : null,
    head: head.length > 0 ? head : null,
    dirty: counts.staged + counts.unstaged + counts.untracked + counts.conflicted > 0,
    ...counts,
  };
}

async function gitOutput(repositoryRoot: string, args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", ["-C", repositoryRoot, ...args]);
    return stdout.trim();
  } catch {
    return "";
  }
}

function countStatus(
  statusOutput: string,
): Pick<RepositoryHealthSummary["git"], "staged" | "unstaged" | "untracked" | "conflicted"> {
  const counts = {
    staged: 0,
    unstaged: 0,
    untracked: 0,
    conflicted: 0,
  };

  for (const line of statusOutput.split("\n").filter(Boolean)) {
    const status = line.slice(0, 2);

    if (status === "??") {
      counts.untracked += 1;
      continue;
    }

    if (GIT_STATUS_CONFLICT_PREFIXES.has(status)) {
      counts.conflicted += 1;
      continue;
    }

    if (status[0] !== " ") {
      counts.staged += 1;
    }

    if (status[1] !== " ") {
      counts.unstaged += 1;
    }
  }

  return counts;
}

async function summarizeProject(root: string): Promise<RepositoryHealthSummary["project"]> {
  const packageJson = await readPackageJson(root);
  const expectedFiles = await Promise.all(
    ["README.md", "LICENSE", "package.json", "tsconfig.json", ".github/workflows"].map(
      async (expectedPath) => ({
        path: expectedPath,
        present: await pathExists(path.join(root, expectedPath)),
      }),
    ),
  );

  return {
    name: readString(packageJson.name),
    packageManager: readString(packageJson.packageManager),
    scripts: readScripts(packageJson.scripts),
    expectedFiles,
  };
}

async function readPackageJson(root: string): Promise<PackageJson> {
  try {
    const rawPackage = await readFile(path.join(root, "package.json"), "utf8");
    const parsedPackage = JSON.parse(rawPackage) as PackageJson;

    return parsedPackage;
  } catch {
    return {};
  }
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readScripts(value: unknown): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  return Object.keys(value).sort();
}

async function pathExists(candidatePath: string): Promise<boolean> {
  try {
    const candidateStat = await stat(candidatePath);

    if (candidateStat.isDirectory()) {
      const entries = await readdir(candidatePath);
      return entries.length > 0;
    }

    await access(candidatePath);
    return true;
  } catch {
    return false;
  }
}

function buildHealthReasons(
  git: RepositoryHealthSummary["git"],
  project: RepositoryHealthSummary["project"],
): string[] {
  const reasons: string[] = [];

  if (!git.isRepository) {
    reasons.push("path is not inside a git repository");
  }

  if (git.dirty) {
    reasons.push("git working tree has uncommitted changes");
  }

  if (git.isRepository && !git.head) {
    reasons.push("git repository has no commits");
  }

  for (const requiredScript of ["build", "lint", "test"]) {
    if (!project.scripts.includes(requiredScript)) {
      reasons.push(`missing npm script: ${requiredScript}`);
    }
  }

  for (const expectedFile of project.expectedFiles) {
    if (!expectedFile.present) {
      reasons.push(`missing expected file: ${expectedFile.path}`);
    }
  }

  return reasons.sort();
}
