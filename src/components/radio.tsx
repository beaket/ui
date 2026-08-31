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
        "group peer border-border-strong relative size-4 shrink-0 rounded-full border before:absolute before:inset-[-14px] before:content-['']",
        // Instrument grammar: the chassis is neutral at rest and reveals a thin
        // action edge on hover. A checked radio can't be unchecked, so it gets
        // no press affordance.
        "bg-bg-input enabled:data-[state=unchecked]:hover:shadow-offset-action cursor-pointer transition-[background-color,box-shadow] duration-100",
        "enabled:data-[state=unchecked]:hover:bg-bg-hover enabled:data-[state=unchecked]:active:bg-bg-active",
        "focus-visible:outline-border-focus focus-visible:outline-2 focus-visible:outline-offset-2",
        "data-[state=checked]:border-border-strong data-[state=checked]:cursor-default",
        "disabled:border-border-muted disabled:bg-bg-disabled disabled:text-fg-disabled disabled:hover:border-border-muted disabled:cursor-not-allowed disabled:border-dashed disabled:shadow-none",
        "disabled:data-[state=checked]:border-border-muted",
        "aria-[invalid=true]:border-danger-solid aria-[invalid=true]:focus-visible:outline-danger-solid",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-indicator"
        className="flex items-center justify-center"
      >
        <span className="bg-bg-emphasis group-disabled:bg-fg-disabled size-2 rounded-full" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}
