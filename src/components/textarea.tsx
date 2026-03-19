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
        "border-graphite bg-paper text-ink w-full border px-3 py-2 text-sm",
        "placeholder:text-steel",
        "focus:ring-signal-blue focus:ring-2 focus:ring-offset-1 focus:outline-none",
        "disabled:border-chrome disabled:bg-frost disabled:text-steel disabled:cursor-not-allowed disabled:border-dashed",
        "read-only:bg-frost read-only:cursor-default",
        "aria-[invalid=true]:border-signal-red aria-[invalid=true]:focus:ring-signal-red",
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
