import {
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  flexRender,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
  type CellData,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Cell as TanStackCell,
  type ColumnDef as TanStackColumnDef,
  type Row as TanStackRow,
} from "@tanstack/react-table";
import { clsx, type ClassValue } from "clsx";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Pagination } from "./pagination";
import { Table } from "./table";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  columnSizingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns,
  sortFns,
});

export type ColumnDef<TData extends RowData, TValue extends CellData = unknown> = TanStackColumnDef<
  typeof dataTableFeatures,
  TData,
  TValue
>;

export type Cell<TData extends RowData, TValue extends CellData = unknown> = TanStackCell<
  typeof dataTableFeatures,
  TData,
  TValue
>;

export type Row<TData extends RowData> = TanStackRow<typeof dataTableFeatures, TData>;

export interface DataTableProps<TData extends RowData, TValue extends CellData> {
  /** Column definitions using TanStack Table's ColumnDef — see https://tanstack.com/table/latest/docs/guide/column-defs */
  columns: ColumnDef<TData>[];
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
  initialColumnVisibility?: ColumnVisibilityState;
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
export function DataTable<TData extends RowData, TValue extends CellData>({
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
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(
    initialColumnVisibility || {},
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(initialRowSelection || {});

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    manualPagination: !paginated,
    manualSorting: !enableSorting,
    manualFiltering: !enableFiltering,
    enableSorting,
    enableFilters: enableFiltering,
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
        pageIndex: 0,
        pageSize,
      },
    },
  });

  const tableRef = useRef(table);
  tableRef.current = table;

  const onSelectionChangeRef = useRef(onSelectionChange);
  onSelectionChangeRef.current = onSelectionChange;

  useEffect(() => {
    if (selectable && onSelectionChangeRef.current) {
      const selectedRows = tableRef.current
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original);
      onSelectionChangeRef.current(selectedRows);
    }
  }, [rowSelection, selectable]);

  return (
    <div data-slot="data-table" className={className}>
      {searchable && (
        <div data-slot="data-table-toolbar" className="mb-4 flex items-center gap-2">
          <div data-slot="data-table-search" className="relative max-w-sm flex-1">
            <Search
              data-slot="data-table-search-icon"
              className="text-fg-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            />
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

      <div
        data-slot="data-table-container"
        className="border-border bg-bg-raised overflow-x-auto border"
      >
        <Table data-slot="data-table-table" className="min-w-full">
          <Table.Header data-slot="data-table-header">
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row data-slot="data-table-header-row" key={headerGroup.id}>
                {selectable && (
                  <Table.Head data-slot="data-table-select-head" className="w-12 py-3">
                    <Checkbox
                      checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() &&
                          !table.getIsAllPageRowsSelected() &&
                          "indeterminate")
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
                      data-slot="data-table-head"
                      key={header.id}
                      scope="col"
                      className={canSort ? "cursor-pointer select-none" : ""}
                      style={{ width: header.getSize() }}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      tabIndex={canSort ? 0 : undefined}
                      onKeyDown={
                        canSort
                          ? (e: React.KeyboardEvent) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                header.column.getToggleSortingHandler()?.(e as any);
                              }
                            }
                          : undefined
                      }
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
                        <div
                          data-slot="data-table-head-content"
                          className="flex items-center gap-2"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <div
                              data-slot="data-table-sort-indicator"
                              className="flex h-4 w-4 items-center justify-center"
                            >
                              {sortDirection === "asc" ? (
                                <ArrowUp data-slot="data-table-sort-icon" className="h-4 w-4" />
                              ) : sortDirection === "desc" ? (
                                <ArrowDown data-slot="data-table-sort-icon" className="h-4 w-4" />
                              ) : (
                                <ArrowUpDown
                                  data-slot="data-table-sort-icon"
                                  className="text-fg-muted h-4 w-4"
                                />
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
          <Table.Body data-slot="data-table-body">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Table.Row
                  data-slot="data-table-row"
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
                      "focus-visible:outline-border-focus cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px]",
                    compact && "h-10",
                    getRowClassName?.(row.original),
                  )}
                >
                  {selectable && (
                    <Table.Cell
                      data-slot="data-table-select-cell"
                      onClick={(e) => e.stopPropagation()}
                      className={compact ? "py-2" : "py-3.5"}
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
                      data-slot="data-table-cell"
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
              <Table.Row data-slot="data-table-empty-row">
                <Table.Cell
                  data-slot="data-table-empty-cell"
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="h-64 text-center"
                >
                  {emptyState || (
                    <div data-slot="data-table-empty" className="text-fg-muted">
                      {emptyMessage}
                    </div>
                  )}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>

      {paginated && (
        <div
          data-slot="data-table-footer"
          className="mt-4 flex flex-wrap items-center justify-between gap-4"
        >
          <div data-slot="data-table-summary" className="text-fg-muted text-sm">
            Showing{" "}
            {table.getFilteredRowModel().rows.length === 0
              ? 0
              : table.state.pagination.pageIndex * table.state.pagination.pageSize + 1}{" "}
            to{" "}
            {Math.min(
              (table.state.pagination.pageIndex + 1) * table.state.pagination.pageSize,
              table.getFilteredRowModel().rows.length,
            )}{" "}
            of {table.getFilteredRowModel().rows.length} results
            {selectable &&
              table.getFilteredSelectedRowModel().rows.length > 0 &&
              ` (${table.getFilteredSelectedRowModel().rows.length} selected)`}
          </div>

          <Pagination
            mode="button"
            page={table.state.pagination.pageIndex + 1}
            totalPages={table.getPageCount()}
            onPageChange={(p) => table.setPageIndex(p - 1)}
          />
        </div>
      )}
    </div>
  );
}
