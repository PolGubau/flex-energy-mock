import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  QrCode,
  Receipt,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  buildContractQRPayload,
  QRCodeSheet,
} from "@/components/ui/qr-code-sheet";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { ContractCardSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { COMMODITY, getCommodityType } from "../components/ContractCard";
import type { ContractSummary } from "../hooks/useDashboard";
import { useDashboard } from "../hooks/useDashboard";

function StatCell({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: "warning" | "destructive" | "primary";
}) {
  const colorMap = {
    warning: "text-warning",
    destructive: "text-destructive",
    primary: "text-primary",
  };
  return (
    <div className="flex items-start gap-3 p-3 md:p-4 bg-muted/40 rounded-2xl">
      <span className="size-8 rounded-xl bg-background flex items-center justify-center shrink-0 mt-0.5 border border-border/60">
        <Icon className="size-3.5 text-muted-foreground" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold leading-tight">
          {label}
        </p>
        <p
          className={cn(
            "text-sm font-bold leading-tight mt-1 tabular-nums truncate",
            accent ? colorMap[accent] : "text-foreground",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
      {children}
    </p>
  );
}

function ContractDetailCard({ c }: { c: ContractSummary }) {
  const { t } = useTranslation();
  const pct = Math.min(100, Math.max(0, c.balancePercent ?? 100));
  const barColor =
    pct > 40 ? "bg-primary" : pct > 15 ? "bg-warning" : "bg-destructive";
  const contractLabel = c.buContractId ?? `#${c.contractId}`;
  const commodityType = getCommodityType(c.contractId);
  const commodityTheme = COMMODITY[commodityType];
  const CommodityIcon = commodityTheme.Icon;

  const daysAccent =
    c.daysLeft !== null && c.daysLeft <= 3
      ? "destructive"
      : c.daysLeft !== null && c.daysLeft <= 7
        ? "warning"
        : undefined;

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Commodity icon */}
          <span
            className={cn(
              "flex items-center justify-center size-9 rounded-2xl shrink-0",
              commodityTheme.iconBg,
            )}
          >
            <CommodityIcon className={cn("size-4", commodityTheme.iconColor)} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t(`dashboard.commodity.${commodityType}`)}
            </p>
            <p className="text-sm font-bold text-foreground truncate">
              {contractLabel}
            </p>
          </div>
        </div>
        <StatusBadge status={c.serviceStatus} />
      </header>

      <div className="space-y-5">
        {/* ── Balance hero ── */}
        <div className="space-y-2.5">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {t("common.balance")}
              </p>
              <p className="text-4xl font-bold tabular-nums text-foreground leading-none tracking-tight">
                {c.balanceFormatted}
              </p>
            </div>
            {c.daysLeft !== null && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0",
                  c.daysLeft <= 3
                    ? "bg-destructive/10 text-destructive"
                    : c.daysLeft <= 7
                      ? "bg-warning/10 text-warning"
                      : "bg-muted text-muted-foreground",
                )}
              >
                <Clock className="size-3" />
                {t("dashboard.daysLeft", { count: c.daysLeft })}
              </span>
            )}
          </div>
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  barColor,
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground tabular-nums">
              {pct.toFixed(0)}% {t("dashboard.balanceRemaining")}
            </p>
          </div>
        </div>

        {/* ── Low balance alert ── */}
        {c.isLowBalance && (
          <div className="flex items-start gap-3 rounded-2xl bg-warning/10 px-4 py-3">
            <AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">
                {t("dashboard.lowBalanceTitle")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("dashboard.lowBalanceDesc")}
              </p>
            </div>
          </div>
        )}

        {/* ── Consumption & cost ── */}
        <div className="space-y-2">
          <SectionLabel>{t("dashboard.consumptionSection")}</SectionLabel>
          <div className="grid sm:grid-cols-2 gap-2">
            <StatCell
              icon={TrendingDown}
              label={t("dashboard.dailyAvg")}
              value={c.avgCostFormatted}
            />
            <StatCell
              icon={TrendingUp}
              label={t("dashboard.forecast")}
              value={c.forecastFormatted}
            />
            <StatCell
              icon={Clock}
              label={t("dashboard.depletionDate")}
              value={c.depletionLabel}
              accent={daysAccent}
            />
            <StatCell
              icon={Zap}
              label={t("dashboard.lastMeasure")}
              value={c.lastMeasureLabel}
            />
          </div>
        </div>

        {/* ── Contract period ── */}
        <div className="space-y-2">
          <SectionLabel>{t("dashboard.periodSection")}</SectionLabel>
          <div className="grid sm:grid-cols-2 gap-2">
            <StatCell
              icon={Calendar}
              label={t("dashboard.startDate")}
              value={c.startDateLabel}
            />
            <StatCell
              icon={Calendar}
              label={t("dashboard.endDate")}
              value={c.endDateLabel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContractsView() {
  const { t } = useTranslation();
  const { contracts, isLoading } = useDashboard();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedContract, setSelectedContract] =
    useState<ContractSummary | null>(null);
  const [contractQROpen, setContractQROpen] = useState(false);

  // All contracts are shown (no filtering in this view anymore)
  const filtered = contracts;

  return (
    <>
      <main className="space-y-5 md:space-y-6">
        <header className="flex items-center gap-3 pt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/")}
            aria-label={t("common.back")}
            className="shrink-0"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground leading-tight">
              {t("dashboard.contractsTitle")}
            </h1>
            {!isLoading && (
              <p className="text-xs text-muted-foreground">
                {filtered.length}{" "}
                {filtered.length === 1
                  ? t("common.contract")
                  : t("common.contracts")}
              </p>
            )}
          </div>
        </header>

        {/* ── Content ── */}
        {isLoading ? (
          <div className="space-y-4">
            <ContractCardSkeleton />
            <ContractCardSkeleton />
          </div>
        ) : contracts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={t("dashboard.noContracts")}
            description={t("dashboard.noContractsDesc")}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={t("dashboard.noContracts")}
            description={t("dashboard.noContractsDesc")}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => {
              const commodityType = getCommodityType(c.contractId);
              const theme = COMMODITY[commodityType];
              const label = c.buContractId || `#${c.contractId}`;

              return (
                <button
                  key={c.contractId}
                  type="button"
                  onClick={() => setSelectedContract(c)}
                  className={cn(
                    "w-full p-4 rounded-2xl border transition-all text-left hover:shadow-md active:scale-[.98]",
                    "border-border hover:border-foreground/30 hover:bg-muted/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                          theme.iconBg,
                        )}
                      >
                        <theme.Icon className={cn("size-6", theme.iconColor)} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {theme.label}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3 ml-3 shrink-0">
                      <div>
                        <p className="text-sm font-bold text-foreground tabular-nums">
                          {c.balanceFormatted}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {c.balancePercent !== null &&
                            `${c.balancePercent.toFixed(0)}%`}
                        </p>
                      </div>
                      <div
                        className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0"
                        aria-hidden="true"
                      >
                        <span className="text-lg">›</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Detail Sheet ── */}
      <Sheet
        open={!!selectedContract}
        onOpenChange={(open) => {
          if (!open) setSelectedContract(null);
        }}
      >
        <SheetContent side="bottom">
          <SheetHeader className="mb-5">
            <h2 className="text-lg font-semibold leading-none tracking-tight">
              {t("dashboard.contractDetail")}
            </h2>
          </SheetHeader>
          {selectedContract && (
            <div className="px-5 pb-8 space-y-4">
              <ContractDetailCard c={selectedContract} />

              {/* ── Actions ── */}
              <div className="space-y-2.5">
                <Button
                  className="w-full gap-2 h-12"
                  onClick={() => {
                    setSelectedContract(null);
                    navigate("/recharge");
                  }}
                >
                  <Zap className="size-4" />
                  {t("recharge.online")}
                </Button>
                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    variant="outline"
                    className="gap-2 h-11 whitespace-nowrap"
                    onClick={() => {
                      setSelectedContract(null);
                      navigate("/history");
                    }}
                  >
                    <Receipt className="size-4 shrink-0" />
                    {t("common.invoices")}
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 h-11 whitespace-nowrap"
                    onClick={() => setContractQROpen(true)}
                  >
                    <QrCode className="size-4 shrink-0" />
                    {t("recharge.qr")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {selectedContract && (
        <QRCodeSheet
          open={contractQROpen}
          onOpenChange={setContractQROpen}
          title={
            selectedContract.buContractId ?? `#${selectedContract.contractId}`
          }
          description={t("qr.contractDesc")}
          payload={buildContractQRPayload(
            user?.id ?? 0,
            selectedContract.contractId,
          )}
          contractName={
            selectedContract.buContractId ?? `#${selectedContract.contractId}`
          }
        />
      )}
    </>
  );
}
