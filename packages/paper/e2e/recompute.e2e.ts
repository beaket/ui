import { type Page, expect, test } from "@playwright/test";
import { LANGUAGES, composing, ime, openLarge, value } from "./ime";
import { largeDoc } from "./large-doc";

// Invariant #1 measured, not inferred (#482): during an active composition no guardedDecorations
// provider recomputes, in a real browser, on a document large enough that a recompute would cost.
// The counter is the e2e Vite config's transform of composing-guard.ts — shipped code is untouched.

const computes = (page: Page) => page.evaluate(() => ({ ...window.__paper.computes }));

// Wait until no provider has recomputed for 150 ms: after a load the background parse and the
// measure pass keep producing viewport updates for a while, and those are not composition work.
const settle = (page: Page) =>
  page.evaluate(async () => {
    let last = -1;
    while (window.__paper.computes.total !== last) {
      last = window.__paper.computes.total;
      await new Promise((r) => setTimeout(r, 150));
    }
  });

const doc = largeDoc(1000);

for (const { name, runs } of LANGUAGES) {
  test(`${name}: zero decoration recomputes while composing in a 1k-line document`, async ({
    page,
  }) => {
    await openLarge(page, doc.markdown);
    await page.evaluate((at) => {
      const view = window.__paper.handle!.getView()!;
      view.focus();
      view.dispatch({ selection: { anchor: at }, scrollIntoView: true });
    }, doc.middle);
    const input = await ime(page);
    for (const run of runs) {
      // Let the previous commit's wake (or the caret move) recompute before taking the baseline.
      await settle(page);
      const before = await computes(page);
      expect(before.total).toBeGreaterThan(0);

      for (const step of run.steps) {
        await input.compose(step);
        expect(await composing(page)).toBe(true);
      }
      await page.waitForTimeout(150);
      expect(await composing(page)).toBe(true);
      expect(await computes(page)).toEqual(before);

      await input.commit(run.commit);
      // The wake after compositionend recomputes, which proves the counter is live, not vacuous.
      await expect.poll(async () => (await computes(page)).total).toBeGreaterThan(before.total);
    }

    const committed = runs.map((r) => r.commit).join("");
    await expect
      .poll(async () => (await value(page)).length)
      .toBe(doc.markdown.length + committed.length);
    expect((await computes(page)).composing).toBe(0);
  });
}
