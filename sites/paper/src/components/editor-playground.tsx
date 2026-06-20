import { type ColorScheme, Paper, type PaperHandle } from "@beaket/paper/react";
import { useEffect, useRef, useState } from "react";

// The heading keeps a trailing space (via ${" "} so formatters can't strip it) —
// the load caret sits after it, one space clear of "Paper" rather than jammed against it.
const INITIAL = `# Paper${" "}

A markdown-first, CJK-first **Live Preview** editor built on CodeMirror 6.

Try it:

- Type \`/\` to open the slash menu
- Drop an image, paste a table, write some \`code\`

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

const SCHEMES: { name: string; value: ColorScheme }[] = [
  { name: "Light", value: "light" },
  { name: "Dark", value: "dark" },
  { name: "System", value: "system" },
];

export function EditorPlayground() {
  const ref = useRef<PaperHandle>(null);
  const [markdown, setMarkdown] = useState(INITIAL);
  const [accent, setAccent] = useState(ACCENTS[0].value);
  const [font, setFont] = useState(FONTS[0].value);
  const [scheme, setScheme] = useState<ColorScheme>("system");
  const [showSource, setShowSource] = useState(false);

  // On load, drop the caret at the end of the "# Paper " heading line (after the
  // trailing space, a space clear of "Paper") so the page reads as an editor you can
  // start writing in. (The table renders as an atomic widget, so a caret can't sit
  // inside a cell — a selection there gets pushed past the table.) Skip on touch —
  // autofocusing there pops the keyboard and buries the hero. preventScroll + a
  // selection-only dispatch (no scrollIntoView) keep the page from yanking down past
  // the hero on focus.
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const view = ref.current?.getView();
    if (!view) return;
    view.dispatch({ selection: { anchor: INITIAL.indexOf("\n") } });
    view.contentDOM.focus({ preventScroll: true });
  }, []);

  // The editor reads its visual tokens from --beaket-paper-* on any ancestor.
  const tokenStyle = {
    "--beaket-paper-accent": accent,
    ...(font ? { "--beaket-paper-font": font } : {}),
  } as React.CSSProperties;

  return (
    // data-pg-theme darkens the surrounding card/toolbar to match a *forced* editor scheme.
    // "system" is left unset so the chrome follows the docs page (which already tracks the OS).
    <div style={tokenStyle} data-pg-theme={scheme === "system" ? undefined : scheme}>
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
        <div className="pg-group">
          <span className="pg-label">Theme</span>
          {SCHEMES.map((s) => (
            <button
              key={s.value}
              type="button"
              className="pg-btn"
              aria-pressed={scheme === s.value}
              onClick={() => setScheme(s.value)}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* The editor ships no container chrome — the host supplies the paper card. */}
      <div className="pg-paper">
        <Paper ref={ref} defaultValue={INITIAL} onChange={setMarkdown} colorScheme={scheme} />
      </div>

      <div className="pg-footer">
        <span>{markdown.length} chars</span>
        <button type="button" className="pg-btn" onClick={() => setShowSource((s) => !s)}>
          {showSource ? "Hide" : "View"} markdown
        </button>
      </div>

      {showSource && <pre className="pg-source">{markdown}</pre>}

      <style>{`
        /* A *forced* editor scheme overrides the local docs tokens so the card, toolbar, footer and
           source view track the editor instead of sitting light under a dark editor. Values mirror the
           docs-site palette in global.css (light :root + the prefers-color-scheme: dark block). The
           editor paints its own surface from its dark tokens — these only dress the chrome around it. */
        [data-pg-theme="light"] {
          --ink: #232a35; --paper: #ffffff; --frost: #f3f4f6; --chrome: #c0c4ca; --steel: #686b6f;
        }
        [data-pg-theme="dark"] {
          --ink: #e8eaec; --paper: #16181c; --frost: #23272e; --chrome: #3e4145; --steel: #9aa0a6;
        }
        /* Re-bridge the editor's porcelain vars to the *forced* palette. global.css resolves
           --color-* at :root against the OS scheme and that computed value inherits down — so
           overriding only --paper/--frost above doesn't reach the editor's tokens, which read
           --color-paper/--color-frost. Without this, a forced-light editor under a dark OS leaks
           dark into overlays that paint those tokens directly: the slash menu, the "Copied" toast
           and the table row/col insert handles. Re-declaring --color-* here re-resolves them
           against the forced --paper/--ink/etc. on this element. */
        [data-pg-theme="light"],
        [data-pg-theme="dark"] {
          --color-ink: var(--ink);
          --color-paper: var(--paper);
          --color-frost: var(--frost);
          --color-chrome: var(--chrome);
          --color-steel: var(--steel);
        }
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
          position: relative;
          width: 22px;
          height: 22px;
          border: 1px solid var(--chrome);
          cursor: pointer;
          padding: 0;
        }
        /* Transparent hit area extends the tap target past 44px without
           changing the visible swatch (the design-system touch-target trick). */
        .pg-swatch::before {
          content: "";
          position: absolute;
          inset: -12px;
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
          padding: 1.25rem 1.5rem;
        }
        /* Give the editor (not the card) the tall min-height so it fills the card.
           Otherwise the card is taller than the editor and the gap below the content
           is a dead zone — clicking there (e.g. under the table) misses the editor and
           nothing types. */
        .pg-paper .cm-content {
          min-height: min(76vh, 680px);
        }
        /* ...but never the nested cell editor: editing a table cell mounts its own
           CodeMirror inside the table widget, whose .cm-content would otherwise inherit
           the rule above and balloon the cell to full height. (0,3,0) beats it. */
        .pg-paper .cm-table-widget .cm-content {
          min-height: 0;
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
          /* Pin the text to the (forced) ink — otherwise it inherits the page body
             colour, which tracks the OS, and goes invisible (light text on the now
             light --frost) when the editor is forced light under a dark OS. */
          color: var(--ink);
          border: 1px solid var(--chrome);
          font-size: 12px;
          white-space: pre-wrap;
          word-break: break-word;
          max-height: 320px;
          overflow: auto;
        }
        @media (max-width: 540px) {
          .pg-toolbar {
            gap: 0.85rem 1rem;
            padding: 0.5rem 0;
          }
          .pg-paper {
            padding: 0.9rem 1rem;
          }
          .pg-paper .cm-content {
            min-height: min(70vh, 560px);
          }
          /* Bigger tap targets for the swatches on touch screens. */
          .pg-swatch {
            width: 26px;
            height: 26px;
          }
        }
      `}</style>
    </div>
  );
}
