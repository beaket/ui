---
"@beaket/ui": minor
---

feat(pagination): one instrument — fused strip with a single accent edge

Pagination adopts the action shadow, but as one machine rather than a row of
buttons: cells fuse into a single strip (shared borders, no gaps) carrying one
static 1px accent edge.

- Strip: new `pagination-strip` slot wraps all cells with `shadow-offset-action`
- Press: the chassis stays still — the pressed key's label travels 1px inside
  the frame while the cell darkens (`active:bg-bg-active`)
- Current page: an ink-solid cell whose label stays held down 1px — the key
  locked at its landing point
- Ellipsis becomes a bordered blank key; focus outline lifts above neighboring
  cell borders
