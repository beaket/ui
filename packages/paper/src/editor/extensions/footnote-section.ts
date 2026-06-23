import type { EditorState, Extension } from "@codemirror/state";
import { StateField } from "@codemirror/state";
import type { DecorationSet } from "@codemirror/view";
import { Decoration, EditorView, WidgetType } from "@codemirror/view";
import { type FootnoteModel, footnoteModelField } from "./footnote-render";

// The collected "Footnotes" section — definitions authored anywhere in the source are gathered into a
// numbered list rendered after the last line (GitHub's presentation). This is a **block** decoration,
// which CM6 requires to come from a StateField, not a ViewPlugin ("Block decorations may not be
// specified via plugins") — so it lives here, separate from the plugin-based reference rendering.
//
// IME safety without the composing-guard plugin (which a StateField can't use): the field recomputes
// only on `docChanged` (the section content depends on the doc, never on the cursor), and the widget's
// `eq()` compares the full rendered model — so composing CJK into a paragraph leaves the definition set
// unchanged → `eq` true → CM6 keeps the existing DOM, no rebuild near the composition target.

interface SectionItem {
  num: number;
  label: string;
  /** Plain body text. v1 does not render inline markdown inside a footnote body (a deliberate cut). */
  body: string;
}

function buildItems(model: FootnoteModel): SectionItem[] {
  return model.order.map((label) => ({
    num: model.numberOf.get(label) as number,
    label,
    body: model.defs.get(label)?.body ?? "",
  }));
}

class FootnoteSectionWidget extends WidgetType {
  constructor(readonly items: SectionItem[]) {
    super();
  }

  eq(other: FootnoteSectionWidget): boolean {
    if (other.items.length !== this.items.length) return false;
    return this.items.every((it, i) => {
      const o = other.items[i];
      return it.num === o.num && it.label === o.label && it.body === o.body;
    });
  }

  toDOM(): HTMLElement {
    const section = document.createElement("div");
    section.className = "cm-footnotes-section";
    section.setAttribute("contenteditable", "false");

    // No heading label — the top border alone marks the collected zone.
    const ol = document.createElement("ol");
    ol.className = "cm-footnotes-list";
    for (const item of this.items) {
      const li = document.createElement("li");
      li.className = "cm-footnotes-item";
      li.value = item.num; // <li value> drives the displayed ordinal
      li.setAttribute("data-footnote-label", item.label);
      li.textContent = item.body || " ";
      ol.appendChild(li);
    }
    section.appendChild(ol);
    return section;
  }

  ignoreEvent(): boolean {
    return false; // let clicks through so the section can offer jump-to-source
  }
}

function sectionDecorations(state: EditorState): DecorationSet {
  const model = state.field(footnoteModelField);
  if (model.order.length === 0) return Decoration.none;
  const widget = Decoration.widget({
    widget: new FootnoteSectionWidget(buildItems(model)),
    block: true,
    side: 1,
  });
  return Decoration.set([widget.range(state.doc.length)]);
}

const footnoteSectionField = StateField.define<DecorationSet>({
  create: (state) => sectionDecorations(state),
  update(value, tr) {
    // The section content depends only on the document. Skip recompute on pure selection/viewport
    // transactions; just map the end-anchored widget to the new coordinates.
    if (!tr.docChanged) return value.map(tr.changes);
    return sectionDecorations(tr.state);
  },
  provide: (f) => EditorView.decorations.from(f),
});

// Click a collected item → move the cursor to its source definition line. The cursor landing there is
// what reveals the raw `[^x]: …` inline (via footnote-render's reveal-on-cursor) — so editing always
// happens at the source, and the section stays a read-only publish preview. mousedown (not click) so
// we beat CM's own selection handling; preventDefault keeps focus/caret where we put it.
const footnoteSectionClick = EditorView.domEventHandlers({
  mousedown(event, view) {
    const target = event.target as HTMLElement | null;
    const item = target?.closest?.(".cm-footnotes-item") as HTMLElement | null;
    if (!item) return false;
    const label = item.getAttribute("data-footnote-label");
    if (!label) return false;
    const def = view.state.field(footnoteModelField).defs.get(label);
    if (!def) return false;
    event.preventDefault();
    view.focus();
    // Land at the end of the definition body so the writer is positioned to keep typing.
    view.dispatch({ selection: { anchor: def.to }, scrollIntoView: true });
    return true;
  },
});

const footnoteSectionTheme = EditorView.theme({
  ".cm-footnotes-section": {
    marginTop: "2em",
    paddingTop: "1em",
    borderTop: "1px solid var(--silver)",
  },
  ".cm-footnotes-list": {
    margin: "0",
    paddingLeft: "1.4em",
    color: "var(--steel)",
    fontSize: "0.9em",
    lineHeight: "1.6",
  },
  ".cm-footnotes-item": {
    paddingLeft: "0.2em",
    cursor: "pointer",
  },
  ".cm-footnotes-item::marker": {
    color: "var(--accent)",
    fontWeight: "600",
  },
});

/** Wire the collected footnotes section (block widget at the end of the document). */
export function footnoteSection(): Extension {
  return [footnoteSectionField, footnoteSectionClick, footnoteSectionTheme];
}
