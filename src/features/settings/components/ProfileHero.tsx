import { BadgeCheck, Building2, ChevronRight, Hash, Mail, Shield, ShieldCheck, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Drawer } from "vaul";
import { useAuth } from "@/context/AuthContext";

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ firstName, lastName }: { firstName?: string; lastName?: string }) {
  const initials = [firstName?.[0], lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";
  return (
    <div className="size-16 md:size-20 rounded-[20px] md:rounded-[24px] bg-primary/12 flex items-center justify-center shrink-0 shadow-sm">
      <span className="text-2xl md:text-3xl font-bold text-primary select-none">{initials}</span>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="py-3 px-4 md:px-5">
      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm font-semibold text-foreground truncate ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  mono?: boolean;
  accent?: "success" | "warning";
  children?: ReactNode;
}) {
  const valueColor =
    accent === "success"
      ? "text-success"
      : accent === "warning"
        ? "text-warning"
        : "text-foreground";

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/60 last:border-0">
      <span className="flex items-center justify-center size-8 rounded-xl bg-background border border-border/60 shrink-0">
        <Icon className="size-3.5 text-muted-foreground" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold leading-tight">
          {label}
        </p>
        <p className={`text-sm font-semibold mt-0.5 truncate ${mono ? "font-mono" : ""} ${valueColor}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 mt-5 first:mt-0">
      {children}
    </p>
  );
}

// ─── ProfileHero ──────────────────────────────────────────────────────────────

export function ProfileHero() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "—";

  return (
    <section className="mb-4 md:mb-6">
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Trigger asChild>
          <div
            role="button"
            tabIndex={0}
            className="bg-card rounded-2xl md:rounded-[28px] border border-border shadow-sm overflow-hidden cursor-pointer hover:border-primary/30 transition-colors group"
          >
            {/* ── Header ── */}
            <div className="flex items-center gap-4 md:gap-5 p-5 md:p-7">
              <Avatar firstName={user.firstName} lastName={user.lastName} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="font-bold text-base md:text-xl tracking-tight text-foreground truncate leading-tight">
                      {fullName}
                    </h1>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {user.email || "—"}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="bg-success/10 text-success text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {t("settings.profile.active")}
                  </span>
                  {user.isEmailVerified && (
                    <span className="bg-muted text-muted-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {t("settings.profile.emailVerified")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Info strip ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 border-t border-border divide-x divide-border">
              <InfoCell label={t("settings.profile.company")} value={user.companyName || "—"} />
              <InfoCell label={t("settings.profile.accountId")} value={`#${user.id}`} mono />
              <div className="hidden md:flex items-center justify-start py-3 px-5 gap-1.5">
                <span className="size-1.5 rounded-full bg-success inline-block shrink-0" aria-hidden="true" />
                <span className="text-xs text-muted-foreground">{t("settings.profile.connected")}</span>
              </div>
            </div>
          </div>
        </Drawer.Trigger>

        {/* ── Detail drawer ── */}
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[28px] bg-background shadow-xl max-h-[90vh] focus:outline-none">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="px-5 pb-4 pt-2 shrink-0">
              <div className="flex items-center gap-4">
                <Avatar firstName={user.firstName} lastName={user.lastName} />
                <div>
                  <Drawer.Title className="text-lg font-bold text-foreground leading-tight">
                    {fullName}
                  </Drawer.Title>
                  <Drawer.Description className="text-sm text-muted-foreground mt-0.5">
                    {user.email || "—"}
                  </Drawer.Description>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 pb-10 overflow-y-auto">
              {/* Personal */}
              <SectionLabel>{t("settings.profile.personal")}</SectionLabel>
              <div className="bg-muted/40 rounded-2xl px-4">
                <DetailRow icon={User} label={t("settings.profile.firstName")} value={user.firstName || "—"} />
                <DetailRow icon={User} label={t("settings.profile.lastName")} value={user.lastName || "—"} />
                <DetailRow icon={Mail} label={t("settings.profile.email")} value={user.email || "—"} />
                <DetailRow icon={Building2} label={t("settings.profile.company")} value={user.companyName || "—"} />
              </div>

              {/* Account */}
              <SectionLabel>{t("settings.profile.account")}</SectionLabel>
              <div className="bg-muted/40 rounded-2xl px-4">
                <DetailRow icon={Hash} label={t("settings.profile.accountId")} value={String(user.id)} mono />
                <DetailRow icon={Hash} label={t("settings.profile.customerId")} value={String(user.customerId)} mono />
              </div>

              {/* Security */}
              <SectionLabel>{t("settings.profile.security")}</SectionLabel>
              <div className="bg-muted/40 rounded-2xl px-4">
                <DetailRow
                  icon={user.isEmailVerified ? BadgeCheck : Shield}
                  label={t("settings.profile.emailVerified")}
                  value={user.isEmailVerified ? t("common.yes") : t("common.no")}
                  accent={user.isEmailVerified ? "success" : "warning"}
                />
                <DetailRow
                  icon={ShieldCheck}
                  label={t("settings.profile.twoFactor")}
                  value={user.is2FAEnabled ? t("common.enabled") : t("common.disabled")}
                  accent={user.is2FAEnabled ? "success" : undefined}
                />
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </section>
  );
}
