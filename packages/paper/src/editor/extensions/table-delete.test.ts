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

    expect([...menu.querySelectorAll("button")].map((b) => b.textContent)).toContain("Delete table");
    clickItem(menu, "Delete table");

    expect(v.state.doc.toString()).toBe("Before.\n\n\n\nAfter.\n");
    expect(v.dom.querySelector(".cm-table-widget")).toBeNull();
  });

  it("the row menu offers Delete table and removes the whole table", async () => {
    const v = makeView(`Before.\n\n${TABLE}\n\nAfter.\n`);
    await until(() => v.dom.querySelector(".cm-row-grip") !== null);
    const menu = openMenu(v, ".cm-row-grip");
    await until(() => v.dom.querySelector(".cm-table-menu") !== null);

    expect([...menu.querySelectorAll("button")].map((b) => b.textContent)).toContain("Delete table");
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
});
