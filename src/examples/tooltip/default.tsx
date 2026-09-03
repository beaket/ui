import { Button } from "../../components/button";

import { Tooltip, TooltipProvider } from "../../components/tooltip";

const args = {};

const render = () => (
  <Tooltip>
    <Tooltip.Trigger asChild>
      <Button variant="outline">Hover me</Button>
    </Tooltip.Trigger>
    <Tooltip.Content>
      <p>This is a tooltip</p>
    </Tooltip.Content>
  </Tooltip>
);

export default function Example() {
  return <div className="flex h-full w-full items-center justify-center">{render()}</div>;
}
