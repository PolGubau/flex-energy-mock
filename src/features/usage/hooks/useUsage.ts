import { format, parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { apiService } from "@/services/api";
import type { MeasureData } from "@/types";

export type UsageMode = "kwh" | "cost";
export type UsagePeriod = "day" | "week" | "month" | "year";
export type ChartType = "bar" | "line";

const PERIOD_KEY = "usage-period";

export function useUsage(scopedContractId?: number) {
  const { contractId: defaultContractId, state } = useApp();
  const activeContractId = scopedContractId ?? defaultContractId;
  const isScoped = scopedContractId !== undefined;
  const [period, setPeriodState] = useState<UsagePeriod>(() => {
    const saved = localStorage.getItem(PERIOD_KEY);
    return (saved as UsagePeriod) ?? "month";
  });
  const setPeriod = (p: UsagePeriod) => {
    localStorage.setItem(PERIOD_KEY, p);
    setPeriodState(p);
  };
  const [mode, setMode] = useState<UsageMode>("kwh");
  const [selectedContract, setSelectedContract] = useState<"all" | number>(
    scopedContractId ?? "all",
  );
  const [data, setData] = useState<MeasureData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Build contracts list from app state (memoized to prevent loop)
  const contracts = useMemo(() => {
    return (state?.dashboard?.contracts ?? []).map((c) => ({
      contractId: c.contractId,
      label: c.buContractId ?? String(c.contractId),
    }));
  }, [state?.dashboard?.contracts]);

  // Effective contract IDs based on selection (memoized to stabilize deps)
  const activeContractIDs = useMemo(() => {
    if (isScoped && scopedContractId !== undefined) return [scopedContractId];
    return selectedContract === "all"
      ? contracts.map((c) => c.contractId)
      : [selectedContract];
  }, [contracts, isScoped, scopedContractId, selectedContract]);

  // Reset data when mode changes to force refetch
  useEffect(() => {
    setData([]);
  }, [mode]);

  useEffect(() => {
    if (!activeContractId) return;

    let cancelled = false;
    setIsLoading(true);

    const effectiveIds =
      activeContractIDs.length > 0 ? activeContractIDs : [activeContractId];

    // Get the full contract data for validation
    const allContracts = state?.dashboard?.contracts ?? [];
    const selectedContracts = allContracts.filter((c) =>
      effectiveIds.includes(c.contractId),
    );

    apiService
      .getGroupedCostsData(period, effectiveIds, mode, selectedContracts)
      .then((res) => {
        if (!cancelled) {
          setData(res);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeContractId, activeContractIDs, mode, period, state]);

  const totalNum = data.reduce((acc, curr) => acc + curr.value, 0);
  const totalUsage = totalNum.toFixed(1);
  const avgUsage = (totalNum / (data.length || 1)).toFixed(1);
  const trend: number | null = null; // No trend calculation without previous period

  // Derive peak hour from the highest-value data point
  const peakEntry = data.length
    ? data.reduce((max, curr) => (curr.value > max.value ? curr : max), data[0])
    : null;

  // Min entry (symmetric to peak)
  const minEntry = data.length
    ? data.reduce((min, curr) => (curr.value < min.value ? curr : min), data[0])
    : null;

  const peakValue = peakEntry?.value ?? 0;
  const minValue = minEntry?.value ?? 0;
  const rangeValue = (peakValue - minValue).toFixed(1);

  const minLabel = minEntry
    ? (() => {
        try {
          const d = parseISO(minEntry.timestamp);
          if (period === "day") {
            const h = format(d, "HH");
            const next = String(Number(h) + 1).padStart(2, "0");
            return `${h}:00 – ${next}:00`;
          }
          if (period === "month") return format(d, "dd MMM");
          return format(d, period === "year" ? "MMM yyyy" : "dd MMM");
        } catch {
          return "—";
        }
      })()
    : "—";

  const peakLabel = peakEntry
    ? (() => {
        try {
          const d = parseISO(peakEntry.timestamp);
          if (period === "day") {
            const h = format(d, "HH");
            const next = String(Number(h) + 1).padStart(2, "0");
            return `${h}:00 – ${next}:00`;
          }
          if (period === "month") return format(d, "dd MMM");
          return format(d, period === "year" ? "MMM yyyy" : "dd MMM");
        } catch {
          return "—";
        }
      })()
    : "—";

  const formatXAxis = (tickItem: string) => {
    try {
      const date = parseISO(tickItem);
      if (period === "day") return format(date, "HH:mm");
      if (period === "year") return format(date, "MMM");
      return format(date, "dd MMM");
    } catch {
      return tickItem;
    }
  };

  return {
    period,
    setPeriod,
    mode,
    setMode,
    selectedContract,
    setSelectedContract,
    contracts,
    data,
    isLoading,
    trend,
    totalUsage,
    avgUsage,
    peakLabel,
    minLabel,
    rangeValue,
    formatXAxis,
  };
}
