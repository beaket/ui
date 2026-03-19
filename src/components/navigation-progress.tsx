import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface NavigationProgressProps extends React.ComponentProps<"div"> {
  /** Whether the progress bar is active */
  active: boolean;
}

/**
 * Indeterminate progress bar for page navigation.
 * Framework-agnostic — receives loading state via props.
 *
 * Requires the following CSS in your stylesheet:
 * ```css
 * @theme {
 *   --animate-navigation-progress: navigation-progress 1s ease-in-out infinite;
 * }
 * @keyframes navigation-progress {
 *   0% { transform: translateX(-100%); }
 *   100% { transform: translateX(400%); }
 * }
 * ```
 */
export function NavigationProgress({ active, className, ...props }: NavigationProgressProps) {
  if (!active) return null;

  return (
    <div
      data-slot="navigation-progress"
      role="progressbar"
      aria-label="Loading"
      className={cn("bg-chrome fixed top-0 right-0 left-0 z-50 h-0.5 overflow-hidden", className)}
      {...props}
    >
      <div className="animate-navigation-progress bg-ink h-full w-1/3 will-change-transform" />
    </div>
  );
}
