import * as DialogPrimitive from "@radix-ui/react-dialog";
import { type ClassValue, clsx } from "clsx";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

interface Props {
  /**
   * When true, prevents closing the dialog via ESC key or clicking outside.
   * Users must use the close button or action buttons to dismiss the dialog.
   */
  preventClose?: boolean;

  /**
   * When true, hides the X close button in the top-right corner.
   * Useful with preventClose when you want users to use only action buttons.
   */
  hideCloseButton?: boolean;

  /**
   * Element that opens the dialog when clicked.
   * Can be any clickable element like Button, link, or custom trigger.
   * Optional - if not provided, dialog must be controlled via open/onOpenChange props.
   */
  trigger?: React.ReactNode;

  /**
   * Dialog content including Header, Description, Footer, and custom elements
   */
  children?: React.ReactNode;

  /**
   * Controlled open state of the dialog.
   * When provided, you must also provide onOpenChange to handle state updates.
   */
  open?: boolean;

  /**
   * Callback when the open state changes.
   * Required when using controlled mode (open prop).
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * When this value becomes truthy, automatically close the dialog.
   * Useful for closing dialog after successful form submission via React Router action.
   */
  closeWhen?: unknown;
}

export function Dialog({
  children,
  trigger,
  preventClose = false,
  hideCloseButton = false,
  open,
  onOpenChange,
  closeWhen,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined;

  // Warn in dev mode if controlled without onOpenChange
  if (process.env.NODE_ENV !== "production") {
    if (isControlled && !onOpenChange) {
      console.warn(
        "Dialog: `open` prop provided without `onOpenChange`. The dialog will be read-only.",
      );
    }
  }

  const dialogOpen = isControlled ? open : internalOpen;
  const dialogOnOpenChange = useCallback(
    (value: boolean) => {
      if (onOpenChange) {
        onOpenChange(value);
      }
      if (!isControlled) {
        setInternalOpen(value);
      }
    },
    [isControlled, onOpenChange],
  );

  // Auto-close when closeWhen becomes truthy
  useEffect(() => {
    if (closeWhen) {
      dialogOnOpenChange(false);
    }
  }, [closeWhen, dialogOnOpenChange]);

  return (
    <DialogPrimitive.Root open={dialogOpen} onOpenChange={dialogOnOpenChange}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-slot="dialog-overlay"
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-40 bg-[var(--ink)]/50"
        />
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 shadow-offset-dark fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 border border-[var(--chrome)] bg-[var(--paper)] p-6 sm:max-w-lg"
          onInteractOutside={preventClose ? (e) => e.preventDefault() : undefined}
          onEscapeKeyDown={preventClose ? (e) => e.preventDefault() : undefined}
        >
          {children}
          {!hideCloseButton && (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              className="absolute top-4 right-4 text-[var(--steel)] transition-colors hover:text-[var(--ink)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-blue)] disabled:pointer-events-none"
              aria-label="Close dialog"
            >
              <X className="size-4" aria-hidden="true" />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-xl leading-7 font-semibold text-[var(--ink)]", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-[var(--steel)]", className)}
      {...props}
    />
  );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("mt-4 flex items-center justify-end gap-2", className)}
      {...props}
    />
  );
}

function DialogClose({
  asChild = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close-action" {...props} asChild={asChild} />;
}

Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;
Dialog.Header = DialogHeader;
Dialog.Footer = DialogFooter;
Dialog.Close = DialogClose;
