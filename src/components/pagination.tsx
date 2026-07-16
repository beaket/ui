import { type ClassValue, clsx } from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

interface PaginationBaseProps {
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

interface PaginationLinkProps extends PaginationBaseProps {
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
}

interface PaginationButtonProps extends PaginationBaseProps {
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
}

export type PaginationProps = PaginationLinkProps | PaginationButtonProps;

/**
 * Pagination component supporting both link and button modes.
 * - `mode="link"` (default): renders `<a>` tags with `buildPageUrl` for SSR-friendly navigation.
 * - `mode="button"`: renders `<button>` tags with `onPageChange` for client-side pagination.
 */
export function Pagination(props: PaginationProps) {
  const { page, totalPages, className, maxPageButtons = 5 } = props;
  const isButtonMode = props.mode === "button";

  if (totalPages <= 1) return null;

  // Calculate which page numbers to show
  const getPageNumbers = (): (number | "ellipsis-start" | "ellipsis-end")[] => {
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
  };

  const pageNumbers = getPageNumbers();
  const buttonBaseClass =
    "flex items-center justify-center h-8 px-3 border text-sm transition-colors relative before:absolute before:inset-[-8px] before:content-['']";
  const buttonActiveClass = "bg-bg-emphasis text-fg-on-emphasis border-border-strong";
  const buttonInactiveClass = "border-border hover:bg-bg-hover";
  const buttonDisabledClass = "border-border-muted text-fg-disabled cursor-not-allowed";

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      data-slot="pagination"
      className={cn("flex items-center justify-center gap-1", className)}
      aria-label="Pagination"
    >
      {/* Previous button */}
      {isButtonMode ? (
        <button
          type="button"
          data-slot="pagination-prev"
          className={cn(buttonBaseClass, hasPrev ? buttonInactiveClass : buttonDisabledClass)}
          disabled={!hasPrev}
          onClick={() => hasPrev && props.onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      ) : hasPrev ? (
        <a
          data-slot="pagination-prev"
          href={props.buildPageUrl(page - 1)}
          className={cn(buttonBaseClass, buttonInactiveClass)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </a>
      ) : (
        <span
          data-slot="pagination-prev"
          className={cn(buttonBaseClass, buttonDisabledClass)}
          role="link"
          aria-disabled="true"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {/* Page numbers */}
      {pageNumbers.map((pageNum) => {
        if (pageNum === "ellipsis-start" || pageNum === "ellipsis-end") {
          return (
            <span
              key={pageNum}
              data-slot="pagination-ellipsis"
              className="text-fg-subtle px-2 py-1"
              aria-hidden="true"
            >
              ...
            </span>
          );
        }

        const isCurrentPage = pageNum === page;

        if (isButtonMode) {
          return (
            <button
              key={pageNum}
              type="button"
              data-slot="pagination-page"
              className={cn(
                buttonBaseClass,
                isCurrentPage ? buttonActiveClass : buttonInactiveClass,
              )}
              onClick={() => props.onPageChange(pageNum)}
              aria-current={isCurrentPage ? "page" : undefined}
            >
              {pageNum}
            </button>
          );
        }

        return (
          <a
            key={pageNum}
            data-slot="pagination-page"
            href={props.buildPageUrl(pageNum)}
            className={cn(buttonBaseClass, isCurrentPage ? buttonActiveClass : buttonInactiveClass)}
            aria-current={isCurrentPage ? "page" : undefined}
          >
            {pageNum}
          </a>
        );
      })}

      {/* Next button */}
      {isButtonMode ? (
        <button
          type="button"
          data-slot="pagination-next"
          className={cn(buttonBaseClass, hasNext ? buttonInactiveClass : buttonDisabledClass)}
          disabled={!hasNext}
          onClick={() => hasNext && props.onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : hasNext ? (
        <a
          data-slot="pagination-next"
          href={props.buildPageUrl(page + 1)}
          className={cn(buttonBaseClass, buttonInactiveClass)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </a>
      ) : (
        <span
          data-slot="pagination-next"
          className={cn(buttonBaseClass, buttonDisabledClass)}
          role="link"
          aria-disabled="true"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
