import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "success"
    | "stark";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
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
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={!asChild ? disabled || loading : undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Spinner />}
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
    "disabled:cursor-not-allowed disabled:border-dashed disabled:border-[var(--chrome)] disabled:bg-[var(--frost)] disabled:text-[var(--steel)]",
    "focus-visible:outline-2 focus-visible:outline-[var(--signal-blue)] focus-visible:outline-offset-2",
    "[&_svg]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--branch)] text-white border border-[var(--branch)] hover:bg-[#2A2D33] hover:border-[#2A2D33] active:bg-[var(--ink)] disabled:text-[var(--steel)] no-underline",
        destructive:
          "bg-[var(--signal-red)] text-white border border-[var(--signal-red)] hover:bg-[#b71c1c] hover:border-[#b71c1c] active:bg-[#9a1919] disabled:text-[var(--steel)] no-underline",
        outline:
          "border border-[var(--chrome)] bg-transparent text-[var(--ink)] hover:bg-[var(--frost)] active:bg-[var(--platinum)]",
        secondary:
          "bg-[var(--frost)] text-[var(--ink)] border border-[var(--chrome)] hover:bg-[var(--platinum)] active:bg-[var(--silver)]",
        ghost:
          "text-[var(--ink)] hover:bg-[var(--frost)] active:bg-[var(--platinum)]",
        link: "text-[var(--signal-blue)] underline-offset-4 hover:underline",
        success:
          "bg-[var(--signal-green)] text-white border border-[var(--signal-green)] hover:bg-[#0f5f42] hover:border-[#0f5f42] active:bg-[#0a4a32] disabled:text-[var(--steel)] no-underline",
        stark:
          "border border-[var(--ink)] bg-transparent text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] active:bg-[var(--graphite)]",
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
    <svg
      className="animate-spin"
      viewBox="0 0 24 24"
      role="status"
      aria-label="Loading"
    >
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
