import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Home,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ContractCardSkeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { useApp } from "@/context/AppContext";
import {
  COMMODITY,
  type CommodityType,
  getCommodityType,
} from "@/features/dashboard/components/ContractCard";
import { cn } from "@/lib/utils";
import { apiService } from "@/services/api";
import { formatCurrency, fromMinorUnits, toMinorUnits } from "@/types";
import { CartDrawer } from "../components/CartDrawer";
import { ContractRechargeCard } from "../components/ContractRechargeCard";
import {
  type CartItem,
  useRechargeCart,
} from "../hooks/useRechargeCart";

interface SuggestionResult {
  contractID: number;
  suggestedAmount: number;
  suggestedAmountRaw: number;
}

const DASHBOARD_COMMODITY_COLORS: Record<
  CommodityType,
  { iconBg: string; iconColor: string }
> = {
  electricity: { iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  gas: { iconBg: "bg-sky-100", iconColor: "text-sky-600" },
  water: { iconBg: "bg-violet-100", iconColor: "text-violet-600" },
};

export function RechargeView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { contracts, isLoading } = useDashboard();
  const { rechargeCart, rechargeContract } = useApp();
  const { items, count, addToCart, removeFromCart, clearCart, totalFormatted, cart } =
    useRechargeCart();
  const [scrolled, setScrolled] = useState(false);
  const [focusedAmount, setFocusedAmount] = useState<number | null>(null);
  const [rechargeCompleted, setRechargeCompleted] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [cartCheckoutOpen, setCartCheckoutOpen] = useState(false);
  const [cartRechargeCompleted, setCartRechargeCompleted] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Smart Suggest state
  const [daysStr, setDaysStr] = useState("30");
  const days = Math.max(1, Number(daysStr) || 1);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionResult[] | null>(null);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  /** contractId → prefill amount (display units) */
  const [prefills, setPrefills] = useState<Map<number, number>>(new Map());
  const requestedContractId = Number(searchParams.get("contractId"));
  const selectedContract = contracts.find(
    (contract) => contract.contractId === requestedContractId,
  );
  const rechargeContracts = selectedContract ? [selectedContract] : contracts;
  const selectedCommodity = selectedContract
    ? COMMODITY[getCommodityType(selectedContract.contractId)]
    : null;
  const selectedCommodityLabel = selectedCommodity
    ? t(`dashboard.commodity.${getCommodityType(selectedContract!.contractId)}`)
    : "";
  const focusedNewBalance =
    selectedContract && focusedAmount !== null
      ? formatCurrency(
        toMinorUnits(
          fromMinorUnits(selectedContract.balanceRaw, selectedContract.scale) +
          focusedAmount,
          selectedContract.scale,
        ),
        selectedContract.currency,
        selectedContract.scale,
      )
      : "";

  const handleConfirmRecharge = async () => {
    if (!selectedContract || focusedAmount === null) return;
    setIsPaying(true);
    try {
      await rechargeContract(
        selectedContract.contractId,
        focusedAmount,
        selectedContract.scale,
      );
      setRechargeCompleted(true);
    } finally {
      setIsPaying(false);
    }
  };

  const startCartCheckout = () => {
    setCheckoutItems(items);
    setCartRechargeCompleted(false);
    setCartCheckoutOpen(true);
  };

  const updateCheckoutAmount = (contractId: number, amount: number) => {
    setCheckoutItems((previousItems) =>
      previousItems.map((item) =>
        item.contractId === contractId ? { ...item, amount } : item,
      ),
    );
    const item = checkoutItems.find(
      (checkoutItem) => checkoutItem.contractId === contractId,
    );
    if (!item) return;
    if (amount > 0) {
      addToCart({ ...item, amount });
      return;
    }
    removeFromCart(contractId);
  };

  const handleConfirmCartRecharge = async () => {
    if (checkoutItems.length === 0) return;
    setIsPaying(true);
    try {
      await rechargeCart(checkoutItems);
      clearCart();
      setCartRechargeCompleted(true);
    } finally {
      setIsPaying(false);
    }
  };

  const isCartFlow = !selectedContract && cartCheckoutOpen;
  const checkoutTotalFormatted = checkoutItems.length
    ? formatCurrency(
      checkoutItems.reduce(
        (total, item) => total + toMinorUnits(item.amount, item.scale),
        0,
      ),
      checkoutItems[0].currency,
      checkoutItems[0].scale,
    )
    : "CHF 0.00";

  const handleSuggest = async () => {
    if (rechargeContracts.length === 0) return;
    setIsSuggesting(true);
    setSuggestError(null);
    setSuggestions(null);
    try {
      const contractIds = rechargeContracts.map((contract) => contract.contractId);
      const result = await apiService.suggestRecharge(contractIds, days);
      setSuggestions(result.filter((s) => s.suggestedAmount > 0));
    } catch {
      setSuggestError(t("recharge.suggestError"));
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleApplyOne = (s: SuggestionResult) => {
    setPrefills((prev) => {
      const next = new Map(prev);
      next.set(s.contractID, s.suggestedAmount);
      return next;
    });
  };

  const handleApplyAll = () => {
    if (!suggestions) return;
    setPrefills(new Map(suggestions.map((s) => [s.contractID, s.suggestedAmount])));
    for (const s of suggestions) {
      const contract = rechargeContracts.find(
        (item) => item.contractId === s.contractID,
      );
      if (!contract || s.suggestedAmount <= 0) continue;
      addToCart({
        contractId: contract.contractId,
        amount: s.suggestedAmount,
        label: contract.buContractId ?? `#${contract.contractId}`,
        currency: contract.currency,
        scale: contract.scale,
        balanceFormatted: contract.balanceFormatted,
      });
    }
  };

  return (
    <main className="pt-4 lg:pt-6 space-y-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {(selectedContract || isCartFlow) ? (
            <button
              type="button"
              onClick={() => {
                if (isCartFlow) {
                  setCartCheckoutOpen(false);
                  return;
                }
                if (focusedAmount !== null) {
                  setFocusedAmount(null);
                  return;
                }
                navigate(`/contracts/${selectedContract.contractId}`);
              }}
              aria-label={t("common.back")}
              className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/")}
              aria-label={t("common.back")}
              className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}
          <div className="min-w-0">
            <h2 className="font-bold text-lg md:text-xl text-foreground">
              {cartRechargeCompleted
                ? "Ricarica completata"
                : isCartFlow
                  ? "Conferma ricarica"
                  : rechargeCompleted
                    ? "Ricarica completata"
                    : focusedAmount !== null
                      ? "Conferma ricarica"
                      : t("recharge.title")}
            </h2>
            {selectedContract ? (
              <p className="mt-0.5 truncate text-xs font-semibold text-muted-foreground">
                {selectedContract.buContractId ??
                  `#${selectedContract.contractId}`}
              </p>
            ) : isCartFlow ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {checkoutItems.length} contratti selezionati
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground text-balance">
                {t("recharge.subtitle")}
              </p>
            )}
          </div>
        </div>
        {!selectedContract && !isCartFlow && (
          <CartDrawer
            items={items}
            count={count}
            totalFormatted={totalFormatted}
            onRemove={removeFromCart}
            onUpdate={addToCart}
            onClear={clearCart}
            onCheckout={startCartCheckout}
            directCheckout
          />
        )}
      </div>

      {/* ── Smart Suggest Card — MD3 Expressive ── */}
      {!selectedContract && !isCartFlow && !isLoading && rechargeContracts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="rounded-[28px] overflow-hidden border border-primary/12 bg-linear-to-br from-primary/8 via-primary/5 to-secondary-container/30"
        >
          {/* Header strip */}
          <div className="px-5 pt-5 pb-4 flex items-start gap-3">
            <span className="flex items-center justify-center size-10 rounded-[14px] bg-primary/12 text-primary shrink-0">
              <Sparkles className="size-5" />
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-foreground leading-tight">{t("recharge.smartSuggest")}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 text-balance">
                {t("recharge.smartSuggestDesc")}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-5 h-px bg-primary/10" />

          {/* Day picker + action */}
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Input
                type="number"
                min={1}
                max={365}
                value={daysStr}
                onChange={(e) => setDaysStr(e.target.value)}
                onBlur={() => setDaysStr(String(days))}
                className="h-12 pr-14 font-bold text-base rounded-2xl bg-background/80 border-primary/20 focus-visible:ring-primary/30"
                autoComplete="off"
              />
              <span className="absolute inset-y-0 right-4 flex items-center text-sm font-medium text-muted-foreground pointer-events-none">
                {t("recharge.days")}
              </span>
            </div>
            <Button
              onClick={handleSuggest}
              disabled={isSuggesting || rechargeContracts.length === 0}
              className="h-12 px-5 rounded-2xl gap-2 font-semibold shrink-0"
            >
              {isSuggesting
                ? <Loader2 className="size-4 animate-spin" />
                : <Sparkles className="size-4" />}
              {isSuggesting ? t("recharge.calculating") : t("recharge.suggest")}
            </Button>
          </div>

          {/* Error */}
          {suggestError && (
            <p className="px-5 pb-4 text-xs text-destructive font-medium">{suggestError}</p>
          )}

          {/* Empty result */}
          {suggestions && suggestions.length === 0 && (
            <p className="px-5 pb-4 text-xs text-muted-foreground">
              {t("recharge.noSuggestionsFor", { count: days })}
            </p>
          )}

          {/* Results */}
          <AnimatePresence>
            {suggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 340, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="px-5 pt-1 pb-5 space-y-3">
                  <p className="text-[11px] font-bold text-primary/60 uppercase tracking-widest">
                    {t("recharge.suggestForDays", { count: days })}
                  </p>
                  <ul className="space-y-2">
                    {suggestions.map((s: SuggestionResult) => {
                      const contract = rechargeContracts.find(
                        (item) => item.contractId === s.contractID,
                      );
                      if (!contract) return null;
                      const label = contract.buContractId
                        ? `Contract · ${contract.buContractId}`
                        : `Contract #${contract.contractId}`;
                      const formatted = formatCurrency(
                        toMinorUnits(s.suggestedAmount, contract.scale),
                        contract.currency,
                        contract.scale,
                      );
                      const isPrefilled = prefills.get(s.contractID) === s.suggestedAmount;
                      return (
                        <motion.li
                          key={s.contractID}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 28 }}
                          className={cn(
                            "flex items-center justify-between gap-3 rounded-2xl px-4 py-3 bg-background/90 border transition-colors",
                            isPrefilled ? "border-primary/30 bg-primary/5" : "border-border/60",
                          )}
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{label}</p>
                            <p className="text-xs text-muted-foreground">{contract.balanceFormatted} {t("recharge.currentSuffix")}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-foreground tabular-nums text-sm">{formatted}</span>
                            <Button
                              size="sm"
                              variant={isPrefilled ? "ghost" : "primary"}
                              className={cn(
                                "h-8 px-3 text-xs gap-1 rounded-xl",
                                isPrefilled && "text-primary bg-primary/10 hover:bg-primary/15",
                              )}
                              onClick={() => handleApplyOne(s)}
                              disabled={isPrefilled}
                            >
                              <Zap className="size-3" />
                              {isPrefilled ? t("recharge.applied") : t("recharge.apply")}
                            </Button>
                          </div>
                        </motion.li>
                      );
                    })}
                  </ul>
                  <Button
                    className="w-full gap-2 h-11 rounded-2xl font-semibold"
                    onClick={handleApplyAll}
                  >
                    <Zap className="size-4" />
                    {t("recharge.applyAll")}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      )}

      {isCartFlow ? (
        cartRechargeCompleted ? (
          <section className="mx-auto flex max-w-sm flex-col items-center px-1 pt-10 text-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="size-10" />
            </span>
            <h3 className="mt-6 text-xl font-bold text-foreground">Ricarica completata</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Le ricariche sono state completate con successo.
            </p>
            <div className="mt-7 w-full rounded-xl bg-card p-4 text-left shadow-sm ring-1 ring-border">
              <p className="text-xs text-muted-foreground">Importo ricaricato</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{checkoutTotalFormatted}</p>
              <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                {checkoutItems.length} contratti ricaricati
              </p>
            </div>
            <Button className="mt-6 h-11 w-full rounded-xl" onClick={() => navigate("/")}>
              Torna alla home
            </Button>
          </section>
        ) : (
          <section className="mx-auto max-w-lg space-y-5 px-1">
            <div className="rounded-xl bg-slate-50 px-4 py-3.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">Importo ricarica</span>
                <strong className="text-lg tabular-nums text-foreground">{checkoutTotalFormatted}</strong>
              </div>
              <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                Distribuito su {checkoutItems.length} contratti
              </div>
            </div>
            <div className="divide-y divide-border rounded-xl bg-card px-4 shadow-sm ring-1 ring-border">
              {checkoutItems.map((item) => (
                (() => {
                  const contract = contracts.find(
                    (candidate) => candidate.contractId === item.contractId,
                  );
                  const commodityType = getCommodityType(item.contractId);
                  const commodity = COMMODITY[commodityType];
                  const CommodityIcon = commodity.Icon;
                  const commodityColors = DASHBOARD_COMMODITY_COLORS[commodityType];
                  const futureBalance = contract
                    ? formatCurrency(
                      contract.balanceRaw +
                      toMinorUnits(item.amount, item.scale),
                      item.currency,
                      item.scale,
                    )
                    : "--";
                  const isFutureBalanceNegative = contract
                    ? contract.balanceRaw + toMinorUnits(item.amount, item.scale) < 0
                    : false;

                  return (
                    <div key={item.contractId} className="space-y-2 py-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className={`flex size-9 shrink-0 items-center justify-center rounded-full ${commodityColors.iconBg}`}
                          >
                            <CommodityIcon
                              className={`size-4 ${commodityColors.iconColor}`}
                            />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-medium text-muted-foreground">
                              {t(`dashboard.commodity.${commodityType}`)}
                            </p>
                            <p className="truncate text-sm font-bold text-foreground">{item.label}</p>
                            <p className="text-xs text-muted-foreground">Saldo attuale {item.balanceFormatted}</p>
                          </div>
                        </div>
                        <div className="flex w-28 shrink-0 items-center gap-1 rounded-lg border border-primary/35 bg-primary/5 px-2 py-1.5">
                          <span className="text-[10px] font-bold text-muted-foreground">{item.currency}</span>
                          <Input
                            type="number"
                            min={0}
                            value={item.amount}
                            onChange={(event) =>
                              updateCheckoutAmount(
                                item.contractId,
                                Number(event.target.value) || 0,
                              )
                            }
                            className="h-5 min-w-0 border-none bg-transparent p-0 text-right text-sm font-bold shadow-none focus-visible:ring-0"
                            aria-label={`Importo per ${item.label}`}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-sky-50 px-3 py-2 text-xs">
                        <span className="text-muted-foreground">Nuovo saldo</span>
                        <strong className={`tabular-nums ${isFutureBalanceNegative ? "text-rose-700" : "text-emerald-700"}`}>
                          {futureBalance}
                        </strong>
                      </div>
                    </div>
                  );
                })()
              ))}
            </div>
            <Button
              className="h-11 w-full rounded-xl"
              onClick={handleConfirmCartRecharge}
              loading={isPaying}
              disabled={checkoutItems.length === 0 || checkoutItems.some((item) => item.amount <= 0)}
            >
              Conferma e paga
              <ArrowRight className="size-4" />
            </Button>
          </section>
        )
      ) : rechargeCompleted && selectedContract && selectedCommodity && focusedAmount !== null ? (
        <section className="mx-auto flex max-w-sm flex-col items-center px-1 pt-10 text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check className="size-10" />
          </span>
          <h3 className="mt-6 text-xl font-bold text-foreground">
            Ricarica completata
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            La tua ricarica e stata completata con successo.
          </p>

          <div className="mt-7 w-full rounded-xl bg-card p-4 text-left shadow-sm ring-1 ring-border">
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-green-100">
                <selectedCommodity.Icon className="size-5 text-green-600" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{selectedCommodityLabel}</p>
                <p className="truncate text-sm font-bold text-foreground">
                  {selectedContract.buContractId ?? `#${selectedContract.contractId}`}
                </p>
                <p className="text-[11px] text-muted-foreground">{`CO-${selectedContract.contractId}`}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 rounded-xl bg-muted/40 p-3">
              <div>
                <p className="text-xs text-muted-foreground">Importo ricaricato</p>
                <p className="text-xl font-bold tabular-nums text-foreground">
                  {formatCurrency(toMinorUnits(focusedAmount, selectedContract.scale), selectedContract.currency, selectedContract.scale)}
                </p>
              </div>
              <div className="border-t border-border pt-2">
                <p className="text-xs text-muted-foreground">Nuovo saldo disponibile</p>
                <p className="text-xl font-bold tabular-nums text-emerald-700">{focusedNewBalance}</p>
              </div>
            </div>
          </div>

          <Button
            className="mt-6 h-11 w-full rounded-xl"
            onClick={() => navigate(`/contracts/${selectedContract.contractId}`)}
          >
            Torna al contratto
          </Button>
        </section>
      ) : focusedAmount !== null && selectedContract && selectedCommodity ? (
        <section className="space-y-5 px-1">
          <div className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-sm ring-1 ring-border">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-green-100">
              <selectedCommodity.Icon className="size-5 text-green-600" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                {selectedCommodityLabel}
              </p>
              <p className="truncate text-sm font-bold text-foreground">
                {selectedContract.buContractId ?? `#${selectedContract.contractId}`}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {`CO-${selectedContract.contractId}`}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">{t("dashboard.detail.currentBalance")}</span>
              <strong className={selectedContract.balanceRaw < 0 ? "text-rose-700" : "text-emerald-700"}>
                {selectedContract.balanceFormatted}
              </strong>
            </div>
            <div className="my-3 h-px bg-border/70" />
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Importo ricarica</span>
              <strong>{formatCurrency(toMinorUnits(focusedAmount, selectedContract.scale), selectedContract.currency, selectedContract.scale)}</strong>
            </div>
            <div className="my-3 h-px bg-border/70" />
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Nuovo saldo</span>
              <strong className="text-emerald-700">{focusedNewBalance}</strong>
            </div>
          </div>

          <div className="divide-y divide-border rounded-xl bg-card px-4 shadow-sm ring-1 ring-border">
            <div className="flex items-center gap-3 py-3.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Zap className="size-4" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">Servizio</p>
                <p className="text-sm font-bold text-foreground">{selectedCommodityLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Home className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Contratto</p>
                <p className="truncate text-sm font-bold text-foreground">
                  {selectedContract.buContractId ?? `#${selectedContract.contractId}`}
                </p>
                <p className="text-[11px] text-muted-foreground">{`CO-${selectedContract.contractId}`}</p>
              </div>
            </div>
          </div>

          <Button
            className="h-11 w-full rounded-xl"
            onClick={handleConfirmRecharge}
            loading={isPaying}
          >
            Conferma e paga
            <ArrowRight className="size-4" />
          </Button>
        </section>
      ) : (
        <section className="space-y-4">
          {!selectedContract && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("recharge.contractsTitle")}
            </h3>
          )}
          {isLoading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <ContractCardSkeleton />
              <ContractCardSkeleton />
            </div>
          ) : rechargeContracts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={t("recharge.noContracts")}
              description={t("recharge.noContractsDesc")}
            />
          ) : (
            <motion.div
              className={cn(rechargeContracts.length > 1 && "grid grid-cols-1 xl:grid-cols-2 gap-4")}
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            >
              {rechargeContracts.map((c) => (
                <motion.div
                  key={c.contractId}
                  variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <ContractRechargeCard
                    contract={c}
                    cartItem={cart.get(c.contractId)}
                    onAddToCart={addToCart}
                    onRemove={removeFromCart}
                    prefillAmount={prefills.get(c.contractId)}
                    focused={Boolean(selectedContract)}
                    onContinue={setFocusedAmount}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      )}

      {/* ── Floating cart trigger ── */}
      {!selectedContract && !isCartFlow && count > 0 && scrolled && (
        <div className={cn(
          "fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-50 transition-all duration-300",
          scrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
        )}>
          <CartDrawer
            items={items}
            count={count}
            totalFormatted={totalFormatted}
            onRemove={removeFromCart}
            onUpdate={addToCart}
            onClear={clearCart}
            onCheckout={startCartCheckout}
            directCheckout
            floating
          />
        </div>
      )}
    </main>
  );
}
