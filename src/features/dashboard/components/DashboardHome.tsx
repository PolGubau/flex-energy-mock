import { ChevronRight, Droplets, Flame, QrCode, Zap } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/ui/empty-state";
import {
  buildDashboardQRPayload,
  QRCodeSheet,
} from "@/components/ui/qr-code-sheet";
import { ContractCardSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/types";
import type { ContractSummary } from "../hooks/useDashboard";
import { type CommodityType, getCommodityType } from "./ContractCard";

interface DashboardHomeProps {
  totalBalanceFormatted: string;
  totalBalanceRaw: number | null;
  contracts: ContractSummary[];
  isLoading: boolean;
}

const SERVICES: Array<{
  type: CommodityType;
  label: string;
  Icon: typeof Zap;
  cardClass: string;
  iconBg: string;
  iconColor: string;
}> = [
  {
    type: "electricity",
    label: "Electricity",
    Icon: Zap,
    cardClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    type: "gas",
    label: "Gas",
    Icon: Flame,
    cardClass: "bg-sky-50 text-sky-700 ring-sky-100",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
  },
  {
    type: "water",
    label: "Water",
    Icon: Droplets,
    cardClass: "bg-violet-50 text-violet-700 ring-violet-100",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
];

const SERVICE_BY_TYPE: Record<CommodityType, (typeof SERVICES)[number]> = {
  electricity: SERVICES[0],
  gas: SERVICES[1],
  water: SERVICES[2],
};

function getContractStatusClass(serviceStatus: string) {
  switch (serviceStatus.toLowerCase()) {
    case "active":
    case "normal":
    case "normalstate":
      return "bg-emerald-50 text-emerald-700";
    case "warning":
    case "grace":
    case "gracestate":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-rose-50 text-rose-700";
  }
}

function getContractStatusKey(serviceStatus: string) {
  switch (serviceStatus.toLowerCase()) {
    case "active":
    case "normal":
    case "normalstate":
      return "active";
    case "warning":
    case "grace":
    case "gracestate":
      return "reduced";
    case "suspended":
    case "lockstate":
    case "closed":
      return "suspended";
    default:
      return "unknown";
  }
}

export function DashboardHome({
  totalBalanceFormatted,
  totalBalanceRaw,
  contracts,
  isLoading,
}: DashboardHomeProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [qrOpen, setQrOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 pb-8 sm:space-y-10">
      {isLoading ? (
        <ContractCardSkeleton />
      ) : (
        <>
          <section
            className={`rounded-xl px-5 py-3.5 ring-1 ${totalBalanceRaw !== null && totalBalanceRaw < 0 ? "bg-rose-50 ring-rose-100" : "bg-emerald-50 ring-emerald-100"}`}
          >
            <p
              className={`text-xs font-medium ${totalBalanceRaw !== null && totalBalanceRaw < 0 ? "text-rose-700/75" : "text-emerald-700/75"}`}
            >
              {t("dashboard.totalBalance")}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
              {totalBalanceFormatted}
            </p>
          </section>

          <section
            className="grid grid-cols-2 gap-3"
            aria-label={t("nav.recharge")}
          >
            <button
              type="button"
              onClick={() => navigate("/recharge")}
              className="inline-flex h-12 min-w-0 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Zap className="size-4" />
              {t("nav.recharge")}
            </button>
            <button
              type="button"
              onClick={() => setQrOpen(true)}
              className="inline-flex h-12 min-w-0 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/50"
            >
              <QrCode className="size-4" />
              {t("recharge.qr")}
            </button>
          </section>

          <section
            className="grid grid-cols-3 gap-2.5"
            aria-label={t("dashboard.commodity.all")}
          >
            {SERVICES.map(({ type, Icon, cardClass }) => {
              const serviceContracts = contracts.filter(
                (contract) => getCommodityType(contract.contractId) === type,
              );
              const rawBalance = serviceContracts.reduce(
                (sum, contract) => sum + contract.balanceRaw,
                0,
              );
              const reference = serviceContracts[0];
              const balance = reference
                ? formatCurrency(
                    rawBalance,
                    reference.currency,
                    reference.scale,
                  )
                : "--";

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => navigate(`/contracts?service=${type}`)}
                  className={`min-w-0 rounded-xl px-2 py-3.5 text-center ring-1 transition-transform active:scale-[.98] ${cardClass}`}
                >
                  <span className="mx-auto mb-2.5 flex size-9 items-center justify-center rounded-full bg-white/65">
                    <Icon className="size-4" />
                  </span>
                  <p className="truncate text-xs font-semibold">
                    {t(`dashboard.commodity.${type}`)}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-bold tabular-nums">
                    {balance}
                  </p>
                </button>
              );
            })}
          </section>

          <section aria-labelledby="contracts-heading">
            <div className="mb-4 px-1">
              <h2
                id="contracts-heading"
                className="text-lg font-semibold tracking-tight text-foreground"
              >
                {t("dashboard.yourContracts")}
              </h2>
            </div>

            {contracts.length > 0 ? (
              <div className="space-y-3">
                {contracts.map((contract) => {
                  const type = getCommodityType(contract.contractId);
                  const service = SERVICE_BY_TYPE[type];
                  const Icon = service.Icon;
                  const label =
                    contract.displayName ||
                    contract.buContractId ||
                    `Contract #${contract.contractId}`;
                  const statusKey = getContractStatusKey(
                    contract.serviceStatus,
                  );

                  return (
                    <button
                      key={contract.contractId}
                      type="button"
                      onClick={() =>
                        navigate(`/contracts/${contract.contractId}`)
                      }
                      className="flex w-full items-center gap-4 rounded-xl border border-border/70 bg-card px-4 py-3.5 text-left shadow-sm transition-colors hover:bg-muted/40"
                    >
                      <span
                        className={`flex size-11 shrink-0 items-center justify-center rounded-full ${service.iconBg}`}
                      >
                        <Icon className={`size-5 ${service.iconColor}`} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {label}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                          {contract.buContractId ?? `CO-${contract.contractId}`}
                        </span>
                        <span className="mt-2 block text-sm font-semibold tabular-nums text-foreground">
                          {contract.balanceFormatted}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getContractStatusClass(contract.serviceStatus)}`}
                        >
                          {t(`dashboard.status.${statusKey}`)}
                        </span>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Zap}
                title={t("dashboard.noContracts")}
                description={t("dashboard.noContractsYet")}
              />
            )}
          </section>
        </>
      )}
      <QRCodeSheet
        open={qrOpen}
        onOpenChange={setQrOpen}
        title={t("qr.ricarica", "Recharge")}
        payload={buildDashboardQRPayload(user?.id ?? 0)}
      />
    </div>
  );
}
