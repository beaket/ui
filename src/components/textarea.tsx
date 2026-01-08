import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

interface Props extends React.ComponentProps<"textarea"> {
  /**
   * Additional CSS classes to apply to the textarea
   */
  className?: string;
}

export function Textarea({ className, ...props }: Props) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border border-[var(--graphite)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)]",
        "placeholder:text-[var(--steel)]",
        "focus:border-[var(--signal-blue)] focus:outline-none",
        "disabled:cursor-not-allowed disabled:border-dashed disabled:bg-[var(--frost)] disabled:text-[var(--steel)]",
        "read-only:cursor-default read-only:bg-[var(--frost)]",
        "aria-[invalid=true]:border-[var(--signal-red)] aria-[invalid=true]:focus:border-[var(--signal-red)]",
        className,
      )}
      {...props}
    />
  );
}
