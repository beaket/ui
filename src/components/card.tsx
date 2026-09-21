import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// A card is a surface, not a template — and a sheet laid on the page, not a box
// drawn on it. Its identity is the material: square corners, the fill step that
// lifts it off the stock, and the drawn grey offset shade that says how far.
// Never an imposed header/body/footer; content is whatever you pour in, and the
// padding + column gap make raw children sit right with no ceremony.
//
// It carries no resting stroke. A border here would only repeat what the surface
// already said, and repeating it at every nesting level is what made a dense
// screen unreadable. `flat` therefore means flush: on a raised parent it has no
// mark of its own, which is what no elevation should look like.
//
// Exactly one shadow utility may ever land in the class list: twMerge can't
// dedupe custom shadow utilities against one another, so the grey shade (per
// elevation) and the pressable accent edge are assigned through mutually
// exclusive compound variants rather than layered and overridden.
const cardVariants = cva("bg-bg-raised text-fg flex flex-col gap-4 p-5", {
  variants: {
    elevation: {
      flat: "",
      shade: "",
      overlay: "bg-bg-overlay",
    },
    interactive: {
      true: "cursor-pointer transition-[box-shadow,translate] duration-100 active:translate-x-px active:translate-y-px focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-2",
      false: "",
    },
  },
  compoundVariants: [
    // Passive surface — the quiet grey shade, one drawn level per elevation.
    { interactive: false, elevation: "shade", class: "shadow-offset" },
    { interactive: false, elevation: "overlay", class: "shadow-offset-overlay" },
    // Pressable — raised at rest like any other sheet, then the shade turns
    // accent on hover: the surface does not appear, it changes voice. Without
    // a resting shade a borderless interactive card would be invisible until
    // hovered. Focus owns the outer outline; pressing drops it onto the edge.
    {
      interactive: true,
      class: "shadow-offset hover:bg-bg-overlay hover:shadow-offset-action active:shadow-none",
    },
  ],
  defaultVariants: { elevation: "shade", interactive: false },
});

export interface CardRootProps extends React.ComponentProps<"div"> {
  /** flat | shade | overlay. How the surface lifts off the page — the drawn grey offset shade by default */
  elevation?: "flat" | "shade" | "overlay";
  /** Turn the whole card into a pressable link: an accent edge appears on hover and drops when pressed */
  interactive?: boolean;
  /** Merge props onto the immediate child (e.g. an `<a>`) instead of rendering a div — for a card that is itself a link */
  asChild?: boolean;
}

function CardRoot({ className, elevation, interactive, asChild = false, ...props }: CardRootProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="card"
      className={cn(cardVariants({ elevation, interactive }), className)}
      {...props}
    />
  );
}

// Edge-to-edge — cancels the root's padding so media and full-width rules reach
// the card's edges. As the first/last child it also clears the top/bottom
// padding (couples to the root's `p-5`; override alongside it if you change it).
function CardSection({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-section"
      className={cn("-mx-5 first:-mt-5 last:-mb-5", className)}
      {...props}
    />
  );
}

// The parts below are optional layout helpers, never the required anatomy. They
// carry no padding of their own — the root already pads and gaps them — so
// reach for them only when you want the ruled-header/footer reading.
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, children, ...props }: React.ComponentProps<"h4">) {
  return (
    // leading-none clipped its own descenders — measured +1.13px of overflow on
    // a Latin title, before any script with a deeper glyph body is considered.
    <h4 data-slot="card-title" className={cn("leading-tight font-semibold", className)} {...props}>
      {children}
    </h4>
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p data-slot="card-description" className={cn("text-fg-muted text-sm", className)} {...props} />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn(className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-footer" className={cn("flex items-center gap-2", className)} {...props} />
  );
}

export { CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardSection, CardTitle };

export const Card = Object.assign(CardRoot, {
  Section: CardSection,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Action: CardAction,
  Content: CardContent,
  Footer: CardFooter,
});
