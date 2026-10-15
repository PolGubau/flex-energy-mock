import {
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfWeek,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { apiService } from "@/services/api";
import type { Transaction } from "@/types";
import { fromMinorUnits } from "@/types";

export type SortField = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
export type FilterType = "all" | "credit" | "debit";
export type FilterStatus = "all" | "Settled" | "Pending" | "Failed";

export function useHistory(scopedContractId?: number) {
  const { contractId: defaultContractId } = useApp();
  const contractId = scopedContractId ?? defaultContractId;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Controls
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("date-desc");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  useEffect(() => {
    if (!contractId) return;
    setIsLoading(true);
    apiService
      .getTransactions(271, contractId)
      .then((res) => {
        setTransactions(res);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [contractId]);

  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  const weeklyTransactions = transactions.filter((tx) =>
    isWithinInterval(parseISO(tx.transactionDate), {
      start: weekStart,
      end: weekEnd,
    }),
  );

  const weeklySpent = weeklyTransactions
    .filter((tx) => tx.amountMinor < 0)
    .reduce(
      (acc, curr) =>
        acc + Math.abs(fromMinorUnits(curr.amountMinor, curr.scale)),
      0,
    );

  const weeklyRecharged = weeklyTransactions
    .filter((tx) => tx.amountMinor > 0)
    .reduce(
      (acc, curr) => acc + fromMinorUnits(curr.amountMinor, curr.scale),
      0,
    );

  const chartData = transactions
    .slice(0, 7)
    .reverse()
    .map((tx) => ({
      date: format(parseISO(tx.transactionDate), "MMM dd"),
      amount: fromMinorUnits(tx.amountMinor, tx.scale),
    }));

  const settledCount = transactions.filter(
    (tx) => tx.transactionStatus === "Settled",
  ).length;
  const efficiencyScore =
    transactions.length > 0
      ? Math.round((settledCount / transactions.length) * 100)
      : null;

  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    // Search by description or orderId
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (tx) =>
          tx.description?.toLowerCase().includes(q) ||
          tx.orderId?.toLowerCase().includes(q),
      );
    }

    // Filter by credit/debit
    if (filterType === "credit") list = list.filter((tx) => tx.amountMinor > 0);
    else if (filterType === "debit")
      list = list.filter((tx) => tx.amountMinor < 0);

    // Filter by status
    if (filterStatus !== "all")
      list = list.filter((tx) => tx.transactionStatus === filterStatus);

    // Sort
    list.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return (
            parseISO(a.transactionDate).getTime() -
            parseISO(b.transactionDate).getTime()
          );
        case "amount-desc":
          return Math.abs(b.amountMinor) - Math.abs(a.amountMinor);
        case "amount-asc":
          return Math.abs(a.amountMinor) - Math.abs(b.amountMinor);
        default: // date-desc
          return (
            parseISO(b.transactionDate).getTime() -
            parseISO(a.transactionDate).getTime()
          );
      }
    });

    return list;
  }, [transactions, search, sortBy, filterType, filterStatus]);

  return {
    transactions,
    filteredTransactions,
    isLoading,
    weeklySpent,
    weeklyRecharged,
    chartData,
    efficiencyScore,
    // controls
    search,
    setSearch,
    sortBy,
    setSortBy,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
  };
}
