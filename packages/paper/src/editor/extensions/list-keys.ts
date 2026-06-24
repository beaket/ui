import { syntaxTree } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import { Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import type { SyntaxNode } from "@lezer/common";

// List indent keys (ADR-0022). Tab nests the current list item one level deeper, Shift+Tab lifts it
// one level shallower — the Obsidian/Typora convention, extending the blockquote Tab pattern
// (blockquote-keys.ts / ADR-0009 decision 6) to lists.
//
// Why the syntax tree, not a regex (as blockquote does): valid markdown nesting depth is NOT "any
// number of spaces". A nested item must be indented to exactly the **content column of the item it
// nests under** (2 under `- `, 3 under `1. `); the wrong width yields invalid nesting, or — at 4
// spaces on a plain line — an indented code block. So we read the real tree:
//  - Tab: nest under the **preceding sibling** item. The first item of a list has no parent to nest
//    under, so Tab there is a no-op (consumed, not a focus escape).
//  - Shift+Tab: if nested, lift to the grandparent level (sibling of the parent item); at top level,
//    strip the marker (lift out of the list into a paragraph).
//  - The whole item subtree (continuation + child items) shifts by a uniform delta, so relative
//    nesting is preserved across multi-line items.
//
// Blockquote-aware: a list inside a blockquote sits *after* the `> ` prefix, so all indent columns are
// measured, and all edits applied, relative to the line's quote prefix — never at the raw line start
// (which would corrupt the `>` markers).
//
// v1 limits (ADR-0022): ordered-list renumbering is left to the source author; a range selection and
// an in-code-block list line fall through (the latter yields to codeBlockEnter's Tab). IME-guarded.

// Blockquote marker prefix at line head: each `>` with 0~1 trailing space. List indentation begins
// after it. No match (length 0) on a plain list line.
const QUOTE_PREFIX = /^(?: *> ?)+/;
const quoteLen = (text: string): number => QUOTE_PREFIX.exec(text)?.[0].length ?? 0;

/** The innermost ListItem at the cursor, or null. Yields (returns null) inside a code block so the
 *  code-block Tab handler owns a list line that happens to wrap a fenced block. */
function listItemAt(view: EditorView): SyntaxNode | null {
  if (view.composing) return null;
  const sel = view.state.selection.main;
  if (!sel.empty) return null;
  const tree = syntaxTree(view.state);
  // Try both association sides — at an empty `- ` line the cursor can resolve to the BulletList.
  for (const side of [-1, 1] as const) {
    for (let n: SyntaxNode | null = tree.resolveInner(sel.head, side); n; n = n.parent) {
      if (n.name === "FencedCode" || n.name === "CodeBlock") return null;
      if (n.name === "ListItem") return n;
    }
  }
  return null;
}

interface ItemInfo {
  mark: SyntaxNode;
  /** Column of the marker relative to the line's content (after any `> ` quote prefix). */
  indent: number;
}

function itemInfo(view: EditorView, item: SyntaxNode): ItemInfo | null {
  const mark = item.getChild("ListMark");
  if (!mark) return null;
  const line = view.state.doc.lineAt(mark.from);
  return { mark, indent: mark.from - line.from - quoteLen(line.text) };
}

/** Apply a uniform list-indent change to every line the item spans (subtree included). A positive
 *  delta inserts spaces, negative removes them — always just after each line's quote prefix. */
function shiftSubtree(view: EditorView, item: SyntaxNode, delta: number, userEvent: string): void {
  const { doc } = view.state;
  const fromLine = doc.lineAt(item.from);
  const toLine = doc.lineAt(Math.max(item.from, item.to - 1));
  const changes: { from: number; to?: number; insert?: string }[] = [];
  for (let ln = fromLine.number; ln <= toLine.number; ln++) {
    const line = doc.line(ln);
    const at = line.from + quoteLen(line.text);
    if (delta > 0) {
      if (line.to > at) changes.push({ from: at, insert: " ".repeat(delta) });
    } else {
      const ws = /^[ \t]*/.exec(line.text.slice(at - line.from))?.[0].length ?? 0;
      const rm = Math.min(-delta, ws);
      if (rm > 0) changes.push({ from: at, to: at + rm });
    }
  }
  if (changes.length === 0) return;
  view.dispatch({ changes, userEvent, scrollIntoView: true });
}

/** Tab: nest the current item one level deeper, under its preceding sibling. */
export function listIndent(view: EditorView): boolean {
  const item = listItemAt(view);
  if (!item) return false;
  const self = itemInfo(view, item);
  if (!self) return true;
  // Preceding sibling ListItem within the same list — the node we nest under.
  let prev: SyntaxNode | null = item.prevSibling;
  while (prev && prev.name !== "ListItem") prev = prev.prevSibling;
  if (!prev) return true; // first item: nothing to nest under → consume, no-op
  const prevInfo = itemInfo(view, prev);
  if (!prevInfo) return true;
  const prevLine = view.state.doc.lineAt(prevInfo.mark.from);
  // Target = the preceding sibling's content column (marker end + 1 space), quote-relative.
  const target = prevInfo.mark.to - prevLine.from - quoteLen(prevLine.text) + 1;
  const delta = target - self.indent;
  if (delta <= 0) return true;
  shiftSubtree(view, item, delta, "input.indent");
  return true;
}

/** Shift+Tab: lift the current item one level shallower (or strip the marker at top level). */
export function listOutdent(view: EditorView): boolean {
  const item = listItemAt(view);
  if (!item) return false;
  const self = itemInfo(view, item);
  if (!self) return true;
  // Nearest ancestor ListItem — present iff this item is nested.
  let parent: SyntaxNode | null = item.parent;
  while (parent && parent.name !== "ListItem") parent = parent.parent;

  if (parent) {
    const parentInfo = itemInfo(view, parent);
    if (!parentInfo) return true;
    const delta = self.indent - parentInfo.indent; // leading list-indent to remove from the subtree
    if (delta <= 0) return true;
    shiftSubtree(view, item, -delta, "delete.dedent");
    return true;
  }
  // Top level: strip the marker (+ one trailing space) → plain paragraph, keeping any quote prefix.
  const { doc } = view.state;
  const after = doc.sliceString(self.mark.to, self.mark.to + 1);
  const from = self.mark.from - self.indent; // start of the list indentation (after the quote prefix)
  const to = after === " " ? self.mark.to + 1 : self.mark.to;
  view.dispatch({
    changes: { from, to, insert: "" },
    userEvent: "delete.dedent",
    scrollIntoView: true,
  });
  return true;
}

// Prec.highest so it beats lang-markdown's markdownKeymap (Prec.high) and claims list lines before
// blockquoteKeymap (also highest) — a list line inside a blockquote should indent the list, not the
// quote. Registered after the slash/trigger menus in createEditor so an open menu's Tab wins (at the
// same precedence the earlier registration wins; the menu handlers return false when closed).
export const listKeymap: Extension = Prec.highest(
  keymap.of([
    { key: "Tab", run: listIndent },
    { key: "Shift-Tab", run: listOutdent },
  ]),
);
