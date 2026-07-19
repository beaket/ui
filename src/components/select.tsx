import * as SelectPrimitive from "@radix-ui/react-select";
import { type ClassValue, clsx } from "clsx";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

function SelectRoot(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

interface SelectTriggerProps extends React.ComponentProps<typeof SelectPrimitive.Trigger> {
  /**
   * sm | default. Size variant of the select trigger
   */
  size?: "sm" | "default";
}

function SelectTrigger({ className, size = "default", children, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-full items-center justify-between gap-2",
        "border-border-strong bg-bg-input text-fg border px-3 py-2 text-sm",
        // Field that opens: the trigger opens a menu (a pressable — it keeps the
        // keyboard ring) but it's field-surfaced, not a Button, so it stays quiet
        // at rest like its field neighbors (no standing edge, no hover growth) and
        // lifts the grown edge only while its menu is open (data-[state=open] lands
        // natively on the Radix trigger; the rest-edge and hover-growth were
        // Button-incidental). Invalid recolors border + ring to danger while the
        // open edge stays accent (role-agnostic — danger rides the focus indicator,
        // which on a pressable is the ring).
        "data-[state=open]:shadow-offset-action-hover transition-[box-shadow] duration-100",
        "focus-visible:outline-border-focus focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:bg-bg-disabled disabled:text-fg-disabled disabled:border-border-muted disabled:cursor-not-allowed disabled:border-dashed disabled:shadow-none",
        "aria-[invalid=true]:border-danger-solid aria-[invalid=true]:focus-visible:outline-danger-solid",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-4" aria-hidden="true" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "shadow-offset-overlay border-border-strong bg-bg-overlay relative z-50 max-h-96 min-w-[8rem] overflow-hidden border",
          "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        collisionPadding={8}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport className="max-h-radix-select-content-available-height p-1">
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-fg-muted px-2 py-1.5 text-xs font-semibold", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 select-none",
        "text-fg py-1.5 pr-8 pl-2 text-sm outline-none",
        // Accent marks the row you'd activate — an accent-bg wash + a 2px accent
        // left-rule (the engaged-edge weight) — with the ink of the words left
        // full, not an ink stamp. Radix Select drives the active row via
        // data-highlighted (not roving focus), so the mark keys off that.
        "data-[highlighted]:bg-accent-bg data-[highlighted]:shadow-[inset_2px_0_0_0_var(--color-accent-solid)]",
        "data-[disabled]:text-fg-disabled data-[disabled]:pointer-events-none",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border-muted pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      tabIndex={-1}
      aria-hidden="true"
      {...props}
    >
      <ChevronUp className="size-4" aria-hidden="true" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      tabIndex={-1}
      aria-hidden="true"
      {...props}
    >
      <ChevronDown className="size-4" aria-hidden="true" />
    </SelectPrimitive.ScrollDownButton>
  );
}

// Compound component pattern
export const Select = Object.assign(SelectRoot, {
  Group: SelectGroup,
  Value: SelectValue,
  Trigger: SelectTrigger,
  Content: SelectContent,
  Label: SelectLabel,
  Item: SelectItem,
  Separator: SelectSeparator,
  ScrollUpButton: SelectScrollUpButton,
  ScrollDownButton: SelectScrollDownButton,
});
