// A representative large markdown document for the perf harness (#482): the constructs Live Preview
// decorates — headings, paragraphs with bold/italic/code/link spans, bullet and ordered lists,
// task items, blockquotes, fenced code blocks, and a few GFM tables — repeated in a fixed cycle so
// every run measures the same text. Deterministic: no randomness, so 1k and 10k are comparable
// across machines and commits.

export interface LargeDoc {
  markdown: string;
  lines: number;
  /** Offset at the end of a plain paragraph line near the middle of the document. */
  middle: number;
  /** Offset at the end of a plain paragraph line near the end of the document. */
  end: number;
}

const PARAGRAPH = (n: number) =>
  `Paragraph ${n} carries **bold text**, _italic text_, \`inline code\`, and a [link](https://example.com/${n}) so inline syntax hiding has work on every line.`;

// One section is 40 lines. Tables appear in every fifth section, so a 1k-line doc has five of them.
function section(n: number): string[] {
  const lines = [
    `## Section ${n}`,
    "",
    PARAGRAPH(n),
    "",
    `- bullet item with **bold** in section ${n}`,
    "- bullet item with `code`",
    "  - nested bullet item",
    `1. ordered item ${n}`,
    "2. ordered item with _emphasis_",
    "- [ ] an open task",
    "- [x] a finished task",
    "",
    `> A blockquote in section ${n} with **bold** inside.`,
    "",
    "```ts",
    `export function section${n}(value: number): number {`,
    "  const doubled = value * 2;",
    "  return doubled + 1;",
    "}",
    "```",
    "",
    PARAGRAPH(n + 0.5),
    "",
  ];
  if (n % 5 === 0) {
    lines.push(
      "| Column | Value | Note |",
      "| --- | --- | --- |",
      `| row ${n} | **${n}** | \`cell\` |`,
      "| second | 2 | _plain_ |",
      "",
    );
  } else {
    lines.push(
      `### Subsection ${n}`,
      "",
      PARAGRAPH(n + 0.25),
      "",
      "Another paragraph without any inline markup, just prose to fill a line.",
    );
  }
  while (lines.length < 39) lines.push(lines.length % 2 ? "" : PARAGRAPH(n + 0.75));
  lines.push("");
  return lines;
}

/** Build a document of exactly `lines` lines. */
export function largeDoc(lines: number): LargeDoc {
  const out: string[] = [];
  for (let n = 1; out.length < lines; n++) out.push(...section(n));
  out.length = lines;
  const markdown = out.join("\n");

  // Offsets of the end of each paragraph line, to pick typing positions that sit inside decorated text.
  const ends: { line: number; offset: number }[] = [];
  let offset = 0;
  out.forEach((text, i) => {
    offset += text.length;
    if (text.startsWith("Paragraph ")) ends.push({ line: i, offset });
    offset += 1;
  });
  const nearest = (line: number) =>
    ends.reduce((a, b) => (Math.abs(b.line - line) < Math.abs(a.line - line) ? b : a)).offset;
  return { markdown, lines, middle: nearest(lines / 2), end: nearest(lines - 1) };
}
