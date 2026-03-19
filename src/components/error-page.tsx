import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface ErrorPageProps {
  /** Status code or error identifier to display */
  code: string | number;
  /** Error message to display */
  message: string;
  /** Optional action element (e.g., a Button with a link) */
  action?: React.ReactNode;
  /** Optional logo element rendered at the top */
  logo?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function ErrorPage({ code, message, action, logo, className }: ErrorPageProps) {
  return (
    <main data-slot="error-page" className={cn("bg-paper flex min-h-screen flex-col", className)}>
      {logo && <div className="flex justify-center pt-8">{logo}</div>}
      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-24">
        <h1 className="text-ink text-[3.5rem] leading-none font-light tracking-tight md:text-[4.5rem]">
          {code}
        </h1>
        <p className="text-ink mt-4 text-center text-lg">{message}</p>
        {action && <div className="mt-12">{action}</div>}
      </div>
    </main>
  );
}
