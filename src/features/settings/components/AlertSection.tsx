import { Check, Clock, Mail, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconBox } from "@/components/ui/icon-box";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/context/AppContext";

const DEBOUNCE_MS = 800;

const TIME_INPUT_CLASS =
  "w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";

function QuietHoursForm() {
  const { t } = useTranslation();
  const { state, updateAlertSettings } = useApp();

  const savedStart = state?.alerts.startHour || "08:00";
  const savedEnd = state?.alerts.endHour || "22:00";

  const [startHour, setStartHour] = useState(savedStart);
  const [endHour, setEndHour] = useState(savedEnd);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync if server state changes (e.g. on initial load)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setStartHour(savedStart);
    setEndHour(savedEnd);
  }, [savedStart, savedEnd]);

  // Debounced auto-save
  useEffect(() => {
    if (startHour === savedStart && endHour === savedEnd) return;
    const timer = setTimeout(async () => {
      setSaving(true);
      try {
        await updateAlertSettings({ startHour, endHour });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } finally {
        setSaving(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startHour, endHour]);

  return (
    <div className="flex items-start gap-3 md:gap-4 p-4 md:p-6">
      <IconBox variant="muted" size="md" className="shrink-0">
        <Clock className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
      </IconBox>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className="font-semibold text-xs md:text-base text-foreground">{t("settings.alerts.availableHours")}</p>
          <span className={`flex items-center gap-1 text-[10px] font-semibold transition-opacity duration-300 ${saving ? "opacity-100 text-muted-foreground" : saved ? "opacity-100 text-success" : "opacity-0"}`}>
            {saving ? t("settings.alerts.saving") : <><Check className="size-3" /> {t("settings.alerts.saved")}</>}
          </span>
        </div>
        <p className="text-[10px] md:text-xs text-muted-foreground mb-3">
          {t("settings.alerts.availableHoursDesc")}
        </p>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor="alert-start-hour" className="block text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
              {t("settings.alerts.from")}
            </label>
            <input
              id="alert-start-hour"
              type="time"
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
              className={TIME_INPUT_CLASS}
            />
          </div>
          <span className="text-muted-foreground font-bold pb-2.5" aria-hidden="true">–</span>
          <div className="flex-1">
            <label htmlFor="alert-end-hour" className="block text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
              {t("settings.alerts.to")}
            </label>
            <input
              id="alert-end-hour"
              type="time"
              value={endHour}
              onChange={(e) => setEndHour(e.target.value)}
              className={TIME_INPUT_CLASS}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AlertSection() {
  const { t } = useTranslation();
  const { state, toggleAlert } = useApp();

  if (!state) return null;

  return (
    <section className="mb-4 md:mb-10">
      <h2 className="font-bold text-base md:text-xl mb-3 md:mb-6 px-2 text-foreground">
        {t("settings.alerts.title")}
      </h2>
      <div className="bg-card rounded-[20px] md:rounded-4xl border border-border shadow-sm overflow-hidden">
        <div className="flex justify-between items-center gap-4 p-4 md:p-6 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3 md:gap-4">
            <IconBox variant="primary" size="md">
              <Mail className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </IconBox>
            <div>
              <p id="alert-email-label" className="font-semibold text-xs md:text-base text-foreground">{t("settings.alerts.emailNotifications")}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground">{t("settings.alerts.emailNotificationsDesc")}</p>
            </div>
          </div>
          <Switch
            aria-labelledby="alert-email-label"
            checked={state.alerts.lowBalance}
            onCheckedChange={() => toggleAlert("lowBalance")}
          />
        </div>

        <Separator />

        <div className="flex justify-between items-center gap-4 p-4 md:p-6 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3 md:gap-4">
            <IconBox variant="warning" size="md">
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-warning" />
            </IconBox>
            <div>
              <p id="alert-sms-label" className="font-semibold text-xs md:text-base text-foreground">{t("settings.alerts.smsNotifications")}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground">{t("settings.alerts.smsNotificationsDesc")}</p>
            </div>
          </div>
          <Switch
            aria-labelledby="alert-sms-label"
            checked={state.alerts.peakUsage}
            onCheckedChange={() => toggleAlert("peakUsage")}
          />
        </div>

        <Separator />

        <QuietHoursForm />
      </div>
    </section>
  );
}
