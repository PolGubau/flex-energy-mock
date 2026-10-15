import { Separator as SeparatorPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

type SeparatorProps = React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>;

export const Separator = ({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorProps) => (
  <SeparatorPrimitive.Root
    decorative={decorative}
    orientation={orientation}
    className={cn(
      "bg-border",
      orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
      className,
    )}
    {...props}
  />
);
