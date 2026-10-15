import { useEffect, useMemo, useState } from "react";
import { apiService } from "@/services/api";
import type { MeasureData } from "@/types";
import type { CommodityType } from "../components/ContractCard";
import { getCommodityType } from "../components/ContractCard";
import type { ContractSummary } from "./useDashboard";

interface UseDashboardChartProps {
  activeFilter: CommodityType | "all";
  contracts: ContractSummary[];
}

export function useDashboardChart({
  activeFilter,
  contracts,
}: UseDashboardChartProps) {
  const [data, setData] = useState<MeasureData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize filtered IDs
  const filteredIds = useMemo(() => {
    if (contracts.length === 0) return [];
    if (activeFilter === "all") {
      return contracts.map((c) => c.contractId);
    }
    return contracts
      .filter((c) => getCommodityType(c.contractId) === activeFilter)
      .map((c) => c.contractId);
  }, [activeFilter, contracts]);

  useEffect(() => {
    if (filteredIds.length === 0) {
      setData([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    apiService
      .getGroupedCostsData("day", filteredIds)
      .then((res) => { 
        if (!cancelled && res.length > 0) setData([...res].reverse()); 
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [filteredIds]);

  const totalUsage = data.reduce(
    (acc: number, d: MeasureData) => acc + d.value,
    0,
  );
  // Positive trend = consumption increased vs 7 days ago (bad), negative = decreased (good)
  const trend =
    data.length >= 2 ? data[data.length - 1].value - data[0].value : 0;

  return { data, isLoading, totalUsage, trend };
}
