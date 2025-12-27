import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Additional CSS classes to apply to the input */
  className?: string;
}

export function Input({ className, type = "text", ...props }: Props) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full px-3 text-sm",
        "bg-white text-[var(--ink)]",
        "border border-[var(--graphite)]",
        "placeholder:text-[var(--steel)]",
        "hover:border-[var(--ink)]",
        "focus:ring-2 focus:ring-[var(--signal-blue)] focus:ring-offset-1 focus:outline-none",
        "disabled:cursor-not-allowed disabled:border-dashed disabled:border-[var(--chrome)] disabled:bg-[var(--frost)] disabled:text-[var(--steel)]",
        "aria-[invalid=true]:border-[var(--signal-red)] aria-[invalid=true]:focus:ring-[var(--signal-red)]",
        "read-only:bg-[var(--frost)] read-only:text-[var(--steel)]",
        className,
      )}
      {...props}
    />
  );
}
