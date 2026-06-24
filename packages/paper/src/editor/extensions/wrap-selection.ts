import type { Extension, TransactionSpec } from "@codemirror/state";
import { EditorSelection, type EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

// Wrap-the-selection-on-type (Notion / Obsidian style): with text selected, typing one of the
// opener chars below surrounds the selection with the pair instead of replacing it, and leaves the
// selection on the inner text. Always-on, no consumer config — a sibling of blockquote-keys /
// table-auto-convert (the API surface freezes at 1.0, so this stays a behavior, not an option).
//
// Pairs are limited to single-keypress markers that produce valid, rendering markdown when doubled
// around a selection:
//   - brackets `(` `[` `{` (asymmetric close)
//   - code / quotes `` ` `` `"` `'` (symmetric)
//   - emphasis `*` → `*text*` italic (symmetric)
// Deliberately omitted: `~~`/`**` strikethrough+bold (need *doubled* markers, can't come from one
// keypress) and `_` (CommonMark won't render `_x_` intra-word, unlike `*`). Use Cmd-B etc. for those.
const WRAP_PAIRS: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
  "`": "`",
  '"': '"',
  "'": "'",
  "*": "*",
};

/**
 * Pure decision seam (the package convention, cf. `computeFootnotes` / `findTokenMatches`): if
 * `text` is a single wrap opener and at least one selection range is non-empty, return the
 * transaction that wraps every non-empty range (empty ranges just insert the char) keeping the
 * selection on the inner text. Returns `null` to defer to the default insertion — when `text` has no
 * pair, is pasted/multi-char, or the whole selection is collapsed.
 */
export function wrapEdit(state: EditorState, text: string): TransactionSpec | null {
  const close = WRAP_PAIRS[text];
  if (!close) return null;
  if (state.selection.ranges.every((r) => r.empty)) return null;
  return state.changeByRange((range) => {
    if (range.empty) {
      return {
        changes: { from: range.from, insert: text },
        range: EditorSelection.cursor(range.from + text.length),
      };
    }
    // Selection lands on the inner text (shifted past the inserted opener), original direction kept.
    const innerFrom = range.from + text.length;
    const innerTo = range.to + text.length;
    return {
      changes: [
        { from: range.from, insert: text },
        { from: range.to, insert: close },
      ],
      range:
        range.head >= range.anchor
          ? EditorSelection.range(innerFrom, innerTo)
          : EditorSelection.range(innerTo, innerFrom),
    };
  });
}

/**
 * Thin `inputHandler` dispatcher over {@link wrapEdit}. Skipped during IME composition (invariant #1)
 * — a wrap can only come from a non-composition single-char insert over a selection anyway. A wrap is
 * one dispatch (one undo step) and changes the doc, so `onChange` (keyed on `docChanged`) still fires.
 */
export function wrapSelection(): Extension {
  return EditorView.inputHandler.of((view, _from, _to, text) => {
    if (view.composing) return false;
    const spec = wrapEdit(view.state, text);
    if (!spec) return false;
    view.dispatch(spec, { scrollIntoView: true, userEvent: "input.wrap" });
    return true;
  });
}
