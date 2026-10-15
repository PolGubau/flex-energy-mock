import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { ContractSummary } from "../hooks/useDashboard";
import { COMMODITY, getCommodityType } from "./ContractCard";
import type { CommodityType } from "./ContractCard";

const ALL_TYPES: CommodityType[] = ["electricity", "gas", "water"];

interface CommodityFilterProps {
  contracts: ContractSummary[];
  value: CommodityType | "all";
  onChange: (type: CommodityType | "all") => void;
  className?: string;
}

export function CommodityFilter({ contracts, value, onChange, className }: CommodityFilterProps) {
  const { t } = useTranslation();

  const counts = {
    all: contracts.length,
    electricity: contracts.filter((c) => getCommodityType(c.contractId) === "electricity").length,
    gas: contracts.filter((c) => getCommodityType(c.contractId) === "gas").length,
    water: contracts.filter((c) => getCommodityType(c.contractId) === "water").length,
  } as const;

  // Only show if there are contracts from more than one type
  const typesPresent = ALL_TYPES.filter((t) => counts[t] > 0);
  if (typesPresent.length <= 1) return null;

  return (
    <div
      className={cn("flex gap-2 flex-wrap", className)}
      role="group"
      aria-label={t("dashboard.commodity.filterLabel", "Filter by type")}
    >
      {/* All chip */}
      <button
        type="button"
        onClick={() => onChange("all")}
        aria-pressed={value === "all"}
        className={cn(
          "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all",
          value === "all"
            ? "bg-foreground text-background shadow-sm"
            : "bg-muted text-muted-foreground hover:bg-muted/70",
        )}
      >
        {t("dashboard.commodity.all")}
        <span className="tabular-nums opacity-70">{counts.all}</span>
      </button>

      {typesPresent.map((type) => {
        const theme = COMMODITY[type];
        const Icon = theme.Icon;
        const isActive = value === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            aria-pressed={isActive}
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all",
              isActive
                ? cn(theme.iconBg, theme.iconColor, "ring-1 ring-current/30 shadow-sm")
                : "bg-muted text-muted-foreground hover:bg-muted/70",
            )}
          >
            <Icon className="size-3" />
            {t(`dashboard.commodity.${type}`)}
            <span className="tabular-nums opacity-70">{counts[type]}</span>
          </button>
        );
      })}
    </div>
  );
}
