import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface BadgeProps extends Omit<React.ComponentProps<"span">, "children"> {
  /** default | secondary | success | error | info | outline | warning | code. Badge style variant */
  variant?: "default" | "secondary" | "success" | "error" | "info" | "outline" | "warning" | "code";
  /** Visible label or content. A badge must not communicate its state through color alone. */
  children: React.ReactNode;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeBase, variantClasses[variant], className)}
      {...props}
    />
  );
}

const badgeBase = "inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium border";

const variantClasses = {
  default: "bg-bg-emphasis text-fg-on-emphasis border-border-strong",
  secondary: "bg-bg-hover text-fg border-border",
  success: "bg-success-solid text-success-fg-on-solid border-success-solid",
  error: "bg-danger-solid text-danger-fg-on-solid border-danger-solid",
  info: "bg-info-solid text-info-fg-on-solid border-info-solid",
  outline: "bg-transparent text-fg border-border",
  warning: "bg-warning-solid text-warning-fg-on-solid border-warning-solid",
  code: "font-mono bg-bg-hover text-fg border-border",
} as const;
