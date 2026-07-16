import { cva } from "class-variance-authority";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface Props extends React.HTMLAttributes<HTMLSpanElement> {
  /** default | secondary | success | error | info | outline | warning | code. Badge style variant */
  variant?: "default" | "secondary" | "success" | "error" | "info" | "outline" | "warning" | "code";
}

export function Badge({ className, variant, ...props }: Props) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

const badgeVariants = cva(
  ["inline-flex items-center justify-center", "px-2 py-0.5", "text-xs font-medium", "border"].join(
    " ",
  ),
  {
    variants: {
      variant: {
        default: "bg-bg-emphasis text-fg-on-emphasis border-border-strong",
        secondary: "bg-bg-hover text-fg border-border",
        success: "bg-success-solid text-success-fg-on-solid border-success-solid",
        error: "bg-danger-solid text-danger-fg-on-solid border-danger-solid",
        info: "bg-info-solid text-info-fg-on-solid border-info-solid",
        outline: "bg-transparent text-fg border-border",
        warning: "bg-warning-solid text-warning-fg-on-solid border-warning-solid",
        code: "font-mono bg-bg-hover text-fg border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
