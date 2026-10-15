import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function useTwoFactorAuth() {
  const { verify2FA, logout } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setIsVerifying(true);
    setError(null);
    try {
      await verify2FA(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsResending(false);
    // In a real app, this would trigger a new code email/SMS
  };

  return {
    code,
    setCode,
    error,
    isVerifying,
    isResending,
    handleVerify,
    handleResend,
    logout,
  };
}
