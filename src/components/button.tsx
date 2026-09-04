import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface Props extends React.ComponentProps<"button"> {
  /** primary | secondary | destructive | outline | ghost | link | success | warning. Button style variant */
  variant?:
    "primary" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success" | "warning";
  /** sm | md | lg | icon. Button size */
  size?: "sm" | "md" | "lg" | "icon";
  /** Shows a loading spinner and disables the button */
  loading?: boolean;
  /** Merges props onto the immediate child element instead of rendering a button */
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size = "md",
  loading,
  disabled,
  children,
  asChild = false,
  type,
  ...props
}: Props) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      type={!asChild ? (type ?? "button") : undefined}
      disabled={!asChild ? disabled || loading : undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && (
            <span aria-live="polite">
              <Spinner />
            </span>
          )}
          {children}
        </>
      )}
    </Comp>
  );
}

// Accent is state, not standing decoration. Edged pressables reveal a thin edge
// on hover and a grown edge while they own an open overlay. Rest stays neutral;
// active press drops onto the edge, and keyboard focus remains the outer outline.
const edge = "hover:shadow-offset-action data-[state=open]:shadow-offset-action-hover";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium",
    "cursor-pointer",
    "active:shadow-none active:translate-x-px active:translate-y-px",
    "disabled:shadow-none disabled:cursor-not-allowed disabled:border-dashed disabled:border-border-muted disabled:bg-bg-disabled disabled:text-fg-disabled",
    "focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-2",
    "[&_svg]:size-4",
    "transition-[box-shadow,translate,border-color] duration-100",
  ].join(" "),
  {
    variants: {
      variant: {
        // Ink fill is the complete persistent primary signal. Accent appears
        // only through interaction, so emphasis never splits into two voices.
        primary: `bg-bg-emphasis text-fg-on-emphasis border border-border-strong hover:bg-bg-emphasis-hover data-[state=open]:bg-bg-emphasis-hover active:bg-bg-emphasis-active disabled:text-fg-disabled no-underline ${edge}`,
        destructive: `bg-danger-solid text-danger-fg-on-solid border border-danger-solid hover:bg-danger-solid-hover hover:border-danger-solid-hover data-[state=open]:bg-danger-solid-hover data-[state=open]:border-danger-solid-hover active:bg-danger-solid-active disabled:text-fg-disabled no-underline ${edge}`,
        // Outline is airy at rest; on engage its signal is the accent edge
        // growing, not a grey fill — so hover and held-open drop the fill and lean
        // on the edge. The press keeps a faint grey settle (active:bg-bg-active) to
        // confirm the drop.
        outline: `border border-border bg-transparent text-fg active:bg-bg-active ${edge}`,
        secondary: `bg-bg-raised text-fg border border-border hover:bg-bg-hover data-[state=open]:bg-bg-hover active:bg-bg-active ${edge}`,
        // Ghost and link are not edged pressables, so they carry no accent edge.
        // Ghost's only hover signal is the grey fill (no edge to grow); link reads
        // as a link — accent text with a hover underline — not a keyed button.
        ghost:
          "text-fg hover:bg-bg-hover data-[state=open]:bg-bg-hover active:bg-bg-active active:translate-x-0 active:translate-y-0",
        link: "text-fg-link underline-offset-4 hover:underline data-[state=open]:underline active:translate-x-0 active:translate-y-0",
        success: `bg-success-solid text-success-fg-on-solid border border-success-solid hover:bg-success-solid-hover hover:border-success-solid-hover data-[state=open]:bg-success-solid-hover data-[state=open]:border-success-solid-hover active:bg-success-solid-active disabled:text-fg-disabled no-underline ${edge}`,
        warning: `bg-warning-solid text-warning-fg-on-solid border border-warning-solid hover:bg-warning-solid-hover hover:border-warning-solid-hover data-[state=open]:bg-warning-solid-hover data-[state=open]:border-warning-solid-hover active:bg-warning-solid-active disabled:text-fg-disabled no-underline ${edge}`,
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-10 px-6 text-sm",
        icon: "size-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

function Spinner() {
  return (
    <svg className="animate-spin" viewBox="0 0 24 24" role="status" aria-label="Loading">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeDasharray="32"
        strokeDashoffset="12"
      />
    </svg>
  );
}
