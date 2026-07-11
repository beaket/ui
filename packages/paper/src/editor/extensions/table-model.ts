import type { EditorState } from "@codemirror/state";

// Table model — pure parse/serialize over the markdown source (no view/DOM dependency).
// lezer is used only to *locate* the Table node (in table-widget.ts); cell ranges are computed
// here by scanning lines directly, because lezer's TableCell node isn't created for empty cells
// and so can't give a click-entry position for an empty cell.

export type TableAlign = "left" | "center" | "right" | null;

export interface CellRange {
  /** Cell content range in body document coordinates (trimmed). If editable=false, from/to are invalid */
  from: number;
  to: number;
  text: string;
  editable: boolean;
}

export interface TableData {
  source: string;
  tableFrom: number;
  aligns: TableAlign[];
  /** rows[0] = header, rows[1..] = body rows (delimiter row excluded) */
  rows: CellRange[][];
}

export function parseAligns(delimiter: string): TableAlign[] {
  return delimiter
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((seg) => {
      const s = seg.trim();
      const left = s.startsWith(":");
      const right = s.endsWith(":");
      if (left && right) return "center";
      if (right) return "right";
      if (left) return "left";
      return null;
    });
}

export function parseRowCells(lineText: string, lineFrom: number): CellRange[] {
  // Collect positions of unescaped pipes
  const pipes: number[] = [];
  for (let i = 0; i < lineText.length; i++) {
    if (lineText[i] === "|" && lineText[i - 1] !== "\\") pipes.push(i);
  }
  if (pipes.length === 0) return [];

  // GFM allows omitting the pipes at the row edges — compensate with virtual boundaries
  const bounds = [...pipes];
  if (lineText.slice(0, pipes[0]).trim() !== "") bounds.unshift(-1);
  if (lineText.slice(pipes[pipes.length - 1] + 1).trim() !== "") bounds.push(lineText.length);

  const cells: CellRange[] = [];
  for (let i = 0; i < bounds.length - 1; i++) {
    const segStart = bounds[i] + 1;
    const segEnd = bounds[i + 1];
    const seg = lineText.slice(segStart, segEnd);
    // Treat only one padding space at each edge as outside the cell — a full trim would erase
    // a trailing space the user just typed during the body→subview reverse sync
    const leading = seg.startsWith(" ") ? 1 : 0;
    const trailing = seg.length > leading && seg.endsWith(" ") ? 1 : 0;
    const text = seg.slice(leading, seg.length - trailing);
    const from = lineFrom + segStart + leading;
    cells.push({ from, to: from + text.length, text, editable: true });
  }
  return cells;
}

const MISSING_CELL: CellRange = { from: -1, to: -1, text: "", editable: false };

export function parseTable(state: EditorState, nodeFrom: number, nodeTo: number): TableData {
  const firstLine = state.doc.lineAt(nodeFrom);
  const lastLine = state.doc.lineAt(nodeTo);
  const rows: CellRange[][] = [];
  let aligns: TableAlign[] = [];

  for (let n = firstLine.number; n <= lastLine.number; n++) {
    const line = state.doc.line(n);
    if (n === firstLine.number + 1) {
      aligns = parseAligns(line.text);
      continue;
    }
    rows.push(parseRowCells(line.text, line.from));
  }

  const cols = Math.max(aligns.length, rows[0]?.length ?? 0);
  for (const row of rows) {
    while (row.length < cols) row.push(MISSING_CELL);
    row.length = cols;
  }

  return {
    source: state.sliceDoc(firstLine.from, lastLine.to),
    tableFrom: firstLine.from,
    aligns,
    rows,
  };
}

export function serializeRow(cells: string[]): string {
  return "|" + cells.map((c) => (c ? ` ${c} ` : "  ")).join("|") + "|";
}

export function serializeDelimiter(aligns: TableAlign[]): string {
  return (
    "|" +
    aligns
      .map((a) => {
        if (a === "center") return " :---: ";
        if (a === "right") return " ---: ";
        if (a === "left") return " :--- ";
        return " --- ";
      })
      .join("|") +
    "|"
  );
}
