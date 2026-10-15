import { useCallback, useState } from "react";
import { formatCurrency, toMinorUnits } from "@/types";

export interface CartItem {
  contractId: number;
  /** Amount in CHF (display units) */
  amount: number;
  label: string;
  currency: string;
  scale: number;
  balanceFormatted: string;
}

export function useRechargeCart() {
  const [cart, setCart] = useState<Map<number, CartItem>>(new Map());

  const addToCart = useCallback((item: CartItem) => {
    if (item.amount <= 0) return;
    setCart((prev) => {
      const next = new Map(prev);
      next.set(item.contractId, item);
      return next;
    });
  }, []);

  const removeFromCart = useCallback((contractId: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      next.delete(contractId);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => setCart(new Map()), []);

  const items: CartItem[] = Array.from(cart.values());
  const count = items.length;

  const totalFormatted =
    items.length > 0
      ? formatCurrency(
          items.reduce(
            (sum: number, item: CartItem) =>
              sum + toMinorUnits(item.amount, item.scale),
            0,
          ),
          items[0].currency,
          items[0].scale,
        )
      : "CHF 0.00";

  const totalAmount = items.reduce(
    (sum: number, item: CartItem) => sum + item.amount,
    0,
  );

  return {
    cart,
    items,
    count,
    addToCart,
    removeFromCart,
    clearCart,
    totalFormatted,
    totalAmount,
  };
}
