import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { COMMODITY, type CommodityType } from "./ContractCard";

interface EnergyIllustrationCardProps {
  activeFilter: CommodityType | "all";
  onFilterChange: (filter: CommodityType | "all") => void;
  showOnlyFilters?: boolean;
}

const ALL_TYPES: CommodityType[] = ["electricity", "gas", "water"];

export function EnergyIllustrationCard({
  activeFilter,
  onFilterChange,
  showOnlyFilters = false,
}: EnergyIllustrationCardProps) {
  const { t } = useTranslation();

  // Map commodity types to illustration paths and dimensions
  const illustrationMap = {
    electricity: {
      src: "/Sun energy-bro.svg",
      alt: "Solar energy illustration",
    },
    gas: {
      src: "/Sun energy-bro.svg",
      alt: "Solar energy illustration",
    },
    water: {
      src: "/Sun energy-bro.svg",
      alt: "Solar energy illustration",
    },
  };

  // Use electricity as default if "all" is selected
  const displayType = activeFilter === "all" ? "electricity" : activeFilter;
  const config = illustrationMap[displayType];

  // If showOnlyFilters is true, render just the filter buttons in a flex wrapper
  if (showOnlyFilters) {
    return (
      <fieldset
        className="flex flex-row gap-1.5 md:gap-2 border-0 p-0 px-2 md:px-4 py-2 md:py-2.5 m-0 justify-center flex-nowrap w-full"
        aria-label="Filter by energy type"
      >
        {/* All button */}
        <button
          type="button"
          onClick={() => onFilterChange("all")}
          aria-pressed={activeFilter === "all"}
          aria-label={t("dashboard.commodity.all")}
          className={cn(
            "shrink-1 inline-flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 rounded-full transition-all duration-200 text-sm font-semibold whitespace-nowrap",
            activeFilter === "all"
              ? "bg-muted text-foreground shadow-sm scale-105"
              : "bg-muted/60 text-foreground opacity-50 hover:opacity-80 hover:scale-105",
          )}
          title={t("dashboard.commodity.all")}
        >
          {t("dashboard.commodity.all")}
        </button>

        {/* Per-type buttons - icon + text */}
        {ALL_TYPES.map((type) => {
          const theme = COMMODITY[type];
          const Icon = theme.Icon;
          const isActive = activeFilter === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onFilterChange(type)}
              aria-pressed={isActive}
              aria-label={t(`dashboard.commodity.${type}`)}
              className={cn(
                "shrink-1 inline-flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 rounded-full transition-all duration-200 text-sm font-semibold whitespace-nowrap",
                isActive
                  ? cn(theme.iconBg, theme.iconColor, "shadow-sm scale-105")
                  : cn(
                      "bg-muted/60",
                      theme.iconColor,
                      "opacity-50 hover:opacity-80 hover:scale-105",
                    ),
              )}
              title={t(`dashboard.commodity.${type}`)}
            >
              <Icon className="size-4.5 md:size-5" />
              {t(`dashboard.commodity.${type}`)}
            </button>
          );
        })}
      </fieldset>
    );
  }

  return (
    <div className="space-y-4">
      {/* Illustration - full width */}
      <div className="w-full flex items-center justify-center">
        <img
          src={config.src}
          alt={config.alt}
          className="w-full h-auto max-h-64 md:max-h-80  transition-all duration-300"
        />
      </div>

      {/* Filter buttons - centered below illustration */}
      <fieldset
        className="flex flex-row gap-2 md:gap-3 border-0 p-0 m-0 flex-wrap justify-center"
        aria-label="Filter by energy type"
      >
        {/* All button */}
        <button
          type="button"
          onClick={() => onFilterChange("all")}
          aria-pressed={activeFilter === "all"}
          aria-label={t("dashboard.commodity.all")}
          className={cn(
            "shrink-0 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full transition-all duration-200 text-sm font-semibold whitespace-nowrap",
            activeFilter === "all"
              ? "bg-muted text-foreground shadow-sm scale-105"
              : "bg-muted/60 text-foreground opacity-50 hover:opacity-80 hover:scale-105",
          )}
          title={t("dashboard.commodity.all")}
        >
          {t("dashboard.commodity.all")}
        </button>

        {/* Per-type buttons - icon + text */}
        {ALL_TYPES.map((type) => {
          const theme = COMMODITY[type];
          const Icon = theme.Icon;
          const isActive = activeFilter === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onFilterChange(type)}
              aria-pressed={isActive}
              aria-label={t(`dashboard.commodity.${type}`)}
              className={cn(
                "shrink-0 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full transition-all duration-200 text-sm font-semibold whitespace-nowrap",
                isActive
                  ? cn(theme.iconBg, theme.iconColor, "shadow-sm scale-105")
                  : cn(
                      "bg-muted/60",
                      theme.iconColor,
                      "opacity-50 hover:opacity-80 hover:scale-105",
                    ),
              )}
              title={t(`dashboard.commodity.${type}`)}
            >
              <Icon className="size-5" />
              {t(`dashboard.commodity.${type}`)}
            </button>
          );
        })}
      </fieldset>
    </div>
  );
}
