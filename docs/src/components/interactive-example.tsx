import DialogAllStates from "../../../src/examples/dialog/all-states";
import DialogDefault from "../../../src/examples/dialog/default";
import InputAffixes from "../../../src/examples/input/affixes";

interface InteractiveExampleProps {
  componentName: string;
  storyName?: string;
}

// This is deliberately a small, explicit client registry. Keep static examples
// in StoryPreview's server-only boundary, and never import Storybook stories here.
const interactiveExamples = {
  "dialog/AllStates": DialogAllStates,
  "dialog/Default": DialogDefault,
  "input/Affixes": InputAffixes,
} as const;

export function InteractiveExample({
  componentName,
  storyName = "Default",
}: InteractiveExampleProps) {
  const Example =
    interactiveExamples[`${componentName}/${storyName}` as keyof typeof interactiveExamples];

  return Example ? <Example /> : null;
}
