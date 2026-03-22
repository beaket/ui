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

interface TabsListProps extends React.ComponentProps<typeof TabsPrimitive.List> {
  /** Add offset shadow to the tabs list */
  shadow?: boolean;
}

function TabsList({ className, shadow, ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "border-chrome bg-frost text-ink inline-flex h-9 w-fit items-center justify-center border p-[3px]",
        shadow && "shadow-offset",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 px-2 py-1 text-sm font-medium whitespace-nowrap transition-colors",
        "text-ink border border-transparent",
        "data-[state=active]:bg-branch data-[state=active]:text-paper",
        "focus-visible:outline-signal-blue focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:border-chrome disabled:bg-frost disabled:text-steel disabled:pointer-events-none disabled:border-dashed",
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
