"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { type ClassValue, clsx } from "clsx";
import { X } from "lucide-react";
import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
} from "react";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// Module-local type for bundlers that replace NODE_ENV without Node globals.
declare const process: { env: { NODE_ENV?: string } };

// Radix does not expose its title id, so the root owns one and hands it to the title, the
// content and the scroll region, which all name themselves from it.
const SheetTitleIdContext = createContext<string | undefined>(undefined);

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export interface SheetProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  /** Width preset for left/right sheets; className can override it. Defaults to md. */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Accessible name of the built-in close button. */
  closeLabel?: string;
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
   * left | right | top | bottom. Edge the sheet is anchored to
   */
  side?: "left" | "right" | "top" | "bottom";

  /**
   * When true, the sheet takes up the full width (for left/right sides).
   * Useful for mobile navigation menus.
   */
  fullScreen?: boolean;
}

const sidePositions = {
  right: "inset-y-0 right-0 h-full w-3/4",
  left: "inset-y-0 left-0 h-full w-3/4",
  top: "inset-x-0 top-0 max-h-dvh w-full",
  bottom: "inset-x-0 bottom-0 max-h-dvh w-full",
};

const sidePositionsFullScreen = {
  right: "inset-y-0 right-0 h-full w-full",
  left: "inset-y-0 left-0 h-full w-full",
  top: "inset-x-0 top-0 max-h-dvh w-full",
  bottom: "inset-x-0 bottom-0 max-h-dvh w-full",
};

const sheetSizes = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  full: "w-full sm:max-w-none",
};

/**
 * Opens the sheet. `asChild` defaults to true — as it does on `Sheet.Close` — so
 * the natural `<Sheet.Trigger><Button>…</Button></Sheet.Trigger>` keeps the
 * consumer's own element. The `trigger` prop is sugar over exactly this part.
 */
function SheetTrigger({
  asChild = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} asChild={asChild} />;
}

function SheetRoot({
  children,
  trigger,
  preventClose = false,
  hideCloseButton = false,
  open,
  onOpenChange,
  side = "right",
  fullScreen = false,
  size = "md",
  className,
  closeLabel = "Close sheet",
  onInteractOutside,
  onEscapeKeyDown,
  onOpenAutoFocus,
  ...contentProps
}: SheetProps) {
  // Radix's Root already implements controlled/uncontrolled, so `open` and
  // `onOpenChange` go straight to it. The only thing left of the hand-rolled
  // wrapper is §9's dev warning, which is about `open` without `onOpenChange` —
  // not about the state it used to mirror.
  const hasWarnedRef = useRef(false);
  const titleId = useId();
  const labelledBy = contentProps["aria-labelledby"] ?? titleId;
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if (open !== undefined && !onOpenChange && !hasWarnedRef.current) {
        console.warn(
          "Sheet: `open` prop provided without `onOpenChange`. The sheet will be read-only.",
        );
        hasWarnedRef.current = true;
      }
    }
  }, [open, onOpenChange]);

  // A `Sheet.Trigger` has to be a sibling of the Portal, not content inside it,
  // so the root sorts children into the two places they can legally go.
  const childList = Children.toArray(children);
  const triggers = childList.filter(
    (child) => isValidElement(child) && child.type === SheetTrigger,
  );
  const content = childList.filter(
    (child) => !(isValidElement(child) && child.type === SheetTrigger),
  );

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger>{trigger}</SheetTrigger>}
      {triggers}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-slot="sheet-overlay"
          className="bg-bg-emphasis/50 fixed inset-0 z-40"
        />
        <DialogPrimitive.Content
          {...contentProps}
          aria-labelledby={labelledBy}
          data-slot="sheet-content"
          className={cn(
            "shadow-offset-overlay border-border bg-bg-overlay fixed z-50 flex flex-col gap-4 border p-6",
            fullScreen ? sidePositionsFullScreen[side] : sidePositions[side],
            !fullScreen && (side === "left" || side === "right") && sheetSizes[size],
            className,
          )}
          onInteractOutside={(event) => {
            onInteractOutside?.(event);
            if (preventClose) event.preventDefault();
          }}
          onOpenAutoFocus={(event) => {
            onOpenAutoFocus?.(event);
            if (event.defaultPrevented) return;
            // The scroll region is the first tab stop, but opening should still land on the first
            // control (as it did before the region existed). It takes focus only when nothing else can.
            const panel = event.target as HTMLElement;
            const body = panel.querySelector<HTMLElement>('[data-slot="sheet-body"]');
            const candidates = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
              (el) => el !== body,
            );
            event.preventDefault();
            for (const el of [...candidates, ...(body ? [body] : [])]) {
              el.focus({ preventScroll: true });
              if (document.activeElement === el) break;
            }
          }}
          onEscapeKeyDown={(event) => {
            onEscapeKeyDown?.(event);
            if (preventClose) event.preventDefault();
          }}
        >
          <div
            data-slot="sheet-body"
            role="region"
            aria-labelledby={
              contentProps["aria-label"] && !contentProps["aria-labelledby"]
                ? undefined
                : labelledBy
            }
            aria-label={contentProps["aria-labelledby"] ? undefined : contentProps["aria-label"]}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keyboard users need to focus this region to scroll long content.
            tabIndex={0}
            className="focus-visible:outline-border-focus -m-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-1 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <SheetTitleIdContext.Provider value={titleId}>{content}</SheetTitleIdContext.Provider>
          </div>
          {!hideCloseButton && (
            <DialogPrimitive.Close
              data-slot="sheet-close"
              className="text-fg-muted hover:text-fg focus-visible:outline-border-focus absolute top-4 right-4 transition-colors duration-100 before:absolute before:inset-[-14px] before:content-[''] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none"
              aria-label={closeLabel}
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
  const titleId = useContext(SheetTitleIdContext);
  return (
    <DialogPrimitive.Title
      id={titleId}
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

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-2 text-left", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
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

export { SheetClose, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger };

export const Sheet = Object.assign(SheetRoot, {
  Trigger: SheetTrigger,
  Title: SheetTitle,
  Description: SheetDescription,
  Header: SheetHeader,
  Footer: SheetFooter,
  Close: SheetClose,
});
