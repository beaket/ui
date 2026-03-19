import { type ClassValue, clsx } from "clsx";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface ViewToggleItem<T extends string> {
  /** Value identifier for this option */
  value: T;
  /** Icon to display */
  icon: ReactNode;
  /** Accessible label for the button */
  label?: string;
}

export interface ViewToggleProps<T extends string> {
  /** Currently selected value */
  value: T;
  /** Callback when selection changes */
  onChange: (value: T) => void;
  /** Toggle options */
  items: ViewToggleItem<T>[];
  /** Additional CSS classes */
  className?: string;
}

export function ViewToggle<T extends string>({
  value,
  onChange,
  items,
  className,
}: ViewToggleProps<T>) {
  return (
    <div data-slot="view-toggle" className={cn("border-chrome flex h-8 border", className)}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            "flex items-center justify-center px-2 [&_svg]:size-4",
            value === item.value ? "bg-ink text-paper" : "hover:bg-frost",
          )}
          aria-label={item.label}
          aria-pressed={value === item.value}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}
