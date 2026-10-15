import { format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Download, FileText, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getClient } from "@/demo/client";
import type { ExportItemDto } from "@/lib/smartsphere/modules/file-manager";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;
// Must match the rendered row height exactly (py-3.5 = 28px + ~28px content + 1px border).
const ROW_H = 57;
const LIST_H = PAGE_SIZE * ROW_H; // fixed height prevents layout shift

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Ghost row: invisible placeholder keeping height stable ─────────────────
function GhostRow() {
  return <div style={{ height: ROW_H }} aria-hidden="true" />;
}

// ── Skeleton row: animated shimmer for initial load ────────────────────────
function SkeletonRow({ index }: { index: number }) {
  return (
    <div>
      {index > 0 && <Separator />}
      <div className="flex items-center gap-3 px-4" style={{ height: ROW_H }}>
        <div className="size-4 rounded bg-muted animate-pulse shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-2/5 rounded bg-muted animate-pulse" />
          <div className="h-2.5 w-1/3 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-7 w-20 rounded-lg bg-muted animate-pulse shrink-0" />
      </div>
    </div>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────
interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onPage: (p: number) => void;
  isTransitioning: boolean;
}

function Pagination({ page, totalPages, total, onPrev, onNext, onPage, isTransitioning }: PaginationProps) {
  const rangeStart = (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = allPages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );
  const rendered: (number | "...")[] = [];
  for (let i = 0; i < visible.length; i++) {
    if (i > 0 && visible[i] - visible[i - 1] > 1) rendered.push("...");
    rendered.push(visible[i]);
  }

  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border bg-muted/20">
      {/* Range label */}
      <span className="text-[11px] text-muted-foreground tabular-nums shrink-0 hidden sm:block">
        {rangeStart}–{rangeEnd} of {total}
      </span>

      {/* Page buttons */}
      <nav aria-label="Pagination" className="flex items-center gap-1 mx-auto sm:mx-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onPrev}
          disabled={page === 1 || isTransitioning}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-3.5" />
        </Button>

        {rendered.map((p, i) =>
          p === "..." ? (
            <span key={`ell-${i}`} className="w-7 text-center text-xs text-muted-foreground select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              disabled={isTransitioning}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "h-7 w-7 rounded-md text-xs font-semibold transition-all",
                p === page
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {p}
            </button>
          ),
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onNext}
          disabled={page === totalPages || isTransitioning}
          aria-label="Next page"
        >
          <ChevronRight className="size-3.5" />
        </Button>
      </nav>

      {/* Spinner — only visible during page transitions */}
      <div className="w-10 flex justify-end shrink-0 hidden sm:flex">
        {isTransitioning && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
      </div>
    </div>
  );
}

export function ExportsSection() {
  const { t } = useTranslation();
  // `displayedItems` persists across transitions so the list never collapses to a spinner.
  const [displayedItems, setDisplayedItems] = useState<ExportItemDto[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const offset = (page - 1) * PAGE_SIZE;

  const load = useCallback((p: number, first = false) => {
    if (!first) setIsTransitioning(true);
    setError(null);
    getClient()
      .fileManager.listExports({ page: p, pageSize: PAGE_SIZE, sortDesc: true })
      .then((res) => {
        setDisplayedItems(res.items ?? []);
        setTotal(res.total ?? 0);
      })
      .catch(() => setError(t("settings.exports.loadError")))
      .finally(() => {
        setIsInitialLoad(false);
        setIsTransitioning(false);
      });
  }, []);

  useEffect(() => {
    load(page, isInitialLoad);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDownload = async (item: ExportItemDto) => {
    if (!item.id) return;
    setDownloadingId(item.id);
    try {
      const response = await getClient().fileManager.downloadExport(item.id);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.fileName ?? `export-${item.id}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* silent – non-critical */ }
    finally { setDownloadingId(null); }
  };

  // Always render PAGE_SIZE rows — pad missing slots with ghost rows so height stays fixed.
  type RowData =
    | { type: "skeleton"; i: number }
    | { type: "ghost"; i: number }
    | { type: "item"; item: ExportItemDto; i: number };

  const rows: RowData[] = isInitialLoad
    ? Array.from({ length: PAGE_SIZE }, (_, i) => ({ type: "skeleton", i }))
    : [
      ...displayedItems.map((item, i) => ({ type: "item" as const, item, i })),
      ...Array.from({ length: PAGE_SIZE - displayedItems.length }, (_, i) => ({
        type: "ghost" as const,
        i: displayedItems.length + i,
      })),
    ];

  const isEmpty = !isInitialLoad && displayedItems.length === 0 && total === 0;

  return (
    <section className="mb-4 md:mb-10">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t("settings.exports.dataExports")}
          </h3>
          {total > 0 && (
            <span className="text-[10px] font-medium text-muted-foreground/60 bg-muted rounded-full px-2 py-0.5 tabular-nums">
              {total}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs h-7"
          onClick={() => load(page)}
          disabled={isInitialLoad || isTransitioning}
        >
          <RefreshCw className={cn("size-3", (isInitialLoad || isTransitioning) && "animate-spin")} />
          {t("settings.exports.refresh")}
        </Button>
      </div>

      <div className="bg-card rounded-[20px] md:rounded-[28px] border border-border shadow-sm overflow-hidden">
        {error ? (
          <div style={{ height: LIST_H }} className="flex items-center justify-center">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        ) : isEmpty ? (
          <div style={{ height: LIST_H }} className="flex flex-col items-center justify-center gap-2 text-center px-4">
            <FileText className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t("settings.exports.noExports")}</p>
            <p className="text-xs text-muted-foreground/60">{t("settings.exports.noExportsDesc")}</p>
          </div>
        ) : (
          <>
            {/* Fixed-height list — never collapses on page change */}
            <div
              style={{ height: LIST_H }}
              className={cn("overflow-hidden transition-opacity duration-150", isTransitioning && "opacity-50")}
              aria-busy={isTransitioning}
            >
              {rows.map((row) => {
                if (row.type === "skeleton") return <div key={`sk-${row.i}`}><SkeletonRow index={row.i} /></div>;
                if (row.type === "ghost") return <GhostRow key={`gh-${row.i}`} />;
                const { item, i } = row;
                return (
                  <div key={item.id ?? i}>
                    {i > 0 && <Separator />}
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4" style={{ height: ROW_H }}>
                      <FileText className="size-4 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.fileName ?? `export-${offset + i + 1}`}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {format(parseISO(item.createdAtUtc as string), "d MMM yyyy")}
                          {" · "}
                          {formatBytes(item.contentLength)}
                          {item.fileFormat ? ` · ${item.fileFormat.toUpperCase()}` : ""}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 gap-1.5 text-xs"
                        onClick={() => handleDownload(item)}
                        disabled={downloadingId === item.id || isTransitioning}
                      >
                        {downloadingId === item.id
                          ? <Loader2 className="size-3.5 animate-spin" />
                          : <Download className="size-3.5" />}

                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {total > 0 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                onPrev={() => setPage((p) => p - 1)}
                onNext={() => setPage((p) => p + 1)}
                onPage={setPage}
                isTransitioning={isTransitioning}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
