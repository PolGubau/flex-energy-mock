import { ArrowRight, LogOut, Mail, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useEmailVerification } from "../hooks/useEmailVerification";

export function EmailVerificationView() {
  const { user, isSending, isResending, handleVerify, handleResend, logout } = useEmailVerification();

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card p-8 rounded-3xl shadow-xl border border-border text-center"
      >
        <span className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6" aria-hidden="true">
          <Mail className="size-8 text-primary" />
        </span>

        <h1 className="text-2xl font-bold text-foreground mb-2">Verify your email</h1>
        <p className="text-muted-foreground text-sm mb-8">
          We've sent a verification link to{" "}
          <strong className="font-semibold text-foreground">{user?.email}</strong>.
          Please check your inbox.
        </p>

        <nav className="space-y-3" aria-label="Verification actions">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleVerify}
            disabled={isSending}
            className="w-full"
          >
            {isSending ? "Verifying..." : "I've verified my email"}
            {!isSending && <ArrowRight className="w-5 h-5" aria-hidden="true" />}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={handleResend}
            disabled={isResending}
            className="w-full"
          >
            <RefreshCw className={`size-4 ${isResending ? "animate-spin" : ""}`} aria-hidden="true" />
            {isResending ? "Resending..." : "Resend email"}
          </Button>

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
        </nav>
      </motion.article>
    </main>
  );
}
