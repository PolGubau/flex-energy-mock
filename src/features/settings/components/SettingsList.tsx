import { ChevronRight, CreditCard, Lock, LogOut, type LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface SettingsItem {
  icon: LucideIcon;
  label: string;
  description?: string;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
  destructive?: boolean;
  comingSoon?: boolean;
}

export function SettingsList() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [feedbackKey, setFeedbackKey] = useState<string | null>(null);

  const showFeedback = (key: string) => {
    setFeedbackKey(key);
    setTimeout(() => setFeedbackKey(null), 2000);
  };

  const items: SettingsItem[] = [
    {
      icon: Lock,
      label: t("settings.items.privacy"),
      description: t("settings.items.privacyDesc"),
      iconBg: "bg-primary/12",
      iconColor: "text-primary",
      comingSoon: true,
    },
    {
      icon: CreditCard,
      label: t("settings.items.payment"),
      description: t("settings.items.paymentDesc"),
      iconBg: "bg-success/12",
      iconColor: "text-success",
      comingSoon: true,
    },
    {
      icon: LogOut,
      label: t("settings.items.logout"),
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      onClick: logout,
      destructive: true,
    },
  ];

  return (
    <section className="mb-4 md:mb-6 space-y-2">
      {items.map((item, i) => (
        <motion.button
          key={item.label}
          type="button"
          onClick={item.comingSoon ? () => showFeedback(item.label) : item.onClick}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl",
            "bg-card border border-border shadow-sm",
            "transition-all duration-150 active:scale-[.98] cursor-pointer text-left",
            item.destructive
              ? "hover:bg-destructive/5 hover:border-destructive/20"
              : "hover:bg-muted/40 hover:border-border",
          )}
        >
          {/* Tonal icon container */}
          <span className={cn("size-10 rounded-2xl flex items-center justify-center shrink-0", item.iconBg)}>
            <item.icon className={cn("size-4.5", item.iconColor)} strokeWidth={2} />
          </span>

          {/* Label + description */}
          <div className="flex-1 min-w-0">
            <p className={cn("text-sm font-semibold leading-tight", item.destructive ? "text-destructive" : "text-foreground")}>
              {item.label}
            </p>
            {item.description && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
            )}
          </div>

          {/* Coming soon badge or chevron */}
          <AnimatePresence mode="wait">
            {item.comingSoon && feedbackKey === item.label ? (
              <motion.span
                key="soon"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0"
              >
                {t("settings.items.comingSoon")}
              </motion.span>
            ) : !item.destructive ? (
              <motion.span key="chevron" initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
                <ChevronRight className="size-4 text-muted-foreground/40 shrink-0" aria-hidden="true" />
              </motion.span>
            ) : null}
          </AnimatePresence>
        </motion.button>
      ))}
    </section>
  );
}

