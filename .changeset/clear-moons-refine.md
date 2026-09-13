---
"@beaket/ui": patch
---

Polish sweep across the component set: one motion grammar, one focus grammar, and the removal of styling that never reached the browser.

**Classes that produced no CSS.** `tw-animate-css` was never a dependency of this repo, so every `animate-in` / `fade-*` / `zoom-*` / `slide-*` class copied into Dialog, Sheet, Tooltip and DropdownMenu emitted nothing — overlays have always appeared instantly, which is what DESIGN.md already documents ("no entrance choreography for ordinary controls"). Those classes are gone, along with Sheet's now-empty `sideAnimations` map. Consumers copying these files into a project that _does_ have `tw-animate-css` installed lose an accidental fade.

**Radix height caps, written in Tailwind 3 syntax.** `max-h-radix-dropdown-menu-content-available-height` and `max-h-radix-select-content-available-height` are not Tailwind 4 class names and generated no rule, so a long menu or select panel could run off the bottom of the viewport instead of scrolling. Both now use the v4 arbitrary-property form and measure correctly (`max-height: 792px` in a 885px viewport). `DropdownMenu.SubContent` gains the same cap. The two `origin-radix-*` classes were equally dead and, with no entrance animation to originate, are removed rather than repaired.

**`Select.Trigger`'s `size` prop did nothing.** It set `data-size` and no rule consumed it; the trigger also carried no height at all, so it rendered 36.57px beside a 36px Input. `size` now selects from the documented height ladder — `h-9` (36px) beside Input and a default Button, `h-8` (32px) beside a small one.

**`Sheet`'s gap never applied.** `gap-4` sat on a `display: block` element, which is why `Sheet.Header` carried an `mb-4` to compensate while nothing else in the panel was spaced. Sheet now stacks with `flex flex-col gap-4` at 24px padding, and the header's compensating margin is removed — measured parity with Dialog: 24px padding, 16px between sections, 32px before the footer. (Dialog's own `grid` is deliberately not copied here: a left/right sheet is `h-full`, and a grid taller than its content stretches every row — it put the header, body and footer in thirds of the viewport.)

**One motion grammar.** Button's transition list omitted `background-color`, so its hover fill snapped while its edge faded; Switch's thumb, Pagination's cells and the Dialog/Sheet close buttons ran at Tailwind's default 150ms, and Slider's thumb had no transition at all. All are 100ms now, leaving Progress as the system's single 150ms — which is what DESIGN.md's Motion section claims.

**One focus grammar.** Table's scroll region was the only focus outline in the system without `outline-offset-2`.

**Consistency.** Navigation and Tabs now share body weight (DESIGN.md calls them the identical grammar; Tabs was 500 and Navigation 400). `Select.Label` and `DropdownMenu.Label` are one role and now one treatment — Label type, 11px/500 in muted ink. The menu leading rule is named once in `dropdown-menu.tsx` instead of hand-written in five places. `DropdownMenu.Shortcut` no longer recolors to accent on a highlighted row, where the label is meant to stay ink. Alert hoists what all five variants share into its base. Pagination's ellipsis is a real ellipsis, and icons use `size-4` throughout.
