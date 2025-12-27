import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface RadioGroupProps extends React.ComponentProps<typeof RadioGroupPrimitive.Root> {
  /** Additional CSS classes to apply to the radio group */
  className?: string;
}

export function RadioGroup({ className, ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("flex gap-2", className)}
      {...props}
    />
  );
}

export interface RadioItemProps extends React.ComponentProps<typeof RadioGroupPrimitive.Item> {
  /** Additional CSS classes to apply to the radio item */
  className?: string;
}

export function RadioItem({ className, ...props }: RadioItemProps) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-item"
      className={cn(
        "peer size-4 shrink-0 rounded-full border border-[var(--chrome)]",
        "bg-[var(--paper)]",
        "hover:border-[var(--steel)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-blue)]",
        "data-[state=checked]:border-[var(--ink)]",
        "disabled:cursor-not-allowed disabled:border-dashed disabled:border-[var(--chrome)] disabled:bg-[var(--frost)] disabled:hover:border-[var(--chrome)]",
        "disabled:data-[state=checked]:border-[var(--chrome)]",
        "aria-[invalid=true]:border-[var(--signal-red)]",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-indicator"
        className="flex items-center justify-center"
      >
        <span className="size-2 rounded-full bg-[var(--ink)] data-[disabled]:bg-[var(--steel)]" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}
