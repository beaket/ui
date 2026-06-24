import { syntaxTree } from "@codemirror/language";
import { type EditorState, type Extension, StateField } from "@codemirror/state";
import type { DecorationSet } from "@codemirror/view";
import { Decoration, EditorView, WidgetType } from "@codemirror/view";
import { guardedDecorations } from "./composing-guard";

// Live-Preview rendering for footnotes. A `[^label]` reference renders as a superscript ordinal
// off-cursor and reveals its raw `[^label]` when the cursor touches it — the same reveal-on-cursor
// contract as inline-syntax-hiding, not the permanently-atomic token path. Numbering is GitHub's: by
// first-reference order in the body, and only references that have a matching definition become a number
// (an undefined `[^x]` stays literal text). The collected section (footnote-section.ts) reads the same
// model.

/** A footnote definition resolved from the source: its source range, label, and raw body text. */
export interface FootnoteDef {
  label: string;
  from: number;
  to: number;
  /** Body text after `[^label]:` (leading space trimmed). Plain text in v1 — inline md is not rendered. */
  body: string;
}

/** The whole-document footnote model, shared by the reference renderer and the collected section. */
export interface FootnoteModel {
  /** label → 1-based ordinal, by first-reference order; only labels that have a definition. */
  numberOf: Map<string, number>;
  /** Labels in numbered order (i.e. the order the collected section lists them). */
  order: string[];
  /** label → definition (last wins if a label is defined twice). */
  defs: Map<string, FootnoteDef>;
}

const REF_RE = /^\[\^([^\]]+)\]$/;
const DEF_RE = /^\[\^([^\]]+)\]:\s?/;

/**
 * Build the footnote model for the whole document. Pure + coordinate-independent → the jsdom
 * contract-test seam (ADR-0005). Scans the full doc (not just the viewport) because numbering is global
 * and stable: a reference's number can't depend on what happens to be scrolled into view.
 */
export function computeFootnotes(state: EditorState): FootnoteModel {
  const defs = new Map<string, FootnoteDef>();
  const refLabelsInOrder: string[] = [];

  syntaxTree(state).iterate({
    from: 0,
    to: state.doc.length,
    enter(node) {
      if (node.name === "FootnoteDefinition") {
        const text = state.doc.sliceString(node.from, node.to);
        const m = DEF_RE.exec(text);
        if (m) {
          const label = m[1];
          defs.set(label, {
            label,
            from: node.from,
            to: node.to,
            body: text.slice(m[0].length),
          });
        }
        return false; // don't descend into the definition's marks
      }
      if (node.name === "FootnoteReference") {
        const m = REF_RE.exec(state.doc.sliceString(node.from, node.to));
        if (m) refLabelsInOrder.push(m[1]);
      }
    },
  });

  const numberOf = new Map<string, number>();
  const order: string[] = [];
  for (const label of refLabelsInOrder) {
    if (numberOf.has(label) || !defs.has(label)) continue;
    order.push(label);
    numberOf.set(label, order.length);
  }

  return { numberOf, order, defs };
}

/**
 * The footnote model, recomputed once per document change and shared by the reference renderer, the
 * collected section, and the jump-to-source handler. Numbering is global, so the model is a whole-doc
 * scan — caching it here keeps cursor moves (which re-run the reference renderer) from rescanning.
 */
export const footnoteModelField = StateField.define<FootnoteModel>({
  create: computeFootnotes,
  update: (value, tr) => (tr.docChanged ? computeFootnotes(tr.state) : value),
});

/** Superscript ordinal shown in place of a `[^label]` reference off-cursor. */
class FootnoteRefWidget extends WidgetType {
  constructor(readonly num: number) {
    super();
  }

  eq(other: FootnoteRefWidget): boolean {
    return other.num === this.num;
  }

  toDOM(): HTMLElement {
    const sup = document.createElement("sup");
    sup.className = "cm-footnote-ref";
    sup.textContent = String(this.num);
    return sup;
  }

  // Let clicks reach the editor so clicking the superscript places the caret there (revealing raw),
  // rather than being swallowed by the widget.
  ignoreEvent(): boolean {
    return false;
  }
}

/**
 * The off-cursor rendering of a definition line: its number plus the rendered body, shown in place
 * where the `[^x]: …` is authored — a real, locatable footnote, not an invisible strip. Clicking or
 * cursoring it reveals the raw line for editing; the same text is also gathered in the collected
 * section, and both derive from the one source so an edit updates them together. (Body is plain text
 * in v1 — inline markdown inside a footnote is not yet rendered.)
 */
class FootnoteDefWidget extends WidgetType {
  constructor(
    readonly num: number,
    readonly body: string,
  ) {
    super();
  }

  eq(other: FootnoteDefWidget): boolean {
    return other.num === this.num && other.body === this.body;
  }

  toDOM(): HTMLElement {
    const wrap = document.createElement("span");
    wrap.className = "cm-footnote-def";

    const num = document.createElement("sup");
    num.className = "cm-footnote-def-num";
    num.textContent = String(this.num);

    const body = document.createElement("span");
    body.className = "cm-footnote-def-body";
    body.textContent = this.body || " ";

    wrap.append(num, body);
    return wrap;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

function selectionTouches(state: EditorState, from: number, to: number): boolean {
  return state.selection.ranges.some((range) => range.from <= to && range.to >= from);
}

function computeRefDecorations(view: EditorView): DecorationSet {
  const { state } = view;
  const { numberOf } = state.field(footnoteModelField);
  if (numberOf.size === 0) return Decoration.none;

  const ranges: ReturnType<Decoration["range"]>[] = [];
  for (const { from, to } of view.visibleRanges) {
    syntaxTree(state).iterate({
      from,
      to,
      enter(node) {
        if (node.name === "FootnoteReference") {
          const m = REF_RE.exec(state.doc.sliceString(node.from, node.to));
          if (!m) return;
          const num = numberOf.get(m[1]);
          if (num === undefined) return; // undefined label → stays literal `[^x]`
          if (selectionTouches(state, node.from, node.to)) return; // reveal raw on cursor
          ranges.push(
            Decoration.replace({ widget: new FootnoteRefWidget(num) }).range(node.from, node.to),
          );
          return;
        }
        if (node.name === "FootnoteDefinition") {
          const text = state.doc.sliceString(node.from, node.to);
          const m = DEF_RE.exec(text);
          if (!m) return false;
          const num = numberOf.get(m[1]);
          if (num === undefined) return false; // unreferenced def → stays raw
          const line = state.doc.lineAt(node.from);
          if (selectionTouches(state, line.from, line.to)) return false; // editing → raw
          // Off-cursor: render the raw `[^x]: …` in place as a real footnote (number + body).
          ranges.push(
            Decoration.replace({
              widget: new FootnoteDefWidget(num, text.slice(m[0].length)),
            }).range(node.from, node.to),
          );
          return false; // don't descend into the definition's marks
        }
      },
    });
  }
  return Decoration.set(ranges, true);
}

const footnoteTheme = EditorView.theme({
  ".cm-footnote-ref": {
    color: "var(--accent)",
    fontWeight: "600",
    cursor: "pointer",
    // Sit the number tight against the preceding word, like a printed footnote mark.
    padding: "0 0.1em",
  },
  // The off-cursor definition rendered in place: an accent number + a *faded* body so the parked
  // definition recedes from the body flow (it reads cleanly at the bottom; here it's just a locatable,
  // number-anchored marker). Faded by mixing --steel toward --paper — theme-aware (lighter in light,
  // dimmer in dark) and no new token. Size held at 0.8em, NOT smaller: CJK glyphs lose legibility when
  // shrunk further. The hover tint signals it's clickable (cursor → reveals raw for editing).
  ".cm-footnote-def": {
    cursor: "pointer",
    color: "color-mix(in srgb, var(--steel) 68%, var(--paper))",
    fontSize: "0.8em",
  },
  ".cm-footnote-def-num": {
    color: "var(--accent)",
    fontWeight: "600",
    marginRight: "0.35em",
  },
  ".cm-footnote-def:hover": {
    backgroundColor: "var(--accent-sel)",
  },
});

/** Wire footnote reference + in-place definition rendering, and the shared model field both halves read. */
export function footnoteRender(): Extension {
  return [
    footnoteModelField,
    guardedDecorations("footnote-render", computeRefDecorations),
    footnoteTheme,
  ];
}
