import * as DialogPrimitive from "@radix-ui/react-dialog";
import { type ClassValue, clsx } from "clsx";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

interface Props {
  /**
   * When true, prevents closing the sheet via ESC key or clicking outside.
   */
  preventClose?: boolean;

  /**
   * When true, hides the X close button in the top-right corner.
   * Useful with preventClose when you want users to use only action buttons.
   */
  hideCloseButton?: boolean;

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
   * left | right | top | bottom. Side from which the sheet slides in
   */
  side?: "left" | "right" | "top" | "bottom";

  /**
   * When true, the sheet takes up the full width (for left/right sides).
   * Useful for mobile navigation menus.
   */
  fullScreen?: boolean;
}

const sidePositions = {
  right: "inset-y-0 right-0 h-full w-3/4 sm:max-w-md",
  left: "inset-y-0 left-0 h-full w-3/4 sm:max-w-md",
  top: "inset-x-0 top-0 w-full",
  bottom: "inset-x-0 bottom-0 w-full",
};

const sidePositionsFullScreen = {
  right: "inset-y-0 right-0 h-full w-full",
  left: "inset-y-0 left-0 h-full w-full",
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
  hideCloseButton = false,
  open,
  onOpenChange,
  closeWhen,
  side = "right",
  fullScreen = false,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const sheetOpen = isControlled ? open : internalOpen;

  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  const hasWarnedRef = useRef(false);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if (isControlled && !onOpenChange && !hasWarnedRef.current) {
        console.warn(
          "Sheet: `open` prop provided without `onOpenChange`. The sheet will be read-only.",
        );
        hasWarnedRef.current = true;
      }
    }
  }, [isControlled, onOpenChange]);

  // Auto-close when closeWhen becomes truthy
  useEffect(() => {
    if (closeWhen) {
      if (isControlled) {
        onOpenChangeRef.current?.(false);
      } else {
        setInternalOpen(false);
        onOpenChangeRef.current?.(false);
      }
    }
  }, [closeWhen, isControlled]);

  const handleOpenChange = (value: boolean) => {
    onOpenChangeRef.current?.(value);
    if (!isControlled) setInternalOpen(value);
  };

  return (
    <DialogPrimitive.Root open={sheetOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-slot="sheet-overlay"
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-bg-emphasis/50 fixed inset-0 z-40"
        />
        <DialogPrimitive.Content
          data-slot="sheet-content"
          className={cn(
            "shadow-offset-overlay border-border bg-bg-overlay fixed z-50 gap-4 border p-4",
            fullScreen ? sidePositionsFullScreen[side] : sidePositions[side],
            sideAnimations[side],
          )}
          onInteractOutside={preventClose ? (e) => e.preventDefault() : undefined}
          onEscapeKeyDown={preventClose ? (e) => e.preventDefault() : undefined}
        >
          {children}
          {!hideCloseButton && (
            <DialogPrimitive.Close
              data-slot="sheet-close"
              className="text-fg-muted hover:text-fg focus-visible:outline-border-focus absolute top-4 right-4 transition-colors before:absolute before:inset-[-14px] before:content-[''] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none"
              aria-label="Close sheet"
            >
              <X className="size-4" aria-hidden="true" />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-fg text-xl leading-7 font-semibold", className)}
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
      className={cn("text-fg-muted text-sm", className)}
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
