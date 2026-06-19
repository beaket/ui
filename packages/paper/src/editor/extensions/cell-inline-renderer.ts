import type { SyntaxNode } from "@lezer/common";
import { markdownParser } from "./markdown";

// Inline markdown rendering for non-editing cells — parse cell text into mark-free DOM.
// Backslash escapes like `\|` are expanded literally (ADR-0002: hide structure syntax).

const SKIP_NODES = new Set(["EmphasisMark", "CodeMark", "StrikethroughMark", "LinkMark", "URL"]);

const WRAPPER_TAGS: Record<string, string> = {
  StrongEmphasis: "strong",
  Emphasis: "em",
  Strikethrough: "s",
  InlineCode: "code",
};

function renderNode(node: SyntaxNode, text: string, parent: Node): void {
  let pos = node.from;
  for (let child = node.firstChild; child; child = child.nextSibling) {
    if (child.from > pos) parent.appendChild(document.createTextNode(text.slice(pos, child.from)));
    pos = child.to;

    if (SKIP_NODES.has(child.name)) continue;
    if (child.name === "Escape") {
      parent.appendChild(document.createTextNode(text.slice(child.from + 1, child.to)));
      continue;
    }
    if (child.name === "HTMLTag") {
      // Line breaks within a cell are represented as <br> (Shift+Enter)
      if (/^<br\s*\/?>$/i.test(text.slice(child.from, child.to))) {
        parent.appendChild(document.createElement("br"));
      }
      continue;
    }
    const tag = WRAPPER_TAGS[child.name];
    if (tag) {
      const el = document.createElement(tag);
      renderNode(child, text, el);
      parent.appendChild(el);
    } else if (child.name === "Link") {
      const el = document.createElement("span");
      el.className = "cm-table-link";
      renderNode(child, text, el);
      parent.appendChild(el);
    } else {
      // Transparent nodes like Paragraph just unwrap their children
      renderNode(child, text, parent);
    }
  }
  if (pos < node.to) parent.appendChild(document.createTextNode(text.slice(pos, node.to)));
}

export function renderCellInline(el: HTMLElement, text: string): void {
  el.textContent = "";
  if (!text) return;
  const tree = markdownParser.parse(text);
  renderNode(tree.topNode, text, el);
}
