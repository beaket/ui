import * as DialogPrimitive from "@radix-ui/react-dialog";
import { type ClassValue, clsx } from "clsx";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

interface Props {
  /**
   * When true, prevents closing the sheet via ESC key or clicking outside.
   */
  preventClose?: boolean;

  /**
   * Element that opens the sheet when clicked.
   * Optional - if not provided, sheet must be controlled via open/onOpenChange props.
   */
  trigger?: React.ReactNode;

  /**
   * Sheet content including Header, Description, Footer, and custom elements
   */
  children?: React.ReactNode;

  /**
   * Controlled open state of the sheet
   */
  open?: boolean;

  /**
   * Callback when the open state changes
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * When this value becomes truthy, automatically close the sheet.
   */
  closeWhen?: unknown;

  /**
   * Side from which the sheet slides in
   */
  side?: "left" | "right" | "top" | "bottom";
}

const sidePositions = {
  right: "inset-y-0 right-0 h-full w-3/4 sm:max-w-md",
  left: "inset-y-0 left-0 h-full w-3/4 sm:max-w-md",
  top: "inset-x-0 top-0 w-full",
  bottom: "inset-x-0 bottom-0 w-full",
};

const sideAnimations = {
  right:
    "data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right",
  left: "data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left",
  top: "data-[state=open]:animate-in data-[state=open]:slide-in-from-top data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top",
  bottom:
    "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom",
};

export function Sheet({
  children,
  trigger,
  preventClose = false,
  open,
  onOpenChange,
  closeWhen,
  side = "right",
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined;

  if (process.env.NODE_ENV !== "production") {
    if (isControlled && !onOpenChange) {
      console.warn(
        "Sheet: `open` prop provided without `onOpenChange`. The sheet will be read-only.",
      );
    }
  }

  const sheetOpen = isControlled ? open : internalOpen;
  const sheetOnOpenChange = useCallback(
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

  useEffect(() => {
    if (closeWhen) {
      sheetOnOpenChange(false);
    }
  }, [closeWhen, sheetOnOpenChange]);

  return (
    <DialogPrimitive.Root open={sheetOpen} onOpenChange={sheetOnOpenChange}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-slot="sheet-overlay"
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-40 bg-[var(--ink)]/50"
        />
        <DialogPrimitive.Content
          data-slot="sheet-content"
          className={cn(
            "fixed z-50 gap-4 border border-[var(--chrome)] bg-[var(--paper)] p-4",
            sidePositions[side],
            sideAnimations[side],
          )}
          onInteractOutside={preventClose ? (e) => e.preventDefault() : undefined}
          onEscapeKeyDown={preventClose ? (e) => e.preventDefault() : undefined}
        >
          {children}
          <DialogPrimitive.Close
            data-slot="sheet-close"
            className="absolute top-4 right-4 text-[var(--steel)] transition-colors hover:text-[var(--ink)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-blue)] disabled:pointer-events-none"
            aria-label="Close sheet"
          >
            <X className="size-4" aria-hidden="true" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-xl leading-7 font-semibold text-[var(--ink)]", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-[var(--steel)]", className)}
      {...props}
    />
  );
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("mb-4 flex flex-col gap-2 text-left", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-4 flex items-center justify-end gap-2", className)}
      {...props}
    />
  );
}

function SheetClose({
  asChild = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="sheet-close-action" {...props} asChild={asChild} />;
}

Sheet.Title = SheetTitle;
Sheet.Description = SheetDescription;
Sheet.Header = SheetHeader;
Sheet.Footer = SheetFooter;
Sheet.Close = SheetClose;
