import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

// Table entry point ③: paste conversion — HTML tables (spreadsheet copy) and TSV into markdown tables.
// Insert with a single dispatch to guarantee immediate undo. Markdown table text needs no conversion:
// even on a plain paste the StateField creates the widget.

function escapeCell(text: string): string {
  // Escape backslashes before pipes: a cell containing `\|` must not collapse to
  // `\\|` (literal backslash + live column delimiter), which would inject columns.
  return text.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>").trim();
}

export function toMarkdownTable(rows: string[][]): string | null {
  if (rows.length === 0) return null;
  const cols = Math.max(...rows.map((row) => row.length));
  if (cols < 1) return null;
  const pad = (row: string[]) => {
    const cells = [...row];
    while (cells.length < cols) cells.push("");
    return "| " + cells.map((c) => c || " ").join(" | ") + " |";
  };
  const lines = [pad(rows[0]), "|" + " --- |".repeat(cols), ...rows.slice(1).map(pad)];
  return lines.join("\n");
}

export function htmlTableToRows(html: string): string[][] | null {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const table = doc.querySelector("table");
  if (!table) return null;
  const rows: string[][] = [];
  for (const tr of table.querySelectorAll("tr")) {
    const cells = [...tr.querySelectorAll("th, td")].map((cell) =>
      escapeCell(cell.textContent ?? ""),
    );
    if (cells.length > 0) rows.push(cells);
  }
  return rows.length > 0 ? rows : null;
}

export function tsvToRows(text: string): string[][] | null {
  if (!text.includes("\t")) return null;
  const lines = text.replace(/\r\n/g, "\n").replace(/\n$/, "").split("\n");
  return lines.map((line) => line.split("\t").map(escapeCell));
}

function insertTable(view: EditorView, markdown: string): void {
  const sel = view.state.selection.main;
  const fromLine = view.state.doc.lineAt(sel.from);
  const toLine = view.state.doc.lineAt(sel.to);
  // Block element — if mid-line, split it above and below
  const prefix = sel.from > fromLine.from ? "\n" : "";
  const suffix = sel.to < toLine.to ? "\n" : "";
  const insert = prefix + markdown + suffix;
  view.dispatch({
    changes: { from: sel.from, to: sel.to, insert },
    selection: { anchor: sel.from + insert.length },
    userEvent: "input.paste",
  });
}

export function pasteTableConvert(): Extension {
  return EditorView.domEventHandlers({
    paste(event, view) {
      if (view.state.readOnly) return false; // read-only: no paste-to-table conversion (ADR-0018)
      const html = event.clipboardData?.getData("text/html") ?? "";
      const text = event.clipboardData?.getData("text/plain") ?? "";

      let rows: string[][] | null = null;
      if (/<table[\s>]/i.test(html)) rows = htmlTableToRows(html);
      else if (text) rows = tsvToRows(text);
      if (!rows) return false;

      const markdown = toMarkdownTable(rows);
      if (!markdown) return false;

      event.preventDefault();
      insertTable(view, markdown);
      return true;
    },
  });
}
