---
"@beaket/ui": minor
---

Add overwrite prompt for existing files in CLI add command

- Add `--overwrite` (`-o`) flag to force overwrite without prompting
- Prompt user for confirmation when a file already exists
- Show skipped files with instructions to use `--overwrite`
- Improve progress display with checkmarks
