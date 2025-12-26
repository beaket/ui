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
        "peer size-4 shrink-0 rounded border border-[var(--chrome)]",
        "bg-[var(--paper)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-blue)]",
        "data-[state=checked]:border-[var(--branch)] data-[state=checked]:bg-[var(--branch)] data-[state=checked]:text-white",
        "disabled:cursor-not-allowed disabled:opacity-50",
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
