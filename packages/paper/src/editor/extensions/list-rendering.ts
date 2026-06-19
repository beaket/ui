import { syntaxTree } from "@codemirror/language";
import type { EditorState, Extension } from "@codemirror/state";
import type { DecorationSet } from "@codemirror/view";
import { Decoration, EditorView, WidgetType } from "@codemirror/view";
import { guardedDecorations } from "./composing-guard";

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
        decorations.push({
          from: line.from,
          to: line.from,
          deco: Decoration.line({
            attributes: { style: `padding-left:${contentCol}ch;text-indent:-${contentCol}ch` },
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
// graphite (≈--ink) border, checked fills with ink and a white checkmark. accent only on focus.
// A native input can't draw ::after, so appearance:none + SVG background stamps the check.
const CHECK_MARK =
  "url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2016%2016'%20fill='none'%20stroke='%23ffffff'%20stroke-width='2.25'%3E%3Cpath%20d='M3.5%208.5l3%203%206-6'/%3E%3C/svg%3E\")";
// Dark mode stamps onto a light --ink fill, so the white checkmark above would vanish; use a dark stroke instead.
const CHECK_MARK_DARK =
  "url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2016%2016'%20fill='none'%20stroke='%230d1117'%20stroke-width='2.25'%3E%3Cpath%20d='M3.5%208.5l3%203%206-6'/%3E%3C/svg%3E\")";

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
        background: `var(--ink) ${CHECK_MARK} center / 11px no-repeat`,
        borderColor: "var(--ink)",
      },
      ".cm-task-checkbox:focus-visible": {
        outline: "2px solid var(--accent)",
        outlineOffset: "2px",
      },
      // Dark mode: --ink fills light, so the white checkmark would disappear — stamp a dark one instead.
      "@media (prefers-color-scheme: dark)": {
        ".cm-task-checkbox:checked": {
          background: `var(--ink) ${CHECK_MARK_DARK} center / 11px no-repeat`,
        },
      },
    }),
  ];
}
