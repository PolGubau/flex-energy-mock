import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Droplets,
  Flame,
  Settings,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/ui/empty-state";
import { ContractCardSkeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/types";
import {
  COMMODITY,
  type CommodityType,
  getCommodityType,
} from "../components/ContractCard";
import { useDashboard } from "../hooks/useDashboard";

const SERVICE_PRESENTATION: Record<
  CommodityType,
  {
    label: string;
    Icon: typeof Zap;
    iconBg: string;
    iconColor: string;
    balanceClass: string;
  }
> = {
  electricity: {
    label: "Electricity",
    Icon: Zap,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    balanceClass: "text-emerald-700",
  },
  gas: {
    label: "Gas",
    Icon: Flame,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    balanceClass: "text-sky-700",
  },
  water: {
    label: "Water",
    Icon: Droplets,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    balanceClass: "text-violet-700",
  },
};

function toCommodityType(value: string | null): CommodityType {
  if (value === "gas" || value === "water" || value === "electricity") {
    return value;
  }
  return "electricity";
}

function statusLabel(status: string) {
  switch (status.toLowerCase()) {
    case "active":
    case "normal":
    case "normalstate":
      return { key: "active", className: "bg-emerald-50 text-emerald-700" };
    case "reduced":
    case "powerreduced":
    case "power_reduced":
      return {
        key: "powerReduced",
        className: "bg-amber-50 text-amber-700",
      };
    default:
      return { key: "blocked", className: "bg-rose-50 text-rose-700" };
  }
}

export function ServiceOverviewView() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { contracts, isLoading } = useDashboard();
  const serviceType = toCommodityType(searchParams.get("service"));
  const service = SERVICE_PRESENTATION[serviceType];
  const commodityTheme = COMMODITY[serviceType];
  const serviceName = t(`dashboard.commodity.${serviceType}`);
  const Icon = service.Icon;
  const serviceContracts = contracts.filter(
    (contract) => getCommodityType(contract.contractId) === serviceType,
  );
  const balanceRaw = serviceContracts.reduce(
    (sum, contract) => sum + contract.balanceRaw,
    0,
  );
  const referenceContract = serviceContracts[0];
  const totalBalance = referenceContract
    ? formatCurrency(
        balanceRaw,
        referenceContract.currency,
        referenceContract.scale,
      )
    : "--";
  const totalBalanceClass =
    balanceRaw < 0 ? "text-rose-700" : service.balanceClass;

  return (
    <div className="-mx-4 min-h-[calc(100vh-5rem)] bg-background pb-24 lg:mx-0 lg:min-h-0 lg:pb-0">
      <section
        className="relative h-72 overflow-hidden bg-slate-900"
        style={{
          backgroundImage: `url('${commodityTheme.backgroundImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center 70%",
        }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-white/20 via-transparent to-slate-950/25" />

        <div className="relative z-10 flex items-center justify-between gap-3 px-5 pt-5 text-slate-900">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/55 backdrop-blur-sm"
              aria-label={t("common.back")}
            >
              <ArrowLeft className="size-4" />
            </button>
            <p className="truncate text-sm font-semibold">{t("nav.home")}</p>
          </div>
          <div className="flex justify-end gap-1">
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-full bg-white/45 backdrop-blur-sm"
              aria-label={t("settings.notifications.title")}
            >
              <Bell className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="flex size-9 items-center justify-center rounded-full bg-white/45 backdrop-blur-sm"
              aria-label={t("settings.title")}
            >
              <Settings className="size-4" />
            </button>
          </div>
        </div>

        <div className="absolute inset-x-5 bottom-8 flex items-center gap-3 text-white">
          <span
            className={`flex size-14 shrink-0 items-center justify-center rounded-full ${service.iconBg}`}
          >
            <Icon className={`size-7 ${service.iconColor}`} />
          </span>
          <div>
            <h1 className="text-2xl font-bold leading-none">{serviceName}</h1>
            <p className="mt-1 text-sm font-medium text-white/90">
              {t("dashboard.contractCount", { count: serviceContracts.length })}
            </p>
          </div>
        </div>
      </section>

      <main className="relative -mt-5 rounded-t-3xl bg-background px-4 pb-8 pt-5">
        {isLoading ? (
          <div className="space-y-3">
            <ContractCardSkeleton />
            <ContractCardSkeleton />
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => navigate("/recharge")}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left shadow-sm ring-1 ${balanceRaw < 0 ? "bg-rose-50 ring-rose-100" : "bg-card ring-border"}`}
            >
              <span>
                <span className="block text-xs font-medium text-muted-foreground">
                  {t("dashboard.serviceBalance", {
                    service: serviceName.toLowerCase(),
                  })}
                </span>
                <span
                  className={`mt-1 block text-2xl font-bold tabular-nums ${totalBalanceClass}`}
                >
                  {totalBalance}
                </span>
              </span>
              <ChevronRight className={`size-5 ${service.iconColor}`} />
            </button>

            <section
              className="mt-5"
              aria-labelledby="service-contracts-heading"
            >
              <h2
                id="service-contracts-heading"
                className="text-base font-bold text-foreground"
              >
                {t("dashboard.yourContracts")} ({serviceContracts.length})
              </h2>

              {serviceContracts.length > 0 ? (
                <div className="mt-3 space-y-2.5">
                  {serviceContracts.map((contract) => {
                    const status = statusLabel(contract.serviceStatus);
                    const label =
                      contract.displayName ??
                      contract.buContractId ??
                      t("dashboard.contractFallback", {
                        id: contract.contractId,
                      });

                    return (
                      <button
                        key={contract.contractId}
                        type="button"
                        onClick={() =>
                          navigate(`/contracts/${contract.contractId}`)
                        }
                        className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left shadow-sm ring-1 transition-colors ${contract.balanceRaw < 0 ? "bg-rose-50 ring-rose-100 hover:bg-rose-100/70" : "bg-card ring-border hover:bg-muted/40"}`}
                      >
                        <span
                          className={`flex size-11 shrink-0 items-center justify-center rounded-full ${service.iconBg}`}
                        >
                          <Icon className={`size-5 ${service.iconColor}`} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {label}
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                            {contract.buContractId ??
                              `CO-${contract.contractId}`}
                          </span>
                          <span
                            className={`mt-1 block text-sm font-bold tabular-nums ${contract.balanceRaw < 0 ? "text-rose-700" : service.balanceClass}`}
                          >
                            {contract.balanceFormatted}
                          </span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.className}`}
                          >
                            {t(`dashboard.status.${status.key}`)}
                          </span>
                          <ChevronRight className="size-4 text-muted-foreground" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={Icon}
                  title={t("dashboard.noServiceContracts", {
                    service: serviceName.toLowerCase(),
                  })}
                  description={t("dashboard.noServiceContractsDesc")}
                />
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
