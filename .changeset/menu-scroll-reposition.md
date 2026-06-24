---
"@beaket/paper": patch
---

fix: keep floating menus glued to their anchor on scroll, and close when the anchor scrolls out of view (#541)

The slash (`/`) menu, the `@`/`[[` trigger menus, and the table grip menu were positioned once when opened (from `coordsAtPos` / `getBoundingClientRect`) with `position: fixed` and no scroll listener — a side effect of #471. Scrolling the editor left them pinned to the viewport, floating over unrelated content while their anchor moved away.

They now re-place from the live anchor coordinates on scroll/resize (capture-phase listener so the inner `.cm-scroller` is caught), and close once the anchor scrolls out of the editor's scroll viewport. Repositioning is skipped during IME composition so the close path never fires mid-compose.
