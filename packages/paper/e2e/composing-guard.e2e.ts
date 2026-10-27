import { expect, test } from "@playwright/test";
import {
  JAPANESE,
  KOREAN,
  KOREAN_SPLIT,
  LANGUAGES,
  caret,
  changeCount,
  composing,
  ime,
  lastChange,
  open,
  value,
} from "./ime";

// The composing-guard matrix #483 inherits from DECISIONS.md § Deferred, in a real browser (#1176).
// jsdom proves the guard's logic on synthetic events (ADR-0005); this suite proves it holds when the
// events come from Chromium's own composition pipeline.

test.afterEach(async ({ page }) => {
  expect(await page.evaluate(() => window.__paper.errors)).toEqual([]);
});

test.describe("plain typing", () => {
  for (const { name, runs, text } of LANGUAGES) {
    test(`${name}: commits exactly, with one onChange after the composition settles`, async ({
      page,
    }) => {
      await open(page, "start ");
      await caret(page);
      const input = await ime(page);

      const run = runs[0]!;
      for (const step of run.steps) await input.compose(step);
      expect(await composing(page)).toBe(true);
      expect(await changeCount(page)).toBe(0);

      await input.commit(run.commit);
      for (const rest of runs.slice(1)) {
        for (const step of rest.steps) await input.compose(step);
        await input.commit(rest.commit);
      }

      await expect.poll(() => value(page)).toBe(`start ${text}`);
      await expect.poll(() => lastChange(page)).toBe(`start ${text}`);
      expect(await page.evaluate(() => window.__paper.compositionEvents)).toEqual(
        runs.flatMap(() => ["compositionstart", "compositionend"]),
      );
    });
  }

  test("Korean: a final consonant that moves to the next syllable is neither lost nor doubled", async ({
    page,
  }) => {
    await open(page, "");
    await caret(page);
    await (await ime(page)).type(KOREAN_SPLIT);
    await expect.poll(() => value(page)).toBe("하나");
  });
});

// Live Preview hides and shows syntax around the caret; none of it may break a composition in flight.
test.describe("Live Preview syntax around the caret", () => {
  const cases = [
    { name: "after bold", doc: "**굵게**", at: undefined, expected: "**굵게**한글" },
    { name: "inside inline code", doc: "`code`", at: 5, expected: "`code한글`" },
    {
      name: "inside a fenced code block",
      doc: "```js\nconst a = 1;\n```",
      at: 18,
      expected: "```js\nconst a = 1;한글\n```",
    },
    { name: "inside a heading", doc: "# 제목", at: undefined, expected: "# 제목한글" },
  ];
  for (const { name, doc, at, expected } of cases) {
    test(`Korean ${name}`, async ({ page }) => {
      await open(page, doc);
      await caret(page, at);
      await (await ime(page)).type(KOREAN);
      await expect.poll(() => value(page)).toBe(expected);
    });
  }

  test("Japanese conversion inside a fenced code block", async ({ page }) => {
    await open(page, "```\nx\n```");
    await caret(page, 5);
    await (await ime(page)).type(JAPANESE);
    await expect.poll(() => value(page)).toBe("```\nx漢字\n```");
  });

  test("bold markers hide again once the caret leaves the composed text", async ({ page }) => {
    await open(page, "**굵게**\n\n끝");
    await caret(page, 6);
    await (await ime(page)).type(KOREAN);
    await expect.poll(() => value(page)).toBe("**굵게**한글\n\n끝");
    await caret(page);
    await expect(page.locator(".cm-line").first()).toHaveText("굵게한글");
  });

  test("Korean inside a table cell", async ({ page }) => {
    await open(page, "| a | b |\n| --- | --- |\n| c | d |\n");
    await page.locator("td").filter({ hasText: "c" }).click();
    // The cell editor is a separate EditorView mounted on click (ADR-0003); compose into it, not the body.
    await expect(page.locator("td .cm-content")).toBeFocused();
    await page.keyboard.press("End");
    await (await ime(page)).type(KOREAN);
    await expect.poll(() => value(page)).toContain("| c한글 | d |");
  });
});

test.describe("deferred paths", () => {
  test("setValue mid-composition waits for compositionend, then replaces without echo", async ({
    page,
  }) => {
    await open(page, "원래 ");
    await caret(page);
    const input = await ime(page);
    await input.compose("ㅎ");
    await input.compose("하");

    await page.evaluate(() => window.__paper.handle!.setValue("교체된 문서"));
    expect(await value(page)).toBe("원래 하");

    await input.commit("하");
    await expect.poll(() => value(page)).toBe("교체된 문서");
    expect(await page.evaluate(() => window.__paper.changes)).not.toContain("교체된 문서");
  });

  test("highlights set mid-composition apply after it settles", async ({ page }) => {
    await open(page, "가나다 라마바 ");
    await caret(page);
    const input = await ime(page);
    await input.compose("ㅎ");

    await page.evaluate(() =>
      window.__paper.setHighlights([{ id: "h1", anchor: { quote: "라마바", offset: 4 } }]),
    );
    await page.waitForTimeout(50);
    expect(await composing(page)).toBe(true);
    await expect(page.locator(".cm-annotation-highlight")).toHaveCount(0);

    await input.commit("하");
    await expect(page.locator(".cm-annotation-highlight")).toHaveText("라마바");
    expect(await value(page)).toBe("가나다 라마바 하");
  });

  test("onSelect holds while composing and flushes once after", async ({ page }) => {
    await open(page, "가나다");
    await caret(page);
    const before = await page.evaluate(() => window.__paper.selects.length);
    const input = await ime(page);
    for (const step of KOREAN[0]!.steps) await input.compose(step);
    expect(await page.evaluate(() => window.__paper.selects.length)).toBe(before);

    await input.commit("한");
    await page.evaluate(() => {
      const view = window.__paper.handle!.getView()!;
      view.dispatch({ selection: { anchor: 0, head: 3 } });
    });
    await expect
      .poll(() => page.evaluate(() => window.__paper.selects.at(-1)?.text))
      .toBe("가나다");
  });
});

test.describe("menus", () => {
  test("slash menu stays as it was while a Korean query composes, then filters on commit", async ({
    page,
  }) => {
    await open(page, "");
    await caret(page);
    await page.keyboard.type("/");
    const menu = page.locator(".cm-slash-menu");
    await expect(menu).toBeVisible();
    const items = await menu.locator("[role=option]").count();

    const input = await ime(page);
    await input.compose("ㅍ");
    await input.compose("표");
    await page.waitForTimeout(50);
    await expect(menu).toBeVisible();
    await expect(menu.locator("[role=option]")).toHaveCount(items);

    // No default label matches 표, so the deferred re-evaluation closes the menu.
    await input.commit("표");
    await expect(menu).toBeHidden();
    expect(await value(page)).toBe("/표");
  });

  test("a full-width ／ composed by a Japanese IME opens the menu only after commit", async ({
    page,
  }) => {
    await open(page, "");
    await caret(page);
    const input = await ime(page);
    await input.compose("／");
    await page.waitForTimeout(50);
    await expect(page.locator(".cm-slash-menu")).toBeHidden();

    await input.commit("／");
    await page.keyboard.type("ta");
    await expect(page.locator(".cm-slash-menu")).toContainText("Table");
  });

  test("@ trigger queries only the committed syllable, never partial jamo", async ({ page }) => {
    await open(page, "");
    await caret(page);
    await page.keyboard.type("@");
    await expect.poll(() => page.evaluate(() => window.__paper.triggerQueries)).toEqual([""]);
    const input = await ime(page);
    for (const step of ["ㄱ", "기", "김"]) await input.compose(step);
    await page.waitForTimeout(50);
    expect(await page.evaluate(() => window.__paper.triggerQueries)).toEqual([""]);

    await input.commit("김");
    await expect.poll(() => page.evaluate(() => window.__paper.triggerQueries)).toEqual(["", "김"]);
    await expect(page.locator(".cm-trigger-menu")).toContainText("김철수");
  });
});

// The keystroke before a composition schedules the menu's evaluation in a timeout. A fast typist or a
// busy main thread lets the composition start before that timeout fires; the menu must still defer
// until compositionend.
test.describe("menu evaluation that fires mid-composition", () => {
  test("slash menu does not open", async ({ page }) => {
    await open(page, "");
    await caret(page);
    const input = await ime(page);
    // Japanese romaji: the uncommitted "t" would match "Table" if the menu evaluated it.
    await input.burst("/", "t");
    await page.waitForTimeout(50);
    expect(await composing(page)).toBe(true);
    await expect(page.locator(".cm-slash-menu")).toBeHidden();

    // No default label matches た, so the menu stays closed after the wake as well.
    await input.compose("た");
    await input.commit("た");
    await expect.poll(() => value(page)).toBe("/た");
    await expect(page.locator(".cm-slash-menu")).toBeHidden();
  });

  test("@ trigger is not queried with a partial syllable", async ({ page }) => {
    await open(page, "");
    await caret(page);
    const input = await ime(page);
    await input.burst("@", "ㄱ");
    for (const step of ["기", "김"]) await input.compose(step);
    await page.waitForTimeout(50);
    expect(await page.evaluate(() => window.__paper.triggerQueries)).toEqual([]);

    await input.commit("김");
    await expect.poll(() => page.evaluate(() => window.__paper.triggerQueries)).toEqual(["김"]);
    await expect(page.locator(".cm-trigger-menu")).toContainText("김철수");
  });
});
