---
"@beaket/ui": patch
---

Rebalance the Solace light neutral ramp into a monotonic OKLab progression while preserving its warm-paper and cool-ink endpoints.

The source hex values produce these OKLab lightness values and adjacent differences (rounded to three decimals):

| Tone | Before L | Before ΔL | After L | After ΔL |
| ---- | -------: | --------: | ------: | -------: |
| 0    |    0.963 |         — |   0.963 |        — |
| 1    |    0.966 |    -0.003 |   0.920 |    0.043 |
| 2    |    0.934 |     0.032 |   0.820 |    0.100 |
| 3    |    0.838 |     0.096 |   0.730 |    0.090 |
| 4    |    0.639 |     0.199 |   0.639 |    0.091 |
| 5    |    0.616 |     0.023 |   0.585 |    0.054 |
| 6    |    0.540 |     0.076 |   0.525 |    0.060 |
| 7    |    0.455 |     0.085 |   0.455 |    0.070 |
| 8    |    0.386 |     0.070 |   0.390 |    0.066 |
| 9    |    0.328 |     0.058 |   0.325 |    0.064 |
| 10   |    0.252 |     0.075 |   0.245 |    0.080 |
| 11   |    0.128 |     0.124 |   0.128 |    0.117 |

The automated palette contract permits 0.04–0.12 OKLab L across the full ramp and tightens the functional `tone-3` through `tone-7` steps to 0.05–0.10. This keeps the paper and deepest-ink ends flexible while preventing functional roles from collapsing or jumping abruptly.
