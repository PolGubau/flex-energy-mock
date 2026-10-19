import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import i18n from "@/i18n";
import { apiService } from "../services/api";
import type { AlertSettings, AppState, Notification } from "../types";
import { toMinorUnits } from "../types";
import { useAuth } from "./AuthContext";

export interface CartRechargeItem {
  contractId: number;
  amount: number; // CHF
  scale: number;
}

interface AppContextType {
  state: AppState | null;
  recharge: (amount: number) => Promise<void>;
  rechargeContract: (
    contractId: number,
    amount: number,
    scale: number,
  ) => Promise<void>;
  rechargeCart: (items: CartRechargeItem[]) => Promise<void>;
  refreshState: () => Promise<void>;
  toggleAlert: (key: keyof AlertSettings) => Promise<void>;
  updateAlertSettings: (settings: Partial<AlertSettings>) => Promise<void>;
  addNotification: (
    title: string,
    message: string,
    type: Notification["type"],
  ) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  updateContractDisplayName: (
    contractId: number,
    displayName: string,
  ) => Promise<void>;
  /** First simulated contract ID, used by the feature hooks. */
  contractId: number;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reload app state whenever the authenticated user changes
  useEffect(() => {
    if (!user) {
      setState(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    let cancelled = false;
    apiService
      .getAppState(user.id)
      .then((data) => {
        if (!cancelled) setState(data);
      })
      .catch(() => {
        if (!cancelled) setState(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const contractId = state?.dashboard?.contracts?.[0]?.contractId ?? 0;

  const refreshState = async () => {
    if (user) setState(await apiService.getAppState(user.id));
  };

  const recharge = async (amount: number) => {
    if (!state?.dashboard || !user) return;
    await rechargeCart([{ contractId, amount, scale: state.dashboard.scale }]);
  };

  const rechargeContract = async (
    targetContractId: number,
    amount: number,
    scale: number,
  ) => {
    await rechargeCart([{ contractId: targetContractId, amount, scale }]);
  };

  const rechargeCart = async (items: CartRechargeItem[]) => {
    if (!state?.dashboard || !user || items.length === 0) return;

    if (
      items.some(
        (item) =>
          !Number.isFinite(item.amount) ||
          item.amount <= 0 ||
          !state.dashboard?.contracts.some(
            (contract) => contract.contractId === item.contractId,
          ),
      )
    ) {
      throw new Error("Invalid demo recharge");
    }
    for (const item of items) {
      const amountMinor = toMinorUnits(item.amount, item.scale);
      await apiService.rechargeBalance(
        user.id,
        item.contractId,
        amountMinor,
        item.scale,
      );
    }

    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title: i18n.t("settings.notifications.recharge.title"),
      message: i18n.t("settings.notifications.recharge.message", {
        count: items.length,
      }),
      timestamp: new Date().toISOString(),
      read: false,
      type: "success",
    };
    const updatedNotifications = [newNotification, ...state.notifications];
    await apiService.updateNotifications(updatedNotifications);

    await refreshState();
  };

  const toggleAlert = async (key: keyof AlertSettings) => {
    if (!state || !user) return;
    const newAlerts = { ...state.alerts, [key]: !state.alerts[key] };
    const updatedAlerts = await apiService.updateAlerts(user.id, newAlerts);
    setState((prev) => (prev ? { ...prev, alerts: updatedAlerts } : null));
  };

  const updateAlertSettings = async (settings: Partial<AlertSettings>) => {
    if (!state || !user) return;
    const newAlerts = { ...state.alerts, ...settings };
    const updatedAlerts = await apiService.updateAlerts(user.id, newAlerts);
    setState((prev) => (prev ? { ...prev, alerts: updatedAlerts } : null));
  };

  const addNotification = async (
    title: string,
    message: string,
    type: Notification["type"],
  ) => {
    if (!state) return;
    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type,
    };
    const updatedNotifications = [newNotification, ...state.notifications];
    await apiService.updateNotifications(updatedNotifications);
    setState((prev) =>
      prev ? { ...prev, notifications: updatedNotifications } : null,
    );
  };

  const markNotificationAsRead = async (id: string) => {
    if (!state) return;
    const updatedNotifications = state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    await apiService.updateNotifications(updatedNotifications);
    setState((prev) =>
      prev ? { ...prev, notifications: updatedNotifications } : null,
    );
  };

  const clearNotifications = async () => {
    if (!state) return;
    await apiService.updateNotifications([]);
    setState((prev) => (prev ? { ...prev, notifications: [] } : null));
  };

  const updateContractDisplayName = async (
    contractId: number,
    displayName: string,
  ) => {
    const trimmedDisplayName = displayName.trim();
    await apiService.updateContractDisplayName(contractId, trimmedDisplayName);
    setState((prev) =>
      prev?.dashboard
        ? {
            ...prev,
            dashboard: {
              ...prev.dashboard,
              contracts: prev.dashboard.contracts.map((contract) =>
                contract.contractId === contractId
                  ? {
                      ...contract,
                      displayName: trimmedDisplayName || undefined,
                    }
                  : contract,
              ),
            },
          }
        : prev,
    );
  };

  return (
    <AppContext.Provider
      value={{
        state,
        recharge,
        rechargeContract,
        rechargeCart,
        refreshState,
        toggleAlert,
        updateAlertSettings,
        addNotification,
        markNotificationAsRead,
        clearNotifications,
        updateContractDisplayName,
        contractId,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
