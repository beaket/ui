import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";

const changelog = defineCollection({
  loader: glob({
    pattern: "CHANGELOG.md",
    base: "../packages/cli",
  }),
});

export const collections = { changelog };
