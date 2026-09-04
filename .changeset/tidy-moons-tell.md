---
"@beaket/ui": minor
---

`DataTable` is a flexible compound over the TanStack instance

`DataTableProps` exposes **20 configuration props** — among them `emptyMessage` _and_ `emptyState`; `onRowClick`, `onRowMouseEnter`, `onRowMouseLeave`; `getRowClassName`. That is the mechanical result of answering layout questions with props instead of with children, and by Ousterhout's measure it makes DataTable a shallow _logic_ component: real complexity behind a wide interface, so the consumer pays twice — once to learn it, again when the 21st need is not on the list.

The root now builds the TanStack `table` object and hands it back; the parts read it:

```tsx
<DataTable columns={columns} data={data} searchable paginated>
  {(table) => (
    <>
      <DataTable.Toolbar searchPlaceholder="Filter people…" />
      <DataTable.Table>
        <DataTable.Head />
        <DataTable.Body>
          {table.getRowModel().rows.map((row) => (
            <DataTable.Row key={row.id} row={row} className={rowClass(row)} onMouseEnter={…} />
          ))}
        </DataTable.Body>
      </DataTable.Table>
      <DataTable.Pagination />
    </>
  )}
</DataTable>
```

`emptyMessage`/`emptyState` become `DataTable.Empty`; `getRowClassName`, `onRowMouseEnter` and `onRowMouseLeave` become ordinary props on your own `<DataTable.Row>`.

Additive: all 20 props keep working and now lay out exactly these parts, so the sugar path and the composed path render the same DOM by construction. Removing any of the 20 is a separate breaking decision.
