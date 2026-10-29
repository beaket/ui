import type { Page } from "@playwright/test";
// Brings the window.__paper declaration into scope for the page.evaluate callbacks.
import type {} from "./fixture/main";

// CDP-driven IME input (#1176). Input.imeSetComposition goes through Chromium's real composition
// pipeline — compositionstart/update/end, beforeinput, and view.composing arrive in the order the
// browser produces them — and Input.insertText while composing commits, firing compositionend.

/** One composed run: the composition updates an IME would show, then the committed text. */
export interface Run {
  steps: string[];
  commit: string;
}

// Each language is the update sequence its IME produces on the way to a commit.
export const KOREAN: Run[] = [
  { steps: ["ㅎ", "하", "한"], commit: "한" },
  { steps: ["ㄱ", "그", "글"], commit: "글" },
];
// 하 + ㄴ + ㅏ: the final ㄴ moves into the next syllable, so 한 is withdrawn and 하 commits
// before 나 starts its own composition (the macOS 2-Set sequence).
export const KOREAN_SPLIT: Run[] = [
  { steps: ["ㅎ", "하", "한"], commit: "하" },
  { steps: ["나"], commit: "나" },
];
// Romaji → kana → kanji conversion, committed as one segment.
export const JAPANESE: Run[] = [
  { steps: ["k", "か", "かn", "かん", "かんj", "かんじ", "漢字"], commit: "漢字" },
];
// Pinyin → candidate commit.
export const CHINESE: Run[] = [
  { steps: ["z", "zh", "zho", "zhon", "zhong", "zhongw", "zhongwe", "zhongwen"], commit: "中文" },
];

export const LANGUAGES = [
  { name: "Korean", runs: KOREAN, text: "한글" },
  { name: "Japanese", runs: JAPANESE, text: "漢字" },
  { name: "Chinese", runs: CHINESE, text: "中文" },
] as const;

export async function ime(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  const compose = (text: string) =>
    cdp.send("Input.imeSetComposition", {
      text,
      selectionStart: text.length,
      selectionEnd: text.length,
    });
  const commit = (text: string) => cdp.send("Input.insertText", { text });
  return {
    compose,
    commit,
    /**
     * Type `key` and start composing `text` in one burst on one session, so the browser queues both
     * input tasks before the timeout the keystroke schedules — the fast-typist or busy-main-thread race.
     */
    burst: (key: string, text: string) =>
      Promise.all([
        cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key, text: key }),
        cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key }),
        compose(text),
      ]),
    /** Compose every step of every run and commit each one. */
    async type(runs: readonly Run[]) {
      for (const run of runs) {
        for (const step of run.steps) await compose(step);
        await commit(run.commit);
      }
    },
  };
}

/** Load the fixture with `doc` as the initial markdown and wait for the editor to mount. */
export async function open(page: Page, doc: string) {
  await page.goto(`/?doc=${encodeURIComponent(doc)}`);
  await page.waitForFunction(() => window.__paper.handle?.getView() !== undefined);
}

/**
 * Load the fixture with a document too large for a URL (#482): an init script hands it over as
 * window.__paperDoc before the fixture mounts, so it is the editor's real initial value.
 */
export async function openLarge(page: Page, doc: string) {
  await page.addInitScript((markdown) => {
    window.__paperDoc = markdown;
  }, doc);
  await page.goto("/");
  await page.waitForFunction(() => window.__paper.handle?.getView() !== undefined);
}

/** Focus the editor with the caret at `pos` (default: end of the document). */
export async function caret(page: Page, pos?: number) {
  await page.evaluate((at) => {
    const view = window.__paper.handle!.getView()!;
    view.focus();
    view.dispatch({ selection: { anchor: at ?? view.state.doc.length } });
  }, pos);
}

export const value = (page: Page) => page.evaluate(() => window.__paper.handle!.getValue());
export const composing = (page: Page) =>
  page.evaluate(() => window.__paper.handle!.getView()!.composing);
export const changeCount = (page: Page) => page.evaluate(() => window.__paper.changes.length);
export const lastChange = (page: Page) => page.evaluate(() => window.__paper.changes.at(-1));
