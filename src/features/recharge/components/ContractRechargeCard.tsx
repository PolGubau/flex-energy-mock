import {
  ArrowUp,
  Check,
  ChevronDown,
  Clock,
  PencilLine,
  ShoppingCart,
  Sparkles,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  COMMODITY,
  getCommodityType,
} from "@/features/dashboard/components/ContractCard";
import type { ContractSummary } from "@/features/dashboard/hooks/useDashboard";
import { cn } from "@/lib/utils";
import { apiService } from "@/services/api";
import { formatCurrency, fromMinorUnits, toMinorUnits } from "@/types";
import type { CartItem } from "../hooks/useRechargeCart";

const PRESET_AMOUNTS = [20, 50, 100, 200] as const;

const DASHBOARD_COMMODITY_COLORS = {
  electricity: { iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  gas: { iconBg: "bg-sky-100", iconColor: "text-sky-600" },
  water: { iconBg: "bg-violet-100", iconColor: "text-violet-600" },
};

interface ContractRechargeCardProps {
  contract: ContractSummary;
  cartItem: CartItem | undefined;
  onAddToCart: (item: CartItem) => void;
  onRemove: (contractId: number) => void;
  onContinue?: (amount: number) => void;
  /** When set, pre-fills the custom input with this amount (display units). */
  prefillAmount?: number;
  /** Applies the dedicated, single-contract payment presentation. */
  focused?: boolean;
}

export function ContractRechargeCard({
  contract: c,
  cartItem,
  onAddToCart,
  onRemove,
  onContinue,
  prefillAmount,
  focused = false,
}: ContractRechargeCardProps) {
  const { t } = useTranslation();
  // Single source of truth: the raw string in the input
  const [inputValue, setInputValue] = useState<string>(
    cartItem ? String(cartItem.amount) : "",
  );

  // Auto-suggest: debounced, re-runs when coverage days change
  const SUGGEST_OPTIONS = [7, 30, 90] as const;
  type SuggestDays = (typeof SUGGEST_OPTIONS)[number];
  const [suggestDays, setSuggestDays] = useState<SuggestDays>(30);
  const [isSuggesting, setIsSuggesting] = useState(true); // loading on mount
  const [suggestion, setSuggestion] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsSuggesting(true);
    setSuggestion(null);
    const timer = setTimeout(async () => {
      try {
        const results = await apiService.suggestRecharge(
          [c.contractId],
          suggestDays,
        );
        if (!cancelled) {
          const match = results.find((r) => r.contractID === c.contractId);
          setSuggestion(match?.suggestedAmount ?? null);
        }
      } catch {
        if (!cancelled) setSuggestion(null);
      } finally {
        if (!cancelled) setIsSuggesting(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [c.contractId, suggestDays]);

  // Sync externally prefilled amount (e.g. from global Smart Suggest)
  useEffect(() => {
    if (prefillAmount !== undefined && prefillAmount > 0) {
      setInputValue(String(prefillAmount));
      setIsExpanded(true);
    }
  }, [prefillAmount]);

  const currentAmount = Number(inputValue) || 0;
  const presetAmounts = focused ? [50, 100, 200, 500] : PRESET_AMOUNTS;
  const activePreset =
    presetAmounts.find((amount) => amount === currentAmount) ?? null;
  const inCart = !!cartItem;
  const showEditor = focused || isExpanded;
  const contractCode = c.buContractId ?? `#${c.contractId}`;
  const contractName = c.displayName || contractCode;
  const commodityType = getCommodityType(c.contractId);
  const commodity = COMMODITY[commodityType];
  const commodityColors = DASHBOARD_COMMODITY_COLORS[commodityType];
  const CommodityIcon = commodity.Icon;

  // Resulting balance after top-up
  const currentBalanceDisplay = fromMinorUnits(c.balanceRaw, c.scale);
  const newBalance = currentBalanceDisplay + currentAmount;
  const newBalanceFormatted = formatCurrency(
    toMinorUnits(newBalance, c.scale),
    c.currency,
    c.scale,
  );

  const buildCartItem = (amt: number): CartItem => ({
    contractId: c.contractId,
    amount: amt,
    label: contractName,
    currency: c.currency,
    scale: c.scale,
    balanceFormatted: c.balanceFormatted,
  });

  const handleAddToCart = () => {
    if (currentAmount <= 0) return;
    onAddToCart(buildCartItem(currentAmount));
  };

  return (
    <article
      className={cn(
        "transition-all duration-200",
        focused
          ? "space-y-5"
          : cn(
              "overflow-hidden rounded-xl border bg-card shadow-sm",
              inCart
                ? "border-primary/30 ring-1 ring-primary/20"
                : "border-border",
            ),
      )}
    >
      {/* ── In-cart indicator strip ── */}
      {inCart && !focused && (
        <div className="h-1 bg-linear-to-r from-primary via-primary/70 to-primary/30" />
      )}

      <div className={cn("space-y-5", focused ? "px-1" : "p-5")}>
        {/* Header */}
        {focused ? (
          <div className="flex items-start justify-between gap-3 rounded-xl bg-card px-4 py-3 shadow-sm ring-1 ring-border">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-full",
                  commodityColors.iconBg,
                )}
              >
                <CommodityIcon
                  className={cn("size-5", commodityColors.iconColor)}
                />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  {t(`dashboard.commodity.${commodityType}`)}
                </p>
                <p className="truncate text-sm font-bold text-foreground">
                  {contractName}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                  {contractCode}
                </p>
              </div>
            </div>
            <StatusBadge status={c.serviceStatus} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsExpanded((expanded) => !expanded)}
            aria-expanded={isExpanded}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full",
                  commodityColors.iconBg,
                )}
              >
                <CommodityIcon
                  className={cn("size-5", commodityColors.iconColor)}
                />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground">
                  {t(`dashboard.commodity.${commodityType}`)}
                </p>
                <p className="truncate text-sm font-bold text-foreground">
                  {contractName}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {contractCode}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-sm font-bold tabular-nums",
                    c.balanceRaw < 0 ? "text-rose-700" : "text-emerald-700",
                  )}
                >
                  {c.balanceFormatted}
                </p>
              </div>
            </div>
            <span className="flex shrink-0 items-center gap-2">
              <StatusBadge status={c.serviceStatus} />
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform",
                  isExpanded && "rotate-180",
                )}
              />
            </span>
          </button>
        )}

        {showEditor && focused && (
          <div
            className={cn(
              "rounded-xl px-4 py-3.5",
              c.balanceRaw < 0 ? "bg-rose-50" : "bg-emerald-50",
            )}
          >
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              {t("dashboard.detail.currentBalance")}
            </p>
            <p
              className={cn(
                "text-2xl font-bold tabular-nums leading-none",
                c.balanceRaw < 0 ? "text-rose-700" : "text-emerald-700",
              )}
            >
              {c.balanceFormatted}
            </p>
          </div>
        )}

        {showEditor && (
          <>
            {/* Days remaining chip */}
            {!focused && c.daysLeft !== null && (
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold",
                  c.daysLeft < 0
                    ? "bg-destructive/10 text-destructive"
                    : c.daysLeft <= 7
                      ? "bg-warning/10 text-warning"
                      : "bg-muted text-muted-foreground",
                )}
              >
                <Clock className="size-3" />
                {c.daysLeft < 0
                  ? t("recharge.rechargeNeeded")
                  : t("recharge.daysRemaining", { count: c.daysLeft })}
              </div>
            )}

            {/* Unified amount selector: pills + input */}
            <div className="space-y-2">
              <p className="text-sm font-bold text-foreground">
                {focused ? "Quanto vuoi ricaricare?" : t("recharge.quickTopUp")}
              </p>

              {/* Preset pills */}
              <div className="grid grid-cols-3 gap-2">
                {presetAmounts.map((amt) => {
                  const active = activePreset === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setInputValue(String(amt))}
                      className={cn(
                        "min-h-9 rounded-lg border text-xs font-bold transition-all",
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border text-foreground hover:border-primary/40 hover:bg-primary/5",
                      )}
                    >
                      {focused ? `${c.currency} ${amt}` : amt}
                    </button>
                  );
                })}
              </div>

              {/* Single amount input */}
              <div>
                {focused && (
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <PencilLine className="size-3.5 text-primary" />
                    Inserisci un importo libero
                  </p>
                )}
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-4 py-3 transition-all",
                    currentAmount > 0 && activePreset === null
                      ? "border-primary bg-primary/5 ring-1 ring-primary/15"
                      : focused
                        ? "border-primary/45 bg-primary/3 hover:border-primary/70"
                        : "border-border/60 bg-muted/20",
                  )}
                >
                  <span className="shrink-0 text-sm font-bold text-foreground">
                    {c.currency}
                  </span>
                  <Input
                    type="number"
                    min={0}
                    value={inputValue}
                    placeholder="Es. 75"
                    autoComplete="off"
                    onChange={(e) => setInputValue(e.target.value)}
                    className="border-none bg-transparent p-0 text-base font-bold shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>

              {/* Resulting balance preview */}
              {currentAmount > 0 && (
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5",
                    focused ? "bg-sky-50" : "bg-muted/40",
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-primary">
                    <ArrowUp className="size-3.5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {t("recharge.newBalanceAfterRecharge")}
                    </p>
                    <p className="mt-0.5 text-base font-bold tabular-nums text-emerald-700">
                      {newBalanceFormatted}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Contract-specific Smart Suggest */}
            <div
              className={cn(
                "space-y-2",
                focused &&
                  "rounded-xl border border-primary/15 bg-primary/5 p-3",
              )}
            >
              {/* Header row: label + day-range selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="size-3 text-primary" />
                  <p className="text-xs font-bold text-primary">
                    {focused
                      ? t("recharge.smartSuggest")
                      : t("recharge.recommendedTopUp")}
                  </p>
                </div>
                <div className="flex rounded-lg bg-primary/8 p-0.5">
                  {SUGGEST_OPTIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSuggestDays(d)}
                      aria-pressed={suggestDays === d}
                      className={cn(
                        "rounded-md px-2 py-1.5 text-[11px] font-bold transition-all",
                        suggestDays === d
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-primary/10",
                      )}
                    >
                      {d} {t("recharge.days")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommendation chip */}
              <AnimatePresence mode="wait">
                {isSuggesting ? (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-14.5 rounded-xl bg-muted/60 animate-pulse"
                  />
                ) : suggestion !== null ? (
                  <motion.button
                    key="chip"
                    type="button"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setInputValue(String(suggestion))}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-background/80 border border-primary/20 hover:bg-primary/12 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base text-foreground tabular-nums leading-tight">
                        {formatCurrency(
                          toMinorUnits(suggestion, c.scale),
                          c.currency,
                          c.scale,
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {t("recharge.coversDays", { count: suggestDays })}
                      </p>
                    </div>
                    <span className="text-[10px] text-primary font-semibold bg-primary/10 px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
                      {t("recharge.tapToApply")}
                    </span>
                  </motion.button>
                ) : null}
              </AnimatePresence>

              {/* Context: avg daily cost */}
              {!isSuggesting && (
                <p className="text-[11px] text-muted-foreground/70 px-0.5">
                  {t("recharge.basedOnAvg", { amount: c.avgCostFormatted })}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                className="h-11 flex-1 rounded-xl"
                disabled={currentAmount <= 0}
                onClick={() =>
                  focused && onContinue
                    ? onContinue(currentAmount)
                    : handleAddToCart()
                }
                variant={inCart ? "outline" : "primary"}
              >
                {inCart ? (
                  <Check className="size-4" />
                ) : (
                  <ShoppingCart className="size-4" />
                )}
                {inCart
                  ? `${t("recharge.update")} · ${formatCurrency(toMinorUnits(currentAmount, c.scale), c.currency, c.scale)}`
                  : focused
                    ? `Continua · ${formatCurrency(toMinorUnits(currentAmount, c.scale), c.currency, c.scale)}`
                    : t("recharge.addToCart")}
              </Button>
              {inCart && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(c.contractId)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl"
                >
                  {t("recharge.remove")}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </article>
  );
}
