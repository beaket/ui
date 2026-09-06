import { defaultKeymap, redo, undo } from "@codemirror/commands";
import { syntaxTree } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import {
  Annotation,
  ChangeSet,
  EditorState,
  Prec,
  StateEffect,
  StateField,
  Transaction,
} from "@codemirror/state";
import type { DecorationSet, ViewUpdate } from "@codemirror/view";
import { Decoration, EditorView, ViewPlugin, WidgetType, keymap } from "@codemirror/view";
import { renderCellInline } from "./cell-inline-renderer";
import { guardedDecorations } from "./composing-guard";
import { markdownExtension } from "./markdown";
import type { TableAlign, TableData } from "./table-model";
import { parseTable, serializeDelimiter, serializeRow } from "./table-model";

// ADR-0002: A table is always a rendered grid widget; structure syntax (|, delimiter rows) stays permanently hidden.
// ADR-0003: Editing happens in a CM subview shown only on the one focused cell — it shares the document with the
// body text (sync annotation prevents re-emission), and undo/IME stay on a single system with the body.
//
// CM6 constraint: block decorations must be provided via StateField (no ViewPlugin).
// Preventing table churn: even when cell editing changes the table source, the widget DOM is not recreated;
// it's updated in place via updateDOM() — keeping the subview from being destroyed during editing is the key.

const cellSync = Annotation.define<"from-cell" | "from-main">();

interface ActiveCell {
  tableFrom: number;
  row: number;
  col: number;
}

const setActiveCellEffect = StateEffect.define<ActiveCell | null>({
  map: (value, mapping) =>
    value ? { ...value, tableFrom: mapping.mapPos(value.tableFrom) } : null,
});

const activeCellField = StateField.define<ActiveCell | null>({
  create: () => null,
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setActiveCellEffect)) value = effect.value;
    }
    if (value && tr.docChanged) {
      value = { ...value, tableFrom: tr.changes.mapPos(value.tableFrom) };
    }
    return value;
  },
});

function sameCell(a: ActiveCell | null, b: ActiveCell | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.tableFrom === b.tableFrom && a.row === b.row && a.col === b.col;
}

function clearActiveCell(view: EditorView): void {
  if (view.state.field(activeCellField)) {
    view.dispatch({ effects: setActiveCellEffect.of(null) });
  }
}

/** Start cell editing on a specific table from the outside (e.g. a slash command) */
export function activateCell(view: EditorView, tableFrom: number, row = 0, col = 0): void {
  view.dispatch({ effects: setActiveCellEffect.of({ tableFrom, row, col }) });
}

// ---------------------------------------------------------------------------
// Line breaks within a cell: the source is GFM-standard <br>, but even during editing it's never exposed as
// characters — it's rendered as a real line break (extending ADR-0002's hiding philosophy inside the cell).
// The cursor is atomic — bundled via atomicRanges so a single Backspace deletes it whole and arrow keys skip it.

const BR_RE = /<br\s*\/?>/gi;

/** Find the source ranges of <br> (and <br/>) in cell text. (Pure — a unit test target) */
export function findBrRanges(text: string): { from: number; to: number }[] {
  const ranges: { from: number; to: number }[] = [];
  BR_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = BR_RE.exec(text))) {
    ranges.push({ from: m.index, to: m.index + m[0].length });
  }
  return ranges;
}

class BrWidget extends WidgetType {
  eq(): boolean {
    return true;
  }
  toDOM(): HTMLElement {
    return document.createElement("br");
  }
  ignoreEvent(): boolean {
    return false;
  }
}

/** Turn <br> in the subview doc into an atomic replace decoration (a real line break) */
function computeBrDecorations(view: EditorView): DecorationSet {
  const ranges = findBrRanges(view.state.doc.toString());
  return Decoration.set(
    ranges.map((r) => Decoration.replace({ widget: new BrWidget() }).range(r.from, r.to)),
    true,
  );
}

/** For the editing subview: hidden <br> render (guard) + cursor atomization (exported for tests) */
export const cellBrLineBreaks: Extension = [
  guardedDecorations("cell-br", computeBrDecorations),
  EditorView.atomicRanges.of((view) => computeBrDecorations(view)),
];

/**
 * Convert newlines entering a cell into <br> (e.g. on paste). Prevents the table row from splitting and
 * unifies on the same line-break model as Shift+Enter. (Reject the newline transaction → replace with conversion)
 */
export const cellNewlineToBr: Extension = EditorState.transactionFilter.of((tr) => {
  if (!tr.docChanged) return tr;
  let hasNewline = false;
  tr.changes.iterChanges((_a, _b, _c, _d, ins) => {
    if (ins.toString().indexOf("\n") >= 0) hasNewline = true;
  });
  if (!hasNewline) return tr;
  const specs: { from: number; to: number; insert: string }[] = [];
  tr.changes.iterChanges((fromA, toA, _fromB, _toB, inserted) => {
    specs.push({ from: fromA, to: toA, insert: inserted.toString().replace(/\r\n?|\n/g, "<br>") });
  });
  const changes = ChangeSet.of(specs, tr.startState.doc.length);
  return {
    changes,
    selection: { anchor: changes.mapPos(tr.startState.selection.main.to, 1) },
    scrollIntoView: tr.scrollIntoView,
    userEvent: tr.annotation(Transaction.userEvent),
  };
});

/**
 * Whether the subview cursor is visually on the top/bottom line (coordinate comparison).
 * A cell is logically one line (no newlines) and visual lines are split only by <br>/wrapping, so judge by coordinates.
 * In jsdom (coordinates 0) always true — unit tests only cover the single-line scenario.
 */
function atVisualEdge(sv: EditorView, edge: "top" | "bottom"): boolean {
  const head = sv.state.selection.main.head;
  const c = sv.coordsAtPos(head);
  const ref = sv.coordsAtPos(edge === "bottom" ? sv.state.doc.length : 0);
  if (!c || !ref) return true;
  return edge === "bottom" ? Math.abs(c.bottom - ref.bottom) < 1 : Math.abs(c.top - ref.top) < 1;
}

// ---------------------------------------------------------------------------
// Cell subview controller — attached to the widget DOM, manages cell text updates and the subview lifecycle

let lastCellClick: { x: number; y: number } | null = null;

class TableController {
  data: TableData;
  private readonly wrap: HTMLElement;
  private cellEls: HTMLElement[][] = [];
  private mainView: EditorView | null = null;
  private subview: EditorView | null = null;
  private active: { row: number; col: number } | null = null;
  private activeFrom = -1;
  /** During subview IME composition, defer body-originated sync and apply it after composition ends (CJK first-class) */
  private pendingSync: string | null = null;

  constructor(wrap: HTMLElement, data: TableData, view: EditorView) {
    this.wrap = wrap;
    this.data = data;
    this.mainView = view;
    this.buildTable();
  }

  private buildTable(): void {
    this.closeMenu();
    this.wrap.textContent = "";
    this.cellEls = [];
    const table = document.createElement("table");

    this.data.rows.forEach((row, rowIndex) => {
      const isHeader = rowIndex === 0;
      const section =
        table.querySelector(isHeader ? "thead" : "tbody") ??
        table.appendChild(document.createElement(isHeader ? "thead" : "tbody"));
      const tr = document.createElement("tr");
      const els: HTMLElement[] = [];
      row.forEach((_cell, colIndex) => {
        const el = document.createElement(isHeader ? "th" : "td");
        const align = this.data.aligns[colIndex];
        if (align) el.style.textAlign = align;
        el.dataset.row = String(rowIndex);
        el.dataset.col = String(colIndex);
        tr.appendChild(el);
        els.push(el);
      });
      section.appendChild(tr);
      this.cellEls.push(els);
    });

    // Grips: header cell = column menu, first cell of a body row = row menu
    this.cellEls[0]?.forEach((el, colIndex) => this.attachGrip(el, "col", colIndex));
    for (let r = 1; r < this.cellEls.length; r++) {
      const el = this.cellEls[r]?.[0];
      if (el) this.attachGrip(el, "row", r);
    }

    this.data.rows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const el = this.cellEls[rowIndex]?.[colIndex];
        if (el) this.renderCell(el, cell.text);
      });
    });

    table.addEventListener("mousedown", (event) => {
      const target = (event.target as HTMLElement).closest("th, td") as HTMLElement | null;
      if (!target || !this.mainView) return;
      // Read-only: never enter a cell for editing (the cell subview is a separate EditorView, so the
      // parent's editable=false does not propagate to it — guard the entry, ADR-0018 matrix).
      if (this.mainView.state.readOnly) return;
      if (this.active && target === this.activeCellEl()) return; // handled by the subview
      event.preventDefault();
      const row = Number(target.dataset.row);
      const col = Number(target.dataset.col);
      if (!this.data.rows[row]?.[col]?.editable) return;
      lastCellClick = { x: event.clientX, y: event.clientY };
      this.mainView.dispatch({
        effects: setActiveCellEffect.of({ tableFrom: this.data.tableFrom, row, col }),
      });
    });

    this.wrap.appendChild(table);
    this.appendEdgeButtons();
  }

  /** Edge hover affordances: right = add column, bottom = add row */
  private appendEdgeButtons(): void {
    const make = (className: string, title: string, onClick: () => void) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `cm-table-edge ${className}`;
      btn.title = title;
      btn.textContent = "+";
      btn.addEventListener("mousedown", (e) => e.preventDefault());
      btn.addEventListener("click", onClick);
      this.wrap.appendChild(btn);
    };
    make("cm-table-add-col", "Add column", () => this.addColumn());
    // Focus the new row's first cell (W-5) so the caret doesn't fall back to the doc head after insert.
    make("cm-table-add-row", "Add row", () => this.addRowAndFocus());
  }

  private tableLines(): { from: number; to: number; text: string; isDelimiter: boolean }[] {
    if (!this.mainView) return [];
    const doc = this.mainView.state.doc;
    const first = doc.lineAt(this.data.tableFrom).number;
    const lines = [];
    for (let i = 0; i <= this.data.rows.length; i++) {
      const line = doc.line(first + i);
      lines.push({ from: line.from, to: line.to, text: line.text, isDelimiter: i === 1 });
    }
    return lines;
  }

  private addRow(): void {
    if (!this.mainView) return;
    const cols = this.data.rows[0]?.length ?? 0;
    const lines = this.tableLines();
    const last = lines[lines.length - 1];
    if (!last) return;
    this.mainView.dispatch({
      changes: { from: last.to, insert: "\n|" + "  |".repeat(cols) },
      annotations: cellSync.of("from-cell"),
      userEvent: "input",
    });
  }

  private addColumn(): void {
    if (!this.mainView) return;
    const changes = this.tableLines().map((line) => {
      const text = line.text.trimEnd();
      const endsWithPipe = text.endsWith("|") && !text.endsWith("\\|");
      const insert = (endsWithPipe ? "" : " |") + (line.isDelimiter ? " --- |" : "  |");
      return { from: line.from + text.length, to: line.to, insert };
    });
    this.mainView.dispatch({
      changes,
      annotations: cellSync.of("from-cell"),
      userEvent: "input",
    });
  }

  private activeCellEl(): HTMLElement | null {
    if (!this.active) return null;
    return this.cellEls[this.active.row]?.[this.active.col] ?? null;
  }

  private setActive(row: number, col: number): void {
    if (!this.mainView) return;
    this.mainView.dispatch({
      effects: setActiveCellEffect.of({ tableFrom: this.data.tableFrom, row, col }),
    });
  }

  /** Tab/Shift+Tab/←→: cycle cells in row-major order. At the end, add a row if allowAddRow, otherwise return state */
  private moveSequential(delta: 1 | -1, allowAddRow = true): "moved" | "end-forward" | "end-back" {
    if (!this.active) return "moved";
    const cols = this.data.rows[0]?.length ?? 0;
    if (cols === 0) return "moved";
    const total = this.data.rows.length * cols;
    let index = this.active.row * cols + this.active.col;
    for (;;) {
      index += delta;
      if (index < 0) return "end-back";
      if (index >= total) {
        if (allowAddRow) {
          this.addRowAndFocus();
          return "moved";
        }
        return "end-forward";
      }
      const row = Math.floor(index / cols);
      const col = index % cols;
      if (this.data.rows[row]?.[col]?.editable) {
        this.setActive(row, col);
        return "moved";
      }
    }
  }

  /** Enter/↓: to the cell below in the same column */
  private moveDown(): void {
    if (!this.active) return;
    const row = this.active.row + 1;
    if (row >= this.data.rows.length) return;
    if (this.data.rows[row]?.[this.active.col]?.editable) {
      this.setActive(row, this.active.col);
    }
  }

  /** ↑: to the cell above in the same column */
  private moveUp(): void {
    if (!this.active) return;
    const row = this.active.row - 1;
    if (row < 0) return;
    if (this.data.rows[row]?.[this.active.col]?.editable) {
      this.setActive(row, this.active.col);
    }
  }

  /**
   * Escape out of the table with the keyboard alone. If the table is at the document end/start, create a blank line and place the cursor there.
   * (Edge arrow escape — table boundary = [tableFrom, tableFrom + source.length])
   */
  private escapeTable(dir: "above" | "below"): void {
    const main = this.mainView;
    if (!main) return;
    const tableFrom = this.data.tableFrom;
    const tableTo = tableFrom + this.data.source.length;
    clearActiveCell(main);
    main.focus();
    const docLen = main.state.doc.length;
    if (dir === "below") {
      if (tableTo >= docLen) {
        main.dispatch({
          changes: { from: docLen, insert: "\n" },
          selection: { anchor: docLen + 1 },
          scrollIntoView: true,
          userEvent: "input",
        });
      } else {
        main.dispatch({
          selection: { anchor: Math.min(tableTo + 1, docLen) },
          scrollIntoView: true,
        });
      }
    } else {
      if (tableFrom <= 0) {
        main.dispatch({
          changes: { from: 0, insert: "\n" },
          selection: { anchor: 0 },
          scrollIntoView: true,
          userEvent: "input",
        });
      } else {
        main.dispatch({ selection: { anchor: Math.max(tableFrom - 1, 0) }, scrollIntoView: true });
      }
    }
  }

  private addRowAndFocus(): void {
    this.addRow();
    // dispatch is synchronous — this.data already reflects the new row
    this.setActive(this.data.rows.length - 1, 0);
  }

  /** Widget updateDOM path after a document change — update in place without recreating the DOM */
  setData(data: TableData): void {
    const dimsChanged =
      data.rows.length !== this.data.rows.length ||
      (data.rows[0]?.length ?? 0) !== (this.data.rows[0]?.length ?? 0);
    this.data = data;

    if (dimsChanged) {
      const active = this.active;
      this.unmount();
      this.buildTable();
      // If the active cell still exists in the new structure, restore it
      if (active && this.mainView && data.rows[active.row]?.[active.col]?.editable) {
        this.mount(this.mainView, active.row, active.col);
      }
      return;
    }

    this.data.rows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const el = this.cellEls[rowIndex]?.[colIndex];
        if (!el) return;
        el.style.textAlign = this.data.aligns[colIndex] ?? "";
        const isActive = this.active?.row === rowIndex && this.active?.col === colIndex;
        if (isActive) {
          this.activeFrom = cell.from;
          this.syncSubviewText(cell.text);
        } else if (el.dataset.src !== cell.text) {
          this.renderCell(el, cell.text);
        }
      });
    });
  }

  private syncSubviewText(text: string): void {
    const sv = this.subview;
    if (!sv || sv.state.doc.toString() === text) return;
    if (sv.composing) {
      this.pendingSync = text;
      return;
    }
    sv.dispatch({
      changes: { from: 0, to: sv.state.doc.length, insert: text },
      annotations: cellSync.of("from-main"),
    });
  }

  mount(view: EditorView, row: number, col: number): void {
    if (this.active?.row === row && this.active?.col === col) return;
    this.unmount();
    // Read-only: do not spin up a cell subview (it would be independently editable). ADR-0018 matrix.
    if (view.state.readOnly) return;
    const cell = this.data.rows[row]?.[col];
    if (!cell?.editable) return;
    this.mainView = view;
    this.active = { row, col };
    this.activeFrom = cell.from;

    const el = this.cellEls[row]?.[col];
    if (!el) return;
    el.classList.add("cm-cell-editing");
    el.textContent = "";

    const state = EditorState.create({
      doc: cell.text,
      extensions: [
        Prec.high(
          keymap.of([
            // Table keyboard semantics. No movement during IME composition — commit only (CJK first-class).
            // CM usually doesn't route keydown to the keymap during composition, but defend doubly.
            {
              key: "Enter",
              run: (sv) => {
                if (!sv.composing) this.moveDown();
                return true;
              },
            },
            {
              key: "Shift-Enter",
              run: (sv) => {
                if (sv.composing) return true;
                const sel = sv.state.selection.main;
                sv.dispatch({
                  changes: { from: sel.from, to: sel.to, insert: "<br>" },
                  selection: { anchor: sel.from + 4 },
                  userEvent: "input.type",
                });
                return true;
              },
            },
            {
              key: "Tab",
              run: (sv) => {
                if (!sv.composing) this.moveSequential(1);
                return true;
              },
            },
            {
              key: "Shift-Tab",
              run: (sv) => {
                if (!sv.composing) this.moveSequential(-1);
                return true;
              },
            },
            // Edge arrow escape: when there's nowhere left to go in the cell, move to a neighbor cell/outside the table.
            // While inside, return false so defaultKeymap handles intra-cell movement.
            {
              key: "ArrowDown",
              run: (sv) => {
                if (sv.composing || !atVisualEdge(sv, "bottom")) return false;
                if (this.active && this.active.row < this.data.rows.length - 1) this.moveDown();
                else this.escapeTable("below");
                return true;
              },
            },
            {
              key: "ArrowUp",
              run: (sv) => {
                if (sv.composing || !atVisualEdge(sv, "top")) return false;
                if (this.active && this.active.row > 0) this.moveUp();
                else this.escapeTable("above");
                return true;
              },
            },
            {
              key: "ArrowRight",
              run: (sv) => {
                if (sv.composing) return false;
                const sel = sv.state.selection.main;
                if (!sel.empty || sel.head !== sv.state.doc.length) return false;
                if (this.moveSequential(1, false) === "end-forward") this.escapeTable("below");
                return true;
              },
            },
            {
              key: "ArrowLeft",
              run: (sv) => {
                if (sv.composing) return false;
                const sel = sv.state.selection.main;
                if (!sel.empty || sel.head !== 0) return false;
                if (this.moveSequential(-1, false) === "end-back") this.escapeTable("above");
                return true;
              },
            },
            {
              key: "Escape",
              run: () => {
                const main = this.mainView;
                if (main) {
                  const from = this.data.tableFrom;
                  const to = from + this.data.source.length;
                  clearActiveCell(main);
                  main.focus();
                  // End editing only and leave the table in a block-selected state (outline ring + Backspace deletes)
                  main.dispatch({ selection: { anchor: from, head: to } });
                }
                return true;
              },
            },
            { key: "Mod-z", run: () => (this.mainView ? undo(this.mainView) : false) },
            {
              key: "Mod-y",
              mac: "Mod-Shift-z",
              run: () => (this.mainView ? redo(this.mainView) : false),
            },
          ]),
        ),
        keymap.of(defaultKeymap),
        EditorView.lineWrapping,
        // A cell being edited = show the source + source highlighting (Live Preview's "where the cursor is = source")
        markdownExtension(),
        // <br> within a cell renders as a real line break even during editing + cursor atomization
        cellBrLineBreaks,
        // Newlines entering a cell (e.g. on paste) are converted to <br> rather than rejected
        cellNewlineToBr,
        EditorView.updateListener.of((update) => {
          // After composition ends, apply the deferred body-originated sync
          if (!update.view.composing && this.pendingSync !== null) {
            const text = this.pendingSync;
            this.pendingSync = null;
            this.syncSubviewText(text);
          }
          if (update.focusChanged && !update.view.hasFocus) {
            setTimeout(() => {
              const main = this.mainView;
              if (main && this.subview === update.view && !update.view.hasFocus) {
                const activeNow = main.state.field(activeCellField);
                if (
                  activeNow &&
                  activeNow.tableFrom === this.data.tableFrom &&
                  activeNow.row === this.active?.row &&
                  activeNow.col === this.active?.col
                ) {
                  clearActiveCell(main);
                }
              }
            }, 30);
          }
        }),
        cellEditorTheme,
      ],
    });

    this.subview = new EditorView({
      state,
      parent: el,
      dispatch: (tr, sv) => {
        sv.update([tr]);
        if (!tr.docChanged || tr.annotation(cellSync) || !this.mainView) return;
        const changes: { from: number; to: number; insert: string }[] = [];
        tr.changes.iterChanges((fromA, toA, _fromB, _toB, inserted) => {
          changes.push({
            from: this.activeFrom + fromA,
            to: this.activeFrom + toA,
            insert: inserted.toString(),
          });
        });
        // userEvent must be preserved so the body history's undo boundaries follow typing semantics
        this.mainView.dispatch({
          changes,
          annotations: cellSync.of("from-cell"),
          userEvent: tr.annotation(Transaction.userEvent) ?? undefined,
        });
      },
    });

    this.subview.focus();
    if (lastCellClick) {
      const pos = this.subview.posAtCoords(lastCellClick);
      if (pos !== null) this.subview.dispatch({ selection: { anchor: pos } });
      lastCellClick = null;
    } else {
      this.subview.dispatch({ selection: { anchor: this.subview.state.doc.length } });
    }
  }

  unmount(): void {
    if (this.subview) {
      this.subview.destroy();
      this.subview = null;
    }
    const el = this.activeCellEl();
    if (el && this.active) {
      el.classList.remove("cm-cell-editing");
      this.renderCell(el, this.data.rows[this.active.row]?.[this.active.col]?.text ?? "");
    }
    this.active = null;
    this.activeFrom = -1;
    this.pendingSync = null;
  }

  destroy(): void {
    this.closeMenu();
    this.unmount();
    this.mainView = null;
  }

  /** Render cell content + preserve the grip (since renderCellInline clears all children) */
  private renderCell(el: HTMLElement, text: string): void {
    renderCellInline(el, text);
    // An empty cell has no inline content, so its line box collapses and the row shrinks to padding-only
    // height (~14px) — a freshly added blank row then looks razor-thin next to filled rows. A zero-width
    // space restores exactly one line box, matching a text cell's height across any font/theme. (The grip
    // is absolutely positioned and contributes no height, so it can't substitute.) Only the rendered
    // (non-editing) path runs here; an active cell is driven by its subview and is untouched.
    if (!text) el.appendChild(document.createTextNode("​"));
    el.dataset.src = text;
    const grip = (el as GripHost).__grip;
    if (grip) el.appendChild(grip);
  }

  private attachGrip(el: HTMLElement, kind: "col" | "row", index: number): void {
    // A real <button> (not a bare <div>) so the menu opener is keyboard-focusable and exposed to AT.
    const grip = document.createElement("button");
    grip.type = "button";
    grip.className = kind === "col" ? "cm-col-grip" : "cm-row-grip";
    const label = kind === "col" ? "Column menu" : "Row menu";
    grip.title = label;
    grip.setAttribute("aria-label", label);
    grip.addEventListener("mousedown", (event) => {
      // Separate from cell-editing entry (the table mousedown)
      event.preventDefault();
      event.stopPropagation();
    });
    grip.addEventListener("click", (event) => {
      event.stopPropagation();
      this.openMenu(kind, index, grip);
    });
    (el as GripHost).__grip = grip;
    el.appendChild(grip);
  }

  // -------------------------------------------------------------------------
  // Grip menu

  private menu: HTMLElement | null = null;
  private menuCloseListener: ((event: MouseEvent) => void) | null = null;
  /** The grip the open menu is anchored to, so it can be re-placed from live coords on scroll (#541). */
  private menuAnchor: HTMLElement | null = null;
  /** Bound scroll/resize handler that keeps the menu glued to its anchor grip. */
  private menuReposition: (() => void) | null = null;

  private openMenu(kind: "col" | "row", index: number, anchor: HTMLElement): void {
    // No menu actions during IME composition (CJK first-class)
    if (this.subview?.composing) return;
    this.closeMenu();

    const items = kind === "col" ? this.columnMenuItems(index) : this.rowMenuItems(index);
    const menu = document.createElement("div");
    menu.className = "cm-table-menu";
    for (const item of items) {
      if (item === "-") {
        const divider = document.createElement("div");
        divider.className = "cm-table-menu-divider";
        menu.appendChild(divider);
        continue;
      }
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = item.label;
      btn.addEventListener("mousedown", (e) => e.preventDefault());
      btn.addEventListener("click", () => {
        this.closeMenu();
        item.action();
      });
      menu.appendChild(btn);
    }

    // Attach to view.dom (.cm-editor, overflow:visible) with position:fixed, mirroring the slash menu —
    // this escapes the .cm-scroller overflow box so the menu is never clipped near the scroller's
    // right/bottom edge (#471). Position is set by positionMenu() from the grip's live viewport rect.
    (this.mainView?.dom ?? this.wrap).appendChild(menu);
    this.menu = menu;
    this.menuAnchor = anchor;
    this.positionMenu();

    this.menuCloseListener = (event) => {
      if (!menu.contains(event.target as Node)) this.closeMenu();
    };
    document.addEventListener("mousedown", this.menuCloseListener, true);
    // Keep the menu glued to the grip on scroll/resize, closing it once the grip scrolls out of the
    // editor viewport (#541). capture:true catches the inner .cm-scroller's non-bubbling scroll.
    this.menuReposition = () => this.positionMenu();
    window.addEventListener("scroll", this.menuReposition, { capture: true, passive: true });
    window.addEventListener("resize", this.menuReposition);
  }

  /**
   * Re-place the menu from the anchor grip's live rect, or close it if the grip has been detached or
   * scrolled out of the editor's scroll viewport (#541). Skipped during IME composition so the close
   * branch never fires mid-compose (CJK first-class, #483); it self-corrects on the next event.
   */
  private positionMenu(): void {
    if (!this.menu || !this.menuAnchor || this.subview?.composing) return;
    const anchorRect = this.menuAnchor.getBoundingClientRect();
    const scroller = this.mainView?.scrollDOM.getBoundingClientRect();
    // Close once the grip scrolls out of the scroller viewport — vertically or horizontally
    // (.cm-scroller scrolls sideways for wide tables), else the fixed menu floats over empty chrome.
    if (
      !this.menuAnchor.isConnected ||
      (scroller &&
        (anchorRect.bottom < scroller.top ||
          anchorRect.top > scroller.bottom ||
          anchorRect.right < scroller.left ||
          anchorRect.left > scroller.right))
    ) {
      this.closeMenu();
      return;
    }
    this.menu.style.left = `${anchorRect.left}px`;
    this.menu.style.top = `${anchorRect.bottom + 4}px`;
  }

  private closeMenu(): void {
    if (this.menuCloseListener) {
      document.removeEventListener("mousedown", this.menuCloseListener, true);
      this.menuCloseListener = null;
    }
    if (this.menuReposition) {
      window.removeEventListener("scroll", this.menuReposition, { capture: true });
      window.removeEventListener("resize", this.menuReposition);
      this.menuReposition = null;
    }
    this.menu?.remove();
    this.menu = null;
    this.menuAnchor = null;
  }

  // -------------------------------------------------------------------------
  // Structure operations — manipulate the cell array, then re-serialize the whole table, single dispatch (1 undo step)

  private cellTexts(): string[][] {
    return this.data.rows.map((row) => row.map((cell) => cell.text));
  }

  private replaceTable(rows: string[][], aligns: TableAlign[]): void {
    if (!this.mainView) return;
    clearActiveCell(this.mainView);
    const lines = [
      serializeRow(rows[0] ?? []),
      serializeDelimiter(aligns),
      ...rows.slice(1).map(serializeRow),
    ];
    const tableLines = this.tableLines();
    const from = tableLines[0]?.from ?? this.data.tableFrom;
    const to = tableLines[tableLines.length - 1]?.to ?? from;
    this.mainView.dispatch({
      changes: { from, to, insert: lines.join("\n") },
      userEvent: "input",
    });
  }

  /**
   * Remove the whole table. Backs the "Delete table" menu item and the last-row / last-column
   * case of Delete row/column (which would otherwise no-op, leaving a small table impossible to
   * remove from the menu). Deletes only the table's own lines — the surrounding blank lines stay,
   * matching the block-select Backspace path.
   */
  private deleteTable(): void {
    if (!this.mainView) return;
    clearActiveCell(this.mainView);
    const tableLines = this.tableLines();
    const from = tableLines[0]?.from ?? this.data.tableFrom;
    const to = tableLines[tableLines.length - 1]?.to ?? from;
    this.mainView.focus();
    this.mainView.dispatch({
      changes: { from, to },
      selection: { anchor: from },
      userEvent: "delete",
    });
  }

  private columnMenuItems(col: number): ({ label: string; action: () => void } | "-")[] {
    const insert = (offset: 0 | 1) => () => {
      const rows = this.cellTexts();
      rows.forEach((row) => row.splice(col + offset, 0, ""));
      const aligns = [...this.data.aligns];
      aligns.splice(col + offset, 0, null);
      this.replaceTable(rows, aligns);
    };
    const move = (delta: -1 | 1) => () => {
      const target = col + delta;
      const aligns = [...this.data.aligns];
      if (target < 0 || target >= aligns.length) return;
      const rows = this.cellTexts();
      rows.forEach((row) => {
        const [value] = row.splice(col, 1);
        row.splice(target, 0, value);
      });
      const [align] = aligns.splice(col, 1);
      aligns.splice(target, 0, align);
      this.replaceTable(rows, aligns);
    };
    const setAlign = (align: TableAlign) => () => {
      const aligns = [...this.data.aligns];
      aligns[col] = align;
      this.replaceTable(this.cellTexts(), aligns);
    };
    const remove = () => {
      const rows = this.cellTexts();
      // Deleting the only column means there's no table left — remove it whole rather than no-op.
      if ((rows[0]?.length ?? 0) <= 1) {
        this.deleteTable();
        return;
      }
      rows.forEach((row) => row.splice(col, 1));
      const aligns = [...this.data.aligns];
      aligns.splice(col, 1);
      this.replaceTable(rows, aligns);
    };
    return [
      { label: "Insert column before", action: insert(0) },
      { label: "Insert column after", action: insert(1) },
      { label: "Move left", action: move(-1) },
      { label: "Move right", action: move(1) },
      { label: "Delete column", action: remove },
      { label: "Delete table", action: () => this.deleteTable() },
      "-",
      { label: "Align left", action: setAlign("left") },
      { label: "Align center", action: setAlign("center") },
      { label: "Align right", action: setAlign("right") },
      { label: "No alignment", action: setAlign(null) },
    ];
  }

  private rowMenuItems(row: number): ({ label: string; action: () => void } | "-")[] {
    const cols = this.data.rows[0]?.length ?? 0;
    const insert = (offset: 0 | 1) => () => {
      const rows = this.cellTexts();
      rows.splice(row + offset, 0, Array<string>(cols).fill(""));
      this.replaceTable(rows, this.data.aligns);
    };
    const move = (delta: -1 | 1) => () => {
      const target = row + delta;
      if (target < 1 || target >= this.data.rows.length) return;
      const rows = this.cellTexts();
      const [value] = rows.splice(row, 1);
      rows.splice(target, 0, value);
      this.replaceTable(rows, this.data.aligns);
    };
    const remove = () => {
      const rows = this.cellTexts();
      // Deleting the last body row would strand a header-only table (rows[0] is the header), which has no
      // row grip left to remove it — only the column menu's "Delete table". Remove the whole table instead.
      if (rows.length <= 2) {
        this.deleteTable();
        return;
      }
      rows.splice(row, 1);
      this.replaceTable(rows, this.data.aligns);
    };
    return [
      { label: "Insert row above", action: insert(0) },
      { label: "Insert row below", action: insert(1) },
      { label: "Move up", action: move(-1) },
      { label: "Move down", action: move(1) },
      { label: "Delete row", action: remove },
      { label: "Delete table", action: () => this.deleteTable() },
    ];
  }
}

interface ControllerHost extends HTMLElement {
  __tableController?: TableController;
}

interface GripHost extends HTMLElement {
  __grip?: HTMLElement;
}

// ---------------------------------------------------------------------------
// Widget

class TableWidget extends WidgetType {
  readonly data: TableData;

  constructor(data: TableData) {
    super();
    this.data = data;
  }

  eq(other: TableWidget): boolean {
    return other.data.source === this.data.source;
  }

  get estimatedHeight(): number {
    return this.data.rows.length * 42;
  }

  toDOM(view: EditorView): HTMLElement {
    const wrap = document.createElement("div") as ControllerHost;
    wrap.className = "cm-table-widget";
    wrap.__tableController = new TableController(wrap, this.data, view);
    return wrap;
  }

  updateDOM(dom: HTMLElement): boolean {
    const ctrl = (dom as ControllerHost).__tableController;
    if (!ctrl) return false;
    ctrl.setData(this.data);
    return true;
  }

  destroy(dom: HTMLElement): void {
    (dom as ControllerHost).__tableController?.destroy();
  }

  coordsAt(dom: HTMLElement): { left: number; right: number; top: number; bottom: number } | null {
    const rect = dom.getBoundingClientRect();
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
  }
}

// Block-container node names that can directly or transitively hold a GFM Table node in the
// syntax tree produced by the configured dialect (CommonMark + GFM + our footnotes extension).
// All other node types are leaf/inline nodes — returning false there prunes the descent and
// avoids walking the inline children of every Paragraph/Heading/etc. on every docChanged.
// FootnoteDefinition is single-line only in this implementation (footnotes-syntax.ts), so it
// can never contain a multi-line Table and is intentionally excluded from this set.
const TABLE_CONTAINERS = new Set([
  "Document",
  "Blockquote",
  "BulletList",
  "OrderedList",
  "ListItem",
]);

/** Build the full DecorationSet of table block widgets for the given state. Pure — a test seam. */
export function buildTableDecorations(state: EditorState): DecorationSet {
  const decorations: ReturnType<Decoration["range"]>[] = [];

  syntaxTree(state).iterate({
    enter(node) {
      if (node.name === "Table") {
        const data = parseTable(state, node.from, node.to);
        const to = state.doc.lineAt(node.to).to;
        decorations.push(
          Decoration.replace({ widget: new TableWidget(data), block: true }).range(
            data.tableFrom,
            to,
          ),
        );
        return false;
      }
      if (!TABLE_CONTAINERS.has(node.name)) return false;
    },
  });

  return Decoration.set(decorations, true);
}

const tableField = StateField.define<DecorationSet>({
  create: buildTableDecorations,
  update(deco, tr) {
    if (!tr.docChanged) return deco;
    return buildTableDecorations(tr.state);
  },
  provide: (field) => EditorView.decorations.from(field),
});

// Reflect active-cell state changes as subview mount/unmount on the widget DOM
const activeCellWatcher = ViewPlugin.fromClass(
  class {
    private readonly view: EditorView;

    constructor(view: EditorView) {
      this.view = view;
    }

    update(update: ViewUpdate) {
      const prev = update.startState.field(activeCellField);
      const next = update.state.field(activeCellField);
      if (sameCell(prev, next)) return;
      // Manipulate the DOM outside the CM update cycle
      setTimeout(() => this.sync(prev, next));
    }

    private sync(prev: ActiveCell | null, next: ActiveCell | null) {
      const controllers = new Map<number, TableController>();
      for (const el of this.view.dom.querySelectorAll(".cm-table-widget")) {
        const ctrl = (el as ControllerHost).__tableController;
        if (ctrl) controllers.set(ctrl.data.tableFrom, ctrl);
      }
      if (prev && (!next || prev.tableFrom !== next.tableFrom)) {
        controllers.get(prev.tableFrom)?.unmount();
      }
      if (next) {
        const ctrl = controllers.get(next.tableFrom);
        if (ctrl) {
          ctrl.mount(this.view, next.row, next.col);
        } else {
          // The table is gone (undo, etc.) — clear the active cell
          clearActiveCell(this.view);
        }
      }
    }
  },
);

// Toggle the outline-ring class on the widget when the table block is "selected" (after Escape, or the first
// Backspace before deletion — the selection exactly matches the table range). Block widgets don't show the
// default selection highlight, so paint it ourselves. (DOM manipulation outside the update cycle, like activeCellWatcher)
const tableSelectionRing = ViewPlugin.fromClass(
  class {
    view: EditorView;
    /** tableFrom of the widget currently wearing the ring, or null. Lets the common case — a plain caret
     *  move, whose empty selection can never match a table block range — skip the DOM walk entirely. */
    private applied: number | null = null;
    constructor(view: EditorView) {
      this.view = view;
    }
    /** The table whose block range the selection exactly covers (the only case a ring shows), else null. */
    private selectedFrom(): number | null {
      const sel = this.view.state.selection.main;
      if (sel.empty) return null;
      let found: number | null = null;
      this.view.state.field(tableField).between(sel.from, sel.to, (from, to) => {
        if (from === sel.from && to === sel.to) found = from;
      });
      return found;
    }
    update(u: ViewUpdate) {
      if (!(u.selectionSet || u.docChanged || u.viewportChanged)) return;
      // Nothing is block-selected now and nothing was painted before → no class to add or remove.
      // Skips the setTimeout + querySelectorAll + class toggle on every caret move (an empty selection
      // can't match a table range), paying the DOM cost only when a ring turns on, off, or must repaint
      // after a doc/viewport change re-rendered the ringed widget. (`applied` is the painted invariant:
      // when it's null, no widget carries the class, so there is nothing to clean up.)
      if (this.selectedFrom() === null && this.applied === null) return;
      setTimeout(() => this.sync());
    }
    sync() {
      const view = this.view;
      const selectedFrom = this.selectedFrom();
      this.applied = selectedFrom;
      for (const el of view.dom.querySelectorAll(".cm-table-widget")) {
        const ctrl = (el as ControllerHost).__tableController;
        const on = !!ctrl && selectedFrom !== null && ctrl.data.tableFrom === selectedFrom;
        el.classList.toggle("cm-table-selected", on);
      }
    }
  },
);

// ---------------------------------------------------------------------------
// Boundary behavior

function findTableRange(
  state: EditorState,
  predicate: (from: number, to: number) => boolean,
): { from: number; to: number } | null {
  let found: { from: number; to: number } | null = null;
  state.field(tableField).between(0, state.doc.length, (from, to) => {
    if (predicate(from, to)) {
      found = { from, to };
      return false;
    }
  });
  return found;
}

/**
 * Whether the document ends with a table that has no trailing line — its block widget range ends
 * exactly at doc end. CM6 renders a caret at that end-boundary *before* the widget (there is no
 * following text line for it to attach to), so clicking in the empty space below such a table would
 * visually land the caret above it even though the state position (doc end) is correct. (Pure — a
 * unit-test target.) Edit paths can't reach this state (tableBoundaryGuard guarantees a trailing
 * blank line after every table), but an initial doc passed straight in can — hence the click heal below.
 */
export function docEndsWithBareTable(state: EditorState): boolean {
  return findTableRange(state, (_from, to) => to === state.doc.length) !== null;
}

// Obsidian 1.5.8 policy: backspace right after a table = (1) select the whole table, (2) once more = delete.
// We must intercept atomicRanges' default behavior (one backspace deletes the whole table).
function tableBackspace(view: EditorView): boolean {
  const sel = view.state.selection.main;

  if (!sel.empty) {
    const selected = findTableRange(view.state, (from, to) => sel.from === from && sel.to === to);
    if (selected) {
      view.dispatch({
        changes: { from: selected.from, to: selected.to },
        userEvent: "delete",
      });
      return true;
    }
    return false;
  }

  const line = view.state.doc.lineAt(sel.head);
  const candidate = sel.head === line.from ? line.from - 1 : sel.head;
  const table = findTableRange(view.state, (_from, to) => to === sel.head || to === candidate);
  if (table && (sel.head === table.to || sel.head === table.to + 1)) {
    view.dispatch({ selection: { anchor: table.from, head: table.to } });
    return true;
  }
  return false;
}

/**
 * Table↔paragraph boundary protection: block deletion of the newline in the blank line (separator) after a table,
 * preventing the GFM trap where the following paragraph is absorbed into a table row. Protects both the
 * table↔blank-line and blank-line↔next-line newlines.
 * (Consistent with the edge arrow escape's "guarantee a blank line after the table" — tables are isolated by surrounding blank lines)
 */
export const tableBoundaryGuard: Extension = EditorState.transactionFilter.of((tr) => {
  if (!tr.docChanged) return tr;
  // A pure insertion (fromA === toA for every change) can never delete a boundary newline, so the
  // guard can only ever block deletions/replacements. Skip the whole syntaxTree walk on this path.
  let hasDeletion = false;
  tr.changes.iterChanges((fromA, toA) => {
    if (toA > fromA) hasDeletion = true;
  });
  if (!hasDeletion) return tr;
  const doc = tr.startState.doc;
  // Carry each protected newline together with its owning table range. The absorption risk only occurs when
  // "the table stays but only the boundary newline disappears," so changes that delete the whole table (e.g. select-all delete) are not blocked.
  const guards: { pos: number; tableFrom: number; tableTo: number }[] = [];
  syntaxTree(tr.startState).iterate({
    enter(node) {
      if (node.name !== "Table") return;
      const endLine = doc.lineAt(node.to);
      if (endLine.number >= doc.lines) return false; // table is the last line — no trailing separator
      const next = doc.line(endLine.number + 1);
      if (next.text.trim() === "") {
        const g = { tableFrom: node.from, tableTo: node.to };
        guards.push({ pos: endLine.to, ...g }); // newline between table ↔ blank line
        if (next.number < doc.lines) guards.push({ pos: next.to, ...g }); // newline between blank line ↔ next line
      }
      return false;
    },
  });
  if (guards.length === 0) return tr;
  let blocked = false;
  tr.changes.iterChanges((fromA, toA) => {
    for (const g of guards) {
      // If the change covers the whole table, the table disappears and absorption is impossible → allow.
      const removesWholeTable = fromA <= g.tableFrom && g.tableTo <= toA;
      if (fromA <= g.pos && g.pos < toA && !removesWholeTable) blocked = true;
    }
  });
  return blocked ? [] : tr;
});

/**
 * Enter a table from outside with ↑/↓ (the symmetric counterpart of the edge arrow escape). ↑ on the line right
 * below a table = enter the last row; ↓ on the line right above = enter the header row. If there's no adjacent table, false (default movement).
 * (Without this, atomicRanges would skip the whole table and jump to the other side → it looks like "nothing happened")
 */
export function enterTableFromOutside(view: EditorView, dir: "up" | "down"): boolean {
  const state = view.state;
  const sel = state.selection.main;
  if (!sel.empty) return false;
  const line = state.doc.lineAt(sel.head);
  if (dir === "up") {
    if (line.number <= 1) return false;
    const probe = line.from - 1; // end of the line right above
    const table = findTableRange(state, (from, to) => from <= probe && probe <= to);
    if (!table) return false;
    const firstLine = state.doc.lineAt(table.from);
    const lastLine = state.doc.lineAt(table.to);
    const rowsLen = lastLine.number - firstLine.number; // total lines - 1 delimiter row = data.rows length
    activateCell(view, table.from, rowsLen - 1, 0);
    return true;
  }
  if (line.number >= state.doc.lines) return false;
  const probe = line.to + 1; // start of the line right below
  const table = findTableRange(state, (from, to) => from <= probe && probe <= to);
  if (!table) return false;
  activateCell(view, table.from, 0, 0); // header row
  return true;
}

// ---------------------------------------------------------------------------
// Theme

const tableTheme = EditorView.theme({
  ".cm-table-widget": {
    position: "relative",
    // padding 0: table spacing is kept symmetric by the blank lines above/below alone (block rhythm). Hover handles
    // overlay outside the edges (the blank line below, the right shell margin) so they don't permanently reserve space (ADR-0009 follow-up).
    padding: "0",
  },
  // Table block selected state (Escape/first Backspace) — outline ring matching the editor selection color (radius 0)
  ".cm-table-selected table": {
    outline: "2px solid var(--accent)",
    outlineOffset: "2px",
  },
  ".cm-table-edge": {
    position: "absolute",
    opacity: "0",
    transition: "opacity 0.15s",
    border: "1px dashed var(--silver)",
    backgroundColor: "var(--frost)",
    color: "var(--muted)",
    cursor: "pointer",
    fontSize: "13px",
    lineHeight: "1",
    padding: "0",
  },
  ".cm-table-edge:hover": {
    backgroundColor: "var(--accent-sel)",
    color: "var(--accent)",
    borderColor: "var(--accent)",
  },
  // Overlay over the right edge (placing it outside causes horizontal overflow → triggers scrolling)
  ".cm-table-add-col": {
    top: "0",
    right: "0",
    width: "14px",
    height: "100%",
  },
  // Overlay over the table's bottom edge (inside), mirroring add-col on the right edge — the two share
  // the same 14px band and overlap in a clean 14×14 bottom-right corner, reading as one consistent
  // "grow the grid" affordance instead of a button floating on the blank line below.
  ".cm-table-add-row": {
    left: "0",
    bottom: "0",
    height: "14px",
    width: "100%",
  },
  ".cm-table-widget:hover .cm-table-edge": {
    opacity: "1",
  },
  ".cm-table-widget table": {
    borderCollapse: "collapse",
    width: "100%",
    // Reset margin so a host/global `table { margin }` rule (common in markdown CSS) can't escape the
    // widget wrap: the wrap is `position: relative` with `padding: 0`, so a table margin collapses out
    // below/above the block widget. CM6 measures only the wrap's box for its height map, so that escaped
    // margin desyncs the map from the DOM for everything below the table — vertical arrow nav then lands
    // a line off, on blank separator lines (#520). Block rhythm comes from the blank lines, not margin.
    margin: "0",
  },
  // Precise grid: silver 1px full border (ADR-0009)
  ".cm-table-widget th, .cm-table-widget td": {
    border: "1px solid var(--silver)",
    // Cell padding = em-based (proportional to font). Horizontal 0.7em (column separation), vertical 0.45em (row readability, 0.5em principle). ADR-0009.
    padding: "0.45em 0.7em",
    textAlign: "left",
    verticalAlign: "top",
    position: "relative",
    // A long unbreakable token (URL, 200-char string) would otherwise set the cell's min-content width,
    // widening the whole `width:100%` table past the viewport and forcing editor-wide horizontal scroll.
    // `anywhere` (unlike the body's inherited `break-word`) DOES shrink min-content, so the table holds
    // 100% and the content wraps inside the cell.
    overflowWrap: "anywhere",
    // `anywhere` shrinks min-content for EVERY cell, which would collapse empty/new columns to ~1ch and
    // cram a genuinely wide grid into the viewport instead of letting it scroll. A floor restores both:
    // a many-column grid trips the scroller's default `overflow-x:auto` again, and a freshly inserted
    // column lands at a sensible, roughly-uniform size rather than a razor-thin sliver. (em-based, ADR-0009.)
    minWidth: "5em",
  },
  ".cm-col-grip": {
    position: "absolute",
    top: "2px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "26px",
    height: "7px",
    backgroundColor: "var(--chrome)",
    cursor: "pointer",
    opacity: "0",
    transition: "opacity 0.15s",
    // <button> resets — the grip is a 7px bar, not a default chrome button.
    border: "none",
    padding: "0",
    appearance: "none",
  },
  ".cm-row-grip": {
    position: "absolute",
    left: "2px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "7px",
    height: "22px",
    backgroundColor: "var(--chrome)",
    cursor: "pointer",
    opacity: "0",
    transition: "opacity 0.15s",
    border: "none",
    padding: "0",
    appearance: "none",
  },
  ".cm-table-widget th:hover .cm-col-grip, .cm-table-widget td:hover .cm-row-grip": {
    opacity: "1",
  },
  ".cm-col-grip:hover, .cm-row-grip:hover": {
    backgroundColor: "var(--accent)",
  },
  // Keyboard focus: grips are now buttons, so show the menu opener when tabbed to.
  ".cm-col-grip:focus-visible, .cm-row-grip:focus-visible": {
    opacity: "1",
    outline: "2px solid var(--accent)",
    outlineOffset: "1px",
  },
  // Touch / no-hover devices have no hover to reveal the structure affordances, leaving every insert/
  // move/delete/align op unreachable. Rest them at a faint-but-visible opacity so they're discoverable
  // without permanently crowding the grid (the brutalist "no resting chrome" is relaxed only where hover
  // can't substitute). Desktop hover-reveal is untouched.
  "@media (hover: none)": {
    ".cm-table-edge, .cm-col-grip, .cm-row-grip": {
      opacity: "0.5",
    },
  },
  // Overlay = porcelain hard offset, radius 0
  ".cm-table-menu": {
    position: "fixed",
    zIndex: "10",
    backgroundColor: "var(--paper)",
    border: "1px solid var(--silver)",
    boxShadow: "var(--shadow-overlay)",
    padding: "4px",
    display: "flex",
    flexDirection: "column",
    minWidth: "140px",
  },
  ".cm-table-menu button": {
    border: "none",
    background: "none",
    textAlign: "left",
    padding: "5px 10px",
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: "inherit",
    color: "var(--ink)",
  },
  ".cm-table-menu button:hover": {
    backgroundColor: "var(--frost)",
  },
  ".cm-table-menu-divider": {
    height: "1px",
    backgroundColor: "var(--silver)",
    margin: "4px 6px",
  },
  ".cm-table-widget th": {
    backgroundColor: "var(--surface)",
    fontWeight: "600",
  },
  ".cm-table-widget td.cm-cell-editing, .cm-table-widget th.cm-cell-editing": {
    boxShadow: "inset 0 0 0 2px var(--accent)",
  },
  ".cm-table-widget code": {
    fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, "D2Coding", monospace',
    fontSize: "0.9em",
    backgroundColor: "var(--surface)",
    border: "1px solid var(--platinum)",
    padding: "0.05em 0.3em",
  },
  ".cm-table-widget .cm-table-link": {
    color: "var(--accent)",
  },
});

const cellEditorTheme = EditorView.theme({
  "&": {
    fontSize: "inherit",
    backgroundColor: "transparent",
  },
  ".cm-scroller": {
    fontFamily: "inherit",
    lineHeight: "inherit",
  },
  ".cm-content": {
    padding: "0",
    caretColor: "var(--ink)",
  },
  ".cm-line": {
    padding: "0",
  },
  "&.cm-focused": {
    outline: "none",
  },
});

export function tableWidget(): Extension {
  return [
    tableField,
    activeCellField,
    activeCellWatcher,
    // Skip in one step so the cursor doesn't enter the table's inner text
    EditorView.atomicRanges.of((view) => view.state.field(tableField)),
    Prec.high(
      keymap.of([
        { key: "Backspace", run: tableBackspace },
        // Enter a table from outside with ↑/↓ (symmetric to the escape). No adjacent table → false → default cursor movement.
        { key: "ArrowUp", run: (v) => enterTableFromOutside(v, "up") },
        { key: "ArrowDown", run: (v) => enterTableFromOutside(v, "down") },
      ]),
    ),
    tableBoundaryGuard,
    tableSelectionRing,
    // Clicking outside the widget (in the body) clears the active cell — events inside the widget are ignored by CM, so this doesn't reach them
    EditorView.domEventHandlers({
      mousedown(event, view) {
        clearActiveCell(view);
        // Bare table at EOF (no trailing line): a click in the empty space below it lands the caret at
        // doc end, which CM renders *before* the widget. Heal the doc with a trailing line and place the
        // caret there — mirroring escapeTable("below"). Geometry-gated (only fires below the last block,
        // browser-verified, invariant #4); read-only never mutates (ADR-0018 matrix).
        if (!view.state.readOnly && docEndsWithBareTable(view.state)) {
          const docLen = view.state.doc.length;
          const lastBottom = view.documentTop + view.lineBlockAt(docLen).bottom;
          if (event.clientY > lastBottom) {
            view.focus();
            view.dispatch({
              changes: { from: docLen, insert: "\n" },
              selection: { anchor: docLen + 1 },
              scrollIntoView: true,
              userEvent: "input",
            });
            event.preventDefault();
            return true;
          }
        }
        return false;
      },
    }),
    tableTheme,
  ];
}
