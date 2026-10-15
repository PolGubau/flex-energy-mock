import { ArrowLeft, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "@/components/ui/empty-state";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { UsageChart } from "../components/UsageChart";
import { type UsagePeriod, useUsage } from "../hooks/useUsage";

const PERIODS: UsagePeriod[] = ["day", "week", "month", "year"];

export function ContractUsageView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { contractId: routeContractId } = useParams();
  const parsedContractId = Number(routeContractId);
  const contractId = Number.isFinite(parsedContractId)
    ? parsedContractId
    : undefined;
  const {
    period,
    setPeriod,
    contracts,
    data,
    isLoading,
    totalUsage,
    avgUsage,
    peakLabel,
    minLabel,
    rangeValue,
    formatXAxis,
  } = useUsage(contractId);
  const contract = contracts.find((item) => item.contractId === contractId);
  const contractLabel = contract?.label ?? t("common.contract");

  return (
    <main className="space-y-5 pb-8 pt-4">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            navigate(contractId ? `/contracts/${contractId}` : "/")
          }
          aria-label={t("common.back")}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">
            {contractLabel}
          </p>
          <h1 className="text-xl font-bold leading-tight text-foreground">
            {t("nav.usage")}
          </h1>
        </div>
      </header>

      <nav
        className="grid grid-cols-4 rounded-2xl bg-muted p-1"
        aria-label={t("nav.usage")}
      >
        {PERIODS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setPeriod(item)}
            aria-pressed={period === item}
            className={cn(
              "rounded-xl px-2 py-2 text-xs font-semibold transition-colors",
              period === item
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t(`usage.periods.${item}`)}
          </button>
        ))}
      </nav>

      <section className="rounded-3xl bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {t("usage.totalConsumption")}
            </p>
            <p className="mt-1 text-4xl font-bold tracking-tight text-foreground tabular-nums">
              {totalUsage} <span className="text-base font-semibold">kWh</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ø {avgUsage} kWh · {t(`usage.periods.${period}`).toLowerCase()}
            </p>
          </div>
          <BarChart3 className="mt-1 size-5 text-primary" />
        </div>

        <div className="mt-5">
          {isLoading && data.length === 0 ? (
            <ChartSkeleton height="h-52" />
          ) : data.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title={t("usage.noData")}
              description={t("usage.noDataDesc")}
              variant="plain"
              className="py-10"
            />
          ) : (
            <UsageChart
              data={data}
              period={period}
              formatXAxis={formatXAxis}
              mode="kwh"
              highlightPeak
            />
          )}
        </div>
      </section>

      <section aria-labelledby="usage-details-heading">
        <h2
          id="usage-details-heading"
          className="mb-2 px-1 text-base font-bold text-foreground"
        >
          {t("dashboard.usageAnalysis")}
        </h2>
        <dl className="divide-y divide-border/60 rounded-2xl bg-card px-4 shadow-sm">
          <div className="flex items-center justify-between py-3">
            <dt className="text-sm text-muted-foreground">{t("usage.peak")}</dt>
            <dd className="text-sm font-semibold text-foreground">{peakLabel}</dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-sm text-muted-foreground">{t("usage.min")}</dt>
            <dd className="text-sm font-semibold text-foreground">{minLabel}</dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-sm text-muted-foreground">{t("usage.range")}</dt>
            <dd className="text-sm font-semibold text-foreground">
              {rangeValue} kWh
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}