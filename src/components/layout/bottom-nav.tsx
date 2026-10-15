import type { LucideIcon } from "lucide-react";
import { AlertCircle, BarChart3, Bell, CheckCircle2, History, Home, Info, Settings, X, Zap } from "lucide-react";
import { motion } from "motion/react";
import { Popover } from "radix-ui";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { t } = useTranslation();
  const { state, markNotificationAsRead, clearNotifications } = useApp();
  const notifications = state?.notifications ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="size-4 text-success" />;
      case "warning": return <AlertCircle className="size-4 text-warning" />;
      default: return <Info className="size-4 text-primary" />;
    }
  };

  const mobileNavItems: { icon: LucideIcon; label: string; path: string }[] = [
    { icon: Home, label: t("nav.home"), path: "/" },
    { icon: Zap, label: t("nav.recharge"), path: "/recharge" },
    { icon: BarChart3, label: t("nav.usage"), path: "/usage" },
    { icon: History, label: t("nav.history"), path: "/history" },
  ];

  const sidebarNavItems: { icon: LucideIcon; label: string; path: string }[] = [
    ...mobileNavItems,
    { icon: Settings, label: t("nav.settings"), path: "/settings" },
  ];
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();

  const handleNavClick = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const initials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((n) => (n as string)[0].toUpperCase())
    .join("") || "?";

  return (
    <>
      {/* ── Desktop sidebar (MD3 Expressive) ────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-card border-r border-border/60 z-50">
        {/* Brand */}
        <div className="px-5 py-6">
          <hgroup className="flex items-center gap-3">
            <span className="size-10 bg-primary rounded-2xl flex items-center justify-center shadow-md shadow-primary/30" aria-hidden="true">
              <Zap className="size-5 text-white" strokeWidth={2.5} />
            </span>
            <div>
              <strong className="font-bold text-foreground text-base tracking-tight leading-none">FlexEnergy</strong>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{t("nav.smartEnergy")}</p>
            </div>
          </hgroup>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-4">
          {sidebarNavItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavClick(item.path)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer group",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-pill"
                    className="absolute inset-0 bg-primary/10 rounded-2xl"
                    transition={{ type: "spring", stiffness: 400, damping: 38 }}
                  />
                )}
                {!isActive && (
                  <span className="absolute inset-0 rounded-2xl bg-transparent group-hover:bg-muted/60 transition-colors duration-150" />
                )}
                <item.icon className={cn("size-4 shrink-0 relative z-10 transition-all", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Notifications */}
        <div className="px-3 pb-2">
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                type="button"
                className="relative w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150 cursor-pointer group"
              >
                <Bell className="size-4 shrink-0 stroke-2" />
                <span>{t("settings.notifications.title")}</span>
                {unreadCount > 0 && (
                  <span className="ml-auto size-5 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="right"
                align="end"
                sideOffset={12}
                className="z-50 w-80 bg-card rounded-3xl shadow-2xl border border-border overflow-hidden outline-none animate-in fade-in zoom-in-95 duration-200"
              >
                <header className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                  <h3 className="font-semibold text-sm text-foreground">{t("settings.notifications.title")}</h3>
                  <div className="flex gap-3 items-center">
                    <button
                      type="button"
                      onClick={() => clearNotifications()}
                      className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      {t("common.clearAll")}
                    </button>
                    <Popover.Close className="text-muted-foreground hover:text-foreground transition-colors">
                      <X className="size-4" />
                    </Popover.Close>
                  </div>
                </header>
                <ol className="max-h-[60vh] overflow-y-auto" aria-live="polite">
                  {notifications.length === 0 ? (
                    <li className="p-10 text-center space-y-3 list-none">
                      <figure className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <Bell className="size-6 text-border" aria-hidden="true" />
                      </figure>
                      <p className="text-xs text-muted-foreground">{t("settings.notifications.noNew")}</p>
                    </li>
                  ) : (
                    notifications.map((n) => (
                      <li key={n.id} className="list-none">
                        <button
                          type="button"
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`w-full text-left p-4 border-b border-border/50 hover:bg-muted/40 transition-colors cursor-pointer relative group ${!n.read ? "bg-primary/5" : ""}`}
                        >
                          {!n.read && <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary" aria-hidden="true" />}
                          <article className="flex gap-3">
                            <span className="mt-0.5 shrink-0" aria-hidden="true">{getNotifIcon(n.type)}</span>
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-foreground tracking-tight">{n.title}</p>
                              <p className="text-xs truncate text-muted-foreground leading-relaxed">{n.message}</p>
                              <time dateTime={n.timestamp} className="text-[10px] text-muted-foreground/70">
                                {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </time>
                            </div>
                          </article>
                        </button>
                      </li>
                    ))
                  )}
                </ol>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>

        {/* User footer */}
        <address className="px-3 pb-5 not-italic">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-muted/50 border border-border/60">
            <span className="size-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0" aria-hidden="true">
              <span className="text-xs font-bold text-primary">{initials}</span>
            </span>
            <dl className="min-w-0 flex-1">
              <dt className="sr-only">Name</dt>
              <dd className="text-sm font-semibold text-foreground truncate leading-tight">
                {user?.firstName} {user?.lastName}
              </dd>
              <dt className="sr-only">Email</dt>
              <dd className="text-xs text-muted-foreground truncate">{user?.email}</dd>
            </dl>
          </div>
        </address>
      </aside>

      {/* ── Mobile bottom nav (MD3 Expressive) ──────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* blur backdrop */}
        <div className="absolute inset-0 bg-card/85 backdrop-blur-2xl border-t border-border/40 shadow-[0_-1px_24px_rgba(0,0,0,.06)]" />
        <div className="relative flex justify-around items-end px-2 pb-safe pt-1">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                type="button"
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className="flex flex-col flex-1 items-center gap-0.5 py-2 cursor-pointer group focus-visible:outline-none"
                aria-current={isActive ? "page" : undefined}
              >
                {/* MD3 pill container */}
                <span className="relative flex items-center justify-center w-14 h-8 rounded-full transition-all duration-300">
                  {isActive && (
                    <motion.span
                      layoutId="mobile-nav-pill"
                      className="absolute inset-0 bg-primary/12 rounded-full"
                      transition={{ type: "spring", stiffness: 420, damping: 38 }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      "relative z-10 transition-all duration-300",
                      isActive
                        ? "size-5 text-primary stroke-[2.5px]"
                        : "size-5 text-muted-foreground stroke-2 group-hover:text-foreground group-hover:scale-110",
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold leading-none transition-all duration-300",
                    isActive ? "text-primary" : "text-muted-foreground/70",
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* iOS home indicator spacer */}
        <div className="h-safe-area-inset-bottom" />
      </nav>
    </>
  );
}
