import { ArrowUpRight, BarChart2, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import { SectionCard } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/types";

function EmptyChart() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-[80px] gap-1.5 text-center">
      <BarChart2 className="size-5 text-muted-foreground/40" />
      <p className="text-[10px] text-muted-foreground/60">{t("common.noData")}</p>
    </div>
  );
}

function getPrimary() {
  return getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
}

interface HistorySummaryProps {
  weeklySpent: number;
  weeklyRecharged: number;
  efficiencyScore: number | null;
  chartData: { date: string; amount: number }[];
  isLoading: boolean;
}

export function HistorySummary({
  weeklySpent,
  weeklyRecharged,
  efficiencyScore,
  chartData,
  isLoading,
}: HistorySummaryProps) {
  const { t } = useTranslation();
  const net = weeklyRecharged - weeklySpent;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
      {/* ── This week ── */}
      <SectionCard className="rounded-[28px] p-5 space-y-3">
        <header className="flex items-center gap-2">
          <span className="size-8 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <TrendingUp className="size-3.5 text-primary" />
          </span>
          <h3 className="font-bold text-sm text-foreground">{t("history.summary.thisWeek")}</h3>
        </header>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : weeklySpent === 0 && weeklyRecharged === 0 ? (
          <p className="text-xs text-muted-foreground py-2">{t("common.noData")}</p>
        ) : (
          <dl className="space-y-2">
            <div className="flex justify-between items-center py-1.5 px-3 rounded-xl bg-muted/40">
              <dt className="text-xs text-muted-foreground">{t("history.summary.spent")}</dt>
              <dd className="text-xs font-bold text-foreground tabular-nums">{formatCurrency(weeklySpent * 100)}</dd>
            </div>
            <div className="flex justify-between items-center py-1.5 px-3 rounded-xl bg-success/8">
              <dt className="text-xs text-success/70">{t("history.summary.received")}</dt>
              <dd className="text-xs font-bold text-success tabular-nums">+{formatCurrency(weeklyRecharged * 100)}</dd>
            </div>
            {efficiencyScore !== null && (
              <div className="pt-1">
                <div className="flex justify-between items-center text-[10px] mb-1.5">
                  <span className="text-muted-foreground font-medium">{t("history.summary.trend")}</span>
                  <span className="font-bold text-foreground">{efficiencyScore}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${efficiencyScore}%` }} />
                </div>
              </div>
            )}
          </dl>
        )}
      </SectionCard>

      {/* ── Activity trend ── */}
      <SectionCard className="rounded-[28px] p-5 space-y-3">
        <header className="flex items-center gap-2">
          <span className="size-8 rounded-2xl bg-tertiary/10 flex items-center justify-center shrink-0">
            <BarChart2 className="size-3.5 text-tertiary" />
          </span>
          <h3 className="font-bold text-sm text-foreground">{t("history.summary.trend")}</h3>
        </header>
        {isLoading ? (
          <Skeleton className="h-20 w-full rounded-xl" />
        ) : chartData.length === 0 ? (
          <EmptyChart />
        ) : (
          <figure className="w-full" aria-label="Activity trend chart">
            <ResponsiveContainer width="100%" height={72}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getPrimary()} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={getPrimary()} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="bg-foreground text-background px-2.5 py-1.5 rounded-xl text-[10px] font-semibold shadow-xl">
                          {formatCurrency(Number(payload[0].value) * 100)}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="amount" stroke={getPrimary()} strokeWidth={2} fillOpacity={1} fill="url(#colorAmt)" />
              </AreaChart>
            </ResponsiveContainer>
          </figure>
        )}
      </SectionCard>

      {/* ── Net balance ── */}
      <SectionCard className={cn("rounded-[28px] p-5 flex flex-col justify-between gap-3", net >= 0 ? "bg-success/5 border-success/15" : "bg-destructive/5 border-destructive/15")}>
        <header className="flex items-center gap-2">
          <span className={cn("size-8 rounded-2xl flex items-center justify-center shrink-0", net >= 0 ? "bg-success/15" : "bg-destructive/15")}>
            <ArrowUpRight className={cn("size-3.5", net >= 0 ? "text-success" : "text-destructive")} />
          </span>
          <h3 className="font-bold text-sm text-foreground">{t("history.summary.netBalance")}</h3>
        </header>
        {isLoading ? (
          <Skeleton className="h-8 w-3/4" />
        ) : (
          <p className={cn("font-bold text-2xl tracking-tight tabular-nums", net >= 0 ? "text-success" : "text-destructive")}>
            {net >= 0 ? "+" : "−"}{formatCurrency(Math.abs(net * 100))}
          </p>
        )}
      </SectionCard>
    </section>
  );
}
