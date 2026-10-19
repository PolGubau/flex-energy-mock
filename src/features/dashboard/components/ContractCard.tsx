import type { LucideIcon } from "lucide-react";
import {
  Clock,
  Droplets,
  Flame,
  QrCode,
  TrendingDown,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  buildContractQRPayload,
  QRCodeSheet,
} from "@/components/ui/qr-code-sheet";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import type { ContractSummary } from "../hooks/useDashboard";
import { TariffDrawer } from "./TariffDrawer";

// ── Commodity theming ────────────────────────────────────────────────────────
export type CommodityType = "electricity" | "gas" | "water";

interface CommodityTheme {
  Icon: LucideIcon;
  label: string;
  backgroundImage: string;
  iconBg: string;
  iconColor: string;
  dotBg: string;
  dotPing: string;
  barHealthy: string;
  hoverRing: string;
  /** RGB triplet for inline gradient & SVG pattern strokes */
  rgb: string;
}

export const COMMODITY: Record<CommodityType, CommodityTheme> = {
  electricity: {
    Icon: Zap,
    label: "Electricity",
    backgroundImage: "/electricity_bg.png",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    dotBg: "bg-primary",
    dotPing: "bg-primary/60",
    barHealthy: "bg-primary",
    hoverRing: "hover:ring-primary/30",
    rgb: "37,99,235",
  },
  gas: {
    Icon: Flame,
    label: "Gas",
    backgroundImage: "/gas_bg.png",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    dotBg: "bg-amber-500",
    dotPing: "bg-amber-400",
    barHealthy: "bg-amber-500",
    hoverRing: "hover:ring-amber-500/30",
    rgb: "245,158,11",
  },
  water: {
    Icon: Droplets,
    label: "Water",
    backgroundImage: "/water_bg.png",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-500",
    dotBg: "bg-cyan-500",
    dotPing: "bg-cyan-400",
    barHealthy: "bg-cyan-500",
    hoverRing: "hover:ring-cyan-500/30",
    rgb: "6,182,212",
  },
};

/** Deterministically assign a fake commodity type until the API provides it. */
export function getCommodityType(contractId: number): CommodityType {
  const types: CommodityType[] = ["electricity", "gas", "water"];
  return types[contractId % 3];
}

interface ContractCardProps {
  c: ContractSummary;
  onRecharge: () => void;
}

export function ContractCard({ c, onRecharge }: ContractCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [qrOpen, setQrOpen] = useState(false);
  const pct = Math.min(100, Math.max(0, c.balancePercent ?? 100));
  const contractLabel = c.buContractId
    ? `${c.buContractId}`
    : `#${c.contractId}`;
  const commodityType = getCommodityType(c.contractId);
  const theme = COMMODITY[commodityType];
  const CommodityIcon = theme.Icon;
  const contractQRPayload = buildContractQRPayload(user?.id ?? 0, c.contractId);

  const barColor =
    pct > 40 ? theme.barHealthy : pct > 15 ? "bg-warning" : "bg-destructive";

  // Diagonal gradient wash at top of card — warning colour when balance is low
  const gradientRgb = c.isLowBalance ? "220,38,38" : theme.rgb;
  const gradientStyle = {
    background: `linear-gradient(150deg, rgba(${gradientRgb},0.11) 0%, rgba(${gradientRgb},0.04) 40%, transparent 65%)`,
  };

  return (
    <>
      <TariffDrawer contractLabel={contractLabel}>
        <motion.article
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className={cn(
            "relative bg-card rounded-[28px] overflow-hidden flex flex-col ring-1 cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[.99]",
            c.isLowBalance
              ? "ring-destructive/50 hover:ring-destructive/70"
              : cn("ring-border", theme.hoverRing),
          )}
        >
          {/* ── Gradient colour wash ────────────────────── */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={gradientStyle}
          />

          {/* ── Header: type identity + contract ID + status ── */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: -8 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative z-10 flex items-center justify-between gap-2 px-5 pt-4 pb-3 border-b border-border/50"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={cn(
                  "w-7 h-7 rounded-xl flex items-center justify-center shrink-0",
                  c.isLowBalance ? "bg-destructive/10" : theme.iconBg,
                )}
              >
                <CommodityIcon
                  className={cn(
                    "size-3.5",
                    c.isLowBalance ? "text-destructive" : theme.iconColor,
                  )}
                />
              </span>
              <div className="min-w-0">
                {/* Type label with live pulsing dot */}
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="relative flex size-1.5 shrink-0">
                    <span
                      className={cn(
                        "animate-ping absolute inline-flex size-full rounded-full opacity-60",
                        c.isLowBalance ? "bg-destructive/60" : theme.dotPing,
                      )}
                    />
                    <span
                      className={cn(
                        "relative inline-flex rounded-full size-1.5",
                        c.isLowBalance ? "bg-destructive" : theme.dotBg,
                      )}
                    />
                  </span>
                  <p
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-widest leading-none",
                      c.isLowBalance ? "text-destructive" : theme.iconColor,
                    )}
                  >
                    {theme.label}
                  </p>
                </div>
                <p className="text-xs font-semibold text-foreground/45 truncate leading-none">
                  {contractLabel}
                </p>
              </div>
            </div>
            <StatusBadge status={c.serviceStatus} />
          </motion.div>

          {/* ── Body — tiled SVG pattern as texture ───────── */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative z-10 flex flex-col flex-1 px-5 pt-4 pb-5 gap-4"
          >
            {/* Balance + Progress Bar (left column) + Low Battery Illustration (right column) */}
            <div className="flex items-center gap-4">
              {/* Left column: saldo + barra */}
              <div className="flex-1 space-y-2">
                <div>
                  <p className="font-bold text-4xl tracking-tight text-foreground tabular-nums leading-none">
                    {c.balanceFormatted}
                  </p>
                  {c.daysLeft !== null && c.daysLeft < 15 && (
                    <div className="mt-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full",
                          c.daysLeft <= 3
                            ? "bg-destructive/10 text-destructive"
                            : "bg-warning/10 text-warning",
                        )}
                      >
                        <Clock className="size-3" />
                        {t("common.daysLeftShort", { count: c.daysLeft })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Battery-styled progress bar */}
                <div className="space-y-1.5">
                  <div className="relative flex items-center gap-1">
                    {/* Main battery bar */}
                    <div
                      className={cn(
                        "flex-1 h-3 rounded-sm border-2 overflow-hidden",
                        barColor === theme.barHealthy
                          ? "border-primary/30"
                          : barColor === "bg-warning"
                            ? "border-warning/30"
                            : "border-destructive/50",
                      )}
                    >
                      <div
                        className={cn(
                          "h-full transition-all duration-700",
                          barColor,
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {/* Battery terminal nub */}
                    <div
                      className={cn(
                        "w-1 h-2 rounded-r",
                        barColor === theme.barHealthy
                          ? "bg-primary/30"
                          : barColor === "bg-warning"
                            ? "bg-warning/30"
                            : "bg-destructive/50",
                      )}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground tabular-nums">
                    {t("common.percentRemaining", { pct: pct.toFixed(0) })}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Footer row: stat + top up ─────────────── */}
            <div className="flex items-center gap-4 border-t border-border pt-4 mt-auto">
              {/* Daily avg stat */}
              <div className="flex-1 flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <TrendingDown className="size-3.5 text-muted-foreground" />
                </span>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {t("dashboard.dailyAvgShort")}
                  </p>
                  <p className="text-sm font-bold text-foreground tabular-nums leading-tight">
                    {c.avgCostFormatted}
                  </p>
                </div>
              </div>

              {/* QR button */}
              <button
                type="button"
                aria-label={t("qr.openContract", "Contract QR code")}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setQrOpen(true);
                }}
                className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0 hover:bg-muted/80 transition-colors"
              >
                <QrCode className="size-3.5 text-muted-foreground" />
              </button>

              {/* Top up button — centered and prominent */}
              {c.isLowBalance && (
                <Button
                  size="lg"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onRecharge();
                  }}
                  className="gap-1.5"
                >
                  <CommodityIcon className="size-4" />
                  {t("dashboard.topUp")}
                </Button>
              )}
            </div>
          </motion.div>
        </motion.article>
      </TariffDrawer>

      <QRCodeSheet
        open={qrOpen}
        onOpenChange={setQrOpen}
        title={contractLabel}
        description={t("qr.contractDesc")}
        payload={contractQRPayload}
        contractName={contractLabel}
      />
    </>
  );
}
