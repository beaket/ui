import type { Extension } from "@codemirror/state";
import { Annotation } from "@codemirror/state";
import type { DecorationSet, ViewUpdate } from "@codemirror/view";
import { EditorView, ViewPlugin } from "@codemirror/view";

// CJK first-class gate: defer decoration recomputation during IME composition (view.composing),
// then wake and re-evaluate via an annotation transaction after compositionend.
// Every extension that creates decorations should go through this helper instead of using ViewPlugin directly.

export const composingRefresh = Annotation.define<boolean>();

// Wake explicitly in case CM6 does not guarantee its own update after composition ends.
// (Module-level single instance — even if shared by multiple consumers, CM6 dedupes it.)
export const composingWake = EditorView.domEventHandlers({
  compositionend(_event, view) {
    setTimeout(() => {
      if (!view.composing) view.dispatch({ annotations: composingRefresh.of(true) });
    });
  },
});

// Dev-only tracing of the guard's defer/recompute decisions. Off by default;
// flip `DEBUG` locally to trace the most expensive invariant (ADR-0004).
const DEBUG = false;
const debugLog = DEBUG
  ? (label: string, action: "defer" | "recompute") =>
      console.debug(`[composing-guard] ${label}: ${action}`)
  : () => {};

export function guardedDecorations(
  label: string,
  compute: (view: EditorView) => DecorationSet,
): Extension {
  const plugin = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      private deferred = false;

      constructor(view: EditorView) {
        this.decorations = compute(view);
      }

      update(update: ViewUpdate) {
        if (update.view.composing) {
          if (update.docChanged) {
            // Defer recomputation, but map existing decorations to new coordinates to keep them valid.
            // Left unmapped, a full-line replace decoration encroaches on the line break and
            // breaks the entire view with a "Decorations that replace line breaks ..." exception.
            this.decorations = this.decorations.map(update.changes);
            this.deferred = true;
            debugLog(label, "defer");
          } else if (update.viewportChanged || update.selectionSet) {
            this.deferred = true;
            debugLog(label, "defer");
          }
          return;
        }
        const woken = update.transactions.some((tr) => tr.annotation(composingRefresh));
        if (
          this.deferred ||
          woken ||
          update.docChanged ||
          update.viewportChanged ||
          update.selectionSet
        ) {
          this.decorations = compute(update.view);
          this.deferred = false;
          debugLog(label, "recompute");
        }
      }
    },
    { decorations: (v) => v.decorations },
  );
  return [composingWake, plugin];
}
