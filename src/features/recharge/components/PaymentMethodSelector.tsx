import { Check, CreditCard, Plus, Smartphone, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { IconBox } from "@/components/ui/icon-box";
import { cn } from "@/lib/utils";
import { formatCurrency, toMinorUnits } from "@/types";
import type { PaymentMethod } from "../hooks/useRecharge";

interface PaymentMethodSelectorProps {
  amount: number;
  selectedMethod: string;
  paymentMethods: PaymentMethod[];
  isSuccess: boolean;
  onSelectMethod: (id: string) => void;
  onConfirm: () => void;
}

function MethodIcon({ type }: { type: PaymentMethod["type"] }) {
  const cls = "w-5 h-5 text-primary";
  if (type === "card") return <CreditCard className={cls} />;
  if (type === "google_pay") return <Smartphone className={cls} />;
  return <Wallet className={cls} />;
}

export function PaymentMethodSelector({
  amount,
  selectedMethod,
  paymentMethods,
  isSuccess,
  onSelectMethod,
  onConfirm,
}: PaymentMethodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentMethod =
    paymentMethods.find((m) => m.id === selectedMethod) ?? paymentMethods[0];

  return (
    <div className="bg-card p-4 md:p-6 rounded-3xl border border-border shadow-sm space-y-4 md:space-y-6">
      {/* Current method row */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <IconBox variant="primary" size="lg">
              <MethodIcon type={currentMethod.type} />
            </IconBox>
            <div>
              <h3 className="font-semibold text-sm md:text-base text-foreground">
                {currentMethod.label}
              </h3>
              <p className="text-[11px] md:text-xs text-muted-foreground">
                {currentMethod.details}
              </p>
            </div>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="secondary" size="sm">
              {isOpen ? "Cancel" : "Change"}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 space-y-1"
          >
            {paymentMethods.map((method) => (
              <Button
                key={method.id}
                variant="ghost"
                onClick={() => {
                  onSelectMethod(method.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full h-auto justify-between p-3 rounded-xl",
                  selectedMethod === method.id
                    ? "bg-primary/10 text-primary"
                    : "text-foreground"
                )}
              >
                <div className="flex items-center gap-3 text-left">
                  <span aria-hidden="true">
                    <MethodIcon type={method.type} />
                  </span>
                  <div>
                    <p className="text-xs font-medium">{method.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {method.details}
                    </p>
                  </div>
                </div>
                {selectedMethod === method.id && (
                  <Check className="size-4 text-primary" />
                )}
              </Button>
            ))}

            <Button
              variant="ghost"
              className="w-full h-auto justify-start gap-3 p-3 rounded-xl border border-dashed border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
            >
              <Plus className="size-4" />
              <span className="text-xs font-medium">Add payment method</span>
            </Button>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>

      {/* Confirm button */}
      <Button
        variant="primary"
        size="lg"
        onClick={onConfirm}
        disabled={amount <= 0}
        className="w-full"
      >
        Top up {formatCurrency(toMinorUnits(amount))}
      </Button>

      {isSuccess && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs text-success"
        >
          Balance updated successfully
        </motion.p>
      )}
    </div>
  );
}
