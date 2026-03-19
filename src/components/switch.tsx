import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const switchVariants = cva(
  "peer inline-flex shrink-0 cursor-pointer items-center p-0.5 transition-colors outline-none data-[state=checked]:bg-signal-green data-[state=unchecked]:bg-chrome focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-blue disabled:cursor-not-allowed disabled:border-dashed disabled:border-chrome disabled:bg-frost border border-chrome",
  {
    variants: {
      size: {
        sm: "h-3 w-7",
        md: "h-4 w-9",
        lg: "h-5 w-11",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const switchThumbVariants = cva(
  "pointer-events-none block bg-paper ring-0 transition-transform data-[state=unchecked]:translate-x-0",
  {
    variants: {
      size: {
        sm: "size-1.5 data-[state=checked]:translate-x-4",
        md: "size-2.5 data-[state=checked]:translate-x-5",
        lg: "size-3.5 data-[state=checked]:translate-x-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

interface SwitchProps
  extends
    Omit<React.ComponentProps<typeof SwitchPrimitive.Root>, "asChild">,
    VariantProps<typeof switchVariants> {
  /**
   * Additional CSS classes to apply to the switch
   */
  className?: string;

  /**
   * Size of the switch
   */
  size?: "sm" | "md" | "lg";

  /**
   * Whether the switch is checked (controlled mode)
   */
  checked?: boolean;

  /**
   * Default checked state (uncontrolled mode)
   */
  defaultChecked?: boolean;

  /**
   * Callback fired when the checked state changes
   */
  onCheckedChange?: (checked: boolean) => void;

  /**
   * Whether the switch is disabled
   */
  disabled?: boolean;

  /**
   * Whether the switch is required in a form
   */
  required?: boolean;

  /**
   * Name attribute for form submission
   */
  name?: string;

  /**
   * Value attribute for form submission when checked
   */
  value?: string;
}

export function Switch({ className, size, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(switchVariants({ size }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb data-slot="switch-thumb" className={switchThumbVariants({ size })} />
    </SwitchPrimitive.Root>
  );
}

export type { SwitchProps };
