import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

interface Props extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  /**
   * Additional CSS classes to apply to the avatar container
   */
  className?: string;
}

export function Avatar({ className, ...props }: Props) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-10 shrink-0 overflow-hidden border border-[var(--chrome)]",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
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
      className={cn(
        "flex size-full items-center justify-center bg-[var(--frost)] text-[var(--ink)]",
        className,
      )}
      {...props}
    />
  );
}

Avatar.Image = AvatarImage;
Avatar.Fallback = AvatarFallback;
