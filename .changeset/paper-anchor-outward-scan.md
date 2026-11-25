---
"@beaket/paper": patch
---

Fuzzy anchor resolution no longer freezes the tab on a long, lightly edited quote. `findApproximate` scanned candidate start positions from the left edge of the search radius, so the true match near the offset hint was found late and `bestDist` stayed loose for most of the scan, leaving the Levenshtein ceiling early-exit idle. It now visits starts closest to the hint first, which tightens `bestDist` immediately (a 1000-character quote went from about 3 s to well under 250 ms). Results are unchanged except that a tie now resolves to the candidate nearest the hint instead of the leftmost.
