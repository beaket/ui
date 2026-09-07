"use client";

import { Slot } from "@radix-ui/react-slot";
import { type ClassValue, clsx } from "clsx";
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

interface NavigationContextValue {
  value?: string;
  match: "exact" | "prefix";
  matchedValue?: string;
  isActive?: (pathname: string, value: string) => boolean;
  register: (id: string, value: string) => () => void;
}

const NavigationValueContext = createContext<NavigationContextValue | undefined>(undefined);
// Optional: explicit active links continue to work without a root.
const useNavigationValue = () => useContext(NavigationValueContext);
const routePath = (value: string) => value.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";

export interface NavigationProps extends React.ComponentProps<"nav"> {
  /** The current page's value. `Navigation.Link` compares its own `value` to it. */
  value?: string;
  /** Exact by default. Prefix selects the longest segment-boundary match after links mount. */
  match?: "exact" | "prefix";
  /** Custom router matching. Explicit active on a link still wins. */
  isActive?: (pathname: string, value: string) => boolean;
}

function NavigationRoot({
  className,
  value,
  match = "exact",
  isActive,
  ...props
}: NavigationProps) {
  const [links, setLinks] = useState(() => new Map<string, string>());
  const register = useCallback((id: string, linkValue: string) => {
    setLinks((previous) => new Map(previous).set(id, linkValue));
    return () =>
      setLinks((previous) => {
        const next = new Map(previous);
        next.delete(id);
        return next;
      });
  }, []);
  const context = useMemo(() => {
    let matchedValue: string | undefined;
    if (match === "prefix" && value !== undefined) {
      const pathname = routePath(value);
      for (const candidate of links.values()) {
        const prefix = routePath(candidate);
        if (
          (pathname === prefix || pathname.startsWith(prefix === "/" ? "/" : `${prefix}/`)) &&
          (matchedValue === undefined || prefix.length > routePath(matchedValue).length)
        )
          matchedValue = candidate;
      }
    }
    return { value, match, matchedValue, isActive, register };
  }, [value, match, links, isActive, register]);
  return (
    <NavigationValueContext.Provider value={context}>
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
  const context = useNavigationValue();
  const id = useId();
  const register = context?.register;
  const registerPrefix = context?.match === "prefix" && !context.isActive && active === undefined;
  useEffect(() => {
    if (registerPrefix && value !== undefined) return register?.(id, value);
  }, [registerPrefix, register, id, value]);
  const isActive =
    active ??
    (value !== undefined &&
      context?.value !== undefined &&
      (context.isActive
        ? context.isActive(context.value, value)
        : context.match === "prefix"
          ? context.matchedValue === value
          : context.value === value));
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
