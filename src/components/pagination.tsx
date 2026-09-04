import { Slot } from "@radix-ui/react-slot";
import { type ClassValue, clsx } from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createContext, useContext, useMemo } from "react";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface PaginationBaseProps {
  /**
   * Current page number (1-indexed)
   */
  page: number;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Additional CSS class for the container
   */
  className?: string;

  /**
   * Maximum number of page buttons to show (default: 5)
   * When there are more pages, ellipsis will be shown
   */
  maxPageButtons?: number;
}

export interface PaginationLinkProps extends PaginationBaseProps {
  /**
   * Use link-based navigation (default).
   * Renders `<a>` tags for SSR-friendly navigation.
   */
  mode?: "link";

  /**
   * Function to build URL for a given page number.
   * Required when mode is "link".
   */
  buildPageUrl: (page: number) => string;

  onPageChange?: never;

  children?: never;
}

export interface PaginationButtonProps extends PaginationBaseProps {
  /**
   * Use button-based navigation for client-side pagination.
   * Renders `<button>` tags with onClick handlers.
   */
  mode: "button";

  /**
   * Callback when a page is selected.
   * Required when mode is "button".
   */
  onPageChange: (page: number) => void;

  buildPageUrl?: never;

  children?: never;
}

export interface PaginationComposedProps extends PaginationBaseProps {
  /**
   * Compose the strip yourself from `Pagination.Previous`, `.Item`,
   * `.Ellipsis` and `.Next` instead of letting the root lay it out.
   */
  children: React.ReactNode;

  mode?: never;

  /** Used by `Pagination.Item` when it renders its own `<a href>`. */
  buildPageUrl?: (page: number) => string;

  /** Used by `Pagination.Item` when it renders its own `<button>`. */
  onPageChange?: (page: number) => void;
}

export type PaginationProps = PaginationLinkProps | PaginationButtonProps | PaginationComposedProps;

interface PaginationContextValue {
  page: number;
  totalPages: number;
  mode: "button" | "link";
  buildPageUrl?: (page: number) => string;
  onPageChange?: (page: number) => void;
}

// §1.4: the context lives in this file, is never exported, carries state the
// parts cannot compute for themselves, and adds no restrictions — every part
// still takes `className` and `asChild`.
const PaginationContext = createContext<PaginationContextValue | null>(null);

// §1.4 rule 2: parts never call `useContext` directly, so a part used outside
// the root says so instead of crashing on a null read.
function usePaginationContext(part: string): PaginationContextValue {
  const context = useContext(PaginationContext);
  if (!context) {
    throw new Error(`\`${part}\` must be used inside \`<Pagination>\``);
  }
  return context;
}

// One fused instrument: cells share neutral borders; pressing a key travels
// its label 1px inside the frame, and the current page stays held down.
const buttonBaseClass =
  "group flex min-h-6 min-w-6 items-center justify-center h-8 px-3 -ml-px first:ml-0 border text-sm transition-colors relative before:absolute before:inset-[-8px] before:content-[''] focus-visible:z-[2] focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-2";
const buttonActiveClass =
  "bg-bg-emphasis text-fg-on-emphasis border-border-strong z-[1] cursor-default before:hidden";
const buttonInactiveClass = "border-border cursor-pointer hover:bg-bg-hover active:bg-bg-active";
const buttonDisabledClass = "border-border-muted text-fg-disabled cursor-not-allowed";
const keyClass =
  "inline-block transition-transform duration-100 group-active:translate-x-px group-active:translate-y-px";
const heldKeyClass = "inline-block translate-x-px translate-y-px";

// The page-number algorithm, no longer entangled with rendering.
function getPageNumbers(
  page: number,
  totalPages: number,
  maxPageButtons: number,
): (number | "ellipsis-start" | "ellipsis-end")[] {
  if (totalPages <= maxPageButtons) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
  const halfRange = Math.floor((maxPageButtons - 3) / 2);

  // Always show first page
  pages.push(1);

  let start = Math.max(2, page - halfRange);
  let end = Math.min(totalPages - 1, page + halfRange);

  // Adjust range if at the edges
  if (page <= halfRange + 2) {
    end = maxPageButtons - 2;
  } else if (page >= totalPages - halfRange - 1) {
    start = totalPages - maxPageButtons + 3;
  }

  // Add ellipsis before middle numbers if needed
  if (start > 2) {
    pages.push("ellipsis-start");
  }

  // Add middle pages
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Add ellipsis after middle numbers if needed
  if (end < totalPages - 1) {
    pages.push("ellipsis-end");
  }

  // Always show last page
  pages.push(totalPages);

  return pages;
}

/**
 * Pagination component supporting both link and button modes.
 * - `mode="link"` (default): renders `<a>` tags with `buildPageUrl` for SSR-friendly navigation.
 * - `mode="button"`: renders `<button>` tags with `onPageChange` for client-side pagination.
 *
 * Both are sugar over the parts: pass children to lay the strip out yourself
 * with `Pagination.Previous`, `.Item`, `.Ellipsis` and `.Next`.
 */
function PaginationRoot(props: PaginationProps) {
  const { page, totalPages, className, maxPageButtons = 5 } = props;
  const { children, buildPageUrl, onPageChange } = props;
  const mode: "button" | "link" =
    props.mode === "button" || (!buildPageUrl && !!onPageChange) ? "button" : "link";

  const context = useMemo(
    // Memoized by hand: React Compiler runs in the consumer's build, which we
    // do not control (F3).
    () => ({ page, totalPages, mode, buildPageUrl, onPageChange }),
    [page, totalPages, mode, buildPageUrl, onPageChange],
  );

  // The sugar layer lays out a whole strip, so an empty one is nothing. A
  // composed strip is the consumer's to decide, and is never withheld.
  if (totalPages <= 1 && children === undefined) return null;

  return (
    <PaginationContext.Provider value={context}>
      <nav
        data-slot="pagination"
        className={cn("flex items-center justify-center", className)}
        aria-label="Pagination"
      >
        <div data-slot="pagination-strip" className="flex items-center">
          {children ?? (
            <>
              <PaginationPrevious />
              {getPageNumbers(page, totalPages, maxPageButtons).map((pageNum) =>
                pageNum === "ellipsis-start" || pageNum === "ellipsis-end" ? (
                  <PaginationEllipsis key={pageNum} />
                ) : (
                  <PaginationItem key={pageNum} page={pageNum} />
                ),
              )}
              <PaginationNext />
            </>
          )}
        </div>
      </nav>
    </PaginationContext.Provider>
  );
}

/** Props shared by the three navigating parts. `href` and `type` come from the root. */
interface PaginationCellProps extends Omit<React.ComponentProps<"a">, "href" | "type"> {
  /** Renders the consumer's own element (a router `Link`) instead of an `<a>`/`<button>` */
  asChild?: boolean;
}

export interface PaginationItemProps extends PaginationCellProps {
  /** The page this cell navigates to */
  page: number;
}

function PaginationItem({
  page,
  className,
  children,
  asChild = false,
  ...props
}: PaginationItemProps) {
  const context = usePaginationContext("Pagination.Item");
  const isCurrentPage = page === context.page;
  const classes = cn(
    buttonBaseClass,
    isCurrentPage ? buttonActiveClass : buttonInactiveClass,
    className,
  );
  const ariaCurrent = isCurrentPage ? ("page" as const) : undefined;

  // Under `asChild` the child owns its tag, its href and its content — we add
  // only the styling hook and the current-page mark, never a wrapper span.
  if (asChild) {
    return (
      <Slot data-slot="pagination-page" className={classes} aria-current={ariaCurrent} {...props}>
        {children}
      </Slot>
    );
  }

  const label = <span className={isCurrentPage ? heldKeyClass : keyClass}>{children ?? page}</span>;

  if (context.mode === "button") {
    return (
      <button
        type="button"
        data-slot="pagination-page"
        className={classes}
        onClick={() => context.onPageChange?.(page)}
        aria-current={ariaCurrent}
        // The cell's props are anchor-shaped minus `href`/`type`; the two tags
        // share everything that is left.
        {...(props as React.ComponentProps<"button">)}
      >
        {label}
      </button>
    );
  }

  return (
    <a
      data-slot="pagination-page"
      href={context.buildPageUrl?.(page)}
      className={classes}
      aria-current={ariaCurrent}
      {...props}
    >
      {label}
    </a>
  );
}

/** Previous and Next differ only in direction, so they share one body. */
function PaginationStep({
  context,
  slot,
  label,
  icon,
  enabled,
  targetPage,
  className,
  children,
  asChild,
  ...props
}: PaginationCellProps & {
  context: PaginationContextValue;
  slot: string;
  label: string;
  icon: React.ReactNode;
  enabled: boolean;
  targetPage: number;
}) {
  const classes = cn(
    buttonBaseClass,
    enabled ? buttonInactiveClass : buttonDisabledClass,
    className,
  );

  if (asChild) {
    return (
      <Slot data-slot={slot} className={classes} aria-label={label} {...props}>
        {children}
      </Slot>
    );
  }

  const content = children ?? (enabled ? <span className={keyClass}>{icon}</span> : icon);

  if (context.mode === "button") {
    return (
      <button
        type="button"
        data-slot={slot}
        className={classes}
        disabled={!enabled}
        onClick={() => enabled && context.onPageChange?.(targetPage)}
        aria-label={label}
        {...(props as React.ComponentProps<"button">)}
      >
        {content}
      </button>
    );
  }

  if (!enabled) {
    return (
      <span
        data-slot={slot}
        className={classes}
        role="link"
        aria-disabled="true"
        aria-label={label}
        {...(props as React.ComponentProps<"span">)}
      >
        {children ?? icon}
      </span>
    );
  }

  return (
    <a
      data-slot={slot}
      href={context.buildPageUrl?.(targetPage)}
      className={classes}
      aria-label={label}
      {...props}
    >
      {content}
    </a>
  );
}

function PaginationPrevious(props: PaginationCellProps) {
  const context = usePaginationContext("Pagination.Previous");
  return (
    <PaginationStep
      context={context}
      slot="pagination-prev"
      label="Previous page"
      icon={<ChevronLeft className="h-4 w-4" />}
      enabled={context.page > 1}
      targetPage={context.page - 1}
      {...props}
    />
  );
}

function PaginationNext(props: PaginationCellProps) {
  const context = usePaginationContext("Pagination.Next");
  return (
    <PaginationStep
      context={context}
      slot="pagination-next"
      label="Next page"
      icon={<ChevronRight className="h-4 w-4" />}
      enabled={context.page < context.totalPages}
      targetPage={context.page + 1}
      {...props}
    />
  );
}

export interface PaginationEllipsisProps extends React.ComponentProps<"span"> {
  /** Renders the consumer's own element instead of a `<span>` */
  asChild?: boolean;
}

function PaginationEllipsis({
  className,
  children,
  asChild = false,
  ...props
}: PaginationEllipsisProps) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="pagination-ellipsis"
      className={cn(
        "text-fg-subtle border-border -ml-px flex h-8 items-center justify-center border px-3 select-none",
        className,
      )}
      aria-hidden="true"
      {...props}
    >
      {children ?? "..."}
    </Comp>
  );
}

export const Pagination = Object.assign(PaginationRoot, {
  Item: PaginationItem,
  Previous: PaginationPrevious,
  Next: PaginationNext,
  Ellipsis: PaginationEllipsis,
});
