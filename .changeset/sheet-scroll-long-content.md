---
"@beaket/ui": patch
---

Make Sheet content scroll when it is taller than the viewport. The panel had no height bound and no overflow rule, so top and bottom sheets grew past the viewport and left and right sheets clipped their content. Children now render in a scrollable `sheet-body` wrapper and the close button stays pinned in the corner. A `className` that sets `grid` or a different `gap` on `sheet-content` now applies to the panel, not to the children's container.
