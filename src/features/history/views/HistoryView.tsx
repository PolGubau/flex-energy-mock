import { ArrowLeft, ArrowUpDown, History, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { TransactionSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { HistorySummary } from '../components/HistorySummary';
import { TransactionRow } from '../components/TransactionRow';
import type { FilterStatus, FilterType, SortField } from '../hooks/useHistory';
import { useHistory } from '../hooks/useHistory';

export function HistoryView() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const TYPE_FILTERS: { label: string; value: FilterType }[] = [
    { label: t("history.filters.all"), value: 'all' },
    { label: t("history.status.Settled"), value: 'credit' },
    { label: t("history.status.Failed"), value: 'debit' },
  ];

  const STATUS_FILTERS: { label: string; value: FilterStatus }[] = [
    { label: t("history.filters.all"), value: 'all' },
    { label: t("history.filters.settled"), value: 'Settled' },
    { label: t("history.filters.pending"), value: 'Pending' },
    { label: t("history.filters.failed"), value: 'Failed' },
  ];

  const SORT_OPTIONS: { label: string; value: SortField }[] = [
    { label: t("history.sort.newest"), value: 'date-desc' },
    { label: t("history.sort.oldest"), value: 'date-asc' },
    { label: t("history.sort.highest"), value: 'amount-desc' },
    { label: t("history.sort.lowest"), value: 'amount-asc' },
  ];
  const {
    transactions,
    filteredTransactions,
    isLoading,
    weeklySpent,
    weeklyRecharged,
    chartData,
    efficiencyScore,
    search,
    setSearch,
    sortBy,
    setSortBy,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
  } = useHistory();

  const hasActiveFilters =
    search.trim() !== '' || filterType !== 'all' || filterStatus !== 'all' || sortBy !== 'date-desc';

  function clearFilters() {
    setSearch('');
    setFilterType('all');
    setFilterStatus('all');
    setSortBy('date-desc');
  }

  return (
    <div className="space-y-6 md:space-y-8 pt-4 lg:pt-6">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label={t("common.back")}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="text-lg font-bold text-foreground">
          {t("history.title")}
        </h1>
      </header>

      <HistorySummary
        weeklySpent={weeklySpent}
        weeklyRecharged={weeklyRecharged}
        efficiencyScore={efficiencyScore}
        chartData={chartData}
        isLoading={isLoading}
      />

      <section>
        <div className="mb-3 px-1 flex items-center justify-between gap-3">
          <h2 className="font-bold text-lg md:text-xl text-foreground tracking-tight flex items-center gap-2">
            {t("history.title")}
            {!isLoading && transactions.length > 0 && (
              <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {filteredTransactions.length}/{transactions.length}
              </span>
            )}
          </h2>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-3" />
              Clear
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-3 mb-4">
          {/* Search */}
          <Input
            placeholder={t("history.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="size-4" />}
            className="h-11 rounded-2xl text-sm bg-muted/40 border-border/60 focus-visible:bg-card"
          />

          {/* Type + Status chips row */}
          <div className="flex gap-2 flex-wrap items-center">
            {/* Type filter: segmented control */}
            <div className="flex p-1 bg-muted rounded-2xl gap-0.5">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilterType(f.value)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                    filterType === f.value
                      ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Status chips */}
            <div className="flex gap-1.5 flex-wrap">
              {STATUS_FILTERS.filter(f => f.value !== 'all').map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilterStatus(filterStatus === f.value ? 'all' : f.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                    filterStatus === f.value
                      ? f.value === 'Settled'
                        ? 'bg-success/10 text-success border-success/25'
                        : f.value === 'Failed'
                          ? 'bg-destructive/10 text-destructive border-destructive/25'
                          : 'bg-warning/10 text-warning border-warning/25'
                      : 'bg-muted text-muted-foreground border-transparent hover:border-border',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort toggle — cycles through options */}
            <button
              type="button"
              onClick={() => {
                const idx = SORT_OPTIONS.findIndex(s => s.value === sortBy);
                setSortBy(SORT_OPTIONS[(idx + 1) % SORT_OPTIONS.length].value);
              }}
              className={cn(
                'ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                sortBy !== 'date-desc'
                  ? 'bg-primary/10 text-primary border-primary/25'
                  : 'bg-muted text-muted-foreground border-transparent hover:border-border',
              )}
            >
              <ArrowUpDown className="size-3" />
              {SORT_OPTIONS.find(s => s.value === sortBy)?.label ?? 'Sort'}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="bg-card rounded-3xl overflow-hidden border border-border shadow-sm">
          {isLoading ? (
            <div className="divide-y divide-border/50">
              {Array.from({ length: 5 }, (_, i) => <TransactionSkeleton key={i} />)}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <EmptyState
              icon={History}
              title={t("history.noResults")}
              description={t("history.noResultsDesc")}
              action={hasActiveFilters ? { label: t("history.filters.all"), onClick: clearFilters } : undefined}
              variant="plain"
              className="py-16"
            />
          ) : (
            <ol className="list-none p-0">
              {filteredTransactions.map((tx, i) => {
                const rowKey = String(tx.orderId ?? tx.transactionDate ?? i);
                return <TransactionRow key={rowKey} tx={tx} />;
              })}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}
