import { EditorView } from "@codemirror/view";
import { silentDocChange } from "./extensions/changeNotifier";

// setValue mechanism — perform a full document replacement (the consumer "opening a different document") IME-safely (ADR-0013 decision 3).
// Calls during composition (view.composing) are deferred and applied after compositionend settles — when an external value
// swaps the doc mid-composition it causes cursor jumps and broken composition, so honor that ADR-0004 invariant at the command level too.
// The replacement transaction is marked with silentDocChange so it does not echo back via onChange (see changeNotifier).

export interface ValueController {
  /** Replace the entire document. If composing, defer and apply when composition ends. */
  setValue(md: string): void;
  /** Remove the DOM listener + cancel the deferred value (unmount safe). */
  dispose(): void;
}

export function createValueController(view: EditorView): ValueController {
  let pending: string | null = null;
  let disposed = false;

  const apply = (md: string): void => {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: md },
      annotations: silentDocChange.of(true),
    });
  };

  // Apply the deferred value after composition ends. Delay one tick with setTimeout to re-check !composing (isomorphic to composingWake).
  const flush = (): void => {
    setTimeout(() => {
      if (disposed || pending === null || view.composing) return;
      const md = pending;
      pending = null;
      apply(md);
    });
  };
  view.contentDOM.addEventListener("compositionend", flush);

  return {
    setValue(md: string): void {
      if (view.composing) {
        pending = md;
        return;
      }
      apply(md);
    },
    dispose(): void {
      disposed = true;
      pending = null;
      view.contentDOM.removeEventListener("compositionend", flush);
    },
  };
}
