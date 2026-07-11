import { EditorSelection, EditorState } from "@codemirror/state";
import { describe, expect, it } from "vitest";
import { selectionTouches } from "./selection-utils";

// selectionTouches drives the Live-Preview reveal-on-cursor contract shared by inline-syntax-hiding,
// code-block-render, and footnote-render: a range the selection touches stays raw, an off-cursor range
// renders. "Touches" is inclusive at both ends, so a collapsed caret parked exactly on a boundary reveals
// the syntax rather than leaving a widget the caret is wedged against. These cases pin that contract.

const DOC = "hello world"; // target range under test is [FROM, TO]
const FROM = 3;
const TO = 6;

function caretAt(pos: number): EditorState {
  return EditorState.create({ doc: DOC, selection: EditorSelection.single(pos) });
}

describe("selectionTouches", () => {
  it("collapsed caret exactly at `from` touches (inclusive boundary)", () => {
    expect(selectionTouches(caretAt(FROM), FROM, TO)).toBe(true);
  });

  it("collapsed caret exactly at `to` touches (inclusive boundary)", () => {
    expect(selectionTouches(caretAt(TO), FROM, TO)).toBe(true);
  });

  it("collapsed caret strictly inside touches", () => {
    expect(selectionTouches(caretAt(FROM + 1), FROM, TO)).toBe(true);
  });

  it("collapsed caret strictly outside does not touch (either side)", () => {
    expect(selectionTouches(caretAt(FROM - 2), FROM, TO)).toBe(false);
    expect(selectionTouches(caretAt(TO + 2), FROM, TO)).toBe(false);
  });

  it("a non-collapsed selection overlapping the range touches", () => {
    const state = EditorState.create({ doc: DOC, selection: EditorSelection.single(0, FROM + 1) });
    expect(selectionTouches(state, FROM, TO)).toBe(true);
  });
});
