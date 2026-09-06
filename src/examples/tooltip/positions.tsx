import { Button } from "../../components/button";

import { Tooltip, TooltipProvider } from "../../components/tooltip";

const args = {};

const render = () => (
  <TooltipProvider>
    <div className="flex items-center justify-center gap-8 py-12">
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button variant="outline">Top</Button>
        </Tooltip.Trigger>
        <Tooltip.Content side="top">Tooltip on top</Tooltip.Content>
      </Tooltip>

      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button variant="outline">Bottom</Button>
        </Tooltip.Trigger>
        <Tooltip.Content side="bottom">Tooltip on bottom</Tooltip.Content>
      </Tooltip>

      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button variant="outline">Left</Button>
        </Tooltip.Trigger>
        <Tooltip.Content side="left">Tooltip on left</Tooltip.Content>
      </Tooltip>

      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button variant="outline">Right</Button>
        </Tooltip.Trigger>
        <Tooltip.Content side="right">Tooltip on right</Tooltip.Content>
      </Tooltip>
    </div>
  </TooltipProvider>
);

export default function Example() {
  return render();
}
