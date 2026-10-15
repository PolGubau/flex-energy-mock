import type * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.ComponentPropsWithoutRef<"input"> & {
  icon?: React.ReactNode;
};

export const Input = ({ icon, className, ...props }: InputProps) => (
  <div className="relative">
    {icon && (
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        {icon}
      </span>
    )}
    <input
      className={cn(
        "w-full py-4 pr-4 bg-input border border-border rounded-2xl transition-all outline-none text-sm text-foreground placeholder:text-muted-foreground/50",
        "focus:ring-2 focus:ring-ring focus:border-transparent",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        icon ? "pl-12" : "pl-4",
        className,
      )}
      {...props}
    />
  </div>
);
