import { ArrowLeft, Mail, Send } from "lucide-react";
import { motion } from "motion/react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

export function ForgotPasswordView({ onBack }: { onBack: () => void }) {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setIsSent(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8"
      >
        <hgroup className="text-center space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">FlexEnergy</h1>
          <p className="text-sm text-muted-foreground">EnergyDynamics Platform</p>
        </hgroup>

        <section className="bg-card p-8 rounded-3xl shadow-xl shadow-border border border-border space-y-6">
          <hgroup className="space-y-2 text-center">
            <h2 className="text-xl font-bold text-foreground tracking-tight">Reset Password</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </hgroup>

          {isSent ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-success/10 border border-success/20 rounded-2xl text-center space-y-4"
            >
              <span className="w-12 h-12 bg-success/15 rounded-full flex items-center justify-center mx-auto" aria-hidden="true">
                <Send className="size-6 text-success" />
              </span>
              <p className="text-sm font-semibold text-success">Check your inbox</p>
              <p className="text-xs text-success/80 leading-relaxed">
                We've sent a password reset link to <span className="font-bold">{email}</span>.
              </p>
              <Button variant="primary" size="lg" onClick={onBack} className="w-full bg-success hover:bg-success/90">
                Back to Login
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="reset-email" className="text-xs font-medium text-muted-foreground ml-1">
                  Email address
                </label>
                <Input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  icon={<Mail className="size-4" />}
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full">
                  <Send className="size-4" />
                  Send Reset Link
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={onBack} className="w-full">
                  <ArrowLeft className="size-4" />
                  Back to Login
                </Button>
              </div>
            </form>
          )}
        </section>

        <p className="text-center text-xs text-muted-foreground/50">© 2026 EnergyDynamics AG</p>
      </motion.div>
    </main>
  );
}
