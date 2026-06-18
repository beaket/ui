import { BeaketPaper, type BeaketPaperHandle } from "@beaket/paper/react";
import { useRef, useState } from "react";

const INITIAL = `# Paper

A markdown-first, **CJK-first** editor. Only the line under your cursor shows raw
syntax — everything else renders (the Obsidian model).

Try it:

- Type \`/\` to open the slash menu
- Drop an image, paste a table, write some \`code\`
- Mix scripts freely — 한국어, 日本語, English

| Feature | Status |
| --- | --- |
| Live preview | ✓ |
| Tables | ✓ |
`;

const ACCENTS = [
  { name: "Blue", value: "#0c6bae" },
  { name: "Crimson", value: "#cf222e" },
  { name: "Green", value: "#116329" },
  { name: "Pink", value: "#e0218a" },
  { name: "Ink", value: "#232a35" },
];

const FONTS = [
  { name: "Sans", value: "" },
  { name: "Serif", value: "Georgia, 'Times New Roman', serif" },
];

export function EditorPlayground() {
  const ref = useRef<BeaketPaperHandle>(null);
  const [markdown, setMarkdown] = useState(INITIAL);
  const [accent, setAccent] = useState(ACCENTS[0].value);
  const [font, setFont] = useState(FONTS[0].value);
  const [showSource, setShowSource] = useState(false);

  // The editor reads its visual tokens from --beaket-paper-* on any ancestor.
  const tokenStyle = {
    "--beaket-paper-accent": accent,
    ...(font ? { "--beaket-paper-font": font } : {}),
  } as React.CSSProperties;

  return (
    <div style={tokenStyle}>
      <div className="pg-toolbar">
        <div className="pg-group">
          <span className="pg-label">Accent</span>
          {ACCENTS.map((a) => (
            <button
              key={a.value}
              type="button"
              className="pg-swatch"
              aria-pressed={accent === a.value}
              aria-label={a.name}
              title={a.name}
              onClick={() => setAccent(a.value)}
              style={{
                background: a.value,
                outline: accent === a.value ? "2px solid var(--ink)" : "none",
                outlineOffset: "2px",
              }}
            />
          ))}
        </div>
        <div className="pg-group">
          <span className="pg-label">Font</span>
          {FONTS.map((f) => (
            <button
              key={f.name}
              type="button"
              className="pg-btn"
              aria-pressed={font === f.value}
              onClick={() => setFont(f.value)}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* The editor ships no container chrome — the host supplies the paper card. */}
      <div className="pg-paper">
        <BeaketPaper ref={ref} defaultValue={INITIAL} onChange={setMarkdown} />
      </div>

      <div className="pg-footer">
        <span>{markdown.length} chars</span>
        <button type="button" className="pg-btn" onClick={() => setShowSource((s) => !s)}>
          {showSource ? "Hide" : "View"} markdown
        </button>
      </div>

      {showSource && <pre className="pg-source">{markdown}</pre>}

      <style>{`
        .pg-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          align-items: center;
          padding: 0.75rem 0;
        }
        .pg-group { display: flex; align-items: center; gap: 0.5rem; }
        .pg-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--steel, #686b6f);
        }
        .pg-swatch {
          width: 22px;
          height: 22px;
          border: 1px solid var(--chrome);
          cursor: pointer;
          padding: 0;
        }
        .pg-btn {
          font: inherit;
          font-size: 13px;
          padding: 0.25rem 0.6rem;
          background: var(--paper);
          color: var(--ink);
          border: 1px solid var(--chrome);
          cursor: pointer;
        }
        .pg-btn[aria-pressed="true"] { background: var(--ink); color: var(--paper); }
        .pg-paper {
          background: var(--beaket-paper-paper, var(--paper, #fff));
          border: 1px solid var(--chrome);
          box-shadow: var(--shadow-offset, 2px 2px 0 0 var(--chrome));
          padding: 1.25rem;
          min-height: 340px;
        }
        .pg-footer {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 0;
          font-size: 13px;
          color: var(--steel, #686b6f);
        }
        .pg-source {
          margin: 0 0 1rem;
          padding: 1rem;
          background: var(--frost, #f3f4f6);
          border: 1px solid var(--chrome);
          font-size: 12px;
          white-space: pre-wrap;
          word-break: break-word;
          max-height: 320px;
          overflow: auto;
        }
      `}</style>
    </div>
  );
}
