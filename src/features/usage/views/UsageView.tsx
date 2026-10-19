import {
  ArrowLeft,
  BarChart3,
  ChevronDown,
  Euro,
  LineChart,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/ui/empty-state";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { getCommodityType } from "@/features/dashboard/components/ContractCard";
import { cn } from "@/lib/utils";
import { UsageChart } from "../components/UsageChart";
import { useUsage } from "../hooks/useUsage";

const PERIODS = ["day", "week", "month", "year"] as const;

export function UsageView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [chartType, setChartType] = useState<"bar" | "line">("line");
  const [highlightPeak, setHighlightPeak] = useState(true);
  const {
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
  } = useUsage();

  const isCost = mode === "cost";
  const usageUnit =
    selectedContract !== "all" && getCommodityType(selectedContract) === "water"
      ? "m³"
      : "kWh";
  const unit = isCost ? "CHF" : usageUnit;

  return (
    <main className="pt-4 pb-8 space-y-6">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label={t("common.back")}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="text-lg font-bold text-foreground">{t("nav.usage")}</h1>
      </header>

      {/* ── Period Toolbar ─────────────────────────────── */}
      <div className="flex gap-2 px-2">
        {PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            aria-pressed={period === p}
            className={cn(
              "relative px-3.5 py-1.5 text-xs font-medium transition-colors rounded-md flex-1 sm:flex-none",
              period === p
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
            )}
          >
            {t(`usage.periods.${p}`)}
            {period === p && (
              <motion.span
                layoutId="period-underline"
                className="absolute bottom-0 inset-x-1 h-0.5 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Stats Section ─────────────────────────────── */}
      <section className="bg-card rounded-3xl border border-border shadow-sm p-5 space-y-4">
        {/* Header with controls */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {isCost ? t("usage.totalCost") : t("usage.totalConsumption")}
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-bold text-4xl tracking-tight tabular-nums text-foreground">
                {totalUsage}
              </span>
              <span className="text-base font-semibold text-muted-foreground">
                {unit}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ø {avgUsage} {unit} · {t(`usage.periods.${period}`).toLowerCase()}
            </p>
          </div>

          {/* Chart type toggle — icon only, top right */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setChartType("bar")}
              aria-pressed={chartType === "bar"}
              className={cn(
                "p-2 transition-colors rounded-lg",
                chartType === "bar"
                  ? "text-primary bg-muted/40"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title={t("usage.barChart")}
            >
              <BarChart3 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setChartType("line")}
              aria-pressed={chartType === "line"}
              className={cn(
                "p-2 transition-colors rounded-lg",
                chartType === "line"
                  ? "text-primary bg-muted/40"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title={t("usage.lineChart")}
            >
              <LineChart className="size-4" />
            </button>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex flex-col md:flex-row md:items-end gap-3 w-full md:w-auto md:justify-end">
          {/* Mode toggle — filled pill (MD3 style) */}
          <div className="flex rounded-xl overflow-hidden border border-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode("kwh")}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center md:justify-start gap-1 px-3 py-1.5 transition-all",
                !isCost
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <Zap className="size-3" />
              {usageUnit}
            </button>
            <button
              type="button"
              onClick={() => setMode("cost")}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center md:justify-start gap-1 px-3 py-1.5 transition-all border-l border-border",
                isCost
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <Euro className="size-3" />
              CHF
            </button>
          </div>

          {/* Contract selector */}
          {contracts.length > 1 && (
            <div className="relative">
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
              <select
                value={
                  selectedContract === "all" ? "all" : String(selectedContract)
                }
                onChange={(e) =>
                  setSelectedContract(
                    e.target.value === "all" ? "all" : Number(e.target.value),
                  )
                }
                className="w-full md:w-auto pl-3 pr-7 py-1.5 rounded-xl text-xs font-semibold bg-muted border border-transparent appearance-none outline-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
              >
                <option value="all">{t("usage.all")}</option>
                {contracts.map((c) => (
                  <option key={c.contractId} value={String(c.contractId)}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {/* ── Chart Section ─────────────────────────────── */}
      {isLoading && data.length === 0 ? (
        <ChartSkeleton height="h-52" />
      ) : data.length === 0 && !isLoading ? (
        <EmptyState
          icon={BarChart3}
          title={t("usage.noData")}
          description={t("usage.noDataDesc")}
          variant="plain"
        />
      ) : (
        <div className="space-y-4">
          <div
            className={cn(
              "transition-opacity duration-200",
              isLoading && "opacity-40 pointer-events-none",
            )}
          >
            <UsageChart
              data={data}
              period={period}
              chartType={chartType}
              formatXAxis={formatXAxis}
              mode={mode}
              usageUnit={usageUnit}
              highlightPeak={highlightPeak}
            />
          </div>

          {/* ── Insights footer ─────────────────────── */}
          <div className="px-2 space-y-2.5">
            {/* Peak row */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {t("usage.peak")}{" "}
                {period === "day" ? t("usage.peakHour") : t("usage.peakPeriod")}
              </span>
              <span className="font-semibold text-foreground">{peakLabel}</span>
            </div>

            {/* Min row */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {t("usage.min")}{" "}
                {period === "day" ? t("usage.minHour") : t("usage.minPeriod")}
              </span>
              <span className="font-semibold text-foreground">{minLabel}</span>
            </div>

            {/* Range row */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t("usage.range")}</span>
              <span className="font-semibold text-foreground">
                {rangeValue} {unit}
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-border/50" />

            {/* Trend row — explicit comparison with previous period */}
            {trend !== null && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {t("usage.vsPrev", {
                    period: t(`usage.periods.${period}`).toLowerCase(),
                  })}
                </span>
                <span
                  className={cn(
                    "font-semibold",
                    trend <= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400",
                  )}
                >
                  {trend > 0 ? "+" : ""}
                  {(trend as number).toFixed(1)}%
                </span>
              </div>
            )}

            {/* Highlight peak toggle */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t("usage.highlightPeak")}</span>
              <button
                type="button"
                role="switch"
                aria-checked={highlightPeak}
                onClick={() => setHighlightPeak((v) => !v)}
                className={cn(
                  "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  highlightPeak ? "bg-primary" : "bg-border",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none absolute top-0.5 size-3 rounded-full shadow transition-transform duration-200",
                    highlightPeak
                      ? "translate-x-3.5 bg-white"
                      : "translate-x-0.5 bg-muted-foreground/60",
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
