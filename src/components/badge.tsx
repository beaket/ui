import { cva } from "class-variance-authority";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface Props extends React.HTMLAttributes<HTMLSpanElement> {
  /** Badge style variant */
  variant?: "default" | "secondary" | "success" | "error" | "info" | "outline" | "warning" | "code";
}

export function Badge({ className, variant, ...props }: Props) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

const badgeVariants = cva(
  ["inline-flex items-center justify-center", "px-2 py-0.5", "text-xs font-medium", "border"].join(
    " ",
  ),
  {
    variants: {
      variant: {
        default: "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]",
        secondary: "bg-[var(--frost)] text-[var(--ink)] border-[var(--chrome)]",
        success: "bg-[var(--signal-green)] text-[var(--paper)] border-[var(--signal-green)]",
        error: "bg-[var(--signal-red)] text-[var(--paper)] border-[var(--signal-red)]",
        info: "bg-[var(--signal-blue)] text-[var(--paper)] border-[var(--signal-blue)]",
        outline: "bg-transparent text-[var(--ink)] border-[var(--chrome)]",
        warning: "bg-[var(--signal-amber)] text-[var(--graphite)] border-[var(--signal-amber)]",
        code: "font-mono bg-[var(--frost)] text-[var(--ink)] border-[var(--chrome)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
