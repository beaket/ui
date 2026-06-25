import {
  type CodeBlockRenderer,
  type CodeBlockRenderers,
  type ColorScheme,
  Paper,
  type PaperHandle,
  type SlashItemsConfig,
  type TokenSpec,
  type TriggerSpec,
} from "@beaket/paper/react";
import { useEffect, useRef, useState } from "react";

// Consumer-delegated code-block rendering (ADR-0023). paper ships zero mermaid bytes — the consumer owns
// the renderer and the dependency. mermaid is `import()`ed lazily, so it stays out of the initial bundle
// and only loads when a `mermaid` fence is first rendered. The renderer bakes colors for the editor's
// scheme (paper re-runs it on a theme flip); a parse error throws and paper shows it as error text in the
// widget. This is the reference wiring — copy it into your app.
let mermaidLoader: Promise<typeof import("mermaid").default> | null = null;
let mermaidSeq = 0;
const mermaidRenderer: CodeBlockRenderer = async (code, el, ctx) => {
  if (!mermaidLoader) mermaidLoader = import("mermaid").then((m) => m.default);
  const mermaid = await mermaidLoader;
  // Re-initialize per render so a scheme flip re-themes (mermaid bakes colors at render time).
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: ctx.colorScheme === "dark" ? "dark" : "default",
  });
  const { svg } = await mermaid.render(`paper-mermaid-${++mermaidSeq}`, code);
  el.innerHTML = svg;
};
const codeBlockRenderers: CodeBlockRenderers = { mermaid: mermaidRenderer };

// Async + grouped slash items (ADR-0012 amendment). The transformer returns a Promise — modelling a
// catalog fetched on first open, with a short delay so the non-interactive "Loading…" row is visible —
// and tags items with `group`, so the menu renders "Blocks" / "Templates" section headers. Built-ins
// keep their order; the consumer clusters by ordering. Resolution is lazy + cached: only the first `/`
// open waits; subsequent opens are instant.
const slashItems: SlashItemsConfig = (defaults) =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          ...defaults.map((item) => ({ ...item, group: "Blocks" })),
          {
            label: "Meeting notes",
            keywords: "template meeting",
            insert: "## Meeting notes\n\n- ",
            group: "Templates",
          },
          {
            label: "Daily log",
            keywords: "template daily",
            insert: "## Daily log\n\n- [ ] ",
            group: "Templates",
          },
        ]),
      500,
    ),
  );

// A declarative `@`-mention trigger (ADR-0016). `onQuery` filters a directory — async here, to model a
// real fetch — and returns declarative items: each inserts a markdown link (single source of truth), and
// `data` carries the user id so `onSelect` can recover *which* person was picked, not just the text.
const PEOPLE = [
  { name: "Ada Lovelace", handle: "ada", id: "u_001" },
  { name: "Alan Turing", handle: "alan", id: "u_002" },
  { name: "Grace Hopper", handle: "grace", id: "u_003" },
  { name: "Katherine Johnson", handle: "katherine", id: "u_004" },
  { name: "Linus Torvalds", handle: "linus", id: "u_005" },
];

const mentionTrigger: TriggerSpec = {
  trigger: "@",
  onQuery: async (query) => {
    const q = query.toLowerCase();
    return PEOPLE.filter((p) => p.name.toLowerCase().includes(q) || p.handle.includes(q)).map(
      (p) => ({
        label: `${p.name} · @${p.handle}`,
        insert: `[@${p.name}](user:${p.id}) `,
        data: p.id,
      }),
    );
  },
  onSelect: (item) => console.log("[paper] mention selected:", item.data),
};

// The atomic-token counterpart (ADR-0017): the same `[@Name](user:id)` markdown the trigger inserts is
// rendered inline (accent + underline, the link visual language — #556) but atomic — the caret steps
// over it, one Backspace deletes it whole. The id round-trips in the markdown, recovered from the
// capture group; no second document model.
const mentionToken: TokenSpec = {
  pattern: /\[@([^\]]+)\]\(user:([^)]+)\)/,
  render: (m) => ({ label: `@${m[1]}`, className: "mention-token" }),
};

// The heading keeps a trailing space (via ${" "} so formatters can't strip it) —
// the load caret sits after it, one space clear of "Why Paper" rather than jammed against it.
const INITIAL = `# Why Paper${" "}

Live preview rewrites the DOM as you type — hiding and revealing syntax around your cursor. Do that mid-IME-composition and Japanese or Korean input drops or duplicates characters. It's a stubborn, still-open problem even in mature, widely-used editors.

Paper makes one promise its central invariant: **never break composition** — no decoration recompute, no widget rebuild while you're mid-character. That's the editor I wanted, small enough to drop into any app.

Try it:

- Type \`/\` to open the slash menu — items load async and are grouped (Blocks · Templates)
- Type \`@\` to mention someone — it renders inline like a link, but atomic (Backspace removes it whole)
- Drop an image, paste a table, write some \`code\`
- A \`mermaid\` fence renders as a diagram below — click into it to edit the source

Paper ships **no diagram renderer** — the host injects one, so the editor stays small. Click in to edit:

\`\`\`mermaid
flowchart LR
  Type[Type markdown] --> Render[Render in place]
  Render --> Edit[Cursor in = raw source]
  Edit --> Type
\`\`\`

| Good fit | Not the tool |
| --- | --- |
| Markdown notes, docs, comments | Rich-text docs that aren't markdown |
| CJK / mixed-language writing | Real-time collaboration |
| Dropping an editor into your app | Page layout & print |
| Read and write in one view | A big plugin ecosystem |

## Markdown, the way it reads

Everything renders **in place** as you type — no split pane, no preview tab. Mix _emphasis_, \`inline code\`, [links](https://github.com/beaket/ui), and footnotes[^gh] right in the flow of a sentence.

[^gh]: GitHub-style — defined right by the reference, and also gathered at the bottom.

> The cursor reveals raw syntax; everything around it stays rendered. That's live preview.

CJK is first-class, not bolted on:

- **English** behaves the way you'd expect
  - _emphasis_, \`code\`, ~~strikethrough~~ — all in place
  - tables, task lists, nested lists, footnotes
- 日本語 — 装飾の境界でも変換が壊れない
  - **強調** や \`コード\` を文中に混ぜても安全
  - 脚注[^ime]を文の途中に挿しても composition は保たれる
- 한국어로 이 문장 끝에 직접 이어서 입력해보세요 →

[^ime]: 変換確定の前に装飾を組み直さない、それだけを守る。

\`\`\`tsx
// fenced code blocks keep their highlighting
import { Paper } from "@beaket/paper/react";

<Paper defaultValue="# Hello, 世界" onChange={setMarkdown} />;
\`\`\`

- [x] Live preview without breaking IME
- [ ] Your next document
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

  // On load, drop the caret at the end of the "# Why Paper " heading line (after the
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
        <Paper
          ref={ref}
          defaultValue={INITIAL}
          onChange={setMarkdown}
          colorScheme={scheme}
          slashItems={slashItems}
          triggers={[mentionTrigger]}
          tokens={[mentionToken]}
          codeBlockRenderers={codeBlockRenderers}
          placeholder="Start writing…"
          // The `minHeight` option (ADR-0018) reserves the editable height on the editor itself, so
          // the editor fills the card and clicking anywhere — even the empty space under the table —
          // places a cursor. This replaces the fragile hand-rolled `.cm-content` CSS this demo used to
          // ship (which also had to special-case the nested cell editor); the option is scoped so the
          // table cell subview is never ballooned.
          minHeight="min(76vh, 680px)"
        />
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
        /* No --color-* re-bridge needed here: as of @beaket/paper ≥ the #472 fix (ADR-0020), a forced
           colorScheme is authoritative — the editor pins its own bridged --color-* per scheme on
           .cm-editor, so overlays (slash menu, "Copied" toast, table handles) follow the forced scheme
           regardless of the docs site's OS-tracking bridge in global.css. The chrome overrides above
           only dress the card/toolbar/footer around the editor. */
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
        /* The editor's own minHeight option (ADR-0018) now reserves the editable height — no
           hand-rolled cm-content CSS (and no cell-subview special case) needed here anymore. */
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
