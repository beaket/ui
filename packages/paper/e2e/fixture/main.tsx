import { useState } from "react";
import { createRoot } from "react-dom/client";
import type { HighlightInput, PaperHandle, SelectionInfo } from "../../src/react";
import { Paper } from "../../src/react";

// The page the IME e2e suite drives (#1176). It mounts the shipped <Paper> and records what a consumer
// would observe — onChange, onSelect, trigger queries — on window.__paper, so a spec can assert the
// composing guard's deferrals from outside. Initial markdown comes from the `?doc=` query string.

export interface Fixture {
  handle: PaperHandle | null;
  changes: string[];
  selects: (SelectionInfo | null)[];
  triggerQueries: string[];
  compositionEvents: string[];
  errors: string[];
  setHighlights: (list: HighlightInput[]) => void;
}

declare global {
  interface Window {
    __paper: Fixture;
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
};
window.__paper = fixture;
window.addEventListener("error", (e) => fixture.errors.push(String(e.message)));
for (const type of ["compositionstart", "compositionend"]) {
  document.addEventListener(type, () => fixture.compositionEvents.push(type), true);
}

const doc = new URLSearchParams(location.search).get("doc") ?? "";

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
