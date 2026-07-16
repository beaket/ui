import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

function NavigationRoot({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav data-slot="navigation" aria-label="Main" className={cn("", className)} {...props} />;
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
        "inline-block px-3 py-1 text-left text-sm no-underline",
        "border-border-strong bg-bg-raised text-fg border",
        "shadow-offset hover:shadow-offset-hover active:shadow-offset-active",
        "hover:bg-bg-hover",
        "focus-visible:outline-border-focus focus-visible:outline-2 focus-visible:outline-offset-2",
        "transition-shadow duration-100",
        "data-[active]:text-fg-on-emphasis data-[active]:bg-bg-emphasis data-[active]:hover:bg-bg-emphasis data-[active]:shadow-none data-[active]:hover:shadow-none",
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
