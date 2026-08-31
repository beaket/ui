import type { PublicExample } from "./contract";
import manifest from "./manifest.json";

import ButtonAllSizes from "./button/all-sizes";
import buttonAllSizesSource from "./button/all-sizes.tsx?raw";
import ButtonAllStates from "./button/all-states";
import buttonAllStatesSource from "./button/all-states.tsx?raw";
import ButtonAllVariants from "./button/all-variants";
import buttonAllVariantsSource from "./button/all-variants.tsx?raw";
import DialogAllStates from "./dialog/all-states";
import dialogAllStatesSource from "./dialog/all-states.tsx?raw";
import DialogDefault from "./dialog/default";
import dialogDefaultSource from "./dialog/default.tsx?raw";
import InputAffixes from "./input/affixes";
import inputAffixesSource from "./input/affixes.tsx?raw";
import InputAllStates from "./input/all-states";
import inputAllStatesSource from "./input/all-states.tsx?raw";
import InputAllTypes from "./input/all-types";
import inputAllTypesSource from "./input/all-types.tsx?raw";

const modules = {
  "button/all-variants.tsx": [ButtonAllVariants, buttonAllVariantsSource],
  "button/all-sizes.tsx": [ButtonAllSizes, buttonAllSizesSource],
  "button/all-states.tsx": [ButtonAllStates, buttonAllStatesSource],
  "input/all-states.tsx": [InputAllStates, inputAllStatesSource],
  "input/all-types.tsx": [InputAllTypes, inputAllTypesSource],
  "input/affixes.tsx": [InputAffixes, inputAffixesSource],
  "dialog/default.tsx": [DialogDefault, dialogDefaultSource],
  "dialog/all-states.tsx": [DialogAllStates, dialogAllStatesSource],
} as const;

const definitions = manifest.examples as Omit<PublicExample, "Component" | "source">[];

export const publicExamples: PublicExample[] = definitions.map((example) => {
  const [Component, source] = modules[example.module as keyof typeof modules];
  return { ...example, Component, source };
});

export function getPublicExample(component: string, story: string) {
  return publicExamples.find(
    (example) => example.component === component && example.story === story,
  );
}
