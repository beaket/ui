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
  /**
   * Allow the user to manually resize the textarea vertically. When combined with
   * `autoResize`, the textarea still grows with content but the user can drag it
   * taller — the manual height becomes a floor that content can only exceed.
   * @default false
   */
  resizable?: boolean;
}

export function Textarea({
  className,
  autoResize = true,
  resizable = false,
  onInput,
  onPointerUp,
  ref,
  ...props
}: Props) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const externalRef = useRef(ref);
  externalRef.current = ref;

  const mergedRef = useCallback((node: HTMLTextAreaElement | null) => {
    internalRef.current = node;
    const extRef = externalRef.current;
    if (typeof extRef === "function") extRef(node);
    else if (extRef) extRef.current = node;
  }, []);

  const userHeightRef = useRef<number | null>(null);
  const lastAppliedHeightRef = useRef<number | null>(null);

  const adjustHeight = useCallback(() => {
    const textarea = internalRef.current;
    if (!textarea || !autoResize) return;

    textarea.style.height = "auto";
    const contentHeight = textarea.scrollHeight;
    const floor = userHeightRef.current ?? 0;
    const next = Math.max(contentHeight, floor);
    textarea.style.height = `${next}px`;
    lastAppliedHeightRef.current = next;
  }, [autoResize]);

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight, props.value, props.defaultValue]);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLTextAreaElement>) => {
      onPointerUp?.(e);
      if (!autoResize || !resizable) return;
      const textarea = internalRef.current;
      if (!textarea) return;
      const current = textarea.offsetHeight;
      if (lastAppliedHeightRef.current !== null && current !== lastAppliedHeightRef.current) {
        userHeightRef.current = current;
        adjustHeight();
      }
    },
    [autoResize, resizable, onPointerUp, adjustHeight],
  );

  return (
    <textarea
      ref={mergedRef}
      data-slot="textarea"
      className={cn(
        "border-border-strong bg-bg-input text-fg w-full border px-3 py-2 text-sm",
        "placeholder:text-fg-subtle",
        "caret-accent-solid selection:bg-accent-bg",
        // Cap-off: same field grammar as Input — quiet at rest, static action
        // edge while engaged, grey surface shade when read-only is focused.
        "not-read-only:focus:shadow-offset-action focus:outline-hidden",
        "enabled:read-only:focus:shadow-offset",
        "enabled:read-only:border-border-muted enabled:read-only:cursor-default",
        "disabled:border-border-muted disabled:bg-bg-disabled disabled:text-fg-disabled disabled:cursor-not-allowed disabled:border-dashed",
        "aria-[invalid=true]:border-danger-solid aria-[invalid=true]:not-read-only:focus:shadow-offset-action-danger",
        autoResize && !resizable && "resize-none overflow-hidden",
        autoResize && resizable && "resize-y overflow-hidden",
        !autoResize && resizable && "resize-y",
        className,
      )}
      onInput={(e) => {
        adjustHeight();
        onInput?.(e);
      }}
      onPointerUp={handlePointerUp}
      {...props}
    />
  );
}
