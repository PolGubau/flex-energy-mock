import { RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { resetDemoState } from "@/demo/store";

export function DemoDataReset() {
  const { t } = useTranslation();

  const handleReset = () => {
    resetDemoState();
    window.location.reload();
  };

  return (
    <section className="mb-4 md:mb-6">
      <motion.button
        type="button"
        onClick={handleReset}
        className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card px-4 py-3.5 text-left shadow-sm transition-all duration-150 hover:border-primary/20 hover:bg-primary/5 active:scale-[.98]"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12">
          <RotateCcw className="size-4.5 text-primary" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="text-sm font-semibold leading-tight text-foreground">
              {t("settings.demoData.title")}
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              {t("settings.theme.demoOnly")}
            </span>
          </span>
          <span className="mt-0.5 block text-[11px] text-muted-foreground">
            {t("settings.demoData.description")}
          </span>
        </span>
        <span className="shrink-0 text-xs font-semibold text-primary">
          {t("settings.demoData.reset")}
        </span>
      </motion.button>
    </section>
  );
}