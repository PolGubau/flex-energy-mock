import { cn } from "@/lib/utils";

/** Animated shimmer base block */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-muted",
        className,
      )}
    />
  );
}

/** Full hero skeleton — mirrors DashboardHero full-bleed layout */
export function HeroSkeleton() {
  return (
    <div className="relative bg-foreground -mx-4 lg:-mx-10 -mt-16 lg:-mt-18 flex flex-col items-center text-center px-6 md:px-10 pt-28 pb-14 md:pt-32 md:pb-16">
      {/* Label */}
      <Skeleton className="h-2.5 w-20 bg-white/20 mb-3" />
      {/* Balance */}
      <Skeleton className="h-10 md:h-14 w-44 md:w-64 bg-white/25 rounded-2xl mb-16" />
      {/* Stat pills */}
      <div className="flex items-center justify-center gap-2">
        <Skeleton className="h-7 w-24 rounded-xl bg-white/15" />
        <Skeleton className="h-7 w-32 rounded-xl bg-white/10" />
        <Skeleton className="h-7 w-20 rounded-xl bg-white/10" />
      </div>
    </div>
  );
}

/** Contract card skeleton */
export function ContractCardSkeleton() {
  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-2.5 w-20" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
      </div>
      <div className="flex justify-between pt-2 border-t border-border">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

const CHART_SKELETON_HEIGHTS = [52, 35, 70, 48, 85, 60, 42];

/** Chart area skeleton */
export function ChartSkeleton({ height = "h-56" }: { height?: string }) {
  return (
    <div className={cn("w-full flex items-end gap-1.5 px-2", height)}>
      {CHART_SKELETON_HEIGHTS.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-lg animate-pulse bg-muted"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

/** Stat card row skeleton */
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Skeleton className="h-16 rounded-2xl" />
      <Skeleton className="h-16 rounded-2xl" />
    </div>
  );
}

/** Transaction list item skeleton */
export function TransactionSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-border/50 last:border-0">
      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-2.5 w-20" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );
}
