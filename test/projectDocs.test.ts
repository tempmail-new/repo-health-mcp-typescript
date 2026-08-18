import { access, readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

const trustSurfaceLinks = [
  { file: "CONTRIBUTING.md", link: "[CONTRIBUTING.md](CONTRIBUTING.md)" },
  { file: "SECURITY.md", link: "[SECURITY.md](SECURITY.md)" },
  { file: "SUPPORT.md", link: "[SUPPORT.md](SUPPORT.md)" },
] as const;

describe("project trust surfaces", () => {
  it("keeps root maintenance entry points linked from the README", async () => {
    const readme = await readFile("README.md", "utf8");

    for (const surface of trustSurfaceLinks) {
      await expect(access(surface.file)).resolves.toBeUndefined();
      expect(readme).toContain(surface.link);
    }
  });
});
