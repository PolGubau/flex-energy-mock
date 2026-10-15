import { Check, FlaskConical } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  THEME_PRESETS,
  applyTenantTheme,
  getActiveThemeId,
  resetTenantTheme,
  saveTenantTheme,
} from "@/lib/tenant-theme";

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState<string>(getActiveThemeId);

  const handleSelect = (preset: (typeof THEME_PRESETS)[number]) => {
    if (preset.id === "default") {
      resetTenantTheme();
      localStorage.removeItem("tenant-theme");
    } else {
      // Store _id alongside theme tokens so we can restore active state
      saveTenantTheme({ ...preset.theme, _id: preset.id } as Parameters<typeof saveTenantTheme>[0]);
      applyTenantTheme(preset.theme);
    }
    setActiveId(preset.id);
  };

  return (
    <section className="mb-4 md:mb-6">
      <div className="bg-card border border-border rounded-2xl md:rounded-[28px] shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <span className="size-7 rounded-xl bg-primary/10 flex items-center justify-center">
              <FlaskConical className="size-3.5 text-primary" strokeWidth={2} />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">{t("settings.theme.title")}</p>
              <p className="text-[10px] text-muted-foreground">{t("settings.theme.demoDesc")}</p>
            </div>
          </div>

          {/* Demo-only badge */}
          <span className="inline-flex items-center gap-1 bg-warning/10 text-warning border border-warning/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <span className="size-1.5 rounded-full bg-warning" />
            {t("settings.theme.demoOnly")}
          </span>
        </div>

        {/* Swatches */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {THEME_PRESETS.map((preset) => {
              const isActive = activeId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelect(preset)}
                  className={cn(
                    "group flex flex-col items-center gap-2 p-2.5 rounded-2xl transition-all",
                    "hover:bg-muted/60 active:scale-95",
                    isActive && "bg-primary/8 ring-1 ring-primary/30",
                  )}
                >
                  {/* Color circle */}
                  <div className="relative">
                    <span
                      className="block size-10 rounded-full shadow-sm ring-1 ring-black/10 transition-transform group-hover:scale-105"
                      style={{ background: preset.swatch }}
                    />
                    {isActive && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check className="size-4 text-white drop-shadow-sm" strokeWidth={3} />
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <div className="text-center">
                    <p className={cn(
                      "text-[11px] font-semibold leading-tight",
                      isActive ? "text-primary" : "text-foreground",
                    )}>
                      {preset.name}
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{preset.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-[10px] text-muted-foreground/60 text-center">
            {t("settings.theme.demoDesc")}
          </p>
        </div>
      </div>
    </section>
  );
}
