import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/**
 * Loading placeholder. The block breathes one step along the neutral ramp
 * (`bg-hover` ↔ `bg-active`) rather than fading, because nothing in this system
 * uses opacity as a styling device — a fading placeholder dims the page behind
 * it instead of re-inking the block.
 *
 * `npx @beaket/ui init` installs the animation CSS below automatically.
 * Only add it manually when copying this component without running init:
 * ```css
 * @theme {
 *   --animate-skeleton-pulse: skeleton-pulse 2s ease-in-out infinite;
 * }
 * @keyframes skeleton-pulse {
 *   0%, 100% { background-color: var(--color-bg-hover); }
 *   50% { background-color: var(--color-bg-active); }
 * }
 * ```
 *
 * The keyframes set `background-color`, so a `className` background is painted
 * over while the animation runs. Recolor by editing the keyframes above — you
 * own this file. Note that `animate-none` does not turn the animation off:
 * tailwind-merge cannot dedupe a custom `animate-*` utility against it, the
 * same way `shadow-none` cannot opt a variant out of `shadow-offset-action`.
 * Use `style={{ animation: "none" }}` if you need it stopped from the outside.
 *
 * `prefers-reduced-motion: reduce` already collapses it globally in
 * `foundation.css`, which lands the block on `bg-hover`.
 */
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      role="status"
      aria-label="Loading"
      className={cn("bg-bg-hover animate-skeleton-pulse", className)}
      {...props}
    />
  );
}
