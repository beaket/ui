import {
  Paper,
  type HighlightInput,
  type PaperHandle,
  type SelectionInfo,
} from "@beaket/paper/react";
import { useEffect, useRef, useState } from "react";

const SEED = `# Annotating with Paper

Select any sentence in this paragraph and a small toolbar appears at the
selection. Hit **Highlight** and the range is stored as an anchor — then
click the highlight to make it active. The editor only reports the
selection; you draw the toolbar and own the list.
`;

// Start in the end-state: one highlight already stored and active, so the
// rendered mark + populated data panel are visible before you touch anything.
// The anchor is just { quote, offset } — quote is plain source text, offset
// computed so it resolves exactly. (Re-resolution matches by quote anyway.)
const SEED_QUOTE = "the range is stored as an anchor";
const INITIAL_HIGHLIGHTS: HighlightInput[] = [
  { id: "h1", anchor: { quote: SEED_QUOTE, offset: SEED.indexOf(SEED_QUOTE) } },
];

export function HighlightsDemo() {
  const paperRef = useRef<PaperHandle>(null);
  const [sel, setSel] = useState<SelectionInfo | null>(null);
  // Exactly what the prop wants: { id, anchor }. We store it verbatim and hand it back.
  const [highlights, setHighlights] = useState<HighlightInput[]>(INITIAL_HIGHLIGHTS);
  const [activeId, setActiveId] = useState<string | null>("h1");
  const nextId = useRef(2);

  const saveHighlight = () => {
    if (!sel) return;
    const id = `h${nextId.current++}`;
    setHighlights((list) => [...list, { id, anchor: sel.anchor }]);
    setSel(null); // selection consumed — hide the toolbar
  };

  // rect is captured once at selection time and is viewport-relative, so a
  // position:fixed toolbar drifts off the text on scroll/resize. Re-read the
  // live selection coords from the view to keep it pinned (and close it if the
  // selection collapsed). Depend on `hasSel` (not `sel`) so we don't resubscribe
  // every reposition frame.
  const hasSel = sel !== null;
  useEffect(() => {
    if (!hasSel) return;
    const reposition = () => {
      const view = paperRef.current?.getView();
      if (!view) return;
      const main = view.state.selection.main;
      if (main.empty) {
        setSel(null);
        return;
      }
      const c = view.coordsAtPos(main.head);
      if (c) {
        setSel((prev) =>
          prev
            ? { ...prev, rect: { left: c.left, top: c.top, right: c.right, bottom: c.bottom } }
            : prev,
        );
      }
    };
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [hasSel]);

  const toolbar =
    sel && sel.rect ? (
      <div className="hd-toolbar" style={{ left: sel.rect.left, top: sel.rect.top - 38 }}>
        <button
          type="button"
          className="hd-tool-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={saveHighlight}
        >
          Highlight
        </button>
      </div>
    ) : null;

  return (
    <div className="hd-root">
      {toolbar}
      <div className="hd-paper">
        <Paper
          ref={paperRef}
          defaultValue={SEED}
          highlights={highlights}
          activeHighlightId={activeId}
          onSelect={setSel}
          onHighlightClick={setActiveId}
        />
      </div>

      {/* The actual data each surface deals in — the contract, not a friendly label. */}
      <div className="hd-panel">
        <div className="hd-row">
          <span className="hd-key">onSelect</span>
          <span className="hd-val">{sel ? formatSelection(sel) : "null"}</span>
        </div>
        <div className="hd-row">
          <span className="hd-key">highlights</span>
          <span className="hd-val">{highlights.length ? JSON.stringify(highlights) : "[]"}</span>
        </div>
        <div className="hd-row">
          <span className="hd-key">activeHighlightId</span>
          <span className="hd-val">{activeId ? `"${activeId}"` : "null"}</span>
        </div>
      </div>

      <style>{`
        .hd-root { position: relative; }
        .hd-paper {
          background: var(--beaket-paper-paper, var(--paper, #fff));
          border: 1px solid var(--chrome);
          box-shadow: var(--shadow-offset, 2px 2px 0 0 var(--chrome));
          padding: 1rem 1.25rem;
          min-height: 190px;
        }
        /* Recolor the highlight marks to a highlighter yellow so they read as
           highlights at a glance. We target the mark classes directly rather
           than Paper's --accent-weak / --accent-sel tokens, because those are
           shared with the slash menu + table selection (overriding them would
           tint those yellow too). Opaque fill + dark ink keeps the text legible
           in BOTH light and dark mode (a translucent tint leaves white text
           unreadable on the dark canvas). The .cm-editor scope wins over Paper's
           theme rule on specificity. Active is the stronger tone. */
        .hd-paper .cm-editor .cm-annotation-highlight {
          background-color: #ffe066;
          color: #232a35;
        }
        .hd-paper .cm-editor .cm-annotation-active {
          background-color: #ffd60a;
          color: #232a35;
        }
        .hd-toolbar {
          position: fixed;
          z-index: 10;
          transform: translateX(-50%);
        }
        .hd-tool-btn {
          font: inherit;
          font-size: 12px;
          font-weight: 600;
          padding: 0.3rem 0.7rem;
          color: var(--paper);
          background: var(--ink);
          border: 1px solid var(--ink);
          box-shadow: var(--shadow-offset, 2px 2px 0 0 var(--chrome));
          cursor: pointer;
          white-space: nowrap;
        }
        .hd-panel {
          margin-top: 0.85rem;
          padding: 0.75rem 0.9rem;
          background: var(--frost, #f3f4f6);
          border: 1px solid var(--chrome);
          font-family: ui-monospace, "SF Mono", "Cascadia Code", Menlo, monospace;
          font-size: 12px;
          line-height: 1.7;
        }
        .hd-row { display: flex; gap: 0.75rem; align-items: flex-start; }
        .hd-row + .hd-row { margin-top: 0.35rem; }
        .hd-key {
          flex-shrink: 0;
          width: 8.5rem;
          color: var(--steel, #686b6f);
        }
        .hd-val {
          color: var(--ink);
          white-space: pre-wrap;
          word-break: break-word;
          min-width: 0;
        }
      `}</style>
    </div>
  );
}

/** A compact one-liner of the onSelect payload — the readable text plus the
 *  viewport rect you'd position UI from (anchor is shown once it's stored). */
function formatSelection(sel: SelectionInfo) {
  const r = sel.rect;
  const rect = r ? `, rect: { left: ${Math.round(r.left)}, top: ${Math.round(r.top)} }` : "";
  return `{ text: ${JSON.stringify(sel.text)}${rect} }`;
}
