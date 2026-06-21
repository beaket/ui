---
"@beaket/paper": patch
---

Clarify in the README that `getView()` is the deliberate raw escape hatch with no cross-version guarantee, and that there is intentionally no blessed `extensions` injection slot. This records the consumer-facing outcome of the extensibility decision (#497, ADR-0015): a raw `Extension[]`/`keymap` slot on `EditorOptions` is declined because it would leak CodeMirror into the 1.0-frozen public surface and let a consumer break the core invariants (the composing guard, the permanently-hidden table structure). Concrete extensibility needs route to the declarative APIs instead; raw access stays on the unsafe `getView()` handle.
