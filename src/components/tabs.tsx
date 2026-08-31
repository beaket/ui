import * as TabsPrimitive from "@radix-ui/react-tabs";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

function TabsRoot({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

// One fused instrument: triggers share neutral hairline borders. Selection owns
// the lens; the strip itself spends no standing accent.
function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("inline-flex w-fit items-center", className)}
      {...props}
    />
  );
}

// The selected tab is not stamped in ink — it sits under a glass lens plate:
// hairline top/left rim, ink bottom/right rim, the faintest accent wash. The
// plate lies beneath the type, so the label keeps full ink density. There is no
// press-travel here: Radix activates a tab on mousedown, so pressing *is*
// selecting — the key never gets a painted frame between "pressed" and "the
// plate". The switch is snappy on purpose; only the surface tint transitions.
function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "group relative isolate flex h-8 items-center justify-center gap-1.5 border px-3.5 text-sm font-medium whitespace-nowrap",
        "border-border-muted text-fg -ml-px first:ml-0",
        "before:absolute before:inset-[-8px] before:content-['']",
        "focus-visible:outline-border-focus focus-visible:z-[2] focus-visible:outline-2 focus-visible:outline-offset-2",
        "transition-colors duration-100",
        "data-[state=active]:after:border-t-border-muted data-[state=active]:after:border-l-border-muted data-[state=active]:after:border-r-border-strong data-[state=active]:after:border-b-border-strong data-[state=active]:after:bg-accent-bg-subtle data-[state=active]:cursor-default data-[state=active]:after:absolute data-[state=active]:after:inset-1 data-[state=active]:after:-z-[1] data-[state=active]:after:border data-[state=active]:after:content-['']",
        "enabled:data-[state=inactive]:hover:bg-bg-hover enabled:data-[state=inactive]:active:bg-bg-active enabled:data-[state=inactive]:cursor-pointer",
        "disabled:text-fg-disabled disabled:cursor-not-allowed",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});
