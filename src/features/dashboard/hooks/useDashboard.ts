import { format, formatDistanceToNow, isPast, parseISO } from "date-fns";
import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import type { DashboardContract } from "@/types";
import { formatCurrency, fromMinorUnits } from "@/types";

export interface ContractSummary {
  contractId: number;
  buContractId?: string;
  displayName?: string;
  serviceStatus: string;
  currency: string;
  scale: number;
  /** Formatted balance string, e.g. "CHF 142.50" */
  balanceFormatted: string;
  /** Raw balance in minor units (for sign checks) */
  balanceRaw: number;
  /** Average daily cost formatted */
  avgCostFormatted: string;
  /** Forecast total cost formatted */
  forecastFormatted: string;
  /** Human-readable depletion label, e.g. "Runs out in 12 days" or "Expired" */
  depletionLabel: string;
  /** ISO string of depletion date */
  depletionDate: string;
  /** Last measure formatted */
  lastMeasureLabel: string;
  /** Contract start date formatted */
  startDateLabel: string;
  /** Contract end date formatted */
  endDateLabel: string;
  isLowBalance: boolean;
  /** Days of balance remaining based on daily average cost; null if avg cost is zero */
  daysLeft: number | null;
  /** Balance as a % of forecastTotalCost (0-100); null if forecast is zero */
  balancePercent: number | null;
}

function summariseContract(c: DashboardContract): ContractSummary {
  const depletionDate = parseISO(c.depletionDate);
  const expired = isPast(depletionDate);
  const depletionLabel = expired
    ? "Balance depleted"
    : `Runs out ${formatDistanceToNow(depletionDate, { addSuffix: true })}`;

  const lastMeasureDate = parseISO(c.lastMeasure);
  const lastMeasureLabel = format(lastMeasureDate, "d MMM yyyy, HH:mm");

  const dailyAvgMinor = c.averageCost;
  const balanceMinor = c.balanceRaw;
  const daysLeft =
    dailyAvgMinor > 0
      ? Math.floor(
          fromMinorUnits(balanceMinor, c.scale) /
            fromMinorUnits(dailyAvgMinor, c.scale),
        )
      : null;

  const balancePercent =
    c.forecastTotalCost > 0
      ? Math.min(100, Math.max(0, (balanceMinor / c.forecastTotalCost) * 100))
      : null;

  // Clamp negative daysLeft — balance already depleted, treat as null for display
  const safeDaysLeft = daysLeft !== null && daysLeft < 0 ? null : daysLeft;

  const startDateLabel = format(parseISO(c.startDate), "d MMM yyyy");
  const endDateLabel = format(parseISO(c.endDate), "d MMM yyyy");

  return {
    contractId: c.contractId,
    buContractId: c.buContractId,
    displayName: c.displayName,
    serviceStatus: c.serviceStatus,
    currency: c.currency,
    scale: c.scale,
    balanceFormatted: formatCurrency(balanceMinor, c.currency, c.scale),
    balanceRaw: balanceMinor,
    avgCostFormatted: formatCurrency(dailyAvgMinor, c.currency, c.scale),
    forecastFormatted: formatCurrency(c.forecastTotalCost, c.currency, c.scale),
    depletionLabel:
      safeDaysLeft !== null
        ? `${safeDaysLeft} day${safeDaysLeft !== 1 ? "s" : ""} remaining`
        : depletionLabel,
    depletionDate: c.depletionDate,
    lastMeasureLabel,
    startDateLabel,
    endDateLabel,
    isLowBalance:
      balanceMinor < 0 || (safeDaysLeft !== null && safeDaysLeft <= 7),
    daysLeft: safeDaysLeft,
    balancePercent,
  };
}

export function useDashboard() {
  const { state, isLoading } = useApp();
  const dashboard = state?.dashboard ?? null;

  const totalBalanceFormatted = dashboard
    ? formatCurrency(
        dashboard.balance,
        dashboard.contracts[0]?.currency ?? "CHF",
        dashboard.scale,
      )
    : "—";

  const contracts: ContractSummary[] = useMemo(() => {
    return (dashboard?.contracts ?? []).map(summariseContract);
  }, [dashboard?.contracts]);

  const hasLowBalance = contracts.some((c) => c.isLowBalance);

  return {
    isLoading,
    dashboard,
    totalBalanceFormatted,
    contracts,
    hasLowBalance,
    consume: dashboard?.consume ?? 0,
    scale: dashboard?.scale ?? 2,
  };
}
