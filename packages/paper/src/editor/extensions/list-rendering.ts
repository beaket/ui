import { syntaxTree } from "@codemirror/language";
import type { EditorState, Extension } from "@codemirror/state";
import type { DecorationSet } from "@codemirror/view";
import { Decoration, EditorView, WidgetType } from "@codemirror/view";
import { BQ_UNIT } from "./block-syntax-hiding";
import { guardedDecorations } from "./composing-guard";

// Quote nesting clamp — mirrors block-syntax-hiding's QUOTE_MAX_DEPTH so an in-quote list's left gutter
// tracks the (clamped) blockquote bar gutter exactly.
const QUOTE_MAX_DEPTH = 4;

// List rendering: on lines outside the cursor, bullet marks (- * +) become •, and task markers (- [ ])
// become click-toggle checkbox widgets. When the cursor enters a line, the source is revealed.

class BulletWidget extends WidgetType {
  eq(): boolean {
    return true;
  }

  toDOM(): HTMLElement {
    const span = document.createElement("span");
    span.className = "cm-list-bullet";
    span.textContent = "•";
    return span;
  }
}

class CheckboxWidget extends WidgetType {
  private readonly checked: boolean;
  private readonly markerFrom: number;
  private readonly markerTo: number;

  constructor(checked: boolean, markerFrom: number, markerTo: number) {
    super();
    this.checked = checked;
    this.markerFrom = markerFrom;
    this.markerTo = markerTo;
  }

  eq(other: CheckboxWidget): boolean {
    return (
      other.checked === this.checked &&
      other.markerFrom === this.markerFrom &&
      other.markerTo === this.markerTo
    );
  }

  toDOM(view: EditorView): HTMLElement {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "cm-task-checkbox";
    input.checked = this.checked;
    input.addEventListener("mousedown", (event) => {
      event.preventDefault();
      view.dispatch({
        changes: {
          from: this.markerFrom,
          to: this.markerTo,
          insert: this.checked ? "[ ]" : "[x]",
        },
      });
    });
    return input;
  }
}

const bulletDeco = Decoration.replace({ widget: new BulletWidget() });

function selectionTouchesLine(state: EditorState, pos: number): boolean {
  const line = state.doc.lineAt(pos);
  return state.selection.ranges.some((range) => range.from <= line.to && range.to >= line.from);
}

function computeDecorations(view: EditorView): DecorationSet {
  const { state } = view;
  const decorations: { from: number; to: number; deco: Decoration }[] = [];

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(state).iterate({
      from,
      to,
      enter(node) {
        if (node.name !== "ListItem") return;

        const listMark = node.node.getChild("ListMark");
        if (!listMark) return;

        // Hanging indent: on a line break, align the second line to the content start rather than the marker.
        // Content start column = marker end - line start + 1 space (includes leading indentation). Applied
        // regardless of cursor presence to prevent a horizontal jump when the cursor enters.
        const line = state.doc.lineAt(listMark.from);
        const contentCol = listMark.to - line.from + 1;
        // A list inside a blockquote shares the line's `padding-left` with the quote's bar gutter, and
        // this inline style would otherwise OVERRIDE that gutter — pulling the bullet onto the bar. Add
        // the quote gutter (depth × BQ_UNIT em, clamped like the bar) back in via calc so the bullet sits
        // right of the bar. text-indent (the hanging indent) stays the list part only.
        let quoteDepth = 0;
        for (let p = node.node.parent; p; p = p.parent) {
          if (p.name === "Blockquote") quoteDepth++;
        }
        const gutter = Math.min(quoteDepth, QUOTE_MAX_DEPTH) * BQ_UNIT;
        const paddingLeft = gutter
          ? `calc(${gutter.toFixed(2)}em + ${contentCol}ch)`
          : `${contentCol}ch`;
        decorations.push({
          from: line.from,
          to: line.from,
          deco: Decoration.line({
            attributes: { style: `padding-left:${paddingLeft};text-indent:-${contentCol}ch` },
          }),
        });

        if (selectionTouchesLine(state, node.from)) return;
        const markText = state.doc.sliceString(listMark.from, listMark.to);
        const isBullet = markText === "-" || markText === "*" || markText === "+";

        const task = node.node.getChild("Task");
        const taskMarker = task?.getChild("TaskMarker");
        if (taskMarker && isBullet) {
          // Replace the whole `- [ ] ` with a single checkbox
          const checked =
            state.doc.sliceString(taskMarker.from, taskMarker.to).toLowerCase() === "[x]";
          const after = state.doc.sliceString(taskMarker.to, taskMarker.to + 1);
          decorations.push({
            from: listMark.from,
            to: after === " " ? taskMarker.to + 1 : taskMarker.to,
            deco: Decoration.replace({
              widget: new CheckboxWidget(checked, taskMarker.from, taskMarker.to),
            }),
          });
        } else if (isBullet) {
          decorations.push({ from: listMark.from, to: listMark.to, deco: bulletDeco });
        }
        // Ordered lists (1. 2.) are left as-is since the number is itself content
      },
    });
  }

  return Decoration.set(
    decorations.map((d) => d.deco.range(d.from, d.to)),
    true,
  );
}

// A minimal port of the beaket/ui (brutalist) checkbox: sharp square, unchecked is white background +
// graphite (≈--ink) border, checked fills with --ink and a checkmark. accent only on focus. A native
// input can't draw ::after, so appearance:none + an SVG background stamps the check. The checkmark
// image is the editor token --cm-check-mark (theme.ts): light = white stroke, dark = dark stroke — so
// it follows a forced colorScheme via the scope class, not a bare prefers-color-scheme query (#487).

export function listRendering(): Extension {
  return [
    guardedDecorations("list-rendering", computeDecorations),
    EditorView.theme({
      ".cm-list-bullet": { color: "var(--steel)" },
      ".cm-task-checkbox": {
        appearance: "none",
        WebkitAppearance: "none",
        boxSizing: "border-box",
        width: "15px",
        height: "15px",
        margin: "0 7px 0 1px",
        verticalAlign: "-2px",
        border: "1px solid var(--slate)",
        borderRadius: "0",
        background: "var(--paper)",
        cursor: "pointer",
      },
      ".cm-task-checkbox:hover": { borderColor: "var(--ink)" },
      ".cm-task-checkbox:checked": {
        background: "var(--ink) var(--cm-check-mark) center / 11px no-repeat",
        borderColor: "var(--ink)",
      },
      ".cm-task-checkbox:focus-visible": {
        outline: "2px solid var(--accent)",
        outlineOffset: "2px",
      },
    }),
  ];
}
