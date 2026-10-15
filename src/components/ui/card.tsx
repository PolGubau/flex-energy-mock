import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  children: ReactNode;
  className?: string;
  /** Remove default padding (e.g. for cards with overflow or internal sections) */
  noPadding?: boolean;
}

export function SectionCard({
  children,
  className,
  noPadding = false,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-3xl border border-border shadow-sm",
        !noPadding && "p-5 md:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
