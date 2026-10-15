import { BarChart3, History, Home, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContractCardSkeleton, HeroSkeleton, Skeleton } from "./skeleton";

const BAR_HEIGHTS = [45, 62, 38, 78, 55, 90, 48];

const SIDEBAR_ITEMS = [
  { icon: Home, label: "Home", active: true },
  { icon: Zap, label: "Recharge" },
  { icon: BarChart3, label: "Usage" },
  { icon: History, label: "History" },
  { icon: Settings, label: "Settings" },
];

const MOBILE_NAV_ITEMS = SIDEBAR_ITEMS.slice(0, 4);

function SidebarSkeleton() {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 flex-col bg-card border-r border-border z-50">
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <span className="size-8 bg-primary rounded-xl flex items-center justify-center">
            <Zap className="size-4 text-white" />
          </span>
          <strong className="font-bold text-foreground text-base tracking-tight">FlexEnergy</strong>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {SIDEBAR_ITEMS.map((item) => (
          <div
            key={item.label}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl",
              item.active ? "bg-primary/10" : "",
            )}
          >
            <item.icon className={cn("size-4 shrink-0", item.active ? "text-primary" : "text-muted-foreground/40")} />
            <Skeleton className={cn("h-3", item.active ? "w-16 bg-primary/20" : "w-20")} />
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-2.5 w-36" />
          </div>
        </div>
      </div>
    </aside>
  );
}

function HeaderSkeleton() {
  return (
    <header className="fixed top-0 left-0 right-0 lg:left-60 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="flex justify-between items-center px-6 lg:px-10 h-16 w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
        <Skeleton className="size-10 rounded-full" />
      </div>
    </header>
  );
}

function BottomNavSkeleton() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center p-2 bg-card/80 backdrop-blur-2xl border-t border-border/50 z-50">
      {MOBILE_NAV_ITEMS.map((item, i) => (
        <div key={item.label} className="flex flex-col flex-1 items-center justify-center py-2 gap-1">
          <item.icon className={cn("size-5", i === 0 ? "text-primary" : "text-muted-foreground/30")} />
          <Skeleton className="h-2 w-8" />
        </div>
      ))}
    </nav>
  );
}

function UsagePreviewSkeleton() {
  return (
    <div className="bg-card rounded-3xl border border-border p-5 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex items-end gap-1.5 h-28">
        {BAR_HEIGHTS.map((h, i) => (
          <div key={i} className="flex-1 animate-pulse rounded-t-md bg-muted" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-14 rounded-2xl" />
        <Skeleton className="h-14 rounded-2xl" />
      </div>
    </div>
  );
}

function QuickActionsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <Skeleton className="size-14 rounded-2xl" />
          <Skeleton className="h-2.5 w-12" />
        </div>
      ))}
    </div>
  );
}

export function AppLoadingScreen() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <SidebarSkeleton />
      <HeaderSkeleton />
      <BottomNavSkeleton />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <main className="flex-1 pt-20 pb-28 lg:pb-10 px-4 lg:px-10">
          <div className="max-w-2xl mx-auto lg:max-w-5xl lg:mx-0 space-y-5 md:space-y-6 pt-4 lg:pt-6">
            <HeroSkeleton />
            <QuickActionsSkeleton />
            <UsagePreviewSkeleton />
            <ContractCardSkeleton />
          </div>
        </main>
      </div>
    </div>
  );
}
