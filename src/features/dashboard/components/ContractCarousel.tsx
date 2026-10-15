import { ChevronRight, QrCode } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { ContractSummary } from "../hooks/useDashboard";
import { ContractCard } from "./ContractCard";

interface ContractCarouselProps {
  contracts: ContractSummary[];
  onRecharge: () => void;
  onQRClick?: () => void;
}

export function ContractCarousel({
  contracts,
  onRecharge,
  onQRClick,
}: ContractCarouselProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const GAP_PX = 12;

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[0] as HTMLElement | null;
    if (!card) return;
    setActiveIndex(Math.round(el.scrollLeft / (card.offsetWidth + GAP_PX)));
  }

  function scrollToIndex(index: number) {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[0] as HTMLElement | null;
    if (!card) return;
    el.scrollTo({
      left: index * (card.offsetWidth + GAP_PX),
      behavior: "smooth",
    });
  }

  return (
    <div>
      <div className="xl:hidden space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">
            {t("dashboard.yourContracts")}
          </p>
          <div className="flex items-center gap-2">
            {onQRClick && (
              <button
                type="button"
                onClick={onQRClick}
                aria-label="Open QR code"
                className="inline-flex items-center justify-center size-7 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
              >
                <QrCode className="size-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("/contracts")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {t("dashboard.viewAllContracts")}
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="-mx-4 flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 pt-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {contracts.map((c) => (
            <div
              key={c.contractId}
              className="w-[calc(100vw-2rem)] shrink-0 snap-center"
            >
              <ContractCard c={c} onRecharge={onRecharge} />
            </div>
          ))}
          <div className="w-4 shrink-0" aria-hidden="true" />
        </div>

        {contracts.length > 1 && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              {contracts.map((c, i) => (
                <button
                  key={c.contractId}
                  type="button"
                  aria-label={`Go to contract ${i + 1}`}
                  onClick={() => scrollToIndex(i)}
                  className={cn(
                    "rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    i === activeIndex
                      ? "w-6 h-2 bg-foreground"
                      : "w-2 h-2 bg-foreground/25 hover:bg-foreground/50",
                  )}
                />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Swipe to see all contracts
            </p>
          </div>
        )}
      </div>

      <div className="hidden xl:block space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">
            {t("dashboard.yourContracts")}
          </p>
          <div className="flex items-center gap-2">
            {onQRClick && (
              <button
                type="button"
                onClick={onQRClick}
                aria-label="Open QR code"
                className="inline-flex items-center justify-center size-7 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
              >
                <QrCode className="size-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("/contracts")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {t("dashboard.viewAllContracts")}
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="grid xl:grid-cols-2 gap-4">
          {contracts.map((c) => (
            <ContractCard key={c.contractId} c={c} onRecharge={onRecharge} />
          ))}
        </div>
      </div>
    </div>
  );
}
