import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatCurrency, toMinorUnits } from "@/types";

const PRESET_AMOUNTS = [10, 20, 50] as const;

interface AmountSelectorProps {
  amount: number;
  isCustom: boolean;
  customAmount: string;
  onSelectPreset: (amt: number) => void;
  onCustomChange: (val: string) => void;
}

export function AmountSelector({
  amount,
  isCustom,
  customAmount,
  onSelectPreset,
  onCustomChange,
}: AmountSelectorProps) {
  return (
    <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
      {PRESET_AMOUNTS.map((amt) => {
        const isSelected = !isCustom && amount === amt;
        return (
          <Button
            key={amt}
            variant="ghost"
            onClick={() => onSelectPreset(amt)}
            className={cn(
              "h-auto p-4 md:p-6 rounded-3xl border-2 transition-all flex items-center justify-center min-h-[80px] md:min-h-[100px]",
              isSelected
                ? "border-primary bg-primary/10 text-primary shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-primary/30"
            )}
          >
            <span className="text-xl md:text-2xl font-bold">
              {formatCurrency(toMinorUnits(amt))}
            </span>
          </Button>
        );
      })}

      {/* Custom amount */}
      <label
        className={cn(
          "p-4 md:p-6 rounded-3xl border-2 transition-all flex flex-col justify-center min-h-[80px] md:min-h-[100px] cursor-text",
          isCustom
            ? "border-primary bg-primary/10 text-primary shadow-sm"
            : "border-border bg-card text-muted-foreground hover:border-primary/30"
        )}
      >
        <span className="text-[10px] text-current mb-0.5 md:mb-1 ml-1 opacity-60">
          Custom amount
        </span>
        <div className="flex items-center gap-1">
          <span className="text-lg md:text-xl font-bold">CHF</span>
          <Input
            type="number"
            value={customAmount}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder="0.00"
            aria-label="Custom recharge amount in CHF"
            className="bg-transparent border-none p-0 shadow-none text-lg md:text-xl font-bold w-full placeholder:text-muted-foreground/30 focus-visible:ring-0"
          />
        </div>
      </label>
    </div>
  );
}
