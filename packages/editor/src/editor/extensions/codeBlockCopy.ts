import { syntaxTree } from "@codemirror/language";
import type { EditorState, Extension } from "@codemirror/state";
import type { DecorationSet } from "@codemirror/view";
import { Decoration, EditorView, ViewPlugin, WidgetType } from "@codemirror/view";
import type { SyntaxNode } from "@lezer/common";
import { guardedDecorations } from "./composingGuard";
import { copyText } from "./markdownCopy";

// Shows a "copy code" button at the top-right of a code block (FencedCode) — copies only the code text
// inside the block (excluding the ``` fences and language line) to the clipboard. A block-level action separate from full-document copy (markdownCopy).
//
// Revealed on hover only — copying a code block is "an operation bound to the block context", so it follows the
// boundary ADR-0007 set (only a single global action is always shown; contextual operations are hover/focus). Zero idle UI.
//
// But CM6 has no wrapper DOM around a block (.cm-line siblings laid out flat), so pure CSS `:hover` can't cover a multi-line
// block (hover responds only on the first line that holds the button, and `:has` turns on all blocks at once).
// So a ViewPlugin uses mousemove→posAtCoords to find the FencedCode the mouse is over and turns on only that block's button
// with `cm-code-copy-visible`. When the cursor enters a block (touched), the fences unfold and the anchor line
// shakes, so the button is attached in render mode only (same philosophy as "structure only on the active line").
//
// composing guard: widget creation inherits composition-time recalculation deferral and coordinate
// mapping via the guardedDecorations pipeline. The hover toggle only touches a sibling button's class and doesn't change
// the decoration/widget structure, so it's safe during composition too (it's not a decoration recalculation).

const COPY_LABEL = "Copy code";
const COPIED_LABEL = "Copied";
const FEEDBACK_MS = 1200;

// A two-overlapping-sheets clipboard (copy) icon. Round 0 (porcelain), but the SVG's own detail is kept.
const COPY_ICON =
  '<svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true" fill="none" ' +
  'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
  '<rect x="9" y="9" width="11" height="11"></rect>' +
  '<path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"></path></svg>';

const CHECK_ICON =
  '<svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true" fill="none" ' +
  'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M20 6 9 17l-5-5"></path></svg>';

function findCodeText(node: SyntaxNode): SyntaxNode | null {
  for (let child = node.firstChild; child; child = child.nextSibling) {
    if (child.name === "CodeText") return child;
  }
  return null;
}

/** The CodeText child range of a FencedCode node = pure code minus the fences/language line. '' if empty. */
export function extractFencedCodeText(state: EditorState, node: SyntaxNode): string {
  const codeText = findCodeText(node);
  return codeText ? state.doc.sliceString(codeText.from, codeText.to) : "";
}

class CodeCopyWidget extends WidgetType {
  readonly code: string;
  readonly blockFrom: number;

  constructor(code: string, blockFrom: number) {
    super();
    this.code = code;
    this.blockFrom = blockFrom;
  }

  // Reuse the DOM if same code and same block position — so editing elsewhere in the document doesn't tear down and rebuild this button.
  // blockFrom is the key (data-block-from) the hover plugin uses to pair the hovered block with its button.
  eq(other: CodeCopyWidget) {
    return other.code === this.code && other.blockFrom === this.blockFrom;
  }

  toDOM() {
    const button = document.createElement("button");
    button.className = "cm-code-copy";
    button.type = "button";
    button.dataset.blockFrom = String(this.blockFrom);
    button.innerHTML = COPY_ICON;
    button.title = COPY_LABEL;
    button.setAttribute("aria-label", COPY_LABEL);
    let timer: ReturnType<typeof setTimeout> | null = null;
    // Block the mousedown default so editor focus/selection isn't stolen (click still fires normally).
    button.addEventListener("mousedown", (e) => e.preventDefault());
    button.addEventListener("click", () => {
      copyText(this.code, () => {
        button.innerHTML = CHECK_ICON;
        button.classList.add("cm-code-copy-done");
        button.title = COPIED_LABEL;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          button.innerHTML = COPY_ICON;
          button.classList.remove("cm-code-copy-done");
          button.title = COPY_LABEL;
          timer = null;
        }, FEEDBACK_MS);
      });
    });
    return button;
  }

  // Don't treat widget-internal events as editor events (so a click doesn't move the cursor).
  ignoreEvent() {
    return true;
  }
}

function computeDecorations(view: EditorView): DecorationSet {
  const { state } = view;
  const widgets: { pos: number; code: string; blockFrom: number }[] = [];

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(state).iterate({
      from,
      to,
      enter(node) {
        if (node.name !== "FencedCode") return;
        // If the cursor is inside the block the fences unfold and the anchor shakes, so attach the button in render mode only.
        const touched = state.selection.ranges.some(
          (range) => range.from <= node.to && range.to >= node.from,
        );
        if (touched) return;
        const codeText = findCodeText(node.node);
        if (!codeText) return;
        const code = state.doc.sliceString(codeText.from, codeText.to);
        if (!code) return;
        // Anchor at the start of the first *content* line (the line after the opening fence) — the fence line is a 0.5em strip, too thin to hold the button.
        // blockFrom = FencedCode node start — the key the hover plugin uses to pair with the hovered block.
        widgets.push({ pos: state.doc.lineAt(codeText.from).from, code, blockFrom: node.from });
      },
    });
  }

  return Decoration.set(
    widgets.map((w) =>
      Decoration.widget({ widget: new CodeCopyWidget(w.code, w.blockFrom), side: -1 }).range(w.pos),
    ),
    true,
  );
}

/** The start position of the FencedCode node enclosing pos. null if outside a code block. */
function enclosingFencedFrom(state: EditorState, pos: number): number | null {
  for (let n: SyntaxNode | null = syntaxTree(state).resolveInner(pos); n; n = n.parent) {
    if (n.name === "FencedCode") return n.from;
  }
  return null;
}

// Reveals only the button of the code block the mouse is over. CSS `:hover` can't cover multi-line blocks, so we pair with JS.
// Only toggles a sibling button's class — the decoration/widget structure is unchanged, so it's safe during composition too.
const hoverReveal = ViewPlugin.fromClass(
  class {
    private view: EditorView;
    private raf = 0;
    private pending: { x: number; y: number } | null = null;
    private readonly onMove: (e: MouseEvent) => void;
    private readonly onLeave: () => void;

    constructor(view: EditorView) {
      this.view = view;
      this.onMove = (e) => {
        this.pending = { x: e.clientX, y: e.clientY };
        // Throttle the mousemove flood to once per frame via rAF.
        if (!this.raf)
          this.raf = requestAnimationFrame(() => {
            this.raf = 0;
            this.flush();
          });
      };
      this.onLeave = () => this.reveal(null);
      view.dom.addEventListener("mousemove", this.onMove);
      view.dom.addEventListener("mouseleave", this.onLeave);
    }

    private flush() {
      const p = this.pending;
      this.pending = null;
      if (!p) return;
      const pos = this.view.posAtCoords(p);
      this.reveal(pos == null ? null : enclosingFencedFrom(this.view.state, pos));
    }

    private reveal(blockFrom: number | null) {
      const key = blockFrom == null ? null : String(blockFrom);
      this.view.dom.querySelectorAll<HTMLElement>(".cm-code-copy").forEach((b) => {
        b.classList.toggle("cm-code-copy-visible", key != null && b.dataset.blockFrom === key);
      });
    }

    destroy() {
      if (this.raf) cancelAnimationFrame(this.raf);
      this.view.dom.removeEventListener("mousemove", this.onMove);
      this.view.dom.removeEventListener("mouseleave", this.onLeave);
    }
  },
);

export function codeBlockCopy(): Extension {
  return [
    guardedDecorations("code-block-copy", computeDecorations),
    hoverReveal,
    EditorView.theme({
      // The reference point for the button's absolute positioning. Two classes beat baseTheme `.cm-line` (same/lower specificity).
      ".cm-line.cm-codeblock-line": { position: "relative" },
      ".cm-code-copy": {
        position: "absolute",
        top: "3px",
        right: "5px",
        zIndex: "6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "24px",
        height: "24px",
        padding: "0",
        border: "1px solid var(--platinum)",
        background: "var(--paper)",
        color: "var(--steel)",
        cursor: "pointer",
        // Hidden by default (zero idle UI) — the hover plugin turns on only the hovered block. opacity 0↔1 fade:
        // the off state is fully transparent so code characters don't show through (unlike markdownCopy's always-on semi-transparent trap).
        opacity: "0",
        pointerEvents: "none",
        transition: "opacity 120ms ease, color 120ms ease, border-color 120ms ease",
        // Global round 0 (porcelain, ADR-0009)
      },
      ".cm-code-copy.cm-code-copy-visible": {
        opacity: "1",
        pointerEvents: "auto",
      },
      ".cm-code-copy:hover": {
        color: "var(--accent)",
        borderColor: "var(--silver)",
      },
      ".cm-code-copy-done": {
        color: "var(--accent)",
        borderColor: "var(--silver)",
      },
    }),
  ];
}
