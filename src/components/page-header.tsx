import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface PageHeaderProps {
  /** Page title text */
  title: string;
  /** Optional item count to display next to the title */
  count?: number;
  /** Action elements (buttons, etc.) rendered on the right side */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function PageHeader({ title, count, children, className }: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        "border-chrome flex shrink-0 items-center justify-between border-b px-6 py-4",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <h1 className="text-sm leading-none font-medium">{title}</h1>
        {count !== undefined && <span className="text-steel text-xs">({count})</span>}
      </div>
      {children}
    </header>
  );
}
