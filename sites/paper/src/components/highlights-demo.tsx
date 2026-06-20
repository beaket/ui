import type { Anchor } from "@beaket/paper";
import { Paper, type SelectionInfo } from "@beaket/paper/react";
import { useRef, useState } from "react";

const SEED = `# Annotating with Paper

Select any sentence in this paragraph and a small toolbar appears at the
selection. Hit **Highlight** and the range is stored as an anchor — then
click the highlight to make it active. The editor only reports the
selection; you draw the toolbar and own the list.
`;

/** What we keep per highlight. \`anchor\` is opaque — Paper hands it to us and we
 *  hand it back; \`quote\` is ours, just for the data panel below. */
interface Stored {
  id: string;
  anchor: Anchor;
  quote: string;
}

export function HighlightsDemo() {
  const [sel, setSel] = useState<SelectionInfo | null>(null);
  const [stored, setStored] = useState<Stored[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const nextId = useRef(1);

  const saveHighlight = () => {
    if (!sel) return;
    const id = `h${nextId.current++}`;
    setStored((list) => [...list, { id, anchor: sel.anchor, quote: sel.text }]);
    setSel(null); // selection consumed — hide the toolbar
  };

  // sel.rect is viewport-relative (from view.coordsAtPos), so position: fixed.
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
          defaultValue={SEED}
          highlights={stored.map((h) => ({ id: h.id, anchor: h.anchor }))}
          activeHighlightId={activeId}
          onSelect={setSel}
          onHighlightClick={setActiveId}
        />
      </div>

      <div className="hd-panel">
        <div className="hd-row">
          <span className="hd-key">selection</span>
          <span className="hd-val">{sel?.text ? `"${sel.text}"` : "—"}</span>
        </div>
        <div className="hd-row">
          <span className="hd-key">highlights</span>
          <span className="hd-val">
            {stored.length
              ? `[ ${stored.map((h) => `${h.id}: "${truncate(h.quote)}"`).join(", ")} ]`
              : "[]"}
          </span>
        </div>
        <div className="hd-row">
          <span className="hd-key">active</span>
          <span className="hd-val">{activeId ?? "null"}</span>
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
        .hd-row { display: flex; gap: 0.75rem; }
        .hd-key {
          flex-shrink: 0;
          width: 5.5rem;
          color: var(--steel, #686b6f);
        }
        .hd-val { color: var(--ink); word-break: break-word; min-width: 0; }
      `}</style>
    </div>
  );
}

function truncate(s: string, n = 24) {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}
