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
        "peer border-chrome size-4 shrink-0 rounded-full border",
        "bg-paper",
        "hover:border-steel",
        "focus-visible:outline-signal-blue focus-visible:outline-2 focus-visible:outline-offset-2",
        "data-[state=checked]:border-ink",
        "disabled:border-chrome disabled:bg-frost disabled:hover:border-chrome disabled:cursor-not-allowed disabled:border-dashed",
        "disabled:data-[state=checked]:border-chrome",
        "aria-[invalid=true]:border-signal-red",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-indicator"
        className="flex items-center justify-center"
      >
        <span className="bg-ink data-[disabled]:bg-steel size-2 rounded-full" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}
