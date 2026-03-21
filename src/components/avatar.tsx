import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

interface Props extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  /**
   * Additional CSS classes to apply to the avatar container
   */
  className?: string;
  /** Add offset shadow to the avatar */
  shadow?: boolean;
}

export function Avatar({ className, shadow, ...props }: Props) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "border-chrome relative flex size-10 shrink-0 overflow-hidden border",
        shadow && "shadow-offset",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  alt,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  if (process.env.NODE_ENV !== "production") {
    if (!alt) {
      console.warn(
        "Avatar.Image: `alt` prop is missing. Provide descriptive alt text for accessibility.",
      );
    }
  }

  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      alt={alt}
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn("bg-frost text-ink flex size-full items-center justify-center", className)}
      {...props}
    />
  );
}

Avatar.Image = AvatarImage;
Avatar.Fallback = AvatarFallback;
