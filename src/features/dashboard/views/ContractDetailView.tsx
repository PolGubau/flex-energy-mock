import {
  ArrowLeft,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronRight,
  FileText,
  Info,
  Pencil,
  QrCode,
  ReceiptText,
  Settings,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  buildContractQRPayload,
  QRCodeSheet,
} from "@/components/ui/qr-code-sheet";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ContractCardSkeleton } from "@/components/ui/skeleton";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { COMMODITY, getCommodityType } from "../components/ContractCard";
import { useDashboard } from "../hooks/useDashboard";

function getStatus(status: string) {
  switch (status.toLowerCase()) {
    case "active":
    case "normal":
    case "normalstate":
      return { key: "active", className: "bg-emerald-50 text-emerald-700" };
    case "warning":
    case "grace":
    case "gracestate":
      return {
        key: "powerReduced",
        className: "bg-amber-50 text-amber-700",
      };
    default:
      return { key: "suspended", className: "bg-rose-50 text-rose-700" };
  }
}

export function ContractDetailView() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { contractId } = useParams();
  const { contracts, isLoading } = useDashboard();
  const { updateContractDisplayName } = useApp();
  const { user } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [rechargeOptionsOpen, setRechargeOptionsOpen] = useState(false);
  const [contractQROpen, setContractQROpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const contract = contracts.find(
    (item) => item.contractId === Number(contractId),
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

  const status = getStatus(contract.serviceStatus);
  const commodityType = getCommodityType(contract.contractId);
  const commodityTheme = COMMODITY[commodityType];
  const contractLabel =
    contract.displayName ||
    contract.buContractId ||
    `Contract #${contract.contractId}`;

  const startEditingName = () => {
    setDisplayName(contract.displayName ?? "");
    setNameError(null);
    setIsEditingName(true);
  };

  const saveDisplayName = async () => {
    setIsSavingName(true);
    setNameError(null);
    try {
      await updateContractDisplayName(contract.contractId, displayName);
      setIsEditingName(false);
    } catch {
      setNameError(t("dashboard.detail.displayNameError"));
    } finally {
      setIsSavingName(false);
    }
  };

  const actions = [
    {
      label: t("dashboard.detail.usage"),
      description: t("dashboard.detail.usageDesc"),
      Icon: BarChart3,
      onClick: () => navigate(`/contracts/${contract.contractId}/usage`),
    },
    {
      label: t("common.invoices"),
      description: t("dashboard.detail.invoicesDesc"),
      Icon: ReceiptText,
      onClick: () => navigate(`/contracts/${contract.contractId}/invoices`),
    },
    {
      label: t("dashboard.contractDetail"),
      description: t("dashboard.detail.detailsDesc"),
      Icon: Info,
      onClick: () => undefined,
    },
  ];

  return (
    <div className="-mx-4 min-h-[calc(100vh-5rem)] bg-background lg:mx-0 lg:min-h-0">
      <section
        className="relative h-72 overflow-hidden bg-slate-900"
        style={{
          backgroundImage: `url('${commodityTheme.backgroundImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center 70%",
        }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-white/20 via-transparent to-slate-950/30" />

        <div className="relative z-10 flex items-center justify-between gap-3 px-5 pt-5 text-slate-900">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(`/contracts?service=${commodityType}`)
              }
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/55 backdrop-blur-sm"
              aria-label={t("common.back")}
            >
              <ArrowLeft className="size-4" />
            </button>
            <p className="truncate text-sm font-semibold">
              {t(`dashboard.commodity.${commodityType}`)}
            </p>
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

        <div className="absolute inset-x-5 bottom-8 flex items-end justify-between gap-3 text-white">
          <div className="min-w-0">
            <div className="flex items-start gap-2">
              <h1 className="line-clamp-2 min-w-0 text-xl font-bold leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,.85)]">
                {contractLabel}
              </h1>
              <button
                type="button"
                onClick={startEditingName}
                className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/65 bg-slate-950/30 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-slate-950/45"
                aria-label={t("dashboard.detail.editDisplayName")}
              >
                <Pencil className="size-3.5" />
              </button>
            </div>
            <p className="mt-1 truncate text-xs font-medium text-white/90">
              {contract.buContractId ?? String(contract.contractId)}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
          >
            {t(`dashboard.status.${status.key}`)}
          </span>
        </div>
      </section>

      <main className="relative -mt-5 rounded-t-3xl bg-background px-4 pb-8 pt-5">
        {isEditingName && (
          <section className="mb-3 rounded-xl bg-card p-4 shadow-sm ring-1 ring-border">
            <label
              className="text-sm font-semibold text-foreground"
              htmlFor="contract-display-name"
            >
              {t("dashboard.detail.displayName")}
            </label>
            <div className="mt-2">
              <Input
                id="contract-display-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder={t("dashboard.detail.displayNamePlaceholder")}
                maxLength={80}
                autoFocus
              />
            </div>
            {nameError && (
              <p className="mt-2 text-xs text-destructive">{nameError}</p>
            )}
            <div className="mt-3 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingName(false)}
                disabled={isSavingName}
              >
                {t("common.cancel")}
              </Button>
              <Button
                size="sm"
                onClick={saveDisplayName}
                loading={isSavingName}
              >
                {t("common.save")}
              </Button>
            </div>
          </section>
        )}
        <section
          className="rounded-xl bg-card px-4 py-3.5 shadow-sm ring-1 ring-border"
          aria-label={t("dashboard.detail.currentBalance")}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t("dashboard.detail.currentBalance")}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                {contract.balanceFormatted}
              </p>
            </div>
            <Button
              onClick={() => setRechargeOptionsOpen(true)}
              className="h-12 rounded-xl bg-emerald-500 px-5 text-base text-white hover:bg-emerald-600"
            >
              {t("nav.recharge")}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </section>

        <section
          className="mt-3 grid grid-cols-2 gap-2.5"
          aria-label="Contract highlights"
        >
          <div className="flex items-center gap-2 rounded-xl bg-card px-3 py-3 shadow-sm ring-1 ring-border">
            <CalendarDays className="size-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-muted-foreground">
                {t("dashboard.detail.nextInvoice")}
              </p>
              <p className="truncate text-xs font-bold text-foreground">
                {contract.depletionLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-card px-3 py-3 shadow-sm ring-1 ring-border">
            <BarChart3 className="size-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-muted-foreground">
                {t("dashboard.detail.averageConsumption")}
              </p>
              <p className="truncate text-xs font-bold text-foreground">
                {contract.avgCostFormatted}
                {t("dashboard.detail.perDay")}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5" aria-labelledby="actions-heading">
          <h2
            id="actions-heading"
            className="text-base font-bold text-foreground"
          >
            {t("dashboard.detail.actionsAndDetails")}
          </h2>
          <div className="mt-2.5 space-y-2">
            {actions.map(({ label, description, Icon, onClick }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                className="flex w-full items-center gap-3 rounded-xl bg-card px-3.5 py-3 text-left shadow-sm ring-1 ring-border transition-colors hover:bg-muted/40"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">
                    {label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {description}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-primary" />
              </button>
            ))}
          </div>
        </section>
      </main>

      <Sheet
        open={rechargeOptionsOpen}
        onOpenChange={setRechargeOptionsOpen}
      >
        <SheetContent side="bottom" className="min-h-[62vh] pb-8">
          <SheetHeader className="pb-6 pt-4">
            <SheetTitle>{t("nav.recharge")}</SheetTitle>
            <SheetDescription>
              {contractLabel}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-3 px-5">
            <button
              type="button"
              onClick={() => {
                setRechargeOptionsOpen(false);
                navigate(`/recharge?contractId=${contract.contractId}`);
              }}
              className="flex min-h-32 w-full items-center gap-4 rounded-xl bg-card px-5 py-5 text-left shadow-sm ring-1 ring-border transition-colors hover:bg-muted/40"
            >
              <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <WalletCards className="size-7" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-foreground">
                  {t("recharge.online")}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {t("recharge.subtitle")}
                </span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-primary" />
            </button>
            <button
              type="button"
              onClick={() => {
                setRechargeOptionsOpen(false);
                setContractQROpen(true);
              }}
              className="flex min-h-32 w-full items-center gap-4 rounded-xl bg-card px-5 py-5 text-left shadow-sm ring-1 ring-border transition-colors hover:bg-muted/40"
            >
              <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <QrCode className="size-7" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-foreground">
                  {t("recharge.qr")}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {t("qr.openContract", "Contract QR code")}
                </span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-primary" />
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <QRCodeSheet
        open={contractQROpen}
        onOpenChange={setContractQROpen}
        title={t("recharge.qr")}
        payload={buildContractQRPayload(user?.id ?? 0, contract.contractId)}
        contractName={contractLabel}
      />
    </div>
  );
}
