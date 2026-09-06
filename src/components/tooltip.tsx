import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface TooltipProviderProps extends React.ComponentProps<
  typeof TooltipPrimitive.Provider
> {
  /**
   * How long to wait, in milliseconds, before showing any tooltip inside this provider
   * @default 0
   */
  delayDuration?: number;
}

function TooltipProvider({ delayDuration = 0, ...props }: TooltipProviderProps) {
  return <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />;
}

export interface TooltipProps extends React.ComponentProps<typeof TooltipPrimitive.Root> {
  /**
   * Overrides the enclosing `TooltipProvider` delay, in milliseconds, for this tooltip alone
   */
  delayDuration?: number;
}

// The delay belongs to the provider, which every tooltip must sit inside (Radix
// throws otherwise). A root that mounted its own provider made the one wrapped
// around a group unreachable — the inner context always won.
function TooltipRoot(props: TooltipProps) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger(props: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "border-border-strong bg-bg-emphasis text-fg-on-emphasis z-50 overflow-hidden border px-3 py-1.5 text-xs",
          "animate-in fade-in-0 zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

export { TooltipProvider };

export const Tooltip = Object.assign(TooltipRoot, {
  Trigger: TooltipTrigger,
  Content: TooltipContent,
});
