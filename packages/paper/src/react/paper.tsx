import type { EditorView } from "@codemirror/view";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { AnchorStatus } from "../editor/anchor";
import type { EditorOptions } from "../editor/create-editor";
import { createEditor } from "../editor/create-editor";
import type { HighlightController, HighlightInput } from "../editor/extensions/highlight-layer";
import { createHighlightController } from "../editor/extensions/highlight-layer";
import { setReadOnly } from "../editor/extensions/read-only";
import type { ColorScheme } from "../editor/theme";
import { setColorScheme } from "../editor/theme";
import type { ValueController } from "../editor/value-controller";
import { createValueController } from "../editor/value-controller";

// Thin React wrapper (ADR-0013 decisions 1, 2, 3). All logic lives in the core
// (createEditor/changeNotifier/valueController) and here we only do wiring — so the core is verified
// under jsdom without React test dependencies (ADR-0005).
// Uncontrolled: defaultValue is only the initial value; full replacement is commanded via ref.setValue().

/** Curated handle exposed via ref + getView() escape hatch (unsafe). ADR-0013 decision 3. */
export interface PaperHandle {
  getValue(): string;
  /** Replace the whole document. While an IME composition is active, deferred and applied on settle (ADR-0004). */
  setValue(md: string): void;
  focus(): void;
  /** Selection range (source coordinates). null on empty selection. The anchor input surface of ADR-0014. */
  getSelection(): { from: number; to: number; text: string } | null;
  /**
   * Raw CM6 EditorView — no cross-version guarantees (unsafe). Power-user escape hatch.
   * Returns `undefined` until the view has mounted (the effect that creates it runs after
   * commit), so a ref callback can guard with `const v = h.getView(); if (!v) return;` —
   * matching `getSelection()` (null) and `getValue()` ("") rather than throwing.
   */
  getView(): EditorView | undefined;
}

export interface PaperProps {
  /** Initial document body. Not a live prop (uncontrolled) — changes do not trigger recreation. */
  defaultValue?: string;
  /** Full markdown on every user edit. Once after IME settle; setValue produces no echo. */
  onChange?: (value: string) => void;
  /** Highlight list (ADR-0014). Live prop — re-resolved immediately on change (deferred during IME composition). */
  highlights?: HighlightInput[];
  /** Active (hover/selected) highlight id. Live prop — declarative visual sync (deferred during IME composition). */
  activeHighlightId?: string | null;
  /** Highlight re-resolution status map (mainly on load/delete). */
  onHighlightStatusChange?: (statuses: Map<string, AnchorStatus>) => void;
  /** Highlight click report (ADR-0014 decision 6). */
  onHighlightClick?: EditorOptions["onHighlightClick"];
  /** Selection report (ADR-0014). sel = { text, anchor, rect }, null on empty selection. */
  onSelect?: EditorOptions["onSelect"];
  onInsertImage?: EditorOptions["onInsertImage"];
  slashItems?: EditorOptions["slashItems"];
  /** Declarative autocomplete triggers — `@` mentions, `[[` wikilinks (ADR-0016). Fixed at creation (not live). */
  triggers?: EditorOptions["triggers"];
  /** Atomic token rendering — render `pattern`-matched markdown as chips (ADR-0017). Fixed at creation (not live). */
  tokens?: EditorOptions["tokens"];
  /** Consumer-delegated code-block renderers — e.g. a `mermaid` fence as a diagram (ADR-0023). Fixed at creation (not live). */
  codeBlockRenderers?: EditorOptions["codeBlockRenderers"];
  /** Light/dark scheme. "system" (default) follows the OS; "light"/"dark" force it. Live prop — flips without recreation. */
  colorScheme?: ColorScheme;
  /** Hint shown on an empty document (ADR-0018). Fixed at creation (not live). */
  placeholder?: EditorOptions["placeholder"];
  /** Read-only mode (ADR-0018). Live prop — flips via a compartment reconfigure (no recreation). */
  readOnly?: boolean;
  /** Fixed editor height (CSS length) with internal scroll (ADR-0018). Fixed at creation (not live). */
  height?: EditorOptions["height"];
  /** Minimum editable height (CSS length) — grows with content, no click-target dead zone (ADR-0018). Fixed at creation (not live). */
  minHeight?: EditorOptions["minHeight"];
  className?: string;
}

export const Paper = forwardRef<PaperHandle, PaperProps>(function Paper(
  {
    defaultValue,
    onChange,
    highlights,
    activeHighlightId,
    onHighlightStatusChange,
    onHighlightClick,
    onSelect,
    onInsertImage,
    slashItems,
    triggers,
    tokens,
    codeBlockRenderers,
    colorScheme,
    placeholder,
    readOnly,
    height,
    minHeight,
    className,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const controllerRef = useRef<ValueController | null>(null);
  const highlightRef = useRef<HighlightController | null>(null);

  // Hold callbacks in refs to call the latest function without recreating the editor (safe even if the parent passes a new function every render).
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onStatusRef = useRef(onHighlightStatusChange);
  onStatusRef.current = onHighlightStatusChange;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onClickRef = useRef(onHighlightClick);
  onClickRef.current = onHighlightClick;

  useEffect(() => {
    if (!containerRef.current) return;
    const view = createEditor(containerRef.current, {
      doc: defaultValue,
      onChange: (v) => onChangeRef.current?.(v),
      onHighlightStatusChange: (m) => onStatusRef.current?.(m),
      onHighlightClick: (id) => onClickRef.current?.(id),
      onSelect: (sel) => onSelectRef.current?.(sel),
      onInsertImage,
      slashItems,
      triggers,
      tokens,
      codeBlockRenderers,
      colorScheme,
      placeholder,
      readOnly,
      height,
      minHeight,
    });
    viewRef.current = view;
    controllerRef.current = createValueController(view);
    highlightRef.current = createHighlightController(view);
    return () => {
      controllerRef.current?.dispose();
      controllerRef.current = null;
      highlightRef.current?.dispose();
      highlightRef.current = null;
      view.destroy();
      viewRef.current = null;
    };
    // Uncontrolled: do not recreate on defaultValue change (full replacement is ref.setValue).
    // Live reconfiguration of onInsertImage/slashItems (Compartment) is follow-up scope — fixed at creation time for now.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // highlights is a live prop — re-resolved IME-safely on change (the controller defers during composition).
  useEffect(() => {
    highlightRef.current?.setHighlights(highlights ?? []);
  }, [highlights]);

  // activeHighlightId is also a live prop — declarative visual sync (deferred during composition).
  useEffect(() => {
    highlightRef.current?.setActiveHighlight(activeHighlightId ?? null);
  }, [activeHighlightId]);

  // colorScheme is a live prop — flipped via a compartment reconfigure (no recreation, document kept).
  useEffect(() => {
    if (viewRef.current) setColorScheme(viewRef.current, colorScheme ?? "system");
  }, [colorScheme]);

  // readOnly is a live prop — flipped via a compartment reconfigure (no recreation, document kept).
  useEffect(() => {
    if (viewRef.current) setReadOnly(viewRef.current, readOnly ?? false);
  }, [readOnly]);

  useImperativeHandle(
    ref,
    (): PaperHandle => ({
      getValue: () => viewRef.current?.state.doc.toString() ?? "",
      setValue: (md) => controllerRef.current?.setValue(md),
      focus: () => viewRef.current?.focus(),
      getSelection: () => {
        const view = viewRef.current;
        if (!view) return null;
        const { from, to } = view.state.selection.main;
        if (from === to) return null;
        return { from, to, text: view.state.sliceDoc(from, to) };
      },
      getView: () => viewRef.current ?? undefined,
    }),
    [],
  );

  return <div className={className} ref={containerRef} />;
});
