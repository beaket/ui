import CheckboxAllStates from "../../../src/examples/checkbox/all-states";
import DataTableAllFeatures from "../../../src/examples/data-table/all-features";
import DataTableFullFeatured from "../../../src/examples/data-table/full-featured";
import DialogAllStates from "../../../src/examples/dialog/all-states";
import DialogDefault from "../../../src/examples/dialog/default";
import DropdownMenuAllStates from "../../../src/examples/dropdown-menu/all-states";
import DropdownMenuDefault from "../../../src/examples/dropdown-menu/default";
import InputAffixes from "../../../src/examples/input/affixes";
import InputAllStates from "../../../src/examples/input/all-states";
import InputAllTypes from "../../../src/examples/input/all-types";
import PaginationAllStates from "../../../src/examples/pagination/all-states";
import PaginationDefault from "../../../src/examples/pagination/default";
import RadioAllStates from "../../../src/examples/radio/all-states";
import SelectAllStates from "../../../src/examples/select/all-states";
import SelectDefault from "../../../src/examples/select/default";
import SelectWithGroups from "../../../src/examples/select/with-groups";
import SheetAllStates from "../../../src/examples/sheet/all-states";
import SheetDefault from "../../../src/examples/sheet/default";
import SwitchAllStates from "../../../src/examples/switch/all-states";
import SwitchOnOff from "../../../src/examples/switch/on-off";
import SwitchSizes from "../../../src/examples/switch/sizes";
import TabsAllStates from "../../../src/examples/tabs/all-states";
import TabsDefault from "../../../src/examples/tabs/default";
import TextareaAllStates from "../../../src/examples/textarea/all-states";
import TextareaAutoResize from "../../../src/examples/textarea/auto-resize";
import TextareaDefault from "../../../src/examples/textarea/default";
import TooltipAllStates from "../../../src/examples/tooltip/all-states";
import TooltipDefault from "../../../src/examples/tooltip/default";
import TooltipPositions from "../../../src/examples/tooltip/positions";

interface InteractiveExampleProps {
  componentName: string;
  storyName?: string;
}

// This is deliberately a small, explicit client registry. Keep static examples
// in StoryPreview's server-only boundary, and never import Storybook stories here.
const interactiveExamples = {
  "checkbox/AllStates": CheckboxAllStates,
  "data-table/AllFeatures": DataTableAllFeatures,
  "data-table/FullFeatured": DataTableFullFeatured,
  "dialog/AllStates": DialogAllStates,
  "dialog/Default": DialogDefault,
  "dropdown-menu/AllStates": DropdownMenuAllStates,
  "dropdown-menu/Default": DropdownMenuDefault,
  "input/Affixes": InputAffixes,
  "input/AllStates": InputAllStates,
  "input/AllTypes": InputAllTypes,
  "pagination/AllStates": PaginationAllStates,
  "pagination/Default": PaginationDefault,
  "radio/AllStates": RadioAllStates,
  "select/AllStates": SelectAllStates,
  "select/Default": SelectDefault,
  "select/WithGroups": SelectWithGroups,
  "sheet/AllStates": SheetAllStates,
  "sheet/Default": SheetDefault,
  "switch/AllStates": SwitchAllStates,
  "switch/OnOff": SwitchOnOff,
  "switch/Sizes": SwitchSizes,
  "tabs/AllStates": TabsAllStates,
  "tabs/Default": TabsDefault,
  "textarea/AllStates": TextareaAllStates,
  "textarea/AutoResize": TextareaAutoResize,
  "textarea/Default": TextareaDefault,
  "tooltip/AllStates": TooltipAllStates,
  "tooltip/Default": TooltipDefault,
  "tooltip/Positions": TooltipPositions,
} as const;

export function InteractiveExample({
  componentName,
  storyName = "Default",
}: InteractiveExampleProps) {
  const Example =
    interactiveExamples[`${componentName}/${storyName}` as keyof typeof interactiveExamples];

  return Example ? <Example /> : null;
}
