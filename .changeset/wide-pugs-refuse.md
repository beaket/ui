---
"@beaket/ui": minor
---

`ref` now typechecks on Badge, Blockquote, Button, `Dialog.Header`/`.Footer` and `Sheet.Header`/`.Footer`

These seven prop declarations extended `React.HTMLAttributes` / `React.ButtonHTMLAttributes`, which do not carry `ref`. React 19 moved `ref` into intrinsic element props, so `React.ComponentProps<"button">` does. Passing a `ref` to any of the seven failed to typecheck for no reason anyone intended; they now extend `React.ComponentProps<…>` like the rest of the registry.

Widened type only — nothing that compiled before stops compiling.
