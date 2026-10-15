import { QrCode, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import type { CommodityType } from "./ContractCard";

interface DashboardHeroProps {
  totalBalanceFormatted: string;
  consume: number;
  chartData: { value: number }[];
  chartLoading: boolean;
  trend: number;
  activeFilter: CommodityType | "all";
  onQRClick?: () => void;
}

export function DashboardHero({
  totalBalanceFormatted,
  consume,
  chartData,
  chartLoading,
  trend,
  activeFilter,
  onQRClick,
}: DashboardHeroProps) {
  const { t } = useTranslation();
  const isPositiveTrend = trend > 0;
  const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;

  // Video map for different commodity types
  const videoSrc = "/5145-183300148.mp4";

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative overflow-hidden bg-foreground -mx-4 lg:-mx-10 -mt-16 lg:-mt-18"
    >
      {/* Background video */}
      <motion.video
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        aria-hidden="true"
        autoPlay
        loop
        muted
        playsInline
        className="pointer-events-none absolute inset-0 size-full object-cover"
        src={videoSrc}
      />
      {/* Gradient overlay — dark at top/bottom, lighter in the middle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-foreground/70 via-foreground/30 to-background"
      />

      {/* Content */}
      <div className="relative z-10 px-6 md:px-10 lg:px-10 pt-28 pb-14 md:pt-32 md:pb-16 flex flex-col items-center text-center">
        {/* Balance */}
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-2">
          {t("dashboard.totalBalance")}
        </p>
        <p className="font-heading font-bold text-4xl md:text-6xl tracking-tight text-white tabular-nums leading-none mb-16">
          {totalBalanceFormatted}
        </p>

        {/* Stat pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {/* Energy consumption pill */}
          <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white shadow-lg text-slate-800 text-xs font-semibold tracking-wide">
            <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-600">
              <Zap className="size-3" />
            </span>
            {consume.toFixed(1)} kWh
          </span>

          {/* Trend pill */}
          {chartData.length > 1 &&
            (chartLoading ? (
              <Skeleton className="h-9 w-40 rounded-full bg-white/15" />
            ) : (
              <span
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-xs font-semibold tracking-wide ${isPositiveTrend
                  ? "bg-amber-50 text-amber-900"
                  : "bg-emerald-50 text-emerald-900"
                  }`}
              >
                <span
                  className={`flex items-center justify-center size-5 rounded-full ${isPositiveTrend
                    ? "bg-amber-200 text-amber-700"
                    : "bg-emerald-200 text-emerald-700"
                    }`}
                >
                  <TrendIcon className="size-3" />
                </span>
                {Math.abs(trend).toFixed(1)} kWh{" "}
                {t("dashboard.thisWeek").toLowerCase()}
              </span>
            ))}

          {/* QR code trigger */}
          {onQRClick && (
            <button
              type="button"
              onClick={onQRClick}
              aria-label={t("qr.openDashboard", "Open QR code")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold tracking-wide shadow-lg hover:bg-white/20 transition-colors"
            >
              <QrCode className="size-3.5" />
              {t("qr.ricarica", "Ricarica")}
            </button>
          )}
        </div>
      </div>
    </motion.section>
  );
}
