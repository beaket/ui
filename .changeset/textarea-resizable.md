---
"@beaket/ui": minor
---

Add `resizable` prop to `Textarea` so it can auto-grow with content while also letting the user drag the handle to make it taller. The manually dragged height becomes a floor — content can still push it larger but won't shrink it below the user's chosen size. Closes #332.
