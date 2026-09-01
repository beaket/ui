import { Button } from "../../components/button";

import { Tooltip, TooltipProvider } from "../../components/tooltip";

export default () => (
  <TooltipProvider>
    <div className="flex flex-col gap-8 py-12">
      <div className="flex items-center gap-4">
        <span className="text-fg-muted w-24 text-sm">Default</span>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button variant="outline">Hover</Button>
          </Tooltip.Trigger>
          <Tooltip.Content>Default tooltip</Tooltip.Content>
        </Tooltip>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-fg-muted w-24 text-sm">On icon</span>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <button
              className="border-border text-fg-muted hover:text-fg focus-visible:outline-border-focus inline-flex size-8 items-center justify-center border focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label="Help"
            >
              ?
            </button>
          </Tooltip.Trigger>
          <Tooltip.Content>Help information</Tooltip.Content>
        </Tooltip>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-fg-muted w-24 text-sm">Long text</span>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button variant="outline">Long tooltip</Button>
          </Tooltip.Trigger>
          <Tooltip.Content className="max-w-xs">
            This is a longer tooltip that demonstrates how the component handles more content.
          </Tooltip.Content>
        </Tooltip>
      </div>
    </div>
  </TooltipProvider>
);
