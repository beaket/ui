import type { Extension } from "@codemirror/state";
import type { ViewUpdate } from "@codemirror/view";
import { EditorView, ViewPlugin, keymap } from "@codemirror/view";

// ADR-0007: "Markdown copy" (AI handoff) — copies the entire document to the clipboard as unprocessed RAW markdown.
// One always-on corner icon = the explicit exception to visual minimalism (allowed only for a single global action).
//
// No composing guard needed: a static button + click that does no decoration recalculation or widget reconstruction.
// Since the document is the source of truth, the payload is view.state.doc.toString() as-is — no wrapping.

const COPY_LABEL = "Copy document as Markdown (for AI)";
const TOAST_TEXT = "Markdown copied";
const TOAST_MS = 1400;
// A lossless source for AI agents that read the screen directly. The Live Preview DOM is a lossy
// projection of the markdown (hidden table |, etc.), so the full RAW markdown is mirrored as-is into the accessibility tree.
const SOURCE_LABEL = "Document Markdown source (for AI)";

/** Writes text to the clipboard and notifies completion (regardless of success/failure) via callback.
 *  localhost is a secure context, so navigator.clipboard is usable in dev too.
 *  Failures (permission/unfocused) are silently ignored in the sandbox. Block-level code copy shares this helper too. */
export function copyText(text: string, onDone: () => void): void {
  void Promise.resolve(navigator.clipboard?.writeText(text)).then(onDone, onDone);
}

/** Copies the entire document to the clipboard as RAW markdown and notifies via a toast. Independent of the selection. */
export function copyDocumentAsMarkdown(view: EditorView, showToast: () => void): boolean {
  copyText(view.state.doc.toString(), showToast);
  return true;
}

// Standard Markdown mark (M + ↓ inside a rounded rectangle) — the icon alone signals "markdown".
const COPY_ICON =
  '<svg width="19" height="12" viewBox="0 0 208 128" aria-hidden="true">' +
  '<rect x="5" y="5" width="198" height="118" rx="10" ry="10" ' +
  'fill="none" stroke="currentColor" stroke-width="10"></rect>' +
  '<path fill="currentColor" d="M30 98V30h20l20 25 20-25h20v68H90V59L70 84 50 59v39zm125 0l-30-33h20V30h20v35h20z"></path>' +
  "</svg>";

const copyButtonPlugin = ViewPlugin.fromClass(
  class {
    button: HTMLButtonElement;
    toast: HTMLDivElement;
    source: HTMLPreElement;
    toastTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(view: EditorView) {
      const button = document.createElement("button");
      button.className = "cm-md-copy";
      button.type = "button";
      button.innerHTML = COPY_ICON;
      button.title = COPY_LABEL;
      button.setAttribute("aria-label", COPY_LABEL);
      // Block the mousedown default so editor focus/selection isn't stolen (click still fires normally).
      button.addEventListener("mousedown", (e) => e.preventDefault());
      button.addEventListener("click", () => copyDocumentAsMarkdown(view, () => this.flashToast()));
      this.button = button;

      const toast = document.createElement("div");
      toast.className = "cm-md-copy-toast";
      toast.textContent = TOAST_TEXT;
      this.toast = toast;

      // A live mirror that is hidden visually (clip technique) but remains in the accessibility tree.
      // display:none/visibility:hidden also remove it from the a11y tree, so they are never used.
      // <pre>: so text extractors (Readability etc.) treat it as preformatted and preserve indentation.
      const source = document.createElement("pre");
      source.className = "cm-md-source";
      source.setAttribute("role", "region");
      source.setAttribute("aria-label", SOURCE_LABEL);
      source.textContent = view.state.doc.toString();
      this.source = source;

      // Must attach to view.dom (.cm-editor) for the EditorView.theme scope to apply.
      view.dom.appendChild(button);
      view.dom.appendChild(toast);
      view.dom.appendChild(source);
    }

    update(u: ViewUpdate) {
      // Update the mirror only when the document changes (a sibling element unrelated to decorations/widgets, so outside the composing guard).
      if (u.docChanged) this.source.textContent = u.state.doc.toString();
    }

    flashToast() {
      this.toast.classList.add("cm-md-copy-toast-show");
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.toast.classList.remove("cm-md-copy-toast-show");
        this.toastTimer = null;
      }, TOAST_MS);
    }

    destroy() {
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.button.remove();
      this.toast.remove();
      this.source.remove();
    }
  },
);

const copyKeymap = keymap.of([
  {
    key: "Mod-Shift-c",
    preventDefault: true,
    run: (view) => {
      const plugin = view.plugin(copyButtonPlugin);
      return copyDocumentAsMarkdown(view, () => plugin?.flashToast());
    },
  },
]);

const copyTheme = EditorView.theme({
  "&": { position: "relative" },
  ".cm-md-copy": {
    position: "absolute",
    top: "2px",
    right: "2px",
    zIndex: "15",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
    border: "1px solid transparent",
    // Opaque canvas-colored background: when the first line of text reaches the top-right, keep
    // characters from showing through and mixing behind the icon (the corner affordance takes priority over text). Being the same color as the canvas,
    // it melts into empty space without a visible boundary.
    background: "var(--canvas)",
    color: "var(--muted)",
    cursor: "pointer",
    // Do not dim with opacity — element opacity makes the background (--canvas) semi-transparent too,
    // so text shows through behind the icon. The dimmed look is expressed via text color (--muted) alone to keep the background opaque.
    transition: "background-color 120ms ease, color 120ms ease, border-color 120ms ease",
    // Global round 0 (porcelain, ADR-0009)
  },
  ".cm-md-copy:hover": {
    color: "var(--accent)",
    backgroundColor: "var(--surface)",
    borderColor: "var(--silver)",
  },
  ".cm-md-copy:active": {
    backgroundColor: "var(--platinum)",
  },
  ".cm-md-copy-toast": {
    position: "absolute",
    top: "8px",
    right: "40px",
    zIndex: "15",
    padding: "4px 10px",
    background: "var(--ink)",
    color: "var(--paper)",
    fontSize: "13px",
    lineHeight: "1.4",
    boxShadow: "var(--shadow-overlay)",
    opacity: "0",
    transform: "translateY(-2px)",
    pointerEvents: "none",
    transition: "opacity 120ms ease, transform 120ms ease",
  },
  ".cm-md-copy-toast-show": {
    opacity: "1",
    transform: "translateY(0)",
  },
  // sr-only: hidden visually but kept in the accessibility tree / DOM text.
  ".cm-md-source": {
    position: "absolute",
    width: "1px",
    height: "1px",
    margin: "-1px",
    padding: "0",
    border: "0",
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    // pre: preserves the markdown's line breaks during text extraction (innerText).
    // With nowrap, line breaks collapse into spaces and tables get mashed onto one line and break.
    whiteSpace: "pre",
  },
});

export function markdownCopy(): Extension {
  return [copyButtonPlugin, copyKeymap, copyTheme];
}
