import { StateEffect } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

// The keystroke-latency probe for the perf harness (#482), installed on a mounted view from outside
// through the public StateEffect.appendConfig — the shipped editor carries no perf code.
//
// Per keystroke it records three times, all on the page's performance.now() timebase:
//   update — keydown event timestamp → the end of the CM update that applied the edit (state, DOM
//            write, and every decoration recompute run synchronously inside it).
//   paint  — keydown → the first task after the next rendered frame (CM's measure pass, style,
//            layout, paint). Includes the idle wait for the next vsync, so it is frame-quantized.
//   work   — update plus that frame's own render time (frame start → after paint): main-thread
//            busy time with the vsync wait removed, the number a "fits in one frame" budget is about.

export interface Sample {
  update: number;
  paint: number;
  work: number;
}

export interface Probe {
  samples: Sample[];
  /** Resolve once `count` samples have been recorded. */
  waitFor(count: number): Promise<void>;
}

export function installProbe(view: EditorView): Probe {
  const samples: Sample[] = [];
  let waiter: { count: number; resolve: () => void } | null = null;
  let start: number | null = null;

  view.contentDOM.ownerDocument.addEventListener(
    "keydown",
    (e) => {
      start = e.timeStamp;
    },
    true,
  );

  const listener = EditorView.updateListener.of((update) => {
    if (!update.docChanged || start === null) return;
    const t0 = start;
    start = null;
    const updated = performance.now();
    requestAnimationFrame((frame) => {
      // A message posted from rAF is delivered after the frame's rendering steps have run.
      const channel = new MessageChannel();
      channel.port1.onmessage = () => {
        const painted = performance.now();
        samples.push({
          update: updated - t0,
          paint: painted - t0,
          work: updated - t0 + (painted - Math.max(frame, updated)),
        });
        if (waiter && samples.length >= waiter.count) {
          waiter.resolve();
          waiter = null;
        }
      };
      channel.port2.postMessage(null);
    });
  });
  view.dispatch({ effects: StateEffect.appendConfig.of(listener) });

  return {
    samples,
    waitFor: (count) =>
      samples.length >= count
        ? Promise.resolve()
        : new Promise((resolve) => {
            waiter = { count, resolve };
          }),
  };
}
