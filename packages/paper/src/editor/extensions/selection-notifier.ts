import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import type { Anchor } from "../anchor";
import { createAnchor } from "../anchor";
import { composingRefresh, composingWake } from "./composing-guard";

// Selection reporting (ADR-0014 decisions 5·6). The editor gives only "selected + screen position", and the
// floating action affordances (comment/trail buttons, etc.) are drawn by the consumer (policy delegated). Since sel
// already carries a snapped anchor, the consumer rarely needs to call createAnchor directly.
// IME invariant: selection changes during composition are held and fire after compositionend settles (ADR-0004, isomorphic to changeNotifier).

export interface SelectionInfo {
  /** Clean text of the selection = snapped anchor.quote (partial markers excluded). */
  text: string;
  /** Anchor for persistence (snap applied). The consumer just stores it as opaque JSON. */
  anchor: Anchor;
  /** Screen coordinates for placing the floating affordance (relative to the selection head). null if coordinates can't be obtained. */
  rect: { left: number; top: number; right: number; bottom: number } | null;
}

export function selectionNotifier(onSelect?: (sel: SelectionInfo | null) => void): Extension {
  if (!onSelect) return [];

  let deferred = false;

  const listener = EditorView.updateListener.of((update) => {
    if (update.view.composing) {
      if (update.selectionSet) deferred = true;
      return;
    }
    const woken = update.transactions.some((tr) => tr.annotation(composingRefresh));
    if (update.selectionSet || (deferred && woken)) {
      deferred = false;
      emit(update.view, onSelect);
    }
  });

  return [composingWake, listener];
}

function emit(view: EditorView, onSelect: (sel: SelectionInfo | null) => void): void {
  const { from, to, head } = view.state.selection.main;
  if (from === to) {
    onSelect(null); // cursor (empty selection) — the consumer hides the affordance
    return;
  }
  const anchor = createAnchor(view.state, from, to);
  const coords = view.coordsAtPos(head);
  const rect = coords
    ? { left: coords.left, top: coords.top, right: coords.right, bottom: coords.bottom }
    : null;
  onSelect({ text: anchor.quote, anchor, rect });
}
