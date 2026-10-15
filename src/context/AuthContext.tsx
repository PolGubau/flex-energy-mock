import type React from "react";
import { createContext, useContext, useState } from "react";
import { readDemoState, updateDemoState } from "../demo/store";
import type { UserInfo } from "../types";

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface AuthUser extends UserInfo {
  isEmailVerified: boolean;
  is2FAEnabled: boolean;
  is2FAVerified: boolean;
  /** Simulated customer ID from the bundled JSON. */
  customerId: number;
  /** Compatibility field; always empty in the local demo. */
  accessToken: string;
  phone?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateProfile: (profile: Partial<Pick<AuthUser, "firstName" | "lastName" | "email" | "companyName" | "phone">>) => Promise<void>;
  verifyEmail: () => Promise<void>;
  verify2FA: (code: string) => Promise<void>;
  isLoading: boolean;
}

// ─── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Credentials are ignored: demo access only restores the local user.
  const login = async (_email: string, _password: string) => {
    setUser({
      ...readDemoState().user,
      accessToken: "",
      isEmailVerified: true,
      is2FAEnabled: false,
      is2FAVerified: true,
    });
  };

  const loginWithGoogle = async () => {
    await login("", "");
  };

  const verifyEmail = async () => {
    if (user) setUser({ ...user, isEmailVerified: true });
  };

  const verify2FA = async (_code: string) => {
    if (user) setUser({ ...user, is2FAVerified: true });
  };

  const logout = async () => {
    setUser(null);
  };

  const updateProfile: AuthContextType["updateProfile"] = async (profile) => {
    const updated = updateDemoState((state) => {
      state.user = { ...state.user, ...profile };
    });
    setUser(updated.user);
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
        updateProfile,
        verifyEmail,
        verify2FA,
        isLoading: false,
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
