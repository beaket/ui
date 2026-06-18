import type { Extension } from "@codemirror/state";
import { Annotation } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { composingRefresh, composingWake } from "./composingGuard";

// onChange notification — push user edits (docChanged) to the consumer as full markdown (ADR-0013).
// Core discipline:
// ① CJK first-class: during composition (view.composing), defer and fire only once after compositionend settles (ADR-0004).
//    When composingWake wakes via the composingRefresh annotation after composition ends, send the final doc then.
// ② No echo: setValue-style programmatic doc replacement is marked with silentDocChange and does not fire.
//    "Typing goes out (onChange), full replacement is a command (setValue)" — the two are asymmetric (finalized 2026-06-17).
//    Why an opt-out annotation rather than a user-event whitelist: "programmatic changes triggered by typing"
//    such as tableAutoConvert are the result of a user edit, so they must keep being pushed.

/** Marker attached to programmatic doc changes (e.g. setValue) that must not echo back to the consumer */
export const silentDocChange = Annotation.define<boolean>();

export function changeNotifier(onChange?: (value: string) => void): Extension {
  if (!onChange) return [];

  let deferred = false;

  const listener = EditorView.updateListener.of((update) => {
    const isSilent = update.transactions.some((tr) => tr.annotation(silentDocChange));

    if (update.view.composing) {
      // User edits during composition are only marked as deferred. Recomputation and firing are postponed until it ends.
      if (update.docChanged && !isSilent) deferred = true;
      return;
    }

    const woken = update.transactions.some((tr) => tr.annotation(composingRefresh));
    const realEdit = update.docChanged && !isSilent;
    if (realEdit || (deferred && woken)) {
      deferred = false;
      onChange(update.state.doc.toString());
    }
  });

  // composingWake is a module-level single instance, so even if shared with other extensions, CM6 dedupes it.
  return [composingWake, listener];
}
