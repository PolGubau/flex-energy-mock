/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { AppLoadingScreen } from "@/components/ui/app-loading-screen";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AppProvider, useApp } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { EmailVerificationView } from "@/features/auth/views/EmailVerificationView";
import { ForgotPasswordView } from "@/features/auth/views/ForgotPasswordView";
import { LoginView } from "@/features/auth/views/LoginView";
import { TwoFactorAuthView } from "@/features/auth/views/TwoFactorAuthView";
import { ContractDetailView } from "@/features/dashboard/views/ContractDetailView";
import { DashboardView } from "@/features/dashboard/views/DashboardView";
import { ServiceOverviewView } from "@/features/dashboard/views/ServiceOverviewView";
import { ContractInvoicesView } from "@/features/history/views/ContractInvoicesView";
import { HistoryView } from "@/features/history/views/HistoryView";
import { RechargeView } from "@/features/recharge/views/RechargeView";
import { FaqView } from "@/features/settings/views/FaqView";
import { SettingsView } from "@/features/settings/views/SettingsView";
import { ContractUsageView } from "@/features/usage/views/ContractUsageView";
import { UsageView } from "@/features/usage/views/UsageView";

function AnimatedRoutes() {
  const location = useLocation();
  const { pathname } = location;

  useEffect(() => {
    if (!pathname) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <Routes location={location}>
          <Route path="/" element={<DashboardView />} />
          <Route path="/contracts" element={<ServiceOverviewView />} />
          <Route
            path="/contracts/:contractId"
            element={<ContractDetailView />}
          />
          <Route
            path="/contracts/:contractId/usage"
            element={<ContractUsageView />}
          />
          <Route
            path="/contracts/:contractId/invoices"
            element={<ContractInvoicesView />}
          />
          <Route path="/usage" element={<UsageView />} />
          <Route path="/recharge" element={<RechargeView />} />
          <Route path="/history" element={<HistoryView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/settings/faq" element={<FaqView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.section>
    </AnimatePresence>
  );
}

function MainContent() {
  const { isLoading: isAppLoading } = useApp();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [authView, setAuthView] = useState<"login" | "forgot">("login");
  const { pathname } = useLocation();
  const isDashboard = pathname === "/";

  if (isAuthLoading || isAppLoading) {
    return <AppLoadingScreen />;
  }

  if (!user) {
    return (
      <AnimatePresence mode="wait">
        {authView === "login" ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoginView onShowForgot={() => setAuthView("forgot")} />
          </motion.div>
        ) : (
          <motion.div
            key="forgot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ForgotPasswordView onBack={() => setAuthView("login")} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (!user.isEmailVerified) return <EmailVerificationView />;
  if (user.is2FAEnabled && !user.is2FAVerified) return <TwoFactorAuthView />;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary">
      <BottomNav />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Header />
        <main
          className={`flex-1 ${isDashboard ? "pt-22" : "pt-0"} lg:pt-6 pb-20 lg:pb-10 px-4 lg:px-10`}
        >
          <div className="max-w-2xl mx-auto lg:max-w-5xl lg:mx-0">
            <ErrorBoundary>
              <AnimatedRoutes />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <MainContent />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
