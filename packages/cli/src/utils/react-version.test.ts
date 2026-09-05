import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import {
  compareVersions,
  highestFloor,
  parseVersion,
  reactFloorWarning,
  readInstalledReact,
  satisfiesFloor,
} from "./react-version.ts";

const tmpDirs: string[] = [];

async function tmpProject(files: Record<string, unknown>): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "beaket-react-floor-"));
  tmpDirs.push(dir);
  for (const [relative, content] of Object.entries(files)) {
    const target = path.join(dir, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, JSON.stringify(content));
  }
  return dir;
}

afterEach(async () => {
  await Promise.all(tmpDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("parseVersion", () => {
  it("reads the spellings a floor is written in", () => {
    expect(parseVersion(">=19.2")).toEqual([19, 2, 0]);
    expect(parseVersion(">= 19.2.1")).toEqual([19, 2, 1]);
    expect(parseVersion("19")).toEqual([19, 0, 0]);
    expect(parseVersion("^19.1.0")).toEqual([19, 1, 0]);
  });

  it("returns null rather than guessing", () => {
    expect(parseVersion(undefined)).toBeNull();
    expect(parseVersion("")).toBeNull();
    expect(parseVersion("latest")).toBeNull();
  });
});

describe("compareVersions", () => {
  it("orders by major, then minor, then patch", () => {
    expect(compareVersions([19, 2, 0], [18, 9, 9])).toBeGreaterThan(0);
    expect(compareVersions([19, 1, 0], [19, 2, 0])).toBeLessThan(0);
    expect(compareVersions([19, 2, 0], [19, 2, 0])).toBe(0);
  });
});

describe("highestFloor", () => {
  it("takes the strictest floor across the components being added", () => {
    expect(highestFloor([">=19.0.0", undefined, ">=19.2.0"])).toBe(">=19.2.0");
    expect(highestFloor([undefined, undefined])).toBeNull();
    expect(highestFloor(["nonsense", ">=19.0.0"])).toBe(">=19.0.0");
  });
});

describe("readInstalledReact", () => {
  it("prefers the installed version over the declared range", async () => {
    const cwd = await tmpProject({
      "package.json": { dependencies: { react: "^19.0.0" } },
      "node_modules/react/package.json": { name: "react", version: "18.3.1" },
    });
    expect(await readInstalledReact(cwd)).toBe("18.3.1");
  });

  it("falls back to the declared range, from any dependency field", async () => {
    const deps = await tmpProject({ "package.json": { dependencies: { react: "^19.1.0" } } });
    expect(await readInstalledReact(deps)).toBe("^19.1.0");

    const peers = await tmpProject({ "package.json": { peerDependencies: { react: ">=19.2.0" } } });
    expect(await readInstalledReact(peers)).toBe(">=19.2.0");
  });

  it("returns null when there is nothing to read", async () => {
    const cwd = await tmpProject({});
    expect(await readInstalledReact(cwd)).toBeNull();
  });
});

describe("satisfiesFloor", () => {
  it("passes on or above the floor and fails below it", () => {
    expect(satisfiesFloor("19.2.8", ">=19.2")).toBe(true);
    expect(satisfiesFloor("19.2.0", ">=19.2.0")).toBe(true);
    expect(satisfiesFloor("18.3.1", ">=19.2")).toBe(false);
    expect(satisfiesFloor("^19.1.0", ">=19.2")).toBe(false);
  });

  it("is null — not false — when either side is unknown, so nothing is warned about", () => {
    expect(satisfiesFloor(null, ">=19.2")).toBeNull();
    expect(satisfiesFloor("19.2.0", "whenever")).toBeNull();
  });
});

describe("reactFloorWarning", () => {
  const components = [{ name: "button" }, { name: "tabs", react: ">=19.2.0" }, { name: "alert" }];

  it("names only the components actually below their own floor", () => {
    expect(reactFloorWarning(">=19.0.0", components, "19.1.0")).toEqual({
      floor: ">=19.2.0",
      names: ["tabs"],
    });
  });

  it("names every component when the registry floor itself is unmet", () => {
    expect(reactFloorWarning(">=19.0.0", components, "18.3.1")).toEqual({
      floor: ">=19.2.0",
      names: ["button", "tabs", "alert"],
    });
  });

  it("says nothing when the floor is met", () => {
    expect(reactFloorWarning(">=19.0.0", components, "19.2.8")).toBeNull();
  });

  it("says nothing when the installed version is unknown", () => {
    expect(reactFloorWarning(">=19.0.0", components, null)).toBeNull();
  });

  it("says nothing when no floor is declared at all", () => {
    expect(reactFloorWarning(undefined, [{ name: "button" }], "18.3.1")).toBeNull();
  });
});
