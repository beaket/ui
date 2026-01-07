import { type ClassValue, clsx } from "clsx";
import {
  AlertCircle,
  FileQuestion,
  FolderOpen,
  Inbox,
  type LucideIcon,
  Search,
  Users,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const iconMap = {
  inbox: Inbox,
  "alert-circle": AlertCircle,
  search: Search,
  "file-question": FileQuestion,
  "folder-open": FolderOpen,
  users: Users,
} as const;

type IconName = keyof typeof iconMap;

export interface BlankSlateProps {
  /**
   * Icon to display above the title. Can be a preset name or a custom LucideIcon component.
   */
  icon?: IconName | LucideIcon;

  /**
   * Main heading text
   */
  title: string;

  /**
   * Supporting description text
   */
  description: string;

  /**
   * Optional action buttons or links
   */
  children?: React.ReactNode;

  /**
   * Additional CSS class for the container
   */
  className?: string;
}

export function BlankSlate({ icon, title, description, children, className }: BlankSlateProps) {
  let IconComponent: LucideIcon | null = null;

  if (icon) {
    if (typeof icon === "string") {
      IconComponent = iconMap[icon];
    } else {
      IconComponent = icon;
    }
  }

  return (
    <div data-slot="blank-slate" className={cn("py-12 text-center", className)}>
      {IconComponent && (
        <div data-slot="blank-slate-icon" className="mb-4 flex justify-center text-[var(--steel)]">
          <IconComponent size={48} />
        </div>
      )}
      <h1 data-slot="blank-slate-title" className="mb-2 text-2xl font-bold text-[var(--ink)]">
        {title}
      </h1>
      <p data-slot="blank-slate-description" className="mb-4 text-[var(--steel)]">
        {description}
      </p>
      {children && (
        <div data-slot="blank-slate-actions" className="flex justify-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
