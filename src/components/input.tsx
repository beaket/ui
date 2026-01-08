import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  /** Additional CSS classes to apply to the input */
  className?: string;
  /** Element to render before the input (e.g., icon) */
  prefix?: React.ReactNode;
  /** Element to render after the input (e.g., icon or button) */
  suffix?: React.ReactNode;
}

const inputBaseStyles = [
  "h-9 w-full px-3 text-sm",
  "bg-white text-[var(--ink)]",
  "border border-[var(--graphite)]",
  "placeholder:text-[var(--steel)]",
  "focus:ring-2 focus:ring-[var(--signal-blue)] focus:ring-offset-1 focus:outline-none",
  "disabled:cursor-not-allowed disabled:border-dashed disabled:border-[var(--chrome)] disabled:bg-[var(--frost)] disabled:text-[var(--steel)]",
  "aria-[invalid=true]:border-[var(--signal-red)] aria-[invalid=true]:focus:ring-[var(--signal-red)]",
  "read-only:bg-[var(--frost)] read-only:text-[var(--steel)]",
].join(" ");

export function Input({ className, type = "text", prefix, suffix, ...props }: Props) {
  if (!prefix && !suffix) {
    return (
      <input type={type} data-slot="input" className={cn(inputBaseStyles, className)} {...props} />
    );
  }

  return (
    <div data-slot="input-wrapper" className="relative flex items-center">
      {prefix && (
        <span
          data-slot="input-prefix"
          className="pointer-events-none absolute left-3 flex items-center text-[var(--steel)] [&_svg]:size-4"
        >
          {prefix}
        </span>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(inputBaseStyles, prefix && "pl-9", suffix && "pr-9", className)}
        {...props}
      />
      {suffix && (
        <span
          data-slot="input-suffix"
          className="absolute right-3 flex items-center text-[var(--steel)] [&_svg]:size-4"
        >
          {suffix}
        </span>
      )}
    </div>
  );
}
