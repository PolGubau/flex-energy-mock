import { Check, Loader2, Pencil } from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { getClient } from "@/lib/smartsphere";
import { CustomerApiError } from "@/lib/smartsphere/modules/customers";

function resolveCustomerError(err: unknown): string {
  if (err instanceof CustomerApiError) {
    if (err.errorCode === "DUPLICATE_EMAIL") return "This email is already in use.";
    return err.message || "Failed to save. Please try again.";
  }
  return "Failed to save. Please try again.";
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
}

export function ProfileEditForm() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: "",
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
      }));
    }
  }, [user]);

  const handleChange = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setError(null);
    try {
      await getClient().customers.createCustomer({
        firstName: form.firstName || null,
        lastName: form.lastName || null,
        email: form.email || null,
        phone: form.phone || null,
        companyName: form.companyName || null,
      });
      setSaved(true);
      setIsOpen(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(resolveCustomerError(err));
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
            <><Check className="size-3.5 text-success" /> Saved</>
          ) : (
            <><Pencil className="size-3.5" /> Edit profile</>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 pb-5 md:pb-8 border-t border-border pt-4 mt-2">
      <p className="text-xs font-semibold text-muted-foreground mb-3">Edit profile</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-muted-foreground font-medium block mb-1">First name</label>
          <Input value={form.firstName} onChange={handleChange("firstName")} placeholder="First name" />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground font-medium block mb-1">Last name</label>
          <Input value={form.lastName} onChange={handleChange("lastName")} placeholder="Last name" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[10px] text-muted-foreground font-medium block mb-1">Email</label>
          <Input type="email" value={form.email} onChange={handleChange("email")} placeholder="you@example.com" />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground font-medium block mb-1">Phone</label>
          <Input type="tel" value={form.phone} onChange={handleChange("phone")} placeholder="+41 ..." />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground font-medium block mb-1">Company</label>
          <Input value={form.companyName} onChange={handleChange("companyName")} placeholder="Company name" />
        </div>
      </div>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      <div className="flex gap-2 mt-4">
        <Button variant="ghost" size="sm" onClick={() => { setIsOpen(false); setError(null); }}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
