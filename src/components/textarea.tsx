import { type ClassValue, clsx } from "clsx";
import { useCallback, useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

interface Props extends React.ComponentProps<"textarea"> {
  /**
   * Additional CSS classes to apply to the textarea
   */
  className?: string;
  /**
   * Automatically resize the textarea based on content
   * @default true
   */
  autoResize?: boolean;
}

export function Textarea({ className, autoResize = true, onInput, ...props }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !autoResize) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [autoResize]);

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight, props.value, props.defaultValue]);

  return (
    <textarea
      ref={textareaRef}
      data-slot="textarea"
      className={cn(
        "w-full border border-[var(--graphite)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)]",
        "placeholder:text-[var(--steel)]",
        "focus:ring-2 focus:ring-[var(--signal-blue)] focus:ring-offset-1 focus:outline-none",
        "disabled:cursor-not-allowed disabled:border-dashed disabled:border-[var(--chrome)] disabled:bg-[var(--frost)] disabled:text-[var(--steel)]",
        "read-only:cursor-default read-only:bg-[var(--frost)]",
        "aria-[invalid=true]:border-[var(--signal-red)] aria-[invalid=true]:focus:ring-[var(--signal-red)]",
        autoResize && "resize-none overflow-hidden",
        className,
      )}
      onInput={(e) => {
        adjustHeight();
        onInput?.(e);
      }}
      {...props}
    />
  );
}
