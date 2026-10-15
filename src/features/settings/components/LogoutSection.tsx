import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function LogoutSection() {
  const { logout } = useAuth();

  return (
    <section className="mb-4 md:mb-10">
      <div className="bg-card rounded-[20px] md:rounded-[32px] border border-border shadow-sm overflow-hidden">
        <Button
          size="lg"
          variant="ghost"
          className="w-full justify-start rounded-none px-4 py-3.5 md:py-4 text-destructive hover:bg-destructive/5 hover:text-destructive gap-2.5 md:gap-4"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
          <span className="font-medium text-xs md:text-base">Log out</span>
        </Button>
      </div>
    </section>
  );
}
