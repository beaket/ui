import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { init } from "./init.ts";

vi.mock("../utils/themes.ts", () => ({ THEME_CSS: {}, VALID_THEMES: [] }));
// Mirror prompts@2: on Ctrl+C the library calls onCancel, and when that
// returns it resolves with the partial answers collected so far.
vi.mock("prompts", () => ({
  default: vi.fn(async (_questions: unknown, options?: { onCancel?: () => void }) => {
    options?.onCancel?.();
    return { components: "src/components/ui" };
  }),
}));

let directory: string | undefined;

afterEach(async () => {
  vi.restoreAllMocks();
  if (directory) await rm(directory, { recursive: true, force: true });
});

it("writes no config and exits non-zero when the init prompts are cancelled", async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), "beaket-ui-init-cancel-"));
  await writeFile(
    path.join(directory, "package.json"),
    '{"name":"app","devDependencies":{"typescript":"6.0.3"}}',
  );
  await writeFile(path.join(directory, "tsconfig.json"), "{}");
  vi.spyOn(process, "cwd").mockReturnValue(directory);
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  const exit = vi.spyOn(process, "exit").mockImplementation((() => {
    throw new Error("exit");
  }) as never);

  await expect(init({})).rejects.toThrow("exit");

  expect(exit).toHaveBeenCalledWith(1);
  expect(await readdir(directory)).not.toContain("beaket.ui.json");
  expect(log.mock.calls.flat().join("\n")).not.toContain("Done!");
});
