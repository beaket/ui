import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { type ClassValue, clsx } from "clsx";
import { Check } from "lucide-react";
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
        "peer size-4 shrink-0 border border-[var(--graphite)]",
        "bg-[var(--paper)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-blue)]",
        "data-[state=checked]:border-[var(--ink)] data-[state=checked]:bg-[var(--ink)] data-[state=checked]:text-[var(--paper)]",
        "disabled:cursor-not-allowed disabled:border-dashed disabled:border-[var(--chrome)] disabled:bg-[var(--frost)] disabled:text-[var(--steel)] disabled:hover:border-[var(--chrome)]",
        "disabled:data-[state=checked]:border-[var(--chrome)] disabled:data-[state=checked]:bg-[var(--frost)] disabled:data-[state=checked]:text-[var(--steel)]",
        "aria-[invalid=true]:border-[var(--signal-red)]",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <Check className="size-3" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
