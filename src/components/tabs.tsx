import * as TabsPrimitive from "@radix-ui/react-tabs";
import { type ClassValue, clsx } from "clsx";
import { Activity, createContext, useContext, useState } from "react";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// `keepMounted` needs to know which tab is current, and Radix does not hand
// that back. The root mirrors it — value and defaultValue still go to Radix
// untouched, so Radix stays in charge of selection and this only observes.
//
// The accessor deliberately does not throw on a missing provider (§1.4 rule 2):
// a Tabs.Content outside a root is Radix's error to raise, and throwing here
// would require more of callers who never opt into keepMounted.
const TabsValueContext = createContext<string | undefined>(undefined);

const useTabsValue = () => useContext(TabsValueContext);

function TabsRoot({
  className,
  value,
  defaultValue,
  onValueChange,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;

  return (
    <TabsValueContext.Provider value={currentValue}>
      <TabsPrimitive.Root
        data-slot="tabs"
        className={cn("flex flex-col gap-2", className)}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => {
          if (value === undefined) setInternalValue(next);
          onValueChange?.(next);
        }}
        {...props}
      />
    </TabsValueContext.Provider>
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

export interface TabsContentProps extends React.ComponentProps<typeof TabsPrimitive.Content> {
  /**
   * Keep this panel's state — scroll position, uncommitted input, anything in
   * a hook — while another tab is active. Off by default, which is Radix's
   * behavior: inactive panels unmount and their state is destroyed.
   *
   * Uses React 19.2's `<Activity mode="hidden">`, the middle ground between
   * unmounting and Radix's `forceMount`: state is preserved, effects are torn
   * down, and re-rendering is deprioritized. Requires React >= 19.2.
   */
  keepMounted?: boolean;
}

function TabsContent({
  className,
  keepMounted = false,
  value,
  children,
  ...props
}: TabsContentProps) {
  const currentValue = useTabsValue();

  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      value={value}
      forceMount={keepMounted || undefined}
      className={cn(
        "flex-1 outline-none",
        // Under forceMount Radix computes `present = forceMount || isSelected`
        // and renders `hidden={!present}` — so the panel element itself is never
        // hidden, and an inactive panel would sit in the flex layout and in the
        // a11y tree as an empty box. `data-state` is still correct under
        // forceMount, so the class does the hiding the attribute no longer can.
        // Without `keepMounted` nothing inactive renders, so this is inert.
        "data-[state=inactive]:hidden",
        className,
      )}
      {...props}
    >
      {keepMounted ? (
        <Activity mode={currentValue === value ? "visible" : "hidden"}>{children}</Activity>
      ) : (
        children
      )}
    </TabsPrimitive.Content>
  );
}

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});
