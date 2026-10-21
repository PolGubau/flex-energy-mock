import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Gauge,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "@/components/ui/empty-state";
import { ContractCardSkeleton } from "@/components/ui/skeleton";
import { COMMODITY, getCommodityType } from "../components/ContractCard";
import { useDashboard } from "../hooks/useDashboard";

function getStatusKey(status: string) {
  switch (status.toLowerCase()) {
    case "active":
    case "normal":
    case "normalstate":
      return "active";
    case "reduced":
    case "powerreduced":
    case "power_reduced":
      return "powerReduced";
    case "warning":
    case "grace":
    case "gracestate":
    case "suspended":
    case "lockstate":
    case "closed":
      return "blocked";
    default:
      return "unknown";
  }
}

interface DetailRowProps {
  icon: typeof FileText;
  label: string;
  value: string;
}

function DetailRow({ icon: Icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-center gap-3 py-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

export function ContractInformationView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { contractId } = useParams();
  const { contracts, isLoading } = useDashboard();
  const numericContractId = Number(contractId);
  const contract = contracts.find(
    (item) => item.contractId === numericContractId,
  );

  if (isLoading) {
    return (
      <div className="space-y-3 pt-4">
        <ContractCardSkeleton />
        <ContractCardSkeleton />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="pt-12">
        <EmptyState
          icon={FileText}
          title={t("dashboard.detail.notFound")}
          description={t("dashboard.detail.notFoundDesc")}
          action={{
            label: t("dashboard.detail.backToContracts"),
            onClick: () => navigate("/contracts"),
          }}
        />
      </div>
    );
  }

  const commodityType = getCommodityType(contract.contractId);
  const commodity = COMMODITY[commodityType];
  const CommodityIcon = commodity.Icon;
  const statusKey = getStatusKey(contract.serviceStatus);
  const contractLabel =
    contract.displayName ||
    contract.buContractId ||
    t("dashboard.contractFallback", { id: contract.contractId });

  return (
    <main className="space-y-5 pb-8 pt-4">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/contracts/${contract.contractId}`)}
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
            {t("dashboard.contractDetail")}
          </h1>
        </div>
      </header>

      <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
        <div className="flex items-center gap-3">
          <span
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${commodity.iconBg}`}
          >
            <CommodityIcon className={`size-5 ${commodity.iconColor}`} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-foreground">
              {contractLabel}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {t(`dashboard.commodity.${commodityType}`)}
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {t(`dashboard.status.${statusKey}`)}
          </span>
        </div>
      </section>

      <section aria-labelledby="contract-information-heading">
        <h2
          id="contract-information-heading"
          className="mb-2 px-1 text-base font-bold text-foreground"
        >
          {t("dashboard.detail.contractInformation")}
        </h2>
        <div className="divide-y divide-border/60 rounded-2xl bg-card px-4 shadow-sm ring-1 ring-border">
          <DetailRow
            icon={FileText}
            label={t("dashboard.detail.contractCodeLabel")}
            value={contract.buContractId ?? String(contract.contractId)}
          />
          <DetailRow
            icon={CalendarDays}
            label={t("dashboard.startDate")}
            value={contract.startDateLabel}
          />
          <DetailRow
            icon={CalendarDays}
            label={t("dashboard.endDate")}
            value={contract.endDateLabel}
          />
          <DetailRow
            icon={ReceiptText}
            label={t("dashboard.lastMeasure")}
            value={contract.lastMeasureLabel}
          />
        </div>
      </section>

      <section aria-labelledby="contract-balance-heading">
        <h2
          id="contract-balance-heading"
          className="mb-2 px-1 text-base font-bold text-foreground"
        >
          {t("dashboard.detail.balanceInformation")}
        </h2>
        <div className="divide-y divide-border/60 rounded-2xl bg-card px-4 shadow-sm ring-1 ring-border">
          <DetailRow
            icon={WalletCards}
            label={t("dashboard.detail.currentBalance")}
            value={contract.balanceFormatted}
          />
          <DetailRow
            icon={Gauge}
            label={t("dashboard.dailyAvg")}
            value={`${contract.avgCostFormatted}${t("dashboard.detail.perDay")}`}
          />
          <DetailRow
            icon={ReceiptText}
            label={t("dashboard.forecast")}
            value={contract.forecastFormatted}
          />
        </div>
      </section>
    </main>
  );
}
