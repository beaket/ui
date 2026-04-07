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
  /** Ref forwarded to the underlying input element */
  ref?: React.Ref<HTMLInputElement>;
}

const inputBaseStyles = [
  "h-9 w-full px-3 text-sm",
  "bg-paper text-ink",
  "border border-graphite",
  "placeholder:text-steel",
  "focus-visible:outline-2 focus-visible:outline-signal-blue focus-visible:outline-offset-2",
  "disabled:cursor-not-allowed disabled:border-dashed disabled:border-chrome disabled:bg-frost disabled:text-steel",
  "aria-[invalid=true]:border-signal-red aria-[invalid=true]:focus-visible:outline-signal-red",
  "read-only:bg-frost read-only:text-steel",
].join(" ");

export function Input({ className, type = "text", prefix, suffix, ref, ...props }: Props) {
  if (!prefix && !suffix) {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(inputBaseStyles, className)}
        {...props}
      />
    );
  }

  return (
    <div data-slot="input-wrapper" className="relative flex items-center">
      {prefix && (
        <span
          data-slot="input-prefix"
          className="text-steel pointer-events-none absolute left-3 flex items-center [&_svg]:size-4"
        >
          {prefix}
        </span>
      )}
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(inputBaseStyles, prefix && "pl-9", suffix && "pr-9", className)}
        {...props}
      />
      {suffix && (
        <span
          data-slot="input-suffix"
          className="text-steel absolute right-3 flex items-center [&_svg]:size-4"
        >
          {suffix}
        </span>
      )}
    </div>
  );
}
