import { ArrowLeft, CheckCircle, CreditCard, Lock, Shield, ShoppingCart, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { CartItem } from "../hooks/useRechargeCart";

type Step = "cart" | "checkout" | "success";

// ─── Card helpers ──────────────────────────────────────────────────────────────
function detectBrand(n: string) {
  if (/^4/.test(n)) return "Visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "Amex";
  return "Card";
}
function fmtCard(raw: string) {
  return raw.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function fmtExpiry(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

interface CartDrawerProps {
  items: CartItem[];
  count: number;
  totalFormatted: string;
  onRemove: (contractId: number) => void;
  onUpdate: (item: CartItem) => void;
  onClear: () => void;
  onCheckout?: () => void;
  directCheckout?: boolean;
  floating?: boolean;
}

// Inline-editable cart item row
function CartItemRow({
  item,
  onRemove,
  onUpdate,
}: {
  item: CartItem;
  onRemove: (id: number) => void;
  onUpdate: (item: CartItem) => void;
}) {
  const { t } = useTranslation();
  const [editValue, setEditValue] = useState(String(item.amount));

  // Keep in sync if parent updates amount (e.g. from card)
  useEffect(() => {
    setEditValue(String(item.amount));
  }, [item.amount]);

  const handleBlur = () => {
    const val = parseFloat(editValue);
    if (!isNaN(val) && val > 0) {
      if (val !== item.amount) onUpdate({ ...item, amount: val });
    } else {
      setEditValue(String(item.amount));
    }
  };

  return (
    <li className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{item.label}</p>
        <p className="text-xs text-muted-foreground">{t("cart.currentBalance", { amount: item.balanceFormatted })}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-muted/30 px-2 py-1">
          <span className="text-[11px] font-semibold text-muted-foreground">{item.currency}</span>
          <Input
            type="number"
            min={1}
            step={1}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            className="w-14 h-5 border-none shadow-none bg-transparent p-0 text-sm font-bold focus-visible:ring-0 text-right tabular-nums"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="size-7 p-0 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(item.contractId)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </li>
  );
}

export function CartDrawer({
  items,
  count,
  totalFormatted,
  onRemove,
  onUpdate,
  onClear,
  onCheckout,
  directCheckout = false,
  floating = false,
}: CartDrawerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("cart");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const rawDigits = cardNumber.replace(/\s/g, "");
  const brand = detectBrand(rawDigits);
  const isValid =
    cardHolder.trim().length >= 2 &&
    rawDigits.length === 16 &&
    expiry.length === 5 &&
    cvv.length >= 3;

  function handleClose(o: boolean) {
    setOpen(o);
    if (!o) setStep("cart");
  }

  function handleSuccess(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid) return;
    setStep("success");
    setTimeout(() => {
      onClear();
      setOpen(false);
      setStep("cart");
      setCardHolder(""); setCardNumber(""); setExpiry(""); setCvv("");
    }, 2500);
  }

  if (directCheckout && onCheckout) {
    return (
      <Button
        className="relative size-11 p-0"
        variant={count > 0 ? "primary" : "outline"}
        size="icon"
        disabled={count === 0}
        onClick={onCheckout}
        aria-label={t("cart.title")}
      >
        <ShoppingCart className="size-4" />
        {count > 0 && (
          <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-bold text-primary-foreground">
            {count}
          </span>
        )}
      </Button>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetTrigger asChild>
        {floating ? (
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="flex items-center gap-3 px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 font-semibold text-sm"
          >
            <ShoppingCart className="size-4" />
            <span>{t("cart.itemCount_other", { count })}</span>
            <span className="opacity-70">·</span>
            <span>{totalFormatted}</span>
          </motion.button>
        ) : (
          <Button
            className="relative size-11 p-0"
            variant={count > 0 ? "primary" : "outline"}
            size="icon"
            disabled={count === 0}
            aria-label={t("cart.title")}
          >
            <ShoppingCart className="size-4" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center border-2 border-background">
                {count}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>

      <SheetContent side="bottom" className="pb-10 px-6 max-h-[90dvh] overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* ── Success ── */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="flex flex-col items-center gap-4 py-14"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center justify-center size-20 rounded-full bg-primary/10"
              >
                <CheckCircle className="size-10 text-primary" />
              </motion.div>
              <div className="text-center space-y-1">
                <p className="font-bold text-lg text-foreground">{t("cart.paymentSuccessful")}</p>
                <p className="text-sm text-muted-foreground">{t("cart.balancesUpdated")}</p>
              </div>
            </motion.div>
          )}

          {/* ── Cart ── */}
          {step === "cart" && (
            <motion.div key="cart" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <SheetHeader>
                <SheetTitle>{t("cart.title")}</SheetTitle>
              </SheetHeader>
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                  <ShoppingCart className="size-10 opacity-30" />
                  <p className="text-sm">{t("cart.empty")}</p>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <ul className="space-y-3">
                    {items.map((item) => (
                      <CartItemRow
                        key={item.contractId}
                        item={item}
                        onRemove={onRemove}
                        onUpdate={onUpdate}
                      />
                    ))}
                  </ul>
                  <Separator />
                  <div className="flex items-center justify-between font-bold">
                    <span>{t("cart.total")}</span>
                    <span className="text-lg">{totalFormatted}</span>
                  </div>
                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={() => {
                      if (onCheckout) {
                        setOpen(false);
                        onCheckout();
                        return;
                      }
                      setStep("checkout");
                    }}
                  >
                    <CreditCard className="size-4" />
                    {t("cart.checkout", { amount: totalFormatted })}
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Checkout form ── */}
          {step === "checkout" && (
            <motion.div key="checkout" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <button type="button" onClick={() => setStep("cart")} className="mr-1 text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="size-4" />
                  </button>
                  {t("cart.securePayment")}
                </SheetTitle>
              </SheetHeader>

              <form onSubmit={handleSuccess} className="pt-3 space-y-5">
                {/* Order summary pill */}
                <div className="flex items-center justify-between rounded-2xl bg-primary/8 border border-primary/20 px-4 py-3">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{t("cart.amountDue")}</p>
                    <p className="text-xl font-bold text-foreground">{totalFormatted}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background/60 border border-border/60 rounded-full px-3 py-1.5">
                    <Lock className="size-3 text-primary" />
                    <span>{t("cart.sslSecured")}</span>
                  </div>
                </div>

                {/* Card preview chip — clearly decorative, not interactive */}
                <div
                  aria-hidden="true"
                  className="relative overflow-hidden rounded-2xl bg-linear-to-br from-foreground/90 to-foreground/70 px-5 py-4 select-none"
                >
                  {/* subtle grid texture */}
                  <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:repeating-linear-gradient(0deg,transparent,transparent_23px,white_23px,white_24px),repeating-linear-gradient(90deg,transparent,transparent_23px,white_23px,white_24px)]" />

                  <div className="relative flex items-center justify-between">
                    <CreditCard className="size-5 text-background/60" />
                    {rawDigits.length >= 1 && (
                      <span className="text-[11px] font-bold text-background/70 uppercase tracking-widest">{brand}</span>
                    )}
                  </div>
                  <p className="relative mt-3 font-mono text-base tracking-[0.22em] text-background/90 tabular-nums">
                    {rawDigits.length >= 4
                      ? `•••• •••• •••• ${rawDigits.slice(-4)}`
                      : "•••• •••• •••• ••••"}
                  </p>
                </div>

                {/* Fields */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ch">{t("cart.cardholderName")}</Label>
                    <Input id="ch" placeholder="Anna Müller" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} autoComplete="off" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cn">{t("cart.cardNumber")}</Label>
                    <Input id="cn" inputMode="numeric" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => setCardNumber(fmtCard(e.target.value))} autoComplete="off" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="exp">{t("cart.expiry")}</Label>
                      <Input id="exp" inputMode="numeric" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(fmtExpiry(e.target.value))} autoComplete="off" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" inputMode="numeric" placeholder="•••" maxLength={4} value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} autoComplete="off" />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2" size="lg" disabled={!isValid}>
                  <Lock className="size-4" />
                  {t("cart.payButton", { amount: totalFormatted })}
                </Button>

                {/* Trust footer */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/70">
                  <Shield className="size-3.5" />
                  <span>{t("cart.encryptedNotice")}</span>
                </div>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
