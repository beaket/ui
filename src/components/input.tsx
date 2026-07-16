import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface Props extends Omit<React.ComponentProps<"input">, "prefix"> {
  /** Element to render before the input (e.g., icon) */
  prefix?: React.ReactNode;
  /** Element to render after the input (e.g., icon or button) */
  suffix?: React.ReactNode;
}

const inputBaseStyles = [
  "h-9 w-full px-3 text-sm",
  "bg-bg-input text-fg",
  "border border-border-strong",
  "placeholder:text-fg-subtle",
  "focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-2",
  "disabled:cursor-not-allowed disabled:border-dashed disabled:border-border-muted disabled:bg-bg-disabled disabled:text-fg-disabled",
  "aria-[invalid=true]:border-danger-solid aria-[invalid=true]:focus-visible:outline-danger-solid",
  "read-only:bg-bg-disabled read-only:text-fg-muted",
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
          className="text-fg-muted pointer-events-none absolute left-3 flex items-center [&_svg]:size-4"
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
          className="text-fg-muted absolute right-3 flex items-center [&_svg]:size-4"
        >
          {suffix}
        </span>
      )}
    </div>
  );
}
