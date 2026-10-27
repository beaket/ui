import { useState } from "react";
import { createRoot } from "react-dom/client";
import type { HighlightInput, PaperHandle, SelectionInfo } from "../../src/react";
import { Paper } from "../../src/react";
import { type Probe, installProbe } from "./perf-probe";

// The page the IME e2e suite drives (#1176). It mounts the shipped <Paper> and records what a consumer
// would observe — onChange, onSelect, trigger queries — on window.__paper, so a spec can assert the
// composing guard's deferrals from outside. Initial markdown comes from the `?doc=` query string, or
// from window.__paperDoc set by an init script when it is too large for a URL (the perf harness, #482).

export interface Fixture {
  handle: PaperHandle | null;
  changes: string[];
  selects: (SelectionInfo | null)[];
  triggerQueries: string[];
  compositionEvents: string[];
  errors: string[];
  setHighlights: (list: HighlightInput[]) => void;
  /**
   * guardedDecorations compute calls, counted by the e2e Vite config's transform of
   * composing-guard.ts (#482); `composing` counts the ones made while view.composing was true.
   */
  computes: { total: number; composing: number };
  /** The keystroke-latency probe, once `probe()` has installed it (perf harness, #482). */
  latency: Probe | null;
  probe: () => void;
}

declare global {
  interface Window {
    __paper: Fixture;
    __paperDoc?: string;
  }
}

const fixture: Fixture = {
  handle: null,
  changes: [],
  selects: [],
  triggerQueries: [],
  compositionEvents: [],
  errors: [],
  setHighlights: () => {},
  computes: { total: 0, composing: 0 },
  latency: null,
  probe: () => {
    fixture.latency = installProbe(fixture.handle!.getView()!);
  },
};
window.__paper = fixture;
window.addEventListener("error", (e) => fixture.errors.push(String(e.message)));
for (const type of ["compositionstart", "compositionend"]) {
  document.addEventListener(type, () => fixture.compositionEvents.push(type), true);
}

const doc = window.__paperDoc ?? new URLSearchParams(location.search).get("doc") ?? "";

function App() {
  const [highlights, setHighlights] = useState<HighlightInput[]>([]);
  fixture.setHighlights = setHighlights;
  return (
    <Paper
      ref={(h) => {
        fixture.handle = h;
      }}
      defaultValue={doc}
      highlights={highlights}
      onChange={(v) => fixture.changes.push(v)}
      onSelect={(s) => fixture.selects.push(s)}
      triggers={[
        {
          trigger: "@",
          onQuery: (q) => {
            fixture.triggerQueries.push(q);
            return [{ label: "김철수", insert: "@김철수" }];
          },
        },
      ]}
    />
  );
}

createRoot(document.getElementById("root")!).render(<App />);
