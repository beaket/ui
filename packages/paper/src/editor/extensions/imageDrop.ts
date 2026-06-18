import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

// Image ingest: insert image files that arrive via drop/paste into the document.
// The editor is "mechanism" only — where to store the binary (policy) is decided by the consumer
// (ADR-0007 conduit philosophy). When the consumer returns a URL via onInsertImage(resolver),
// `![alt](url)` is inserted. Without a resolver, the default: render in-session via a blob: URL
// (URL.createObjectURL). This matches the in-memory sandbox nature — it's honest that it breaks on
// refresh. (PLAN-images.md Phase B agreement)

/** Convert a file into a URL (or the src of a markdown fragment) to place into the document. May be async (upload). */
export type ImageResolver = (file: File) => string | Promise<string>;

const blobResolver: ImageResolver = (file) => URL.createObjectURL(file);

/** Strip the extension from the filename and use it as alt (`photo.png` → `photo`). */
export function altFromFilename(name: string): string {
  return name.replace(/\.[^.]+$/, "") || name;
}

/**
 * Insert image markdown as a line-only block and return the insertion end (start of the next line).
 * If mid-line, split upward (lead with `\n`), and always trail a `\n` to isolate the image on its
 * own line. Place the cursor on the line below the image, not the image line — Phase A renders only
 * when the image line has no cursor.
 */
export function insertImageBlock(view: EditorView, pos: number, alt: string, url: string): number {
  const clamped = Math.min(Math.max(pos, 0), view.state.doc.length);
  const line = view.state.doc.lineAt(clamped);
  const lead = clamped > line.from ? "\n" : "";
  const md = `![${alt}](${url})`;
  const insert = lead + md + "\n";
  const after = clamped + insert.length;
  view.dispatch({
    changes: { from: clamped, insert },
    selection: { anchor: after },
    userEvent: "input.drop",
    scrollIntoView: true,
  });
  return after;
}

/**
 * Resolve a file list via the resolver and insert in order (supports dropping multiple). A pure
 * entry point decoupled from events — verifies the resolver→insert→render contract in jsdom without
 * synthesizing a DataTransfer (ADR-0005). If the resolver throws or returns an empty string, only
 * that file is skipped.
 */
export async function handleImageFiles(
  view: EditorView,
  files: File[],
  pos: number,
  resolve: ImageResolver,
): Promise<void> {
  let cursor = pos;
  for (const file of files) {
    let url: string;
    try {
      url = await resolve(file);
    } catch {
      continue;
    }
    if (!url) continue;
    cursor = insertImageBlock(
      view,
      Math.min(cursor, view.state.doc.length),
      altFromFilename(file.name),
      url,
    );
  }
}

function imageFilesOf(list: FileList | null | undefined): File[] {
  return list ? [...list].filter((f) => f.type.startsWith("image/")) : [];
}

function draggingFiles(event: DragEvent): boolean {
  return !!event.dataTransfer && [...event.dataTransfer.types].includes("Files");
}

/**
 * Snap the drop coordinate to the nearest line boundary — aligns "the visible insertion line = the
 * actual insertion position" so the user doesn't miss where it goes. Upper half of a line → above
 * that line; lower half → below it.
 *
 * The indicator Y uses the **line block box** (lineBlockAt) boundary, not the glyph (coordsAtPos) —
 * with the glyph, on lines with large padding such as headings, the line crosses the characters
 * (measured bug). The block box includes padding, so the boundary falls in the gap between blocks.
 * Convert the block's doc coordinate to a client coordinate via documentTop.
 * (Coordinate-dependent — jsdom coordinates are 0 so it can't be unit-tested; verified in the browser.)
 */
function dropTarget(
  view: EditorView,
  x: number,
  y: number,
): { pos: number; clientY: number } | null {
  const posAt = view.posAtCoords({ x, y });
  const line = view.state.doc.lineAt(posAt ?? view.state.doc.length);
  const block = view.lineBlockAt(line.from);
  const topClient = view.documentTop + block.top;
  const bottomClient = view.documentTop + block.bottom;
  // Empty area below the body text → end of document (boundary below the last line)
  if (posAt == null) return { pos: view.state.doc.length, clientY: bottomClient };
  const aboveHalf = y < (topClient + bottomClient) / 2;
  return aboveHalf
    ? { pos: line.from, clientY: topClient }
    : { pos: line.to, clientY: bottomClient };
}

export function imageDrop(resolve: ImageResolver = blobResolver): Extension {
  // Drag indicator (insertion line) — pure overlay DOM rather than editor state, so it is independent
  // of decoration recomputation/the composing guard (lightweight). position:fixed, so it uses
  // coordsAtPos's client coordinates directly (no scroll correction needed).
  let indicator: HTMLElement | null = null;
  const showIndicator = (view: EditorView, clientY: number) => {
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.className = "cm-image-drop-indicator";
      view.dom.appendChild(indicator);
    }
    const content = view.contentDOM.getBoundingClientRect();
    indicator.style.top = `${clientY - 1}px`;
    indicator.style.left = `${content.left}px`;
    indicator.style.width = `${content.width}px`;
  };
  const hideIndicator = () => {
    indicator?.remove();
    indicator = null;
  };

  return [
    EditorView.domEventHandlers({
      paste(event, view) {
        if (view.composing) return false;
        // Capture the File references synchronously before await — after await, event.clipboardData may be empty.
        const files = imageFilesOf(event.clipboardData?.files);
        if (files.length === 0) return false;
        event.preventDefault();
        const pos = view.state.selection.main.from;
        void handleImageFiles(view, files, pos, resolve);
        return true;
      },
      // For an external file drop to fire, dragover's default behavior (open/navigate to the file) must be prevented.
      // At the same time, update the insertion line to the drop position.
      dragover(event, view) {
        if (!draggingFiles(event)) return false;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
        const t = dropTarget(view, event.clientX, event.clientY);
        if (t) showIndicator(view, t.clientY);
        return false;
      },
      // Hide only when fully leaving the editor (dragover soon restores the flicker from entering over a child).
      dragleave(event, view) {
        const to = event.relatedTarget as Node | null;
        if (to && view.dom.contains(to)) return false;
        hideIndicator();
        return false;
      },
      drop(event, view) {
        hideIndicator();
        if (view.composing) return false;
        const files = imageFilesOf(event.dataTransfer?.files);
        if (files.length === 0) return false;
        event.preventDefault();
        // Insert at the same snap position as the visible insertion line (where you see = where it goes).
        const t = dropTarget(view, event.clientX, event.clientY);
        const pos = t ? t.pos : view.state.selection.main.from;
        void handleImageFiles(view, files, pos, resolve);
        return true;
      },
    }),
    EditorView.theme({
      // Insertion line — accent (signal-blue) 2px, radius 0 (ADR-0009). Appears only briefly during drag.
      ".cm-image-drop-indicator": {
        position: "fixed",
        height: "2px",
        backgroundColor: "var(--accent)",
        pointerEvents: "none",
        zIndex: "20",
      },
    }),
  ];
}
