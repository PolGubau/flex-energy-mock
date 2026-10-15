import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatChipVariant = "muted" | "success" | "warning" | "destructive";

interface StatChipProps {
  children: ReactNode;
  variant?: StatChipVariant;
  className?: string;
}

const variantStyles: Record<StatChipVariant, string> = {
  muted: "bg-muted text-muted-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatChip({
  children,
  variant = "muted",
  className,
}: StatChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
