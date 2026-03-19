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
        default: "bg-ink text-paper border-ink",
        secondary: "bg-frost text-ink border-chrome",
        success: "bg-signal-green text-paper border-signal-green",
        error: "bg-signal-red text-paper border-signal-red",
        info: "bg-signal-blue text-paper border-signal-blue",
        outline: "bg-transparent text-ink border-chrome",
        warning: "bg-signal-amber text-graphite border-signal-amber",
        code: "font-mono bg-frost text-ink border-chrome",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
