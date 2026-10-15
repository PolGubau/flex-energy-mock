import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function useEmailVerification() {
  const { user, verifyEmail, logout } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async () => {
    setIsSending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await verifyEmail();
    setIsSending(false);
  };

  const handleResend = async () => {
    setIsResending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsResending(false);
  };

  return {
    user,
    isSending,
    isResending,
    handleVerify,
    handleResend,
    logout,
  };
}
