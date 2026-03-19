import { type ClassValue, clsx } from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface PaginationProps {
  /**
   * Current page number (1-indexed)
   */
  page: number;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Function to build URL for a given page number
   */
  buildPageUrl: (page: number) => string;

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

/**
 * Server-side pagination component using links.
 * Works with React Router's Link component for SSR-friendly navigation.
 */
export function Pagination({
  page,
  totalPages,
  buildPageUrl,
  className,
  maxPageButtons = 5,
}: PaginationProps) {
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
  const buttonBaseClass = "px-3 py-1 border text-sm transition-colors";
  const buttonActiveClass = "bg-ink text-paper border-ink";
  const buttonInactiveClass = "border-chrome hover:bg-frost";
  const buttonDisabledClass = "border-chrome text-steel cursor-not-allowed";

  return (
    <nav
      data-slot="pagination"
      className={cn("flex items-center justify-center gap-1", className)}
      aria-label="Pagination"
    >
      {/* Previous button */}
      {page > 1 ? (
        <a
          data-slot="pagination-prev"
          href={buildPageUrl(page - 1)}
          className={cn(buttonBaseClass, buttonInactiveClass)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </a>
      ) : (
        <span
          data-slot="pagination-prev"
          className={cn(buttonBaseClass, buttonDisabledClass)}
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
              className="text-steel px-2 py-1"
              aria-hidden="true"
            >
              ...
            </span>
          );
        }

        const isCurrentPage = pageNum === page;
        return (
          <a
            key={pageNum}
            data-slot="pagination-page"
            href={buildPageUrl(pageNum)}
            className={cn(buttonBaseClass, isCurrentPage ? buttonActiveClass : buttonInactiveClass)}
            aria-current={isCurrentPage ? "page" : undefined}
          >
            {pageNum}
          </a>
        );
      })}

      {/* Next button */}
      {page < totalPages ? (
        <a
          data-slot="pagination-next"
          href={buildPageUrl(page + 1)}
          className={cn(buttonBaseClass, buttonInactiveClass)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </a>
      ) : (
        <span
          data-slot="pagination-next"
          className={cn(buttonBaseClass, buttonDisabledClass)}
          aria-disabled="true"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
