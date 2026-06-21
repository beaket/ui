import type { Extension } from "@codemirror/state";
import { Facet } from "@codemirror/state";
import type { ViewUpdate } from "@codemirror/view";
import { EditorView, ViewPlugin } from "@codemirror/view";
import { composingRefresh, composingWake } from "./composing-guard";
import { type MenuController, menuKeymap, menuTheme, PopupMenu } from "./menu-engine";

// Declarative consumer trigger API (ADR-0016): register extra autocomplete triggers — `@` mentions,
// `[[` wikilinks — each backed by the consumer's own, possibly-async suggestion source. It reuses the
// shared menu engine (`menu-engine.ts`) for render/keymap/IME deferral, and stays in the declarative,
// `EditorView`-free family of `slashItems` (ADR-0012): a selected item inserts a markdown string
// (single source of truth = markdown). It coexists with the built-in slash menu (`/`); the two never
// open at once because their triggers are distinct, and the shared keymap routes to whichever is open.
//
// Rendering an inserted token as an atomic chip is the separate concern of #499 — out of scope here.

/**
 * One suggestion produced by a trigger's `onQuery` (ADR-0016). **Declarative** — never an
 * `EditorView` (ADR-0012 decision 2). Selecting it replaces the trigger + query with `insert`.
 */
export interface TriggerItem {
  /** Display label in the menu. */
  label: string;
  /** The markdown string to insert in place of `trigger` + query (rides the single-source-of-truth rule). */
  insert: string;
  /** Cursor position after insertion (offset from insertion start). Defaults to end of insertion. */
  cursorOffset?: number;
  /**
   * Opaque passthrough for the consumer's own entity (e.g. a user id). The editor never reads it;
   * it is handed back verbatim to `onSelect`, so an `@mention` can recover *which* entity was picked.
   */
  data?: unknown;
}

/**
 * A consumer-registered trigger (ADR-0016) — passed via `EditorOptions.triggers`. Build-time config,
 * the same family as `slashItems`/`onInsertImage` (consumer delegation), not a runtime plugin API.
 */
export interface TriggerSpec {
  /** The literal string that opens this menu, e.g. `"@"` or `"[["`. Reserve `/` for the slash menu. */
  trigger: string;
  /**
   * Minimum query length (chars after the trigger) before `onQuery` fires and the menu opens.
   * Defaults to 0 (open as soon as the trigger is typed). Raise it for punctuation-like triggers.
   */
  minQueryLength?: number;
  /**
   * Produce the suggestions for the current query. May be sync or async; the editor discards stale
   * responses (a slow earlier query never overwrites a faster later one) and never acts on a result
   * that resolves mid-IME-composition. The consumer does its own filtering/ranking here.
   */
  onQuery: (query: string) => TriggerItem[] | Promise<TriggerItem[]>;
  /**
   * Optional post-insertion notification — receives the chosen item (with its `data`). Fires after
   * the insert is dispatched. Insertion itself is the declarative `insert` string; this is only how a
   * consumer learns *which* entity was picked (recording a mention id, analytics, etc.).
   */
  onSelect?: (item: TriggerItem) => void;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** The active trigger at the cursor: which spec fired, the query after it, and the source position. */
export interface TriggerMatch {
  spec: TriggerSpec;
  query: string;
  /** Absolute source position of the trigger's first character. */
  triggerPos: number;
}

/**
 * Find the active trigger at the cursor (the first spec, in registration order, whose trigger sits at
 * a word boundary just before the cursor with a long-enough query). Pure and coordinate-independent,
 * so it is a deterministic jsdom contract-test target (ADR-0005). Like the slash regex it keeps the
 * `(?:^|\s)` boundary and a `\S*` query — a query may not contain spaces (a deferred enhancement).
 */
export function matchTrigger(
  before: string,
  head: number,
  specs: readonly TriggerSpec[],
): TriggerMatch | null {
  for (const spec of specs) {
    const re = new RegExp(`(?:^|\\s)(${escapeRegExp(spec.trigger)})(\\S*)$`);
    const m = re.exec(before);
    if (!m) continue;
    const query = m[2];
    if (query.length < (spec.minQueryLength ?? 0)) continue;
    return { spec, query, triggerPos: head - query.length - spec.trigger.length };
  }
  return null;
}

/**
 * Whether a resolved `onQuery` response is still current: only the latest issued generation may open
 * the menu. Every new query (and every close) bumps the generation, so a stale in-flight response —
 * superseded by a newer keystroke, or arriving after the menu closed — is dropped. Pure → unit-tested
 * (ADR-0005); the live `view.composing` re-check is applied alongside it at resolve time.
 */
export function isResponseCurrent(issuedGeneration: number, currentGeneration: number): boolean {
  return issuedGeneration === currentGeneration;
}

/** **Internal** facet carrying the consumer's trigger specs to the plugin (not public). */
const triggersFacet = Facet.define<readonly TriggerSpec[], readonly TriggerSpec[]>({
  combine: (values) => values[0] ?? [],
});

/**
 * The trigger-menu controller — one plugin handles every registered trigger (only one menu open at a
 * time). Mirrors the slash menu's IME-deferred update gate; adds async-source sequencing.
 */
class TriggerMenu implements MenuController {
  private readonly popup: PopupMenu<TriggerItem>;
  private active: TriggerMatch | null = null;
  private generation = 0;

  constructor(private readonly view: EditorView) {
    this.popup = new PopupMenu(
      view,
      { menu: "cm-trigger-menu", selected: "cm-trigger-selected", header: "cm-trigger-header" },
      (item) => this.apply(item),
    );
  }

  get isOpen(): boolean {
    return this.popup.isOpen;
  }

  update(update: ViewUpdate): void {
    // While composing, defer all open/close/filtering decisions (CJK first-class, invariant #1)
    if (update.view.composing) return;
    const woken = update.transactions.some((tr) => tr.annotation(composingRefresh));
    if (!update.docChanged && !update.selectionSet && !woken) return;
    setTimeout(() => this.evaluate());
  }

  private evaluate(): void {
    const specs = this.view.state.facet(triggersFacet);
    if (specs.length === 0) return this.close();

    const { state } = this.view;
    const sel = state.selection.main;
    if (!sel.empty || !this.view.hasFocus) return this.close();

    const line = state.doc.lineAt(sel.head);
    const before = line.text.slice(0, sel.head - line.from);
    const match = matchTrigger(before, sel.head, specs);
    if (!match) return this.close();

    // Same trigger + position + query, already shown → nothing changed; don't re-query the source.
    if (
      this.popup.isOpen &&
      this.active &&
      this.active.spec.trigger === match.spec.trigger &&
      this.active.triggerPos === match.triggerPos &&
      this.active.query === match.query
    ) {
      return;
    }

    this.active = match;
    const generation = ++this.generation;
    Promise.resolve(match.spec.onQuery(match.query))
      .then((items) => this.receive(generation, match, items))
      // A rejection from a *superseded* query must not close the menu a newer query just opened —
      // the stale guard applies to the error path too (the guarantee ADR-0016 decision 4 makes).
      .catch(() => {
        if (isResponseCurrent(generation, this.generation) && !this.view.composing) this.close();
      });
  }

  /** Apply an async (or sync) response only if it is still the latest and we are not mid-composition. */
  private receive(generation: number, match: TriggerMatch, items: TriggerItem[]): void {
    if (!isResponseCurrent(generation, this.generation) || this.view.composing) return;
    if (!this.active || this.active.triggerPos !== match.triggerPos) return;
    if (!items || items.length === 0) return this.close();
    this.popup.open(match.triggerPos, items);
  }

  moveSelection(delta: -1 | 1): void {
    this.popup.moveSelection(delta);
  }

  applySelected(): void {
    this.popup.applySelected();
  }

  private apply(item: TriggerItem): void {
    if (!this.active) return;
    const from = this.active.triggerPos;
    const head = this.view.state.selection.main.head;
    const onSelect = this.active.spec.onSelect;
    const cursor =
      item.cursorOffset !== undefined ? from + item.cursorOffset : from + item.insert.length;
    this.view.dispatch({
      changes: { from, to: head, insert: item.insert },
      selection: { anchor: Math.min(cursor, from + item.insert.length) },
      userEvent: "input",
    });
    this.close();
    onSelect?.(item);
  }

  close(): void {
    this.popup.close();
    this.active = null;
    // Invalidate any in-flight response so it can't reopen the menu after we've closed.
    this.generation++;
  }

  destroy(): void {
    this.close();
  }
}

const triggerPlugin = ViewPlugin.fromClass(TriggerMenu);

const triggerKeymap = menuKeymap((view) => view.plugin(triggerPlugin));

/**
 * Wire the declarative trigger menu (ADR-0016). Returns nothing when no triggers are registered, so
 * a consumer that doesn't use it pays zero overhead (lightness). `composingWake`/`menuTheme` are the
 * same `Extension` instances the slash menu uses — CM6 dedups them by identity.
 */
export function triggerMenu(specs?: readonly TriggerSpec[]): Extension {
  if (!specs || specs.length === 0) return [];
  return [composingWake, triggersFacet.of(specs), triggerPlugin, triggerKeymap, menuTheme];
}
