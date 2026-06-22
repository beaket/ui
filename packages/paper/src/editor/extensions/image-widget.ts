import { syntaxTree } from "@codemirror/language";
import type { EditorState, Extension } from "@codemirror/state";
import type { DecorationSet } from "@codemirror/view";
import { Decoration, EditorView, WidgetType } from "@codemirror/view";
import { guardedDecorations } from "./composing-guard";

// Live Preview: a line that is entirely a single image (`![alt](url)`) is shown as a rendered
// image when the cursor is outside that line, and exposes the `![alt](url)` source for editing
// when the cursor touches it. Same "line with cursor = source" rule as the horizontal rule
// `---` (blockSyntaxHiding) — it swaps the HR's `::after` horizontal rule for an `<img>` widget.
//
// Caption: the markdown `title` is the visible caption (consumer convention) — `![alt](url "caption")`
// renders <figure><img><figcaption>, a bare `![alt](url)` renders a plain <img>. See toDOM.
// guardedDecorations (ViewPlugin) provides the composing guard, so StateField/atomicRanges/coordsAt
// are not needed.
//
// Scope (first pass): displaying web URLs only. Local file drop/upload (ingest) is separate work
// (PLAN-images.md Phase B).

export interface ParsedImage {
  alt: string;
  url: string;
  title: string | null;
}

// `![alt](url)` / `![alt](url "title")`. The URL is parsed simply as a whitespace-free token (URLs with parens are rare).
const IMAGE_RE = /^!\[([^\]]*)\]\(\s*(\S+?)(?:\s+"([^"]*)")?\s*\)$/;

export function parseImage(src: string): ParsedImage | null {
  const m = IMAGE_RE.exec(src.trim());
  if (!m) return null;
  return { alt: m[1], url: m[2], title: m[3] ?? null };
}

class ImageWidget extends WidgetType {
  readonly url: string;
  readonly alt: string;
  readonly title: string | null;

  constructor(url: string, alt: string, title: string | null) {
    super();
    this.url = url;
    this.alt = alt;
    this.title = title;
  }

  // Reuse the DOM if the source (url/alt/title) is the same — DOM stays unchanged even if recomputed while composing (CJK first-class).
  eq(other: ImageWidget): boolean {
    return other.url === this.url && other.alt === this.alt && other.title === this.title;
  }

  toDOM(view: EditorView): HTMLElement {
    // Caption convention (consumer-facing): the markdown `title` is the visible caption — a
    // titled image `![alt](url "caption")` renders as a <figure> with a <figcaption>; a bare
    // `![alt](url)` stays a plain <img>. alt remains the a11y text in both. (paper-md grill 2026-06-22)
    const caption = this.title && this.title.length > 0 ? this.title : null;
    const wrap = document.createElement(caption ? "figure" : "span");
    wrap.className = caption ? "cm-image-widget cm-image-figure" : "cm-image-widget";
    const img = document.createElement("img");
    img.src = this.url;
    img.alt = this.alt;
    // Re-measure the CM height model when async load changes height — prevents scroll jumps (ADR-0003).
    img.addEventListener("load", () => view.requestMeasure());
    img.addEventListener("error", () => {
      wrap.classList.add("cm-image-broken");
      wrap.textContent = this.alt || this.url;
    });
    wrap.appendChild(img);
    if (caption) {
      const cap = document.createElement("figcaption");
      cap.textContent = caption;
      wrap.appendChild(cap);
    }
    return wrap;
  }

  // Clicks/arrow keys must reach the editor so the cursor enters the line and exposes the source (same entry as HR).
  ignoreEvent(): boolean {
    return false;
  }
}

function selectionTouchesLine(state: EditorState, pos: number): boolean {
  const line = state.doc.lineAt(pos);
  return state.selection.ranges.some((range) => range.from <= line.to && range.to >= line.from);
}

function computeDecorations(view: EditorView): DecorationSet {
  const { state } = view;
  const ranges: ReturnType<Decoration["range"]>[] = [];

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(state).iterate({
      from,
      to,
      enter(node) {
        if (node.name !== "Image") return;
        const line = state.doc.lineAt(node.from);
        // Block-render only when the line is entirely a single image (mid-sentence inline images keep their source).
        if (line.text.trim() !== state.sliceDoc(node.from, node.to)) return;
        // If the cursor touches the line, expose the `![alt](url)` source for editing.
        if (selectionTouchesLine(state, node.from)) return;
        const parsed = parseImage(state.sliceDoc(node.from, node.to));
        if (!parsed) return;
        ranges.push(
          Decoration.replace({
            widget: new ImageWidget(parsed.url, parsed.alt, parsed.title),
          }).range(line.from, line.to),
        );
        return false;
      },
    });
  }

  return Decoration.set(ranges, true);
}

export function imageWidget(): Extension {
  return [
    guardedDecorations("image-widget", computeDecorations),
    EditorView.theme({
      ".cm-image-widget": {
        display: "inline-block",
        maxWidth: "100%",
      },
      // Titled image → figure with a caption below the image (paper-md grill). Keep it inline-block
      // (inherited from .cm-image-widget) — NOT block — so a captioned image gets the exact same
      // vertical spacing in its line as a bare one; a block widget pulls in CM6's line-height-tall
      // widgetBuffer anchors above/below and would sit ~25px further from the surrounding text.
      ".cm-image-figure": {
        margin: "0",
      },
      ".cm-image-figure figcaption": {
        marginTop: "0.5em",
        fontSize: "0.76em", // ≈12.5px on the 16.5px body
        lineHeight: "1.5",
        color: "var(--muted)",
      },
      // porcelain: radius 0. silver 1px to separate from the near-white canvas (ADR-0009).
      ".cm-image-widget img": {
        display: "block",
        maxWidth: "100%",
        // If the border (2px left+right) is added outside maxWidth:100%, it overflows the container
        // and causes horizontal scroll (when natural width >= container). border-box includes the border within 100%.
        boxSizing: "border-box",
        height: "auto",
        border: "1px solid var(--silver)",
      },
      // Load-failure fallback: render alt text in a surface box (ADR-0009 panel tokens).
      ".cm-image-broken": {
        padding: "0.45em 0.7em",
        backgroundColor: "var(--surface)",
        border: "1px solid var(--silver)",
        color: "var(--muted)",
        fontSize: "0.9em",
      },
    }),
  ];
}
