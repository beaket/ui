import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface PageHeaderProps extends React.ComponentProps<"header"> {
  /** Page title text */
  title: string;
  /** Optional item count to display next to the title */
  count?: number;
}

export function PageHeader({ title, count, children, className, ...props }: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        "border-chrome flex shrink-0 items-center justify-between border-b px-6 py-4",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <h1 className="text-sm leading-none font-medium">{title}</h1>
        {count !== undefined && <span className="text-steel text-xs">({count})</span>}
      </div>
      {children}
    </header>
  );
}
