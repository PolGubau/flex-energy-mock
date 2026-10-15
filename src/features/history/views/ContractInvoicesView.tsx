import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  Check,
  Clock3,
  Download,
  FileText,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "@/components/ui/empty-state";
import { TransactionSkeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { getClient } from "@/demo/client";
import { cn } from "@/lib/utils";
import { formatCurrency, type Transaction } from "@/types";
import type { FilterStatus } from "../hooks/useHistory";
import { useHistory } from "../hooks/useHistory";

const FILTERS: FilterStatus[] = ["all", "Settled", "Pending"];

function InvoiceRow({ tx }: { tx: Transaction }) {
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);
  const isSettled = tx.transactionStatus === "Settled";
  const isFailed = tx.transactionStatus === "Failed";
  const StatusIcon = isSettled ? Check : isFailed ? XCircle : Clock3;

  const downloadInvoice = async () => {
    if (!tx.exportId) return;
    setIsDownloading(true);
    try {
      const response = await getClient().fileManager.downloadExport(tx.exportId);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <li className="flex items-center gap-3 px-4 py-4 first:pt-3 last:pb-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <FileText className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {tx.description || t("common.invoice", "Invoice")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {format(parseISO(tx.transactionDate), "d MMM yyyy")}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-bold tabular-nums text-foreground">
            {formatCurrency(Math.abs(tx.amountMinor), tx.currency, tx.scale)}
          </p>
          <span
            className={cn(
              "mt-1 inline-flex items-center gap-1 text-[10px] font-semibold",
              isSettled
                ? "text-success"
                : isFailed
                  ? "text-destructive"
                  : "text-warning",
            )}
          >
            <StatusIcon className="size-3" />
            {t(`history.status.${tx.transactionStatus}`, tx.transactionStatus)}
          </span>
        </div>
        {tx.exportId && (
          <button
            type="button"
            onClick={downloadInvoice}
            disabled={isDownloading}
            aria-label={t("settings.exports.download")}
            className="flex size-8 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10 disabled:opacity-40"
          >
            <Download className="size-4" />
          </button>
        )}
      </div>
    </li>
  );
}

export function ContractInvoicesView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { contractId: routeContractId } = useParams();
  const parsedContractId = Number(routeContractId);
  const contractId = Number.isFinite(parsedContractId)
    ? parsedContractId
    : undefined;
  const { contracts } = useDashboard();
  const {
    transactions,
    filteredTransactions,
    isLoading,
    filterStatus,
    setFilterStatus,
  } = useHistory(contractId);
  const contract = contracts.find((item) => item.contractId === contractId);
  const contractLabel =
    contract?.displayName || contract?.buContractId || t("common.contract");

  return (
    <main className="space-y-5 pb-8 pt-4">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            navigate(contractId ? `/contracts/${contractId}` : "/")
          }
          aria-label={t("common.back")}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">
            {contractLabel}
          </p>
          <h1 className="text-xl font-bold leading-tight text-foreground">
            {t("common.invoices")}
          </h1>
        </div>
      </header>

      <nav
        className="grid grid-cols-3 rounded-2xl bg-muted p-1"
        aria-label={t("common.invoices")}
      >
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setFilterStatus(filter)}
            aria-pressed={filterStatus === filter}
            className={cn(
              "rounded-xl px-2 py-2 text-xs font-semibold transition-colors",
              filterStatus === filter
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {filter === "all"
              ? t("history.filters.all")
              : t(`history.status.${filter}`)}
          </button>
        ))}
      </nav>

      <section aria-labelledby="invoices-list-heading">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2
            id="invoices-list-heading"
            className="text-base font-bold text-foreground"
          >
            {t("common.invoices")}
          </h2>
          {!isLoading && (
            <span className="text-xs text-muted-foreground">
              {filteredTransactions.length}/{transactions.length}
            </span>
          )}
        </div>

        <div className="overflow-hidden rounded-3xl bg-card shadow-sm">
          {isLoading ? (
            <div className="divide-y divide-border/50">
              {Array.from({ length: 5 }, (_, index) => (
                <TransactionSkeleton key={index} />
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={t("history.noResults")}
              description={t("history.noResultsDesc")}
              variant="plain"
              className="py-16"
            />
          ) : (
            <ol className="divide-y divide-border/50">
              {filteredTransactions.map((tx, index) => (
                <InvoiceRow
                  key={tx.orderId ?? tx.transactionDate ?? index}
                  tx={tx}
                />
              ))}
            </ol>
          )}
        </div>
      </section>
    </main>
  );
}