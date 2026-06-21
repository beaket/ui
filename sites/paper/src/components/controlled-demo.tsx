import { Paper, type PaperHandle } from "@beaket/paper/react";
import { useEffect, useRef, useState } from "react";

// The recipe itself, running live (ADR-0019). A thin wrapper turns the uncontrolled <Paper> into a
// controlled value/onChange component. It works because the uncontrolled surface already provides
// both halves: setValue is IME-deferred, and onChange fires on user edits only (setValue does not
// echo). The `value !== getValue()` guard is the whole trick — see the comment below.
function ControlledPaper({
  value,
  onChange,
  paperRef,
}: {
  value: string;
  onChange: (v: string) => void;
  paperRef?: React.Ref<PaperHandle>;
}) {
  const ref = useRef<PaperHandle>(null);
  useEffect(() => {
    // Sync EXTERNAL value changes into the editor. Skip the echo of the user's own edit: after
    // onChange fires, `value` already equals what the editor holds, so this is a no-op then — no
    // cursor jump. A real external change (the buttons / the textarea below) differs, so setValue
    // applies (IME-deferred internally).
    if (ref.current && value !== ref.current.getValue()) ref.current.setValue(value);
  }, [value]);
  return (
    <Paper
      ref={(v) => {
        ref.current = v;
        if (typeof paperRef === "function") paperRef(v);
        else if (paperRef) (paperRef as React.RefObject<PaperHandle | null>).current = v;
      }}
      defaultValue={value}
      onChange={onChange}
      minHeight="180px"
    />
  );
}

const DOC_A = `# Release notes

- Controlled **value** lives in React state.
- Type here → the state (and the textarea) update.
`;

const DOC_B = `# Meeting agenda

1. Roadmap review
2. Open questions
3. Next steps
`;

export function ControlledDemo() {
  // The single source the parent controls. Both <Paper> and the <textarea> read and write it.
  const [value, setValue] = useState(DOC_A);

  return (
    <div className="cd-root">
      <div className="cd-bar">
        <span className="cd-label">Set value externally</span>
        <button type="button" className="cd-btn" onClick={() => setValue(DOC_A)}>
          Doc A
        </button>
        <button type="button" className="cd-btn" onClick={() => setValue(DOC_B)}>
          Doc B
        </button>
        <button type="button" className="cd-btn" onClick={() => setValue("")}>
          Clear
        </button>
        <span className="cd-count">{value.length} chars</span>
      </div>

      <div className="cd-panes">
        <div className="cd-pane">
          <div className="cd-pane-label">&lt;ControlledPaper value onChange /&gt;</div>
          <div className="cd-paper">
            <ControlledPaper value={value} onChange={setValue} />
          </div>
        </div>
        <div className="cd-pane">
          <div className="cd-pane-label">&lt;textarea value onChange /&gt; — same state</div>
          <textarea
            className="cd-textarea"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>

      <style>{`
        .cd-root { position: relative; }
        .cd-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0 0.85rem;
        }
        .cd-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--steel, #686b6f);
          margin-right: 0.25rem;
        }
        .cd-btn {
          font: inherit;
          font-size: 13px;
          padding: 0.25rem 0.6rem;
          background: var(--paper);
          color: var(--ink);
          border: 1px solid var(--chrome);
          cursor: pointer;
        }
        .cd-count {
          margin-left: auto;
          font-size: 12px;
          color: var(--steel, #686b6f);
        }
        .cd-panes {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .cd-pane { min-width: 0; }
        .cd-pane-label {
          font-family: ui-monospace, "SF Mono", "Cascadia Code", Menlo, monospace;
          font-size: 11px;
          color: var(--steel, #686b6f);
          margin-bottom: 0.4rem;
        }
        .cd-paper {
          background: var(--beaket-paper-paper, var(--paper, #fff));
          border: 1px solid var(--chrome);
          box-shadow: var(--shadow-offset, 2px 2px 0 0 var(--chrome));
          padding: 0.9rem 1.1rem;
        }
        .cd-textarea {
          width: 100%;
          min-height: 212px;
          box-sizing: border-box;
          padding: 0.9rem 1.1rem;
          background: var(--frost, #f3f4f6);
          color: var(--ink);
          border: 1px solid var(--chrome);
          font-family: ui-monospace, "SF Mono", "Cascadia Code", Menlo, monospace;
          font-size: 13px;
          line-height: 1.6;
          resize: vertical;
        }
        .cd-textarea:focus-visible {
          outline: 2px solid var(--beaket-paper-accent, #0c6bae);
          outline-offset: 2px;
        }
        @media (max-width: 640px) {
          .cd-panes { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
