import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface BlockquoteProps extends React.HTMLAttributes<HTMLQuoteElement> {
  /** URL source for the quote */
  cite?: string;
  /** Name of the person being quoted */
  author?: string;
  /** Title or role of the author */
  authorTitle?: string;
}

export function Blockquote({
  className,
  children,
  cite,
  author,
  authorTitle,
  ...props
}: BlockquoteProps) {
  return (
    <blockquote
      data-slot="blockquote"
      className={cn("border-graphite my-4 border-l py-1 pl-3", className)}
      cite={cite}
      {...props}
    >
      <div className="text-sm leading-relaxed italic">{children}</div>
      {(author || authorTitle) && (
        <footer className="text-steel mt-2 text-sm">
          {author && <strong className="text-ink block">{author}</strong>}
          {authorTitle && <span>{authorTitle}</span>}
        </footer>
      )}
    </blockquote>
  );
}
