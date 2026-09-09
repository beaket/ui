import * as SliderPrimitive from "@radix-ui/react-slider";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface SliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  /** Accessible names for automatic thumbs; use Slider.Thumb to compose your own. */
  thumbLabels?: string[];
}

function SliderRoot({
  className,
  children,
  value,
  defaultValue,
  min = 0,
  thumbLabels,
  ...props
}: SliderProps) {
  const initial = defaultValue ?? [min];
  const values = value ?? initial;
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      value={value}
      defaultValue={initial}
      min={min}
      className={cn(
        "relative flex min-h-11 w-full touch-none items-center select-none data-[disabled]:cursor-not-allowed data-[orientation=vertical]:h-48 data-[orientation=vertical]:w-11 data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          {values.map((_, index) => (
            <SliderThumb
              key={index}
              aria-label={
                thumbLabels?.[index] ?? (values.length === 1 ? "Value" : `Value ${index + 1}`)
              }
            />
          ))}
        </>
      )}
    </SliderPrimitive.Root>
  );
}

export type SliderTrackProps = React.ComponentProps<typeof SliderPrimitive.Track>;
export function SliderTrack({ className, ...props }: SliderTrackProps) {
  return (
    <SliderPrimitive.Track
      data-slot="slider-track"
      className={cn(
        "border-border bg-bg-input data-[disabled]:border-border-muted data-[disabled]:bg-bg-disabled relative grow overflow-hidden border data-[disabled]:border-dashed data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2",
        className,
      )}
      {...props}
    />
  );
}

export type SliderRangeProps = React.ComponentProps<typeof SliderPrimitive.Range>;
export function SliderRange({ className, ...props }: SliderRangeProps) {
  return (
    <SliderPrimitive.Range
      data-slot="slider-range"
      className={cn(
        "bg-bg-emphasis data-[disabled]:bg-border-muted absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
        className,
      )}
      {...props}
    />
  );
}

export type SliderThumbProps = React.ComponentProps<typeof SliderPrimitive.Thumb>;
export function SliderThumb({ className, ...props }: SliderThumbProps) {
  return (
    <SliderPrimitive.Thumb
      data-slot="slider-thumb"
      className={cn(
        "border-border bg-bg-input relative block size-5 border before:absolute before:inset-[-13px] before:content-['']",
        "hover:shadow-offset-action focus-visible:outline-border-focus cursor-grab focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-x-px active:translate-y-px active:cursor-grabbing active:shadow-none",
        "data-[disabled]:border-border-muted data-[disabled]:bg-bg-disabled data-[disabled]:translate-none data-[disabled]:cursor-not-allowed data-[disabled]:border-dashed data-[disabled]:shadow-none",
        className,
      )}
      {...props}
    />
  );
}

export const Slider = Object.assign(SliderRoot, {
  Track: SliderTrack,
  Range: SliderRange,
  Thumb: SliderThumb,
});
