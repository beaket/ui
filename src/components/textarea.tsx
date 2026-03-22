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

export function Textarea({ className, autoResize = true, onInput, ref, ...props }: Props) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const externalRef = useRef(ref);
  externalRef.current = ref;

  const mergedRef = useCallback((node: HTMLTextAreaElement | null) => {
    internalRef.current = node;
    const extRef = externalRef.current;
    if (typeof extRef === "function") extRef(node);
    else if (extRef) extRef.current = node;
  }, []);

  const adjustHeight = useCallback(() => {
    const textarea = internalRef.current;
    if (!textarea || !autoResize) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [autoResize]);

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight, props.value, props.defaultValue]);

  return (
    <textarea
      ref={mergedRef}
      data-slot="textarea"
      className={cn(
        "border-graphite bg-paper text-ink w-full border px-3 py-2 text-sm",
        "placeholder:text-steel",
        "focus-visible:outline-signal-blue focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:border-chrome disabled:bg-frost disabled:text-steel disabled:cursor-not-allowed disabled:border-dashed",
        "read-only:bg-frost read-only:cursor-default",
        "aria-[invalid=true]:border-signal-red aria-[invalid=true]:focus-visible:outline-signal-red",
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
