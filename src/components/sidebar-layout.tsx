import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

function SidebarLayoutRoot({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-layout"
      className={cn("flex flex-col gap-6 lg:flex-row", className)}
      {...props}
    />
  );
}

function SidebarLayoutContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-layout-content"
      className={cn("min-w-0 flex-1", className)}
      {...props}
    />
  );
}

function SidebarLayoutSidebar({ className, ...props }: React.ComponentProps<"aside">) {
  return (
    <aside
      data-slot="sidebar-layout-sidebar"
      className={cn("w-full shrink-0 space-y-6 lg:w-[280px]", className)}
      {...props}
    />
  );
}

export const SidebarLayout = Object.assign(SidebarLayoutRoot, {
  Content: SidebarLayoutContent,
  Sidebar: SidebarLayoutSidebar,
});
