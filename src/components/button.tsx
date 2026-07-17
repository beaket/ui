import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary | secondary | destructive | outline | ghost | link | success | stark | warning. Button style variant */
  variant?:
    | "primary"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "success"
    | "stark"
    | "warning";
  /** sm | md | lg | icon. Button size */
  size?: "sm" | "md" | "lg" | "icon";
  /** Shows a loading spinner and disables the button */
  loading?: boolean;
  /** Use monospace font for CTA-style text */
  mono?: boolean;
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
  mono = false,
  asChild = false,
  type,
  ...props
}: Props) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, mono }), className)}
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

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium",
    "cursor-pointer",
    "shadow-offset-action",
    "hover:shadow-offset-action-hover",
    // Held open — a trigger whose menu/popover is open sustains its hover state:
    // the grown edge stays (still pressable, now the active owner). data-[state=open]
    // is only set when this Button is a Radix trigger (asChild); inert otherwise.
    "data-[state=open]:shadow-offset-action-hover",
    "active:shadow-none active:translate-x-px active:translate-y-px",
    "disabled:shadow-none disabled:cursor-not-allowed disabled:border-dashed disabled:border-border-muted disabled:bg-bg-disabled disabled:text-fg-disabled",
    "focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-2",
    "[&_svg]:size-4",
    "transition-[box-shadow,translate] duration-100",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-bg-emphasis text-fg-on-emphasis border border-accent-solid hover:bg-bg-emphasis-hover data-[state=open]:bg-bg-emphasis-hover active:bg-bg-emphasis-active disabled:text-fg-disabled no-underline",
        destructive:
          "bg-danger-solid text-danger-fg-on-solid border border-danger-solid hover:bg-danger-solid-hover hover:border-danger-solid-hover data-[state=open]:bg-danger-solid-hover data-[state=open]:border-danger-solid-hover active:bg-danger-solid-active disabled:text-fg-disabled no-underline",
        outline:
          "border border-border bg-transparent text-fg hover:bg-bg-hover data-[state=open]:bg-bg-hover active:bg-bg-active",
        secondary:
          "bg-accent-bg text-accent-fg border border-accent-border hover:border-accent-solid data-[state=open]:border-accent-solid",
        ghost:
          "text-fg hover:bg-bg-hover data-[state=open]:bg-bg-hover active:bg-bg-active shadow-none hover:shadow-none data-[state=open]:shadow-none active:shadow-none active:translate-x-0 active:translate-y-0",
        link: "text-fg-link underline-offset-4 hover:underline data-[state=open]:underline shadow-none hover:shadow-none data-[state=open]:shadow-none active:shadow-none active:translate-x-0 active:translate-y-0",
        success:
          "bg-success-solid text-success-fg-on-solid border border-success-solid hover:bg-success-solid-hover hover:border-success-solid-hover data-[state=open]:bg-success-solid-hover data-[state=open]:border-success-solid-hover active:bg-success-solid-active disabled:text-fg-disabled no-underline",
        stark:
          "border border-border-strong bg-transparent text-fg hover:bg-bg-emphasis hover:text-fg-on-emphasis data-[state=open]:bg-bg-emphasis data-[state=open]:text-fg-on-emphasis active:bg-bg-emphasis",
        warning:
          "bg-warning-solid text-warning-fg-on-solid border border-warning-solid hover:bg-warning-solid-hover hover:border-warning-solid-hover data-[state=open]:bg-warning-solid-hover data-[state=open]:border-warning-solid-hover active:bg-warning-solid-active disabled:text-fg-disabled no-underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-10 px-6 text-sm",
        icon: "size-9 p-0",
      },
      mono: {
        true: "font-mono tracking-wide",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      mono: false,
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
