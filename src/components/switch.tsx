import * as SwitchPrimitive from "@radix-ui/react-switch";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// Instrument grammar: the track is neutral at rest and reveals a thin accent
// edge on hover; pressing travels the thumb instead of dropping the chassis. Checked
// fills with ink — state is carried by thumb position + ink, not a signal role.
// Hover tints the surface, like checkbox/radio: the on-track warms
// (emphasis-hover), the off-channel darkens one step (border-muted → border).
// Invalid recolors border + focus ring to danger while the accent edge stays
// (role-agnostic, exactly as on checkbox/radio).
const switchBase =
  "group peer inline-flex shrink-0 cursor-pointer items-center p-0.5 transition-[background-color,box-shadow] duration-100 outline-none enabled:hover:shadow-offset-action data-[state=checked]:bg-bg-emphasis enabled:data-[state=checked]:hover:bg-bg-emphasis-hover data-[state=unchecked]:bg-border-muted enabled:data-[state=unchecked]:hover:bg-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:shadow-none disabled:cursor-not-allowed disabled:border-dashed disabled:border-border-muted disabled:bg-bg-disabled disabled:text-fg-disabled disabled:data-[state=checked]:bg-bg-disabled aria-[invalid=true]:border-danger-solid aria-[invalid=true]:focus-visible:outline-danger-solid border border-border-strong relative before:absolute before:inset-[-14px] before:content-['']";

const switchSizes = {
  sm: "h-4 w-8",
  md: "h-4 w-9",
  lg: "h-5 w-11",
} as const;

const thumbBase =
  "pointer-events-none block bg-bg-input group-disabled:bg-border-muted ring-0 transition-transform data-[state=unchecked]:translate-x-0 group-active:translate-y-px group-active:data-[state=unchecked]:translate-x-px";

const thumbSizes = {
  sm: "size-2 data-[state=checked]:translate-x-4 group-active:data-[state=checked]:translate-x-[17px]",
  md: "size-2.5 data-[state=checked]:translate-x-5 group-active:data-[state=checked]:translate-x-[21px]",
  lg: "size-3.5 data-[state=checked]:translate-x-6 group-active:data-[state=checked]:translate-x-[25px]",
} as const;

export interface SwitchProps extends Omit<
  React.ComponentProps<typeof SwitchPrimitive.Root>,
  "asChild"
> {
  /**
   * sm | md | lg. Size of the switch
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

export function Switch({ className, size = "md", ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(switchBase, switchSizes[size], className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={`${thumbBase} ${thumbSizes[size]}`}
      />
    </SwitchPrimitive.Root>
  );
}
