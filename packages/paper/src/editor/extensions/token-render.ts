import { syntaxTree } from "@codemirror/language";
import type { EditorState, Extension } from "@codemirror/state";
import { Facet, Prec } from "@codemirror/state";
import type { DecorationSet } from "@codemirror/view";
import { Decoration, EditorView, keymap, WidgetType } from "@codemirror/view";
import { guardedDecorations } from "./composing-guard";

// Atomic token rendering (ADR-0017). A consumer registers `pattern → view`: a markdown substring that
// matches `pattern` (e.g. an inserted mention `[@Grace Hopper](user:u_003)`) is rendered as an **atomic
// token** — a replace-widget showing the consumer's label, the caret steps over it (never into it), and
// one Backspace at its trailing edge deletes the whole thing. The markdown text is never mutated to
// render (single source of truth), so copy/serialize round-trips to plain markdown for free; identity
// is recovered from the pattern's own capture groups (no separate data channel). Pairs with the trigger
// API (#498/ADR-0016): #498 inserts the markdown, #499 renders it atomically.

/** The declarative view of a matched token (ADR-0017). No `EditorView`/DOM/CM6 type is exposed. */
export interface TokenView {
  /** Text shown in place of the matched markdown. */
  label: string;
  /** Optional class on the token span, for consumer styling (a stable `.cm-*` hook). */
  className?: string;
}

/** A consumer-registered atomic token (ADR-0017) — passed via `EditorOptions.tokens`. Build-time config. */
export interface TokenSpec {
  /**
   * The markdown pattern to render atomically, e.g. `/\[@[^\]]+\]\(user:[^)]+\)/`. Matched per line
   * (a token does not span lines). Matches inside code (fenced or inline) are skipped. Patterns should
   * be mutually exclusive across specs; on overlap the earlier match position wins.
   */
  pattern: RegExp;
  /** Build the token's display from a regex match (its capture groups carry the identity). Declarative. */
  render: (match: RegExpMatchArray) => TokenView;
}

/** A resolved match: the source range plus the consumer's declarative view. */
export interface TokenMatch {
  from: number;
  to: number;
  view: TokenView;
}

const CODE_NODES = new Set([
  "InlineCode",
  "FencedCode",
  "CodeText",
  "CodeBlock",
  "Comment",
  "CommentBlock",
]);

/** Code ranges in [from,to] — token patterns inside code are literal text, never atomized (a 1.0 correctness rule). */
function collectCodeRanges(
  state: EditorState,
  from: number,
  to: number,
): { from: number; to: number }[] {
  const ranges: { from: number; to: number }[] = [];
  syntaxTree(state).iterate({
    from,
    to,
    enter(node) {
      if (CODE_NODES.has(node.name)) ranges.push({ from: node.from, to: node.to });
    },
  });
  return ranges;
}

/**
 * Find every atomic token in [from,to]. Pure and coordinate-independent → the jsdom contract-test seam
 * (ADR-0005); geometry (widget DOM/placement) is carved out for the browser (invariant #4). A fresh
 * RegExp per line avoids cross-line `lastIndex` statefulness; overlapping matches are resolved
 * left-to-right (earlier position wins) so the decoration set never holds conflicting replace ranges.
 */
export function findTokenMatches(
  state: EditorState,
  specs: readonly TokenSpec[],
  from: number,
  to: number,
): TokenMatch[] {
  const code = collectCodeRanges(state, from, to);
  const inCode = (a: number, b: number) => code.some((c) => a < c.to && b > c.from);

  const found: TokenMatch[] = [];
  const startLine = state.doc.lineAt(from).number;
  const endLine = state.doc.lineAt(to).number;
  for (let n = startLine; n <= endLine; n++) {
    const line = state.doc.line(n);
    for (const spec of specs) {
      const flags = spec.pattern.flags.includes("g")
        ? spec.pattern.flags
        : `${spec.pattern.flags}g`;
      const re = new RegExp(spec.pattern.source, flags);
      let m: RegExpExecArray | null;
      // biome-ignore lint/suspicious/noAssignInExpressions: standard global-regex scan loop
      while ((m = re.exec(line.text)) !== null) {
        if (m[0].length === 0) {
          re.lastIndex++;
          continue;
        }
        const mFrom = line.from + m.index;
        const mTo = mFrom + m[0].length;
        if (inCode(mFrom, mTo)) continue;
        found.push({ from: mFrom, to: mTo, view: spec.render(m) });
      }
    }
  }

  // Resolve overlaps: sort by position (longer first on a tie) and keep only non-overlapping ranges,
  // so two specs that match the same text never produce conflicting replace decorations.
  found.sort((a, b) => a.from - b.from || b.to - a.to);
  const result: TokenMatch[] = [];
  let lastTo = -1;
  for (const t of found) {
    if (t.from >= lastTo) {
      result.push(t);
      lastTo = t.to;
    }
  }
  return result;
}

/** The atomic token widget — a non-interactive span carrying the consumer's label (onClick is deferred). */
class TokenWidget extends WidgetType {
  constructor(readonly view: TokenView) {
    super();
  }

  eq(other: TokenWidget): boolean {
    return other.view.label === this.view.label && other.view.className === this.view.className;
  }

  toDOM(): HTMLElement {
    const span = document.createElement("span");
    span.className = this.view.className ? `cm-token ${this.view.className}` : "cm-token";
    span.textContent = this.view.label;
    return span;
  }

  // Let clicks reach the editor so a click on the chip positions the caret at the token boundary
  // (atomicRanges, not this flag, is what keeps the caret out of the token's interior). Without this,
  // clicking an existing chip leaves the caret elsewhere and Backspace can't delete the token.
  ignoreEvent(): boolean {
    return false;
  }
}

/** **Internal** facet carrying the consumer's token specs to the plugin and the Backspace command. */
const tokensFacet = Facet.define<readonly TokenSpec[], readonly TokenSpec[]>({
  combine: (values) => values[0] ?? [],
});

function computeDecorations(view: EditorView): DecorationSet {
  const specs = view.state.facet(tokensFacet);
  if (specs.length === 0) return Decoration.none;
  const ranges: ReturnType<Decoration["range"]>[] = [];
  for (const { from, to } of view.visibleRanges) {
    for (const t of findTokenMatches(view.state, specs, from, to)) {
      ranges.push(Decoration.replace({ widget: new TokenWidget(t.view) }).range(t.from, t.to));
    }
  }
  return Decoration.set(ranges, true);
}

/** Pure: the token range with the given `edge` exactly at `pos` (the Backspace/Delete target), or null. */
export function tokenAtEdge(
  state: EditorState,
  specs: readonly TokenSpec[],
  pos: number,
  edge: "to" | "from",
): { from: number; to: number } | null {
  const line = state.doc.lineAt(pos);
  for (const t of findTokenMatches(state, specs, line.from, line.to)) {
    if (t[edge] === pos) return { from: t.from, to: t.to };
  }
  return null;
}

/**
 * Delete a whole token from either side in one stroke: **Backspace** at its trailing edge (the token
 * is *behind* the caret — e.g. just after inserting), **Delete** at its leading edge (the token is
 * *ahead* — e.g. after clicking the chip, which lands the caret at `from`). `atomicRanges`' own default
 * is to *skip* (move the caret across), not delete, so the delete-whole semantics the issue asks for
 * need these explicit commands (the same lesson as the table's custom Backspace).
 */
function deleteTokenAt(edge: "to" | "from"): (view: EditorView) => boolean {
  return (view) => {
    const sel = view.state.selection.main;
    if (!sel.empty) return false;
    const specs = view.state.facet(tokensFacet);
    if (specs.length === 0) return false;
    const t = tokenAtEdge(view.state, specs, sel.head, edge);
    if (!t) return false;
    view.dispatch({
      changes: { from: t.from, to: t.to },
      selection: { anchor: t.from },
      userEvent: "delete",
    });
    return true;
  };
}

const tokenTheme = EditorView.theme({
  // Porcelain chip — radius 0 (ADR-0009), accent-tinted. The consumer fully restyles via `className`.
  ".cm-token": {
    backgroundColor: "var(--accent-sel)",
    color: "var(--accent)",
    border: "1px solid var(--accent)",
    padding: "0 0.25em",
    whiteSpace: "nowrap",
  },
});

/**
 * Wire atomic token rendering (ADR-0017). Returns nothing when no tokens are registered, so a consumer
 * that doesn't use it pays zero overhead (lightness). Decorations ride the IME-guarded `atomic` path of
 * `guardedDecorations`; the Backspace command sits at `Prec.high` to beat the default delete.
 */
export function tokenRender(specs?: readonly TokenSpec[]): Extension {
  if (!specs || specs.length === 0) return [];
  return [
    tokensFacet.of(specs),
    guardedDecorations("token-render", computeDecorations, { atomic: true }),
    Prec.high(
      keymap.of([
        { key: "Backspace", run: deleteTokenAt("to") },
        { key: "Delete", run: deleteTokenAt("from") },
      ]),
    ),
    tokenTheme,
  ];
}
