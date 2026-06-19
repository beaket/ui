import type { EditorState, Extension } from "@codemirror/state";
import { StateEffect, StateField } from "@codemirror/state";
import type { DecorationSet } from "@codemirror/view";
import { Decoration, EditorView } from "@codemirror/view";
import type { Anchor, AnchorStatus } from "../anchor";
import { resolveAnchor } from "../anchor";

// Highlight layer (ADR-0014 surface step). Renders the consumer-supplied anchor list as mark decorations,
// reports per-anchor status (exact/approximate/orphaned), and handles activeHighlightId and clicks.
// *What it's for* (comment/trail/panel) is consumer policy — only the mechanism lives here.
//
// IME design (advisor-confirmed): decorations are **mark** decorations held in a StateField, so they're
// doubly exempt from the line-break replace exception. Position truth = `decorations.map(tr.changes)` (CM-accurate
// boundary bias for free). Re-resolution (resolveAnchor) happens only in the setHighlights effect. The active class
// toggle *re-resolves nothing* — it re-emits only the class from the current decorations. The controller holds the
// effect dispatch that triggers re-resolution/re-emission during composition.

/** Consumer input: id is the consumer's, anchor is the editor format (opaque JSON). */
export interface HighlightInput {
  id: string;
  anchor: Anchor;
}

/** Replaces the entire highlight list. */
export const setHighlightsEffect = StateEffect.define<HighlightInput[]>();
/** Sets the active (hover/selection) highlight id (null = none). Declarative visual sync (decision 5). */
export const setActiveHighlightEffect = StateEffect.define<string | null>();

interface HighlightState {
  decorations: DecorationSet;
  /** Single per-anchor status map (ADR-0014 decision 5). New instance only on re-resolution (for change detection). */
  statuses: Map<string, AnchorStatus>;
  activeId: string | null;
}

const EMPTY: HighlightState = { decorations: Decoration.none, statuses: new Map(), activeId: null };

interface Entry {
  id: string;
  from: number;
  to: number;
}

/** A single highlight range as a mark decoration. If active, an extra class (toggleable without re-resolution). */
function markFor(entry: Entry, statuses: Map<string, AnchorStatus>, activeId: string | null) {
  const classes = ["cm-annotation-highlight"];
  if (statuses.get(entry.id) === "approximate") classes.push("cm-annotation-approximate");
  if (entry.id === activeId) classes.push("cm-annotation-active");
  return Decoration.mark({
    class: classes.join(" "),
    attributes: { "data-highlight-id": entry.id },
  }).range(entry.from, entry.to);
}

function marksFrom(entries: Entry[], statuses: Map<string, AnchorStatus>, activeId: string | null) {
  const ranges = entries
    .filter((e) => e.from < e.to)
    .map((e) => markFor(e, statuses, activeId))
    .sort((a, b) => a.from - b.from || a.to - b.to);
  return Decoration.set(ranges, true);
}

/** Reads entries from the current decoration set (already-mapped positions) — for active re-emission (without manual mapPos). */
function entriesOf(set: DecorationSet): Entry[] {
  const out: Entry[] = [];
  set.between(0, 1e9, (from, to, deco) => {
    const id = (deco.spec.attributes as Record<string, string> | undefined)?.["data-highlight-id"];
    if (id != null) out.push({ id, from, to });
  });
  return out;
}

/** Re-resolves the anchor list against the current doc → entry list + status map (pure). orphaned remains only in status. */
function resolveToEntries(
  state: EditorState,
  inputs: HighlightInput[],
): { entries: Entry[]; statuses: Map<string, AnchorStatus> } {
  const doc = state.doc.toString();
  const statuses = new Map<string, AnchorStatus>();
  const entries: Entry[] = [];
  for (const { id, anchor } of inputs) {
    const resolved = resolveAnchor(doc, anchor);
    statuses.set(id, resolved.status);
    if (resolved.status !== "orphaned" && resolved.from < resolved.to) {
      entries.push({ id, from: resolved.from, to: resolved.to });
    }
  }
  return { entries, statuses };
}

/**
 * Builds decorations + status from the anchor list (pure). v1 scope = body text + inline styles (decision 4). The
 * inside of table cells/images is out of scope, but mark decorations don't throw when laid over atomic ranges (graceful — just invisible).
 */
export function buildHighlights(
  state: EditorState,
  inputs: HighlightInput[],
  activeId: string | null = null,
): { decorations: DecorationSet; statuses: Map<string, AnchorStatus> } {
  const { entries, statuses } = resolveToEntries(state, inputs);
  return { decorations: marksFrom(entries, statuses, activeId), statuses };
}

/** Test/internal use — reads the resolved decorations and status. Not exposed in the public barrel. */
export const highlightField = StateField.define<HighlightState>({
  create: () => EMPTY,
  update(value, tr) {
    let { decorations, statuses, activeId } = value;
    const hl = tr.effects.find((e) => e.is(setHighlightsEffect));
    const act = tr.effects.find((e) => e.is(setActiveHighlightEffect));
    if (!hl && !act && !tr.docChanged) return value;

    if (act) activeId = act.value as string | null;

    if (hl) {
      // Re-resolve (against the new doc). Even if setActive is in the same transaction, derive once with the final activeId.
      const r = resolveToEntries(tr.state, hl.value as HighlightInput[]);
      statuses = r.statuses;
      decorations = marksFrom(r.entries, statuses, activeId);
    } else if (tr.docChanged) {
      // Common path (typing): map positions only — CM-accurate boundary bias for free. No re-resolution/re-emission.
      decorations = decorations.map(tr.changes);
    }

    if (act && !hl) {
      // Only active changed: re-emit only the class from the currently-mapped decorations (no re-resolution).
      decorations = marksFrom(entriesOf(decorations), statuses, activeId);
    }

    return { decorations, statuses, activeId };
  },
  provide: (f) => EditorView.decorations.from(f, (v) => v.decorations),
});

const highlightTheme = EditorView.theme({
  ".cm-annotation-highlight": {
    backgroundColor: "var(--accent-weak, rgba(12, 107, 174, 0.08))",
    borderRadius: "2px",
  },
  // approximate has lower confidence → distinguished visually with a dotted underline (decision 5: don't collapse to 2 states).
  ".cm-annotation-approximate": {
    textDecoration: "underline dotted var(--accent, #0c6bae)",
  },
  // active (hover/selection sync) is distinguished with a darker background.
  ".cm-annotation-active": {
    backgroundColor: "var(--accent-sel, rgba(12, 107, 174, 0.16))",
  },
});

export interface HighlightLayerConfig {
  /** Re-resolution result status map (changes mostly on load/delete). Exposed as a single map (decision 5). */
  onHighlightStatusChange?: (statuses: Map<string, AnchorStatus>) => void;
  /** Reports highlight clicks (decision 6). The consumer opens a comment panel, etc. */
  onHighlightClick?: (id: string) => void;
}

/** Command handle for IME-safe replacement of the highlight list/active (isomorphic to valueController, ADR-0004). */
export interface HighlightController {
  setHighlights(list: HighlightInput[]): void;
  setActiveHighlight(id: string | null): void;
  dispose(): void;
}

/**
 * Holds the effect dispatch that triggers re-resolution/re-emission during composition — so a transaction during
 * composition doesn't disturb the IME. The renderer (field) stays safe via mapPos even during composition. On flush,
 * the held highlights and active are *coalesced into a single dispatch* so the field derives once from
 * (final ranges, final activeId) (prevents stale active).
 */
export function createHighlightController(view: EditorView): HighlightController {
  let pendingHighlights: HighlightInput[] | null = null;
  let pendingActive: { id: string | null } | null = null;
  let disposed = false;

  const flush = (): void => {
    setTimeout(() => {
      if (disposed || view.composing) return;
      const effects = [];
      if (pendingHighlights !== null) {
        effects.push(setHighlightsEffect.of(pendingHighlights));
        pendingHighlights = null;
      }
      if (pendingActive !== null) {
        effects.push(setActiveHighlightEffect.of(pendingActive.id));
        pendingActive = null;
      }
      if (effects.length) view.dispatch({ effects });
    });
  };
  view.contentDOM.addEventListener("compositionend", flush);

  return {
    setHighlights(list: HighlightInput[]): void {
      if (view.composing) {
        pendingHighlights = list;
        return;
      }
      view.dispatch({ effects: setHighlightsEffect.of(list) });
    },
    setActiveHighlight(id: string | null): void {
      if (view.composing) {
        pendingActive = { id };
        return;
      }
      view.dispatch({ effects: setActiveHighlightEffect.of(id) });
    },
    dispose(): void {
      disposed = true;
      pendingHighlights = null;
      pendingActive = null;
      view.contentDOM.removeEventListener("compositionend", flush);
    },
  };
}

export function highlightLayer(config: HighlightLayerConfig = {}): Extension {
  const statusEmitter = EditorView.updateListener.of((update) => {
    if (!config.onHighlightStatusChange) return;
    const before = update.startState.field(highlightField, false);
    const after = update.state.field(highlightField, false);
    // statuses is a new instance only on re-resolution (setHighlights) → detect change by reference comparison. docChange/active
    // changes keep the same instance, so they don't re-emit. updateListener runs after apply, so calling directly is safe.
    if (after && before?.statuses !== after.statuses)
      config.onHighlightStatusChange(after.statuses);
  });

  const clickHandler = EditorView.domEventHandlers({
    click(event) {
      if (!config.onHighlightClick) return false;
      const el = (event.target as HTMLElement | null)?.closest?.("[data-highlight-id]");
      const id = el?.getAttribute("data-highlight-id");
      // For overlapping highlights, the innermost is caught (v1 rule). Pure reporting — doesn't block cursor placement (false).
      if (id != null) config.onHighlightClick(id);
      return false;
    },
  });

  return [highlightField, statusEmitter, clickHandler, highlightTheme];
}
