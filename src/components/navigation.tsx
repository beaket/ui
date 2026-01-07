import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

function NavigationRoot({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav data-slot="navigation" className={cn("", className)} {...props} />;
}

function NavigationList({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="navigation-list"
      className={cn("m-0 flex list-none gap-2 p-0", className)}
      {...props}
    />
  );
}

function NavigationItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="navigation-item" className={cn("", className)} {...props} />;
}

interface NavigationLinkProps extends React.ComponentProps<"a"> {
  /** Whether this link represents the current page */
  active?: boolean;
}

function NavigationLink({ className, active, ...props }: NavigationLinkProps) {
  return (
    <a
      data-slot="navigation-link"
      data-active={active || undefined}
      className={cn(
        "inline-block min-w-[80px] px-4 py-1 text-center text-sm no-underline",
        "border border-[var(--graphite)] bg-white text-[var(--ink)]",
        "shadow-offset hover:shadow-offset-hover",
        "hover:bg-[var(--frost)]",
        "data-[active]:bg-[var(--ink)] data-[active]:text-[var(--paper)]",
        className,
      )}
      aria-current={active ? "page" : undefined}
      {...props}
    />
  );
}

export const Navigation = Object.assign(NavigationRoot, {
  List: NavigationList,
  Item: NavigationItem,
  Link: NavigationLink,
});
