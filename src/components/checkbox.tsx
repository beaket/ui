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
        "group peer border-graphite relative size-4 shrink-0 border before:absolute before:inset-[-14px] before:content-['']",
        "bg-paper",
        "focus-visible:outline-signal-blue focus-visible:outline-2 focus-visible:outline-offset-2",
        "data-[state=checked]:border-ink data-[state=checked]:bg-ink data-[state=checked]:text-paper",
        "data-[state=indeterminate]:border-ink data-[state=indeterminate]:bg-ink data-[state=indeterminate]:text-paper",
        "disabled:border-chrome disabled:bg-frost disabled:text-steel disabled:hover:border-chrome disabled:cursor-not-allowed disabled:border-dashed",
        "disabled:data-[state=checked]:border-chrome disabled:data-[state=checked]:bg-frost disabled:data-[state=checked]:text-steel",
        "aria-[invalid=true]:border-signal-red aria-[invalid=true]:focus-visible:outline-signal-red",
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
