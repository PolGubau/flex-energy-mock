import { cn } from "@/lib/utils";

interface PeriodToggleProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function PeriodToggle<T extends string>({
  options,
  value,
  onChange,
  className,
}: PeriodToggleProps<T>) {
  return (
    <div className={cn("flex p-1 bg-muted rounded-2xl self-start", className)}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all",
            value === option
              ? "bg-card text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
