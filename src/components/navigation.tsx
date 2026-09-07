"use client";

import { Slot } from "@radix-ui/react-slot";
import { type ClassValue, clsx } from "clsx";
import { createContext, useContext } from "react";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// The current page is one answer, not one answer per link. The root holds it;
// `Navigation.Link` compares its own `value` and derives `active` itself.
//
// Optional by construction: the default is `undefined`, so a `Navigation.Link`
// used with an explicit `active` — inside a root that sets no `value`, or
// outside a root entirely — keeps working exactly as before. That is why this
// accessor does not throw the way §1.4's rule 2 asks: throwing here would
// *require more* of existing callers, which Part 3's growth rule forbids.
// The value is a primitive, so there is nothing to memoize by hand (§1.4 rule 3
// is about object values).
const NavigationValueContext = createContext<string | undefined>(undefined);

const useNavigationValue = () => useContext(NavigationValueContext);

export interface NavigationProps extends React.ComponentProps<"nav"> {
  /** The current page's value. `Navigation.Link` compares its own `value` to it. */
  value?: string;
}

function NavigationRoot({ className, value, ...props }: NavigationProps) {
  return (
    <NavigationValueContext.Provider value={value}>
      <nav data-slot="navigation" aria-label="Main" className={cn("", className)} {...props} />
    </NavigationValueContext.Provider>
  );
}

// One fused instrument: links share neutral hairline borders. Selection owns
// the lens; the strip itself spends no standing accent. Vertical layouts swap the fusion axis:
// `flex-col [&>li+li]:border-l [&>li+li]:-mt-px`.
function NavigationList({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="navigation-list"
      className={cn("!m-0 inline-flex list-none !p-0 [&>li+li]:border-l-0", className)}
      {...props}
    />
  );
}

function NavigationItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="navigation-item"
      className={cn("border-border-muted !m-0 border", className)}
      {...props}
    />
  );
}

export interface NavigationLinkProps extends React.ComponentProps<"a"> {
  /** Whether this link represents the current page. Overrides the derived state. */
  active?: boolean;
  /** This link's value, compared against the root's `value` to derive `active`. */
  value?: string;
  /** Renders the consumer's own element (a router `Link`) instead of an `<a>` */
  asChild?: boolean;
}

// The current page is not stamped in ink — it sits under a glass lens plate:
// hairline top/left rim, ink bottom/right rim (ink gathers where every shadow
// in the system falls), and the faintest accent wash. The plate lies beneath
// the type, so the label keeps full ink density. Pressing any other link
// travels its label 1px like an instrument key.
function NavigationLink({
  className,
  active,
  value,
  asChild = false,
  children,
  ...props
}: NavigationLinkProps) {
  const currentValue = useNavigationValue();
  const isActive = active ?? (value !== undefined && value === currentValue);
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      data-slot="navigation-link"
      data-active={isActive || undefined}
      className={cn(
        "group relative isolate flex h-8 items-center px-3.5 text-sm no-underline",
        "text-fg",
        "before:absolute before:inset-[-8px] before:content-['']",
        "focus-visible:outline-border-focus focus-visible:z-[2] focus-visible:outline-2 focus-visible:outline-offset-2",
        "transition-colors duration-100",
        isActive
          ? "after:border-t-border-muted after:border-l-border-muted after:border-r-border-strong after:border-b-border-strong after:bg-accent-bg-subtle cursor-default after:absolute after:inset-1 after:-z-[1] after:border after:content-['']"
          : "hover:bg-bg-hover active:bg-bg-active cursor-pointer",
        className,
      )}
      aria-current={isActive ? "page" : undefined}
      {...props}
    >
      {/* Under `asChild` the child owns its tag and its content — the press-travel
          wrapper is ours to inject, so it is skipped, the way Button skips its
          spinner. */}
      {asChild ? (
        children
      ) : (
        <span
          className={cn(
            "inline-flex items-center",
            !isActive &&
              "transition-transform duration-100 group-active:translate-x-px group-active:translate-y-px",
          )}
        >
          {children}
        </span>
      )}
    </Comp>
  );
}

export { NavigationItem, NavigationLink, NavigationList };

export const Navigation = Object.assign(NavigationRoot, {
  List: NavigationList,
  Item: NavigationItem,
  Link: NavigationLink,
});
