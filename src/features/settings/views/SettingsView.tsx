import { AlertSection } from "../components/AlertSection";
import { ExportsSection } from "../components/ExportsSection";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { ProfileHero } from "../components/ProfileHero";
import { SettingsList } from "../components/SettingsList";
import { SupportCenter } from "../components/SupportCenter";
import { ThemeSwitcher } from "../components/ThemeSwitcher";

export function SettingsView() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(space.16))] pt-4 lg:pt-6">
      <ProfileHero />
      <div className="space-y-0 flex-1">
        <AlertSection />
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
      <div className="space-y-0 mt-auto">
        <ExportsSection />
        <SupportCenter />
        <SettingsList />
      </div>
    </div>
  );
}
