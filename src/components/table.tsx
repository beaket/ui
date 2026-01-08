import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface TableProps extends React.ComponentProps<"table"> {
  /** Add offset shadow to the table */
  shadow?: boolean;
}

export function Table({ className, shadow, ...props }: TableProps) {
  return (
    <table
      data-slot="table"
      className={cn(
        "w-full caption-bottom text-sm tabular-nums",
        shadow && "shadow-offset",
        className,
      )}
      {...props}
    />
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "[&_tr]:border-b [&_tr]:border-[var(--graphite)] [&_tr]:bg-[var(--frost)]",
        className,
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-[var(--chrome)] bg-[var(--frost)] font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-[var(--chrome)] bg-white hover:bg-[var(--frost)] data-[state=selected]:bg-[var(--platinum)]",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-9 px-1.5 py-1 text-left align-middle font-semibold whitespace-nowrap text-[var(--ink)] [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-1.5 py-1 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableSectionHeader({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-section-header"
      className={cn(
        "bg-[var(--platinum)] [&>th]:border-y [&>th]:border-[var(--chrome)] [&>th]:px-1.5 [&>th]:py-1 [&>th]:font-semibold",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-[var(--steel)]", className)}
      {...props}
    />
  );
}

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Footer = TableFooter;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;
Table.SectionHeader = TableSectionHeader;
Table.Caption = TableCaption;
