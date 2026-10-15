import { AlertCircle, CheckCircle, CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
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
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/services/api";
import { formatCurrency, toMinorUnits } from "@/types";
import type { CartItem } from "../hooks/useRechargeCart";

// ─── Card brand detection ──────────────────────────────────────────────────────
function detectBrand(number: string): string {
  const n = number.replace(/\s/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "Amex";
  return "Card";
}

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface CheckoutSheetProps {
  items: CartItem[];
  totalFormatted: string;
  trigger: React.ReactNode;
  onSuccess: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function CheckoutSheet({ items, totalFormatted, trigger, onSuccess }: CheckoutSheetProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rawDigits = cardNumber.replace(/\s/g, "");
  const brand = detectBrand(rawDigits);

  const isValid =
    cardHolder.trim().length >= 2 &&
    rawDigits.length === 16 &&
    expiry.length === 5 &&
    cvv.length >= 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !user) return;
    setIsProcessing(true);
    setError(null);
    try {
      for (const item of items) {
        const amountMinor = toMinorUnits(item.amount, item.scale);
        await apiService.rechargeWithCard(user.id, item.contractId, amountMinor, item.scale, {
          cardHolder: cardHolder.trim(),
          cardNumber: rawDigits,
          cardBrand: brand,
        });
      }
      setSuccess(true);
      onSuccess();
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
        setCardHolder(""); setCardNumber(""); setExpiry(""); setCvv("");
      }, 2500);
    } catch {
      setError("Payment failed. Check your details and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="pb-10 max-h-[90dvh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CreditCard className="size-4" />
            Payment
          </SheetTitle>
        </SheetHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <CheckCircle className="size-12 text-primary" />
            <p className="font-semibold text-foreground">Payment successful!</p>
            <p className="text-sm text-muted-foreground text-center">Your balances have been updated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-1 pt-2 space-y-5">
            {/* Order summary */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
              {items.map((item) => (
                <div key={item.contractId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(toMinorUnits(item.amount, item.scale), item.currency, item.scale)}
                  </span>
                </div>
              ))}
              <Separator className="my-1" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{totalFormatted}</span>
              </div>
            </div>

            {/* Card holder */}
            <div className="space-y-1.5">
              <Label htmlFor="cardHolder">Cardholder name</Label>
              <Input
                id="cardHolder"
                placeholder="Anna Müller"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                autoComplete="cc-name"
              />
            </div>

            {/* Card number */}
            <div className="space-y-1.5">
              <Label htmlFor="cardNumber">Card number</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  autoComplete="cc-number"
                  className="pr-16"
                />
                {rawDigits.length >= 1 && (
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-muted-foreground">
                    {brand}
                  </span>
                )}
              </div>
            </div>

            {/* Expiry + CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="expiry">Expiry</Label>
                <Input
                  id="expiry"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  autoComplete="cc-exp"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  inputMode="numeric"
                  placeholder="123"
                  maxLength={4}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  autoComplete="cc-csc"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full gap-2" size="lg" disabled={!isValid || isProcessing}>
              {isProcessing ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
              {isProcessing ? "Processing…" : `Pay ${totalFormatted}`}
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
