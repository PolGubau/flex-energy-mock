import { AlertCircle, ArrowRight, LogOut, RefreshCw, ShieldCheck, Smartphone } from "lucide-react";
import { motion } from "motion/react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { useTwoFactorAuth } from "../hooks/useTwoFactorAuth";

export function TwoFactorAuthView() {
  const { code, setCode, error, isVerifying, isResending, handleVerify, handleResend, logout } = useTwoFactorAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card p-8 rounded-3xl shadow-xl border border-border text-center"
      >
        <span className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6" aria-hidden="true">
          <ShieldCheck className="size-8 text-primary" />
        </span>

        <h1 className="text-2xl font-bold text-foreground mb-2">Two-Factor Authentication</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Enter the 6-digit code from your authenticator app to secure your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="otp-code" className="sr-only">One-time code</label>
            <input
              id="otp-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full bg-input border-2 border-border rounded-2xl p-4 text-center text-3xl font-bold tracking-[0.5em] text-foreground focus:border-primary focus:ring-0 transition-all placeholder:text-muted-foreground/30"
            />
            {error && (
              <p role="alert" className="flex items-center justify-center gap-2 text-destructive text-xs font-medium">
                <AlertCircle className="size-4" aria-hidden="true" />
                {error}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isVerifying || code.length !== 6}
              className="w-full shadow-lg shadow-primary/20"
            >
              {isVerifying ? "Verifying..." : "Verify code"}
              {!isVerifying && <ArrowRight className="w-5 h-5" aria-hidden="true" />}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleResend}
                disabled={isResending}
                className="w-full justify-center"
              >
                <RefreshCw className={`size-3.5 ${isResending ? "animate-spin" : ""}`} aria-hidden="true" />
                {isResending ? "Sending..." : "Resend code"}
              </Button>
              <Button type="button" variant="secondary" size="sm" className="w-full justify-center">
                <Smartphone className="size-3.5" aria-hidden="true" />
                SMS code
              </Button>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full text-muted-foreground"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </Button>
        </form>
      </motion.article>
    </main>
  );
}
