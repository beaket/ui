import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export type LabelProps = React.ComponentProps<"label">;

export function Label({ className, ...props }: LabelProps) {
  return (
    // The control association arrives as `htmlFor` from the caller; the eslint
    // `components: { Label: "label" }` setting audits those call sites.
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label
      data-slot="label"
      className={cn("text-fg block text-sm font-medium", className)}
      {...props}
    />
  );
}
