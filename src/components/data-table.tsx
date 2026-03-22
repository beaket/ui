import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { clsx, type ClassValue } from "clsx";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Table } from "./table";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface DataTableProps<TData, TValue> {
  /** Column definitions using TanStack Table's ColumnDef */
  columns: ColumnDef<TData, TValue>[];
  /** Array of data to display */
  data: TData[];
  /** Enable global search/filter functionality */
  searchable?: boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Enable pagination */
  paginated?: boolean;
  /** Number of rows per page */
  pageSize?: number;
  /** Empty state message */
  emptyMessage?: string;
  /** Custom empty state component */
  emptyState?: React.ReactNode;
  /** Row click handler */
  onRowClick?: (row: TData) => void;
  /** Additional CSS class for the table container */
  className?: string;
  /** Enable column sorting (default: true) */
  enableSorting?: boolean;
  /** Enable column filtering (default: true) */
  enableFiltering?: boolean;
  /** Initial column visibility state */
  initialColumnVisibility?: VisibilityState;
  /** Show compact table styling */
  compact?: boolean;
  /** Enable row selection with checkboxes */
  selectable?: boolean;
  /** Callback when row selection changes */
  onSelectionChange?: (selectedRows: TData[]) => void;
  /** Initial row selection state */
  initialRowSelection?: RowSelectionState;
  /** Function to generate custom class names for each row based on row data */
  getRowClassName?: (row: TData) => string;
  /** Callback when mouse enters a row */
  onRowMouseEnter?: (row: TData) => void;
  /** Callback when mouse leaves a row */
  onRowMouseLeave?: (row: TData) => void;
}

/**
 * A data table component built on TanStack Table.
 * Features sorting, filtering, pagination, and row selection.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  searchable = false,
  searchPlaceholder = "Search...",
  paginated = false,
  pageSize = 10,
  emptyMessage = "No data available",
  emptyState,
  onRowClick,
  className,
  enableSorting = true,
  enableFiltering = true,
  initialColumnVisibility,
  compact = false,
  selectable = false,
  onSelectionChange,
  initialRowSelection,
  getRowClassName,
  onRowMouseEnter,
  onRowMouseLeave,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility || {},
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(initialRowSelection || {});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: paginated ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: selectable,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const tableRef = useRef(table);
  tableRef.current = table;

  useEffect(() => {
    if (selectable && onSelectionChange) {
      const selectedRows = tableRef.current
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original);
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, selectable, onSelectionChange]);

  return (
    <div className={className}>
      {searchable && (
        <div className="mb-4 flex items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="text-steel absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
              aria-label="Search"
            />
          </div>
        </div>
      )}

      <div className="border-chrome bg-surface-1 overflow-x-auto border">
        <Table className="min-w-full">
          <Table.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id}>
                {selectable && (
                  <Table.Head className="w-12">
                    <Checkbox
                      checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                      }
                      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                      aria-label="Select all"
                    />
                  </Table.Head>
                )}
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();

                  return (
                    <Table.Head
                      key={header.id}
                      scope="col"
                      className={canSort ? "cursor-pointer select-none" : ""}
                      style={{ width: header.getSize() }}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      aria-sort={
                        canSort
                          ? sortDirection === "asc"
                            ? "ascending"
                            : sortDirection === "desc"
                              ? "descending"
                              : "none"
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-2">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <div className="flex h-4 w-4 items-center justify-center">
                              {sortDirection === "asc" ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : sortDirection === "desc" ? (
                                <ArrowDown className="h-4 w-4" />
                              ) : (
                                <ArrowUpDown className="text-steel h-4 w-4" />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </Table.Head>
                  );
                })}
              </Table.Row>
            ))}
          </Table.Header>
          <Table.Body>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Table.Row
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onRowClick(row.original);
                          }
                        }
                      : undefined
                  }
                  tabIndex={onRowClick ? 0 : undefined}
                  role={onRowClick ? "button" : undefined}
                  onMouseEnter={() => onRowMouseEnter?.(row.original)}
                  onMouseLeave={() => onRowMouseLeave?.(row.original)}
                  className={cn(
                    onRowClick &&
                      "focus-visible:outline-signal-blue cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px]",
                    compact && "h-10",
                    getRowClassName?.(row.original),
                  )}
                >
                  {selectable && (
                    <Table.Cell
                      onClick={(e) => e.stopPropagation()}
                      className={compact ? "py-2" : ""}
                    >
                      <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                      />
                    </Table.Cell>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell
                      key={cell.id}
                      className={compact ? "py-2" : ""}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="h-64 text-center"
                >
                  {emptyState || <div className="text-steel">{emptyMessage}</div>}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>

      {paginated && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-steel text-sm">
            Showing{" "}
            {table.getFilteredRowModel().rows.length === 0
              ? 0
              : table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                1}{" "}
            to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length,
            )}{" "}
            of {table.getFilteredRowModel().rows.length} results
            {selectable &&
              table.getFilteredSelectedRowModel().rows.length > 0 &&
              ` (${table.getFilteredSelectedRowModel().rows.length} selected)`}
          </div>

          <nav className="flex items-center gap-1" aria-label="Table pagination">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={cn(
                "flex h-8 items-center justify-center border px-3 text-sm transition-colors",
                table.getCanPreviousPage()
                  ? "border-chrome hover:bg-frost cursor-pointer"
                  : "border-chrome text-steel cursor-not-allowed",
              )}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => table.setPageIndex(i)}
                className={cn(
                  "cursor-pointer border px-3 py-1 text-sm transition-colors",
                  table.getState().pagination.pageIndex === i
                    ? "bg-branch text-paper border-branch"
                    : "border-chrome hover:bg-frost",
                )}
                aria-current={table.getState().pagination.pageIndex === i ? "page" : undefined}
              >
                {i + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={cn(
                "flex h-8 items-center justify-center border px-3 text-sm transition-colors",
                table.getCanNextPage()
                  ? "border-chrome hover:bg-frost cursor-pointer"
                  : "border-chrome text-steel cursor-not-allowed",
              )}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

export type { Cell, ColumnDef, Row } from "@tanstack/react-table";
