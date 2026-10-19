import { Lock, LogIn, Mail } from "lucide-react";
import { motion } from "motion/react";
import type { FormEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";

export function LoginView({ onShowForgot }: { onShowForgot: () => void }) {
  const { t } = useTranslation();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
    } catch {
      setError(t("auth.incorrectCredentials"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Brand panel — desktop only */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-primary p-12 text-primary-foreground relative overflow-hidden">
        {/* Subtle texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Brand */}
        <div className="relative z-10 space-y-2">
          <img
            src="/logo-flexenergy.jpeg"
            alt="FlexEnergy"
            className="h-10 object-contain opacity-70"
            style={{ mixBlendMode: "multiply" }}
          />
          <div>
            <div className="font-heading font-bold text-lg text-white tracking-tight">
              FlexEnergy
            </div>
            <div className="text-[11px] text-white/45 font-medium">
              {t("auth.energyManagement")}
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="font-heading font-bold text-4xl xl:text-5xl leading-tight text-white mb-3">
              {t("auth.hero.title")
                .split("\n")
                .map((line, i) => (
                  <span key={i}>
                    {line}
                    {i === 0 && <br />}
                  </span>
                ))}
            </h1>
            <p className="text-white/55 text-sm max-w-xs leading-relaxed">
              {t("auth.hero.subtitle")}
            </p>
          </div>

          {/* Live consumption preview card */}
          <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-5 border border-white/12">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">
                  {t("auth.hero.thisWeek")}
                </p>
                <p className="text-2xl font-bold text-white tabular-nums">
                  87.3 kWh
                </p>
              </div>
              <span className="bg-success/25 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-success/30">
                {t("auth.hero.vsLastWeek")}
              </span>
            </div>
            {/* Mini bar chart */}
            <div className="flex items-end gap-1.5 h-14 mb-2">
              {[55, 72, 48, 88, 61, 79, 100].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm transition-all"
                  style={{
                    height: `${h}%`,
                    background:
                      i === 6
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span
                  key={i}
                  className="flex-1 text-center text-[9px] font-semibold"
                  style={{
                    color:
                      i === 6
                        ? "rgba(255,255,255,0.75)"
                        : "rgba(255,255,255,0.25)",
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="relative z-10 text-[11px] text-white/25">
          © 2026 EnergyDynamics AG
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile brand header */}
          <div className="lg:hidden text-center space-y-3">
            <img
              src="/logo-flexenergy.jpeg"
              alt="FlexEnergy"
              className="h-12 mx-auto object-contain opacity-60"
              style={{ mixBlendMode: "multiply" }}
            />
            <div>
              <h1 className="font-heading font-bold text-2xl text-foreground">
                FlexEnergy
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                {t("auth.energyManagement")}
              </p>
            </div>
          </div>

          <div className="bg-card p-8 rounded-3xl shadow-sm border border-border space-y-6">
            <div className="hidden lg:block">
              <h2 className="font-heading font-bold text-2xl text-foreground">
                {t("auth.welcomeBack")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t("auth.signInToAccount")}
              </p>
            </div>

            <p className="rounded-xl bg-primary/10 px-4 py-3 text-xs text-primary">
              {t("auth.demoNotice")}
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  {t("auth.emailAddress")}
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  icon={<Mail className="size-4" />}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  {t("auth.password")}
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  icon={<Lock className="size-4" />}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                  />
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    {t("auth.rememberMe")}
                  </span>
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onShowForgot}
                  className="text-primary hover:text-primary/80 px-0"
                >
                  {t("auth.forgotPassword")}
                </Button>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium px-3.5 py-2.5 rounded-xl">
                  <span className="size-1.5 rounded-full bg-destructive shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
              >
                <LogIn className="size-4" />
                {t("auth.signIn")}
              </Button>
            </form>

            <div className="relative flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                or
              </span>
              <Separator className="flex-1" />
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => loginWithGoogle()}
              className="w-full"
            >
              <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {t("auth.signInWithGoogle")}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              {t("auth.noAccount")}{" "}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 px-0"
              >
                {t("auth.createOne")}
              </Button>
            </p>
          </div>

          <p className="lg:hidden text-center text-xs text-muted-foreground/50">
            © 2026 EnergyDynamics AG
          </p>
        </motion.div>
      </div>
    </div>
  );
}
