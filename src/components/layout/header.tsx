import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Info,
  Settings,
  X,
} from "lucide-react";
import { Popover } from "radix-ui";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { state, markNotificationAsRead, clearNotifications } = useApp();
  const { user } = useAuth();
  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || "User";
  const initials =
    [user?.firstName, user?.lastName]
      .filter(Boolean)
      .map((name) => name?.[0]?.toUpperCase())
      .join("") || "?";

  const notifications = state?.notifications ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;
  const getNotificationText = (
    notification: (typeof notifications)[number],
  ) => {
    const key = `settings.notifications.demo.${notification.id}`;
    return {
      title: t(`${key}.title`, { defaultValue: notification.title }),
      message: t(`${key}.message`, { defaultValue: notification.message }),
    };
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="size-4 text-success" />;
      case "warning":
        return <AlertCircle className="size-4 text-warning" />;
      default:
        return <Info className="size-4 text-primary" />;
    }
  };

  if (pathname !== "/") return null;

  return (
    <header className="fixed top-0 right-0 left-0 z-40 border-b border-border/60 bg-card/85 shadow-[0_1px_16px_rgba(0,0,0,.04)] backdrop-blur-2xl lg:hidden">
      <div className="mx-auto flex h-18 w-full max-w-5xl items-center justify-between px-5 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-sm font-bold text-primary">
            {initials}
          </span>
          <div className="flex min-w-0 flex-col">
            <p className="text-[11px] font-medium text-muted-foreground">
              {t("auth.welcomeBack")}
            </p>
            <p className="truncate text-[15px] font-bold leading-tight tracking-tight text-foreground">
              {userName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="flex size-10 items-center justify-center rounded-2xl outline-none transition-all active:scale-95 hover:bg-muted/70"
            aria-label={t("nav.settings")}
            title={t("nav.settings")}
          >
            <Settings className="size-4.5 text-muted-foreground" />
          </button>

          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                type="button"
                className="relative flex size-10 items-center justify-center rounded-2xl outline-none transition-all active:scale-95 hover:bg-muted/70"
                aria-label={t("settings.notifications.title")}
              >
                <Bell className="size-4.5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-4.5 h-4.5 px-1 bg-destructive text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-card">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                className="z-50 w-[calc(100vw-2rem)] max-w-80 overflow-hidden rounded-3xl border border-border bg-card shadow-2xl outline-none animate-in fade-in zoom-in-95 duration-200"
                align="end"
                sideOffset={8}
              >
                <header className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                  <h3 className="font-semibold text-sm text-foreground">
                    {t("settings.notifications.title")}
                  </h3>
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
                <ol
                  className="max-h-[min(60vh,28rem)] overflow-y-auto overscroll-contain"
                  aria-live="polite"
                >
                  {notifications.length === 0 ? (
                    <li className="p-10 text-center space-y-3 list-none">
                      <figure className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <Bell
                          className="size-6 text-border"
                          aria-hidden="true"
                        />
                      </figure>
                      <p className="text-xs text-muted-foreground">
                        {t("settings.notifications.noNew")}
                      </p>
                    </li>
                  ) : (
                    notifications.map((n) => {
                      const content = getNotificationText(n);
                      return (
                        <li key={n.id} className="list-none">
                          <button
                            type="button"
                            onClick={() => markNotificationAsRead(n.id)}
                            className={`w-full text-left p-4 border-b border-border/50 hover:bg-muted/40 transition-colors cursor-pointer relative group ${!n.read ? "bg-primary/5" : ""}`}
                          >
                            {!n.read && (
                              <span
                                className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
                                aria-hidden="true"
                              />
                            )}
                            <article className="flex gap-3">
                              <span
                                className="mt-0.5 shrink-0"
                                aria-hidden="true"
                              >
                                {getIcon(n.type)}
                              </span>
                              <div className="space-y-1">
                                <p className="text-xs font-semibold text-foreground tracking-tight">
                                  {content.title}
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {content.message}
                                </p>
                                <time
                                  dateTime={n.timestamp}
                                  className="text-[10px] text-muted-foreground/70"
                                >
                                  {new Date(n.timestamp).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </time>
                              </div>
                            </article>
                          </button>
                        </li>
                      );
                    })
                  )}
                </ol>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>
    </header>
  );
}
