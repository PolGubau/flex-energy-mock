import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  /** Use "card" to add bg-card/border wrapper, "plain" for inline use */
  variant?: "card" | "plain";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = "card",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center gap-3 py-12 px-6",
        variant === "card" &&
        "bg-card border border-border rounded-3xl shadow-sm",
        className,
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-sm text-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground max-w-xs">{description}</p>
        )}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          {action.label} →
        </button>
      )}
    </div>
  );
}
