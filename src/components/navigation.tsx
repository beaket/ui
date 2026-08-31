import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

function NavigationRoot({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav data-slot="navigation" aria-label="Main" className={cn("", className)} {...props} />;
}

// One fused instrument: links share neutral hairline borders. Selection owns
// the lens; the strip itself spends no standing accent. Vertical layouts swap the fusion axis:
// `flex-col [&>li+li]:ml-0 [&>li+li]:-mt-px`.
function NavigationList({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="navigation-list"
      className={cn("m-0 inline-flex list-none p-0 [&>li+li]:-ml-px", className)}
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

// The current page is not stamped in ink — it sits under a glass lens plate:
// hairline top/left rim, ink bottom/right rim (ink gathers where every shadow
// in the system falls), and the faintest accent wash. The plate lies beneath
// the type, so the label keeps full ink density. Pressing any other link
// travels its label 1px like an instrument key.
function NavigationLink({ className, active, children, ...props }: NavigationLinkProps) {
  return (
    <a
      data-slot="navigation-link"
      data-active={active || undefined}
      className={cn(
        "group relative isolate flex h-8 items-center border px-3.5 text-sm no-underline",
        "border-border-muted text-fg",
        "before:absolute before:inset-[-8px] before:content-['']",
        "focus-visible:outline-border-focus focus-visible:z-[2] focus-visible:outline-2 focus-visible:outline-offset-2",
        "transition-colors duration-100",
        active
          ? "after:border-t-border-muted after:border-l-border-muted after:border-r-border-strong after:border-b-border-strong after:bg-accent-bg-subtle cursor-default after:absolute after:inset-1 after:-z-[1] after:border after:content-['']"
          : "hover:bg-bg-hover active:bg-bg-active cursor-pointer",
        className,
      )}
      aria-current={active ? "page" : undefined}
      {...props}
    >
      <span
        className={cn(
          "inline-flex items-center",
          !active &&
            "transition-transform duration-100 group-active:translate-x-px group-active:translate-y-px",
        )}
      >
        {children}
      </span>
    </a>
  );
}

export const Navigation = Object.assign(NavigationRoot, {
  List: NavigationList,
  Item: NavigationItem,
  Link: NavigationLink,
});
