import { Check, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "@/i18n";
import { cn } from "@/lib/utils";

function supportsColorEmoji() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return false;

  canvas.width = 32;
  canvas.height = 32;
  context.font = "24px sans-serif";
  context.fillText("🇮🇹", 0, 24);

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  for (let index = 0; index < pixels.length; index += 4) {
    const [red, green, blue, alpha] = pixels.slice(index, index + 4);
    if (alpha > 0 && (red !== green || green !== blue)) return true;
  }

  return false;
}

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const active = i18n.resolvedLanguage ?? i18n.language ?? "en";
  const [hasColorEmoji, setHasColorEmoji] = useState(false);

  useEffect(() => {
    setHasColorEmoji(supportsColorEmoji());
  }, []);

  const handleSelect = (code: string) => {
    void i18n.changeLanguage(code);
  };

  return (
    <section className="mb-4 md:mb-6">
      <div className="bg-card border border-border rounded-2xl md:rounded-[28px] shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border bg-muted/30">
          <span className="size-7 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Globe className="size-3.5 text-primary" strokeWidth={2} />
          </span>
          <p className="text-sm font-semibold text-foreground leading-tight">
            {t("settings.language.title")}
          </p>
        </div>

        {/* Language options */}
        <div className="p-3">
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${SUPPORTED_LANGUAGES.length}, 1fr)` }}
            role="radiogroup"
            aria-label={t("settings.language.title")}
          >
            {SUPPORTED_LANGUAGES.map(({ code, flag, abbreviation }) => {
              const isActive = active.startsWith(code);
              const label = t(`settings.language.${code}` as Parameters<typeof t>[0]);
              return (
                <button
                  key={code}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => handleSelect(code)}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 px-3 py-3 rounded-2xl transition-all duration-150",
                    "border text-sm font-semibold active:scale-[.97]",
                    isActive
                      ? "bg-primary/8 border-primary/25 text-primary shadow-sm"
                      : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "font-bold leading-none",
                      hasColorEmoji ? "text-2xl" : "text-xs",
                    )}
                    aria-hidden="true"
                  >
                    {hasColorEmoji ? flag : abbreviation}
                  </span>
                  <span className="text-xs font-semibold leading-tight">{label}</span>
                  {isActive && (
                    <span className="absolute top-2 right-2 size-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
