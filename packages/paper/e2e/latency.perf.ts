import { type Page, expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Sample } from "./fixture/perf-probe";
import { KOREAN, ime, openLarge } from "./ime";
import { largeDoc } from "./large-doc";

// Keystroke latency on large documents (#482), measured by the in-page probe (fixture/perf-probe.ts)
// around real CDP key events. Writes test-results/paper-perf/summary.{json,md} and prints the table.
//
// Assertion policy — CI machines are noisy, so latency is not a hard gate by default:
//   - zero guardedDecorations recomputes during a composition: always asserted (a count, not a time);
//   - PAPER_PERF_ASSERT=targets: assert the #482 targets on `work` p95 (local, quiet machine);
//   - otherwise latency is reported only.
// PAPER_PERF_SAMPLES overrides the sample count per scenario (default 200, after 20 warm-up keys).

const SAMPLES = Number(process.env.PAPER_PERF_SAMPLES ?? 200);
const WARMUP = 20;
/** #482 targets: keystroke p95 in ms. */
const TARGETS: Record<number, number> = { 1000: 16, 10000: 50 };
const OUT = path.resolve("test-results/paper-perf");
const TEXT = "the quick brown fox jumps over the lazy dog ";

type Metric = keyof Sample;
const METRICS: Metric[] = ["update", "work", "paint"];

interface Stats {
  p50: number;
  p95: number;
  max: number;
}
interface Scenario {
  lines: number;
  where: "middle" | "end";
  samples: number;
  stats: Record<Metric, Stats>;
}

function stats(values: number[]): Stats {
  const sorted = [...values].sort((a, b) => a - b);
  const at = (q: number) => sorted[Math.min(sorted.length - 1, Math.ceil(q * sorted.length) - 1)]!;
  const round = (n: number) => Math.round(n * 10) / 10;
  return { p50: round(at(0.5)), p95: round(at(0.95)), max: round(sorted.at(-1)!) };
}

async function placeCaret(page: Page, at: number) {
  await page.evaluate((pos) => {
    const view = window.__paper.handle!.getView()!;
    view.focus();
    view.dispatch({ selection: { anchor: pos }, scrollIntoView: true });
  }, at);
}

async function measure(page: Page, at: number): Promise<Sample[]> {
  await placeCaret(page, at);
  await page.evaluate(() => window.__paper.probe());
  const cdp = await page.context().newCDPSession(page);
  for (let i = 0; i < WARMUP + SAMPLES; i++) {
    const key = TEXT[i % TEXT.length]!;
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key, text: key });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key });
    await page.evaluate((n) => window.__paper.latency!.waitFor(n), i + 1);
  }
  await cdp.detach();
  return (await page.evaluate(() => window.__paper.latency!.samples)).slice(WARMUP);
}

async function composeRecomputes(page: Page, at: number) {
  await placeCaret(page, at);
  // Let the caret move's own recompute land before the baseline.
  await page.waitForTimeout(300);
  const before = await page.evaluate(() => ({ ...window.__paper.computes }));
  const input = await ime(page);
  const run = KOREAN[0]!;
  for (const step of run.steps) await input.compose(step);
  await page.waitForTimeout(150);
  const during = await page.evaluate(() => ({ ...window.__paper.computes }));
  await input.commit(run.commit);
  return {
    total: during.total - before.total,
    whileComposing: during.composing - before.composing,
  };
}

const fmt = (s: Stats) => `${s.p50.toFixed(1)} / ${s.p95.toFixed(1)} / ${s.max.toFixed(1)}`;

function markdown(results: Scenario[], recomputes: Record<number, unknown>, env: object) {
  const rows = results.map(
    (r) =>
      `| ${r.lines.toLocaleString("en")} | ${r.where} | ${fmt(r.stats.update)} | ${fmt(r.stats.work)} | ${fmt(r.stats.paint)} | < ${TARGETS[r.lines]} |`,
  );
  return [
    "# @beaket/paper keystroke latency",
    "",
    `${SAMPLES} keystrokes per scenario after ${WARMUP} warm-up keys; ms as p50 / p95 / max.`,
    "`update` = keydown → CM update applied; `work` = update + the next frame's render time (vsync wait removed);",
    "`paint` = keydown → after the next frame (includes the vsync wait). Targets (#482) apply to `work` p95.",
    "",
    "| lines | caret | update | work | paint | target p95 |",
    "| ---: | --- | --- | --- | --- | --- |",
    ...rows,
    "",
    `Decoration recomputes during a Korean composition: ${JSON.stringify(recomputes)}`,
    "",
    `Environment: ${JSON.stringify(env)}`,
    "",
  ].join("\n");
}

test("keystroke latency on 1k- and 10k-line documents", async ({ page, browserName, browser }) => {
  const results: Scenario[] = [];
  const recomputes: Record<number, { total: number; whileComposing: number }> = {};

  for (const lines of [1000, 10000]) {
    const doc = largeDoc(lines);
    for (const where of ["middle", "end"] as const) {
      await test.step(`${lines} lines, typing at the ${where}`, async () => {
        await openLarge(page, doc.markdown);
        const samples = await measure(page, doc[where]);
        expect(samples).toHaveLength(SAMPLES);
        results.push({
          lines,
          where,
          samples: samples.length,
          stats: Object.fromEntries(
            METRICS.map((m) => [m, stats(samples.map((s) => s[m]))]),
          ) as Record<Metric, Stats>,
        });
      });
    }
    await test.step(`${lines} lines, recomputes during a composition`, async () => {
      await openLarge(page, doc.markdown);
      recomputes[lines] = await composeRecomputes(page, doc.middle);
    });
    expect(await page.evaluate(() => window.__paper.errors)).toEqual([]);
  }

  const env = {
    browser: `${browserName} ${browser.version()}`,
    platform: process.platform,
    arch: process.arch,
    ci: Boolean(process.env.CI),
    date: new Date().toISOString(),
  };
  mkdirSync(OUT, { recursive: true });
  writeFileSync(
    path.join(OUT, "summary.json"),
    `${JSON.stringify({ samples: SAMPLES, warmup: WARMUP, targets: TARGETS, results, recomputes, env }, null, 2)}\n`,
  );
  const summary = markdown(results, recomputes, env);
  writeFileSync(path.join(OUT, "summary.md"), summary);
  console.log(`\n${summary}`);

  for (const { whileComposing, total } of Object.values(recomputes)) {
    expect(whileComposing).toBe(0);
    expect(total).toBe(0);
  }
  if (process.env.PAPER_PERF_ASSERT === "targets") {
    for (const r of results) {
      expect
        .soft(r.stats.work.p95, `${r.lines} lines at the ${r.where}`)
        .toBeLessThan(TARGETS[r.lines]!);
    }
  }
});
