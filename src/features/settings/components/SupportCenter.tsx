import { BookOpen, HelpCircle, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IconBox } from "@/components/ui/icon-box";

export function SupportCenter() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const supportItems = [
    {
      icon: HelpCircle,
      title: t("settings.support.knowledgeBase"),
      description: t("settings.support.knowledgeBaseDesc"),
      href: null,
    },
    {
      icon: MessageSquare,
      title: t("settings.support.direct"),
      description: t("settings.support.directDesc"),
      href: null,
    },
    {
      icon: BookOpen,
      title: t("settings.support.faqTitle"),
      description: t("settings.support.faqDesc"),
      href: "/settings/faq",
    },
  ];

  return (
    <section className="mb-4 md:mb-10">
      <h2 className="font-bold text-base md:text-xl mb-3 md:mb-6 px-2 text-foreground">
        {t("settings.support.center")}
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 list-none p-0">
        {supportItems.map(({ icon: Icon, title, description, href }) => (
          <li key={title}>
            <Button
              variant="ghost"
              onClick={() => href && navigate(href)}
              className="w-full h-auto text-left flex-col items-start gap-2 md:gap-4 bg-card p-4 md:p-6 rounded-[20px] md:rounded-[32px] border border-border shadow-sm hover:bg-muted/30 group"
            >
              <IconBox
                variant="primary"
                size="lg"
                className="group-hover:scale-110 transition-transform"
              >
                <Icon className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary" />
              </IconBox>
              <div>
                <h3 className="font-semibold text-xs md:text-base text-foreground mb-0.5">
                  {title}
                </h3>
                <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed font-normal">
                  {description}
                </p>
              </div>
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
