import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
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
  /** Button size */
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
    "shadow-offset",
    "hover:shadow-offset-hover",
    "active:shadow-offset-active",
    "disabled:shadow-none disabled:cursor-not-allowed disabled:border-dashed disabled:border-chrome disabled:bg-frost disabled:text-steel",
    "focus-visible:outline-2 focus-visible:outline-signal-blue focus-visible:outline-offset-2",
    "[&_svg]:size-4",
    "transition-shadow duration-100",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-branch text-paper border border-branch hover:bg-iron hover:border-iron active:bg-ink disabled:text-steel no-underline",
        destructive:
          "bg-signal-red text-paper border border-signal-red hover:bg-signal-red-hover hover:border-signal-red-hover active:bg-signal-red-active disabled:text-steel no-underline",
        outline: "border border-chrome bg-transparent text-ink hover:bg-frost active:bg-platinum",
        secondary: "bg-frost text-ink border border-chrome hover:bg-platinum active:bg-silver",
        ghost:
          "text-ink hover:bg-frost active:bg-platinum shadow-none hover:shadow-none active:shadow-none",
        link: "text-signal-blue underline-offset-4 hover:underline shadow-none hover:shadow-none active:shadow-none",
        success:
          "bg-signal-green text-paper border border-signal-green hover:bg-signal-green-hover hover:border-signal-green-hover active:bg-signal-green-active disabled:text-steel no-underline",
        stark:
          "border border-ink bg-transparent text-ink hover:bg-ink hover:text-paper active:bg-graphite",
        warning:
          "bg-signal-amber text-graphite border border-signal-amber hover:bg-signal-amber-hover hover:border-signal-amber-hover active:bg-signal-amber-active disabled:text-steel no-underline",
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
