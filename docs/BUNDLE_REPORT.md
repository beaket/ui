# Docs bundle boundary report

Run `pnpm docs:bundle:report` to build the production docs and print every emitted public
JavaScript chunk with raw and gzip bytes. The command fails if the public output contains
Storybook runtime/story files or grows past the 400,000-byte raw-JavaScript boundary.

| Build       |                          Raw public JS | Notes                                                                                                        |
| ----------- | -------------------------------------: | ------------------------------------------------------------------------------------------------------------ |
| Before #788 |                        1,359,308 bytes | Storybook story chunks and `storybook/test` were emitted by the legacy preview glob.                         |
| After #788  | 386,872 bytes raw / 103,642 bytes gzip | Static previews are SSR-only; the only React island registry contains the three interactive public examples. |

Chunk hashes intentionally change between builds, so the command output, rather than a copied
file-name list, is the reproducible emitted-chunk report. The check runs in the Docs deployment
workflow before the site artifact is uploaded.
