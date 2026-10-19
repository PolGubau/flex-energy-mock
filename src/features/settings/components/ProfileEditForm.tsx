import { Check, Loader2, Pencil } from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
}

export function ProfileEditForm() {
  const { user, updateProfile } = useAuth();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    companyName: user?.companyName ?? "",
  });

  // Re-sync if user reloads
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        firstName: user.firstName ?? prev.firstName,
        lastName: user.lastName ?? prev.lastName,
        email: user.email ?? prev.email,
        companyName: user.companyName ?? prev.companyName,
        phone: user.phone ?? prev.phone,
      }));
    }
  }, [user]);

  const handleChange =
    (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setError(null);
    };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateProfile(form);
      setSaved(true);
      setIsOpen(false);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError(t("settings.profile.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="px-4 md:px-8 pb-5 md:pb-8">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          onClick={() => setIsOpen(true)}
        >
          {saved ? (
            <>
              <Check className="size-3.5 text-success" />{" "}
              {t("settings.profile.saved")}
            </>
          ) : (
            <>
              <Pencil className="size-3.5" /> {t("settings.profile.edit")}
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 pb-5 md:pb-8 border-t border-border pt-4 mt-2">
      <p className="text-xs font-semibold text-muted-foreground mb-3">
        {t("settings.profile.editTitle")}
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-muted-foreground font-medium block mb-1">
            {t("settings.profile.firstName")}
          </label>
          <Input
            value={form.firstName}
            onChange={handleChange("firstName")}
            placeholder={t("settings.profile.firstName")}
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground font-medium block mb-1">
            {t("settings.profile.lastName")}
          </label>
          <Input
            value={form.lastName}
            onChange={handleChange("lastName")}
            placeholder={t("settings.profile.lastName")}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[10px] text-muted-foreground font-medium block mb-1">
            {t("settings.profile.email")}
          </label>
          <Input
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground font-medium block mb-1">
            {t("settings.profile.phone")}
          </label>
          <Input
            type="tel"
            value={form.phone}
            onChange={handleChange("phone")}
            placeholder="+41 ..."
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground font-medium block mb-1">
            {t("settings.profile.company")}
          </label>
          <Input
            value={form.companyName}
            onChange={handleChange("companyName")}
            placeholder={t("settings.profile.companyName")}
          />
        </div>
      </div>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      <div className="flex gap-2 mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(false);
            setError(null);
          }}
        >
          {t("common.cancel")}
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            t("settings.profile.saveChanges")
          )}
        </Button>
      </div>
    </div>
  );
}
