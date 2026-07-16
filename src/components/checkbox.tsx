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
        "bg-bg-input",
        "focus-visible:outline-border-focus focus-visible:outline-2 focus-visible:outline-offset-2",
        "data-[state=checked]:border-border-strong data-[state=checked]:bg-bg-emphasis data-[state=checked]:text-fg-on-emphasis",
        "data-[state=indeterminate]:border-border-strong data-[state=indeterminate]:bg-bg-emphasis data-[state=indeterminate]:text-fg-on-emphasis",
        "disabled:border-border-muted disabled:bg-bg-disabled disabled:text-fg-disabled disabled:hover:border-border-muted disabled:cursor-not-allowed disabled:border-dashed",
        "disabled:data-[state=checked]:border-border-muted disabled:data-[state=checked]:bg-bg-disabled disabled:data-[state=checked]:text-fg-disabled",
        "aria-[invalid=true]:border-danger-solid aria-[invalid=true]:focus-visible:outline-danger-solid",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <Check className="size-3 group-data-[state=indeterminate]:hidden" />
        <Minus className="hidden size-3 group-data-[state=indeterminate]:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
