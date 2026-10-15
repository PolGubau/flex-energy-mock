import { format, parseISO } from "date-fns";
import { Zap } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Drawer } from "vaul";
import { Skeleton } from "@/components/ui/skeleton";
import { getClient } from "@/lib/smartsphere";
import type {
  TariffDataDto,
  TariffRateDataDto,
} from "@/lib/smartsphere/modules/tariffs";

interface TariffDrawerProps {
  contractLabel: string;
  children: ReactNode;
}

function formatAmount(minor: number, scale: number): string {
  return (minor / 10 ** scale).toFixed(scale);
}

function RateRow({ rate }: { rate: TariffRateDataDto }) {
  const { t } = useTranslation();
  const formatted = formatAmount(rate.amountMinor, rate.scale);
  const validFrom = format(parseISO(rate.validFrom as string), "d MMM yyyy");
  const validTo = format(parseISO(rate.validTo as string), "d MMM yyyy");
  return (
    <div className="px-5 py-3.5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">
          {formatted} {rate.unitOfMeasure ?? "CHF/kWh"}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {validFrom} → {validTo}
        </p>
      </div>
      {rate.assigned && (
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          {t("dashboard.tariff.active")}
        </span>
      )}
    </div>
  );
}

export function TariffDrawer({ contractLabel, children }: TariffDrawerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [tariffs, setTariffs] = useState<TariffDataDto[]>([]);
  const [rates, setRates] = useState<TariffRateDataDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    setError(null);

    getClient()
      .tariffs.listElectricalTariffs({ enabled: true })
      .then(async (res) => {
        const list = res.tariffs ?? [];
        setTariffs(list);
        // Fetch rates for the first assigned tariff
        const assigned = list.find((t) => t.assigned) ?? list[0];
        if (assigned?.tariffId) {
          const ratesRes = await getClient().tariffs.listElectricalTariffRates({
            tariffId: assigned.tariffId,
          });
          setRates(ratesRes.tariffRates ?? []);
        }
      })
      .catch(() => setError(t("dashboard.tariff.loadError")))
      .finally(() => setIsLoading(false));
  }, [open]);

  const activeTariff = tariffs.find((t) => t.assigned) ?? tariffs[0];

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[28px] bg-background shadow-xl max-h-[90vh] focus:outline-none">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          {/* Header */}
          <div className="px-5 pb-4 pt-2 shrink-0">
            <Drawer.Title className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Zap className="size-4 text-primary" />
              {t("dashboard.tariff.title")}
            </Drawer.Title>
            <Drawer.Description className="text-sm text-muted-foreground mt-0.5">
              {contractLabel}
            </Drawer.Description>
          </div>

          {/* Body */}
          <div className="pb-8 px-5 pt-2 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-3">
                {/* Plan card skeleton */}
                <div className="bg-muted/50 rounded-2xl px-4 py-3 border border-border space-y-2">
                  <Skeleton className="h-2.5 w-8" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
                {/* Rate schedule skeleton */}
                <div className="rounded-2xl border border-border overflow-hidden bg-card">
                  <div className="px-5 py-2.5 bg-muted/30 border-b border-border">
                    <Skeleton className="h-2.5 w-24" />
                  </div>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="px-5 py-3.5 flex justify-between items-center border-b border-border last:border-0">
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-2.5 w-36" />
                      </div>
                      <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <p className="text-xs text-destructive text-center py-6">{error}</p>
            ) : (
              <>
                {activeTariff && (
                  <div className="mb-4 bg-muted/50 rounded-2xl px-4 py-3 border border-border">
                    <p className="text-[10px] text-muted-foreground mb-0.5 font-medium uppercase tracking-wider">
                      {t("dashboard.tariff.plan")}
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {activeTariff.tariffName ?? activeTariff.tariffId}
                    </p>
                    {activeTariff.currency && (
                      <p className="text-[11px] text-muted-foreground">
                        {activeTariff.currency}
                      </p>
                    )}
                  </div>
                )}
                {rates.length > 0 ? (
                  <div className="rounded-2xl border border-border overflow-hidden bg-card">
                    <p className="px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border">
                      {t("dashboard.tariff.rateSchedule")}
                    </p>
                    {rates.map((r, i) => (
                      <div key={r.tariffRateId ?? i} className="border-b border-border last:border-0">
                        <RateRow rate={r} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {t("dashboard.tariff.noRates")}
                  </p>
                )}
              </>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
