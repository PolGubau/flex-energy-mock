import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { clearAuthToken } from "../lib/smartsphere";
import type { UserInfo } from "../types";

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface AuthUser extends UserInfo {
  isEmailVerified: boolean;
  is2FAEnabled: boolean;
  is2FAVerified: boolean;
  /** Numeric customer ID from the SmartSphere JWT sub claim */
  customerId: number;
  /** Access token for API calls */
  accessToken: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  verify2FA: (code: string) => Promise<void>;
  isLoading: boolean;
}

// ─── Demo user (hardcoded for demo — no real login required) ───────────────────
const DEMO_CUSTOMER_ID = 271;

const DEMO_USER: AuthUser = {
  id: DEMO_CUSTOMER_ID,
  customerId: DEMO_CUSTOMER_ID,
  email: "demo@flexenergy.com",
  firstName: "Demo",
  lastName: "User",
  companyName: "FlexEnergy Demo",
  accessToken: "",
  isEmailVerified: true,
  is2FAEnabled: false,
  is2FAVerified: true,
};

// ─── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-login with demo user on mount — no credentials needed
  useEffect(() => {
    setUser(DEMO_USER);
    setIsLoading(false);
  }, []);

  // No-op: demo mode always uses the hardcoded user
  const login = async (_email: string, _password: string) => {
    setUser(DEMO_USER);
  };

  const loginWithGoogle = async () => {
    setUser(DEMO_USER);
  };

  const verifyEmail = async () => {
    if (user) setUser({ ...user, isEmailVerified: true });
  };

  const verify2FA = async (_code: string) => {
    if (user) setUser({ ...user, is2FAVerified: true });
  };

  const logout = async () => {
    clearAuthToken();
    setUser(null);
  };

  const forgotPassword = async (_email: string) => {
    // No-op in demo mode
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        logout,
        forgotPassword,
        verifyEmail,
        verify2FA,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
