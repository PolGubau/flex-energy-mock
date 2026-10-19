import { ScanLine, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet";

// ── Hardcoded app identifier — replace with real value from backend ──────────
const APP_ID = "flexenergy-demo-v1";

// ── Payload builders ─────────────────────────────────────────────────────────

export interface DashboardQRPayload {
  appId: string;
  userId: number;
  type: "dashboard";
  ts: string;
}

export interface ContractQRPayload {
  appId: string;
  userId: number;
  contractId: number;
  type: "contract";
}

export type QRPayload = DashboardQRPayload | ContractQRPayload;

export function buildDashboardQRPayload(userId: number): DashboardQRPayload {
  return {
    appId: APP_ID,
    userId,
    type: "dashboard",
    ts: new Date().toISOString(),
  };
}

export function buildContractQRPayload(
  userId: number,
  contractId: number,
): ContractQRPayload {
  return { appId: APP_ID, userId, contractId, type: "contract" };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface QRCodeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  payload: QRPayload;
  contractName?: string;
}

export function QRCodeSheet({
  open,
  onOpenChange,
  title,
  description,
  payload,
  contractName,
}: QRCodeSheetProps) {
  const { t } = useTranslation();
  const value = JSON.stringify(payload);
  const contractLabel =
    payload.type === "contract" ? `CO-${payload.contractId}` : null;
  const handleShare = async () => {
    if (navigator.share) await navigator.share({ title, text: value });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="pb-8">
        <SheetHeader>
          <SheetTitle>
            {payload.type === "contract" ? t("qr.rechargeTitle") : title}
          </SheetTitle>
          <SheetDescription>
            {description ?? t("qr.scanDescription")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col items-center px-5 text-center">
          <div className="w-full rounded-2xl border border-primary/10 bg-primary/5 p-4 sm:max-w-sm">
            <div className="rounded-xl bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80">
              <QRCodeSVG
                value={value}
                size={188}
                level="H"
                includeMargin
                className="mx-auto block"
              />
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-primary">
              <ScanLine className="size-4" />
              <span>{t("qr.scanHint")}</span>
            </div>
          </div>
          {contractLabel && (
            <div className="mt-4">
              <p className="text-sm font-bold text-foreground">
                {contractName ?? contractLabel}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {contractLabel}
              </p>
            </div>
          )}
          <div className="mt-4 flex w-full items-start gap-3 rounded-xl border border-border/70 bg-card px-3.5 py-3 text-left">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ScanLine className="size-4" />
            </span>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t("qr.operatorHint")}
            </p>
          </div>
          {navigator.share && (
            <button
              type="button"
              onClick={handleShare}
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-background text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
            >
              <Share2 className="size-4" />
              {t("qr.share")}
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
