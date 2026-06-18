// Minimal polyfills to run CodeMirror 6 under jsdom.
// CM uses Range/ResizeObserver for layout measurement, but the decoration/transaction logic
// works correctly even when measured values are 0 — and that logic is exactly what we want to verify.

const zeroRect = {
  x: 0,
  y: 0,
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  width: 0,
  height: 0,
  toJSON() {
    return this;
  },
} as DOMRect;

Range.prototype.getBoundingClientRect = () => zeroRect;
Range.prototype.getClientRects = () =>
  ({
    length: 0,
    item: () => null,
    [Symbol.iterator]: Array.prototype[Symbol.iterator],
  }) as unknown as DOMRectList;

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

if (typeof globalThis.CompositionEvent === "undefined") {
  globalThis.CompositionEvent = class extends Event {
    readonly data: string;
    constructor(type: string, init?: CompositionEventInit) {
      super(type, init);
      this.data = init?.data ?? "";
    }
  } as unknown as typeof CompositionEvent;
}
