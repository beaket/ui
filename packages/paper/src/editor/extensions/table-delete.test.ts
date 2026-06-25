import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../create-editor";

// A table you wrote must be removable from the grip menu. Before, the menu only had
// "Delete row"/"Delete column" and those no-op'd on the last row/column — so a small table
// could not be deleted from the menu at all (reported: "can't delete the table"). The menu DOM
// + doc mutations are jsdom-testable (no geometry, invariant #4).

let view: EditorView | null = null;

function makeView(doc: string): EditorView {
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  view = new EditorView({
    state: EditorState.create({ doc, extensions: editorExtensions() }),
    parent,
  });
  return view;
}

async function until(cond: () => boolean, timeout = 5000): Promise<void> {
  const start = Date.now();
  while (!cond()) {
    if (Date.now() - start > timeout) throw new Error("until(): timeout");
    await new Promise((r) => setTimeout(r, 20));
  }
}

function openMenu(v: EditorView, gripSelector: string): HTMLElement {
  const grip = v.dom.querySelector(gripSelector) as HTMLElement;
  grip.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  return v.dom.querySelector(".cm-table-menu") as HTMLElement;
}

function clickItem(menu: HTMLElement, label: string): void {
  const btn = [...menu.querySelectorAll("button")].find((b) => b.textContent === label);
  if (!btn) throw new Error(`menu item not found: ${label}`);
  btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

afterEach(() => {
  view?.destroy();
  view = null;
});

const TABLE = ["| A | B |", "| --- | --- |", "| 1 | 2 |"].join("\n");

describe("table deletion from the grip menu", () => {
  it("the column menu offers Delete table and removes the whole table", async () => {
    const v = makeView(`Before.\n\n${TABLE}\n\nAfter.\n`);
    await until(() => v.dom.querySelector(".cm-col-grip") !== null);
    const menu = openMenu(v, ".cm-col-grip");
    await until(() => v.dom.querySelector(".cm-table-menu") !== null);

    expect([...menu.querySelectorAll("button")].map((b) => b.textContent)).toContain(
      "Delete table",
    );
    clickItem(menu, "Delete table");

    expect(v.state.doc.toString()).toBe("Before.\n\n\n\nAfter.\n");
    expect(v.dom.querySelector(".cm-table-widget")).toBeNull();
  });

  it("the row menu offers Delete table and removes the whole table", async () => {
    const v = makeView(`Before.\n\n${TABLE}\n\nAfter.\n`);
    await until(() => v.dom.querySelector(".cm-row-grip") !== null);
    const menu = openMenu(v, ".cm-row-grip");
    await until(() => v.dom.querySelector(".cm-table-menu") !== null);

    expect([...menu.querySelectorAll("button")].map((b) => b.textContent)).toContain(
      "Delete table",
    );
    clickItem(menu, "Delete table");

    expect(v.state.doc.toString()).toBe("Before.\n\n\n\nAfter.\n");
  });

  it("Delete column on the only column removes the table instead of no-op", async () => {
    const v = makeView(`Top.\n\n| Solo |\n| --- |\n| x |\n\nBottom.\n`);
    await until(() => v.dom.querySelector(".cm-col-grip") !== null);
    const menu = openMenu(v, ".cm-col-grip");
    await until(() => v.dom.querySelector(".cm-table-menu") !== null);

    clickItem(menu, "Delete column");

    expect(v.state.doc.toString()).toBe("Top.\n\n\n\nBottom.\n");
    expect(v.dom.querySelector(".cm-table-widget")).toBeNull();
  });

  // T-16: deleting the last *body* row used to leave a header-only table that no row grip could remove
  // (grips attach only to body rows) — only the column menu's "Delete table" or Backspace-select reached it.
  it("Delete row on the last body row removes the table, not a header-only stub", async () => {
    const v = makeView(`Top.\n\n${TABLE}\n\nBottom.\n`);
    await until(() => v.dom.querySelector(".cm-row-grip") !== null);
    const menu = openMenu(v, ".cm-row-grip");
    await until(() => v.dom.querySelector(".cm-table-menu") !== null);

    clickItem(menu, "Delete row");

    expect(v.state.doc.toString()).toBe("Top.\n\n\n\nBottom.\n");
    expect(v.dom.querySelector(".cm-table-widget")).toBeNull();
  });

  // An empty cell would collapse its line box and shrink a blank row to padding-only height; a
  // zero-width space restores a full line so added blank rows match filled rows. (jsdom can't measure
  // height — invariant #4 — but it can confirm the line-box placeholder is present.)
  it("empty cells carry a zero-width space so blank rows keep a line height", async () => {
    const v = makeView(`Top.\n\n| A | B |\n| --- | --- |\n|  |  |\n\nBottom.\n`);
    await until(() => v.dom.querySelector(".cm-table-widget tbody td") !== null);
    const bodyCells = [...v.dom.querySelectorAll(".cm-table-widget tbody td")];
    expect(bodyCells.length).toBeGreaterThan(0);
    // every empty body cell holds the ZWSP line box
    for (const td of bodyCells) {
      expect(td.textContent).toContain("​");
    }
  });

  // Grips are AT-exposed <button>s (not bare <div>s) with an aria-label, so the structure menu appears
  // in the accessibility tree.
  it("grips are accessible buttons with an aria-label", async () => {
    const v = makeView(`Before.\n\n${TABLE}\n\nAfter.\n`);
    await until(() => v.dom.querySelector(".cm-row-grip") !== null);
    const rowGrip = v.dom.querySelector(".cm-row-grip") as HTMLElement;
    const colGrip = v.dom.querySelector(".cm-col-grip") as HTMLElement;

    expect(rowGrip.tagName).toBe("BUTTON");
    expect(colGrip.tagName).toBe("BUTTON");
    expect(rowGrip.getAttribute("aria-label")).toBe("Row menu");
    expect(colGrip.getAttribute("aria-label")).toBe("Column menu");
  });
});
