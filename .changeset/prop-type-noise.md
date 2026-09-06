---
"@beaket/ui": patch
---

Remove `className` redeclarations from six component prop types

`AvatarProps`, `CheckboxProps`, `RadioGroupProps`, `RadioItemProps`,
`SwitchProps`, and `TextareaProps` each redeclared `className?: string` inside an
interface already extending a props type that provides it. It reached no
consumer and no docs table — the props generator excludes `className`. Types are
unchanged. `CheckboxProps`, `RadioGroupProps`, and `RadioItemProps` are now type
aliases, matching `LabelProps`.

`PaginationBaseProps` and `DataTableProps` keep theirs: neither extends a DOM
props type, so the declaration is the only source.
