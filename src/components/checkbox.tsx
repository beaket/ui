import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { type ClassValue, clsx } from "clsx";
import { Check, Minus } from "lucide-react";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface Props extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  /** Additional CSS classes to apply to the checkbox */
  className?: string;
}

export function Checkbox({ className, ...props }: Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group peer border-border-strong relative size-4 shrink-0 border before:absolute before:inset-[-14px] before:content-['']",
        // Instrument grammar: the chassis floats on a static accent edge; press
        // physics belong to the indicator (the key), not the box.
        "bg-bg-input shadow-offset-action cursor-pointer transition-colors duration-100",
        "enabled:data-[state=unchecked]:hover:bg-bg-hover enabled:data-[state=unchecked]:active:bg-bg-active",
        "focus-visible:outline-border-focus focus-visible:outline-2 focus-visible:outline-offset-2",
        "data-[state=checked]:border-border-strong data-[state=checked]:bg-bg-emphasis data-[state=checked]:text-fg-on-emphasis enabled:data-[state=checked]:hover:bg-bg-emphasis-hover",
        "data-[state=indeterminate]:border-border-strong data-[state=indeterminate]:bg-bg-emphasis data-[state=indeterminate]:text-fg-on-emphasis enabled:data-[state=indeterminate]:hover:bg-bg-emphasis-hover",
        "disabled:border-border-muted disabled:bg-bg-disabled disabled:text-fg-disabled disabled:hover:border-border-muted disabled:cursor-not-allowed disabled:border-dashed disabled:shadow-none",
        "disabled:data-[state=checked]:border-border-muted disabled:data-[state=checked]:bg-bg-disabled disabled:data-[state=checked]:text-fg-disabled",
        "aria-[invalid=true]:border-danger-solid aria-[invalid=true]:focus-visible:outline-danger-solid",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-transform duration-100 group-active:translate-x-px group-active:translate-y-px"
      >
        <Check className="size-3 group-data-[state=indeterminate]:hidden" />
        <Minus className="hidden size-3 group-data-[state=indeterminate]:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
