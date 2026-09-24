import { Button } from "@/components/button";

interface Target {
  href: string;
  label: string;
}

/**
 * Previous / next between sibling pages, built from the Button this site
 * documents. It lives in React rather than inline in the Astro page because
 * `asChild` clones a React element: an Astro-slotted child is not one, so the
 * Slot silently drops the button's props and you get a bare `<a>`.
 */
export function PageNav({
  prev,
  next,
  label,
}: {
  prev?: Target | null;
  next?: Target | null;
  label: string;
}) {
  return (
    <nav className="page-nav" aria-label={label}>
      {prev ? (
        <Button asChild variant="outline">
          <a href={prev.href}>← {prev.label}</a>
        </Button>
      ) : (
        <span />
      )}
      {next ? (
        <Button asChild variant="outline">
          <a href={next.href}>{next.label} →</a>
        </Button>
      ) : (
        <span />
      )}
    </nav>
  );
}
