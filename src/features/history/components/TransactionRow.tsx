import { format, parseISO } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, FileText, Loader2 } from "lucide-react";
import type { Key } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getClient } from "@/demo/client";
import type { Transaction } from "@/types";
import { formatCurrency } from "@/types";

export interface TransactionRowProps {
  tx: Transaction;
  key?: Key | null;
}

export function TransactionRow({ tx }: TransactionRowProps) {
  const { t } = useTranslation();
  const isCredit = tx.amountMinor > 0;
  const [loadingPdf, setLoadingPdf] = useState(false);

  const handleViewPdf = async () => {
    if (!tx.exportId) return;
    setLoadingPdf(true);
    try {
      const response = await getClient().fileManager.downloadExport(tx.exportId);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      // Revoke after a delay to allow the new tab to load
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      // silent — non-critical
    } finally {
      setLoadingPdf(false);
    }
  };

  const statusStyle = tx.transactionStatus === "Settled"
    ? "bg-success/10 text-success"
    : tx.transactionStatus === "Failed"
      ? "bg-destructive/10 text-destructive"
      : "bg-warning/10 text-warning";

  return (
    <li className="px-4 py-3.5 md:px-5 md:py-4 border-b border-border/40 last:border-0 hover:bg-muted/25 active:bg-muted/40 transition-colors">
      <article className="flex justify-between items-center gap-3">
        {/* Left: icon + info */}
        <div className="flex items-center gap-3 min-w-0">
          {/* MD3 tonal icon container */}
          <span className={`shrink-0 size-10 rounded-2xl flex items-center justify-center ${isCredit ? "bg-success/12" : "bg-primary/10"}`}>
            {isCredit
              ? <ArrowDownLeft className="size-4.5 text-success" />
              : <ArrowUpRight className="size-4.5 text-primary" />
            }
          </span>

          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-foreground capitalize truncate leading-snug">
              {tx.description}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <time dateTime={tx.transactionDate} className="text-[10px] text-muted-foreground">
                {format(parseISO(tx.transactionDate), "d MMM yyyy")}
              </time>
              <span aria-hidden="true" className="text-border">·</span>
              {/* Status chip */}
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${statusStyle}`}>
                {tx.transactionStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Right: amount + PDF */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`font-bold text-base tabular-nums leading-none ${isCredit ? "text-success" : "text-foreground"}`}>
            {isCredit ? "+" : "−"}
            {formatCurrency(Math.abs(tx.amountMinor), tx.currency, tx.scale)}
          </span>

          {tx.exportId && (
            <button
              type="button"
              onClick={handleViewPdf}
              disabled={loadingPdf}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary/60 hover:text-primary disabled:opacity-40 transition-colors"
              aria-label={t("common.receipt")}
            >
              {loadingPdf
                ? <Loader2 className="size-3 animate-spin" />
                : <FileText className="size-3" />
              }
              {t("common.receipt")}
            </button>
          )}
        </div>
      </article>
    </li>
  );
}
