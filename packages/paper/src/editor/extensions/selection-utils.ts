import type { EditorState } from "@codemirror/state";

// Shared Live-Preview selection helpers. The reveal-on-cursor extensions (inline-syntax-hiding,
// code-block-render, footnote-render, …) all decide "render vs. raw" by asking whether the selection
// sits on a range — so that predicate lives here once instead of being re-declared per extension.

/**
 * Whether any selection range overlaps `[from, to]`, inclusive on both ends.
 *
 * "Touches" is inclusive by design: a collapsed caret sitting exactly at `from` or at `to` counts as
 * touching, so typing at either boundary reveals the raw syntax instead of leaving a rendered widget
 * the caret is wedged against.
 */
export function selectionTouches(state: EditorState, from: number, to: number): boolean {
  return state.selection.ranges.some((range) => range.from <= to && range.to >= from);
}
