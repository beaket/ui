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
  type ReactTable,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Cell as TanStackCell,
  type ColumnDef as TanStackColumnDef,
  type Row as TanStackRow,
} from "@tanstack/react-table";
import { clsx, type ClassValue } from "clsx";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import {
  createContext,
  useContext,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";
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

export interface DataTableProps<TData extends RowData> {
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
  /**
   * Arrange the parts yourself instead of letting the props lay them out.
   * A function child receives the TanStack table instance (§11).
   */
  children?: React.ReactNode | ((table: DataTableInstance<TData>) => React.ReactNode);
}

/**
 * The TanStack table instance the root builds and every part reads.
 * `DataTable`'s children may be a function receiving it — the §11 way to hand
 * control back instead of adding a 21st prop.
 */
export type DataTableInstance<TData extends RowData> = ReactTable<typeof dataTableFeatures, TData>;

interface DataTableContextValue<TData extends RowData = RowData> {
  table: DataTableInstance<TData>;
  compact: boolean;
  selectable: boolean;
  /** Column count including the selection column — the empty row's colSpan. */
  columnCount: number;
  /**
   * The search field's own value. Not `table.state.globalFilter`, which is the
   * deferred one — the input must never lag behind the keystroke (F6).
   */
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
}

// §1.4: the context lives in this file, is never exported, and carries the one
// thing the parts cannot compute for themselves — the table instance. It adds
// no restrictions: every part still takes className and its element's props.
const DataTableContext = createContext<DataTableContextValue | null>(null);

// §1.4 rule 2: parts never call useContext directly.
function useDataTableContext<TData extends RowData>(part: string): DataTableContextValue<TData> {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error(`\`${part}\` must be used inside \`<DataTable>\``);
  }
  return context as DataTableContextValue<TData>;
}

export interface DataTableToolbarProps extends React.ComponentProps<"div"> {
  /** Placeholder for the default search field */
  searchPlaceholder?: string;
}

function DataTableToolbar({
  className,
  children,
  searchPlaceholder = "Search...",
  ...props
}: DataTableToolbarProps) {
  const { globalFilter, setGlobalFilter } = useDataTableContext("DataTable.Toolbar");

  return (
    <div
      data-slot="data-table-toolbar"
      className={cn("mb-4 flex items-center gap-2", className)}
      {...props}
    >
      {children ?? (
        <div data-slot="data-table-search" className="relative max-w-sm flex-1">
          <Search
            data-slot="data-table-search-icon"
            className="text-fg-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
            aria-label="Search"
          />
        </div>
      )}
    </div>
  );
}

function DataTableTable({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="data-table-container"
      className={cn("border-border bg-bg-raised overflow-x-auto border", className)}
      {...props}
    >
      <Table data-slot="data-table-table" className="min-w-full">
        {children}
      </Table>
    </div>
  );
}

function DataTableHead({ className, ...props }: React.ComponentProps<"thead">) {
  const { table, selectable } = useDataTableContext("DataTable.Head");

  return (
    <Table.Header data-slot="data-table-header" className={className} {...props}>
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
                          header.column.getToggleSortingHandler()?.(e as never);
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
                  <div data-slot="data-table-head-content" className="flex items-center gap-2">
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
  );
}

function DataTableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <Table.Body data-slot="data-table-body" className={className} {...props} />;
}

export interface DataTableRowProps<TData extends RowData> extends React.ComponentProps<"tr"> {
  /** The row this cell group renders. Cells are derived from it. */
  row: Row<TData>;
}

function DataTableRow<TData extends RowData>({
  row,
  className,
  children,
  ...props
}: DataTableRowProps<TData>) {
  const { compact, selectable } = useDataTableContext<TData>("DataTable.Row");

  return (
    <Table.Row
      data-slot="data-table-row"
      data-state={row.getIsSelected() && "selected"}
      className={cn(compact && "h-10", className)}
      {...props}
    >
      {children ?? (
        <>
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
        </>
      )}
    </Table.Row>
  );
}

export interface DataTableEmptyProps extends React.ComponentProps<"tr"> {
  /** Message shown when no children are supplied */
  message?: string;
}

function DataTableEmpty({
  className,
  children,
  message = "No data available",
  ...props
}: DataTableEmptyProps) {
  const { columnCount } = useDataTableContext("DataTable.Empty");

  return (
    <Table.Row data-slot="data-table-empty-row" className={className} {...props}>
      <Table.Cell
        data-slot="data-table-empty-cell"
        colSpan={columnCount}
        className="h-64 text-center"
      >
        {children ?? (
          <div data-slot="data-table-empty" className="text-fg-muted">
            {message}
          </div>
        )}
      </Table.Cell>
    </Table.Row>
  );
}

function DataTablePagination({ className, ...props }: React.ComponentProps<"div">) {
  const { table, selectable } = useDataTableContext("DataTable.Pagination");
  const filteredCount = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.state.pagination;
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div
      data-slot="data-table-footer"
      className={cn("mt-4 flex flex-wrap items-center justify-between gap-4", className)}
      {...props}
    >
      <div data-slot="data-table-summary" className="text-fg-muted text-sm">
        Showing {filteredCount === 0 ? 0 : pageIndex * pageSize + 1} to{" "}
        {Math.min((pageIndex + 1) * pageSize, filteredCount)} of {filteredCount} results
        {selectable && selectedCount > 0 && ` (${selectedCount} selected)`}
      </div>

      <Pagination
        mode="button"
        page={pageIndex + 1}
        totalPages={table.getPageCount()}
        onPageChange={(p) => table.setPageIndex(p - 1)}
      />
    </div>
  );
}

/**
 * A data table component built on TanStack Table.
 * Features sorting, filtering, pagination, and row selection.
 *
 * The 20 configuration props below are sugar (§2) over the parts: pass children
 * — or a function receiving the TanStack instance — to arrange
 * `DataTable.Toolbar`, `.Table`, `.Head`, `.Body`, `.Row`, `.Empty` and
 * `.Pagination` yourself. `getRowClassName`, `onRowMouseEnter` and
 * `onRowMouseLeave` are then just props on your own `<DataTable.Row>`.
 */
function DataTableRoot<TData extends RowData>({
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
  children,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(
    initialColumnVisibility || {},
  );
  const [globalFilter, setGlobalFilter] = useState("");
  // F6: the search input stays bound to the immediate value so typing is never
  // blocked; the whole-table filter pass lags by one render, by design.
  const deferredGlobalFilter = useDeferredValue(globalFilter);
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
      globalFilter: deferredGlobalFilter,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
  });

  // F2: both hand-rolled "latest ref" writes happened during render, which React
  // tells you not to do and which React Compiler refuses to optimize past.
  // useEffectEvent is the official replacement for exactly this shape — an
  // Effect calling the freshest callback without listing it as a dependency —
  // and it closes over the freshest `table` too, so the tableRef goes with it.
  const emitSelectionChange = useEffectEvent(() => {
    onSelectionChange?.(table.getFilteredSelectedRowModel().rows.map((row) => row.original));
  });

  useEffect(() => {
    if (selectable) emitSelectionChange();
  }, [rowSelection, selectable]);

  const context = useMemo(
    // Memoized by hand: React Compiler runs in the consumer's build, which we
    // do not control (F3).
    () => ({
      table: table as DataTableInstance<RowData>,
      compact,
      selectable,
      columnCount: columns.length + (selectable ? 1 : 0),
      globalFilter,
      setGlobalFilter,
    }),
    [table, compact, selectable, columns.length, globalFilter],
  );

  const rows = table.getRowModel().rows;

  return (
    <DataTableContext.Provider value={context}>
      <div data-slot="data-table" className={className}>
        {children !== undefined ? (
          typeof children === "function" ? (
            children(table)
          ) : (
            children
          )
        ) : (
          <>
            {/* §2 sugar over the parts, byte-identical to the old output. */}
            {searchable && <DataTableToolbar searchPlaceholder={searchPlaceholder} />}

            <DataTableTable>
              <DataTableHead />
              <DataTableBody>
                {rows.length ? (
                  rows.map((row) => (
                    <DataTableRow
                      key={row.id}
                      row={row}
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
                        getRowClassName?.(row.original),
                      )}
                    />
                  ))
                ) : (
                  <DataTableEmpty message={emptyMessage}>{emptyState}</DataTableEmpty>
                )}
              </DataTableBody>
            </DataTableTable>

            {paginated && <DataTablePagination />}
          </>
        )}
      </div>
    </DataTableContext.Provider>
  );
}

export const DataTable = Object.assign(DataTableRoot, {
  Toolbar: DataTableToolbar,
  Table: DataTableTable,
  Head: DataTableHead,
  Body: DataTableBody,
  Row: DataTableRow,
  Empty: DataTableEmpty,
  Pagination: DataTablePagination,
});
