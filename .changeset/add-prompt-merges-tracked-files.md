---
"@beaket/ui": patch
---

Fix `add` discarding local edits when the overwrite prompt is answered yes. The baseline fetch that feeds the three-way merge was gated on `--overwrite` instead of on whether the file is tracked in `beaket.ui.json`, so the prompt path did a plain overwrite. Tracked files are now merged on both paths.
