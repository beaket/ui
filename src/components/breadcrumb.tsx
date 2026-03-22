import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

function BreadcrumbRoot({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="breadcrumb"
      aria-label="Breadcrumb"
      className={cn("text-sm", className)}
      {...props}
    />
  );
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

function BreadcrumbLink({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      data-slot="breadcrumb-link"
      className={cn(
        "text-signal-blue hover:text-ink underline",
        "focus-visible:outline-signal-blue focus-visible:outline-2 focus-visible:outline-offset-2",
        "relative before:absolute before:inset-[-8px] before:content-['']",
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbSeparator({ className, children, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-separator"
      className={cn("text-steel", className)}
      aria-hidden="true"
      {...props}
    >
      {children ?? "/"}
    </span>
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      className={cn("text-ink font-medium", className)}
      aria-current="page"
      {...props}
    />
  );
}

export const Breadcrumb = Object.assign(BreadcrumbRoot, {
  List: BreadcrumbList,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Separator: BreadcrumbSeparator,
  Page: BreadcrumbPage,
});
