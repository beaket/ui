import { syntaxTree } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import { Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import type { SyntaxNode } from "@lezer/common";

// Blockquote key behavior (ADR-0009 decision 6). Obsidian style — Enter escapes, level changes use Tab-style.
//  - Enter, line with content: continue at the same depth (`> > foo` → next line `> > `).
//  - Enter, empty blockquote line: escape the whole blockquote — remove all `>` (leaving an empty separator line). Escapes after Enter twice past content.
//  - Tab: indent the current blockquote line one level deeper (`> > ` → `> > > `, `> > x` → `> > > x`).
//  - Shift+Tab: outdent the current blockquote line one level. For empty lines, **auto-insert a separator line (`>`)** so you can
//    write one level shallower right there (without the separator, typed text gets absorbed into the deeper paragraph above as a lazy continuation — measured).
//    At depth 1, escape.
//
// Why Prec.highest: lang-markdown's markdown() auto-registers markdownKeymap (Enter→continue) at Prec.high
// (index.js: addKeymap defaults to true). To override that default continuation (which can't escape the blockquote) only on blockquote lines,
// we must be above it (highest). But register after the slash menu (also highest) so we yield to it, and code-block
// `>` lines are filtered out via syntaxTree and left untouched. We don't intervene during IME composition (ADR-0004 spirit).

// Blockquote prefix at line head: each `>` with 0~1 space. e.g. "> > " → depth 2, ">>x" → depth 2.
const QUOTE_PREFIX = /^((?: *> ?)+)/;

/** Whether the cursor is actually inside a Blockquote node (prevents misidentifying code-block `>` lines / plain body text) */
function inBlockquote(view: EditorView, pos: number): boolean {
  for (let n: SyntaxNode | null = syntaxTree(view.state).resolveInner(pos, -1); n; n = n.parent) {
    if (n.name === "Blockquote") return true;
    if (n.name === "FencedCode" || n.name === "CodeBlock") return false;
  }
  return false;
}

/** Returns {line, depth, prefixLen, contentEmpty} if the cursor is on a blockquote line (empty or content line), else null.
 *  Excludes all of: during composition, selection ranges, code-block `>`, and lines without a `>` prefix (the common guard for all 3 key behaviors). */
function quoteContext(view: EditorView) {
  if (view.composing) return null;
  const sel = view.state.selection.main;
  if (!sel.empty) return null;
  if (!inBlockquote(view, sel.head)) return null;
  const line = view.state.doc.lineAt(sel.head);
  const m = QUOTE_PREFIX.exec(line.text);
  if (!m) return null;
  const prefixLen = m[1].length;
  return {
    line,
    depth: (m[1].match(/>/g) ?? []).length,
    prefixLen,
    contentEmpty: /^\s*$/.test(line.text.slice(prefixLen)),
  };
}

/** Common dispatch that replaces a single-line range and places the cursor */
function applyEdit(
  view: EditorView,
  from: number,
  to: number,
  insert: string,
  anchor: number,
  userEvent: string,
): void {
  view.dispatch({
    changes: { from, to, insert },
    selection: { anchor },
    scrollIntoView: true,
    userEvent,
  });
}

export function blockquoteNewline(view: EditorView): boolean {
  const ctx = quoteContext(view);
  if (!ctx) return false;
  const { line, depth, prefixLen, contentEmpty } = ctx;
  // List/task lines inside a blockquote yield to markdownKeymap (since the blockquote + list marker must be continued together).
  if (/^\s*([-*+]|\d+[.)])\s/.test(line.text.slice(prefixLen))) return false;

  if (contentEmpty) {
    // Empty blockquote line: escape entirely. Replace the marker line with an empty line (`\n`), **leaving an empty separator line and placing the cursor on the new line below it**.
    // Without the separator line, text typed right away gets absorbed into the blockquote above as a CommonMark lazy continuation (measured bug).
    applyEdit(view, line.from, line.to, "\n", line.from + 1, "delete.dedent");
    return true;
  }
  // If the cursor is inside the prefix (`> > `), it would split the marker, so yield to the default behavior (rare).
  if (view.state.selection.main.head < line.from + prefixLen) return false;
  // Line with content: continue at the same depth (split at the cursor position).
  view.dispatch(view.state.replaceSelection("\n" + "> ".repeat(depth)), {
    scrollIntoView: true,
    userEvent: "input",
  });
  return true;
}

/** Tab: indent the current blockquote line one level deeper. Going deeper adds a marker for new nesting, so it's always safe (no separator line needed). */
export function blockquoteIndent(view: EditorView): boolean {
  const ctx = quoteContext(view);
  if (!ctx) return false;
  const { line, depth, prefixLen } = ctx;
  const newPrefix = "> ".repeat(depth + 1);
  const head = view.state.selection.main.head;
  applyEdit(
    view,
    line.from,
    line.from + prefixLen,
    newPrefix,
    head + (newPrefix.length - prefixLen),
    "input",
  );
  return true;
}

/** Shift+Tab: outdent the current blockquote line one level. Empty lines get a separator line inserted (to prevent typing absorption); content lines
 *  only shrink the prefix (fine for standalone lines; pulling out a single line from a deep multi-line paragraph is a limitation in that rare case). At depth 1, escape. */
export function blockquoteOutdent(view: EditorView): boolean {
  const ctx = quoteContext(view);
  if (!ctx) return false;
  const { line, depth, prefixLen, contentEmpty } = ctx;
  const target = depth - 1;
  const head = view.state.selection.main.head;

  if (contentEmpty) {
    // Empty line: since typing will happen right there, a separator line is needed to break the lazy continuation (measured).
    // Escape (target 0): empty separator line (`\n`). Otherwise: [depth-target separator line] + [depth-target line]. Cursor at the end.
    const insert = target <= 0 ? "\n" : "> ".repeat(target).trimEnd() + "\n" + "> ".repeat(target);
    applyEdit(view, line.from, line.to, insert, line.from + insert.length, "delete.dedent");
    return true;
  }
  // Content line: shrink only the prefix by one level (if target 0, remove the blockquote → plain text).
  const newPrefix = target <= 0 ? "" : "> ".repeat(target);
  const anchor = Math.max(line.from, head - (prefixLen - newPrefix.length));
  applyEdit(view, line.from, line.from + prefixLen, newPrefix, anchor, "delete.dedent");
  return true;
}

// Overrides markdownKeymap's (Prec.high) default Enter continuation on blockquote lines. To yield to the slash menu,
// it's registered after slashCommand in createEditor (within the same highest, the earlier-registered one wins).
export const blockquoteKeymap: Extension = Prec.highest(
  keymap.of([
    { key: "Enter", run: blockquoteNewline },
    { key: "Tab", run: blockquoteIndent },
    { key: "Shift-Tab", run: blockquoteOutdent },
  ]),
);
