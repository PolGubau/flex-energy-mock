import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readDemoState, resetDemoState } from "@/demo/store";
import { AppProvider, useApp } from "./AppContext";
import { AuthProvider, useAuth } from "./AuthContext";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>{children}</AppProvider>
    </AuthProvider>
  );
}

beforeEach(() => {
  resetDemoState();
});

describe("demo screen state", () => {
  it("refreshes individual and cart contract balances without double counting", async () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    await waitFor(() => expect(result.current.state?.dashboard).toBeTruthy());
    await act(async () => {
      await result.current.rechargeContract(301, 50, 2);
    });
    expect(result.current.state.dashboard.balance).toBe(27500);
    expect(result.current.state.dashboard.contracts[1].balanceRaw).toBe(6850);
    await act(async () => {
      await result.current.rechargeCart([
        { contractId: 300, amount: 10, scale: 2 },
        { contractId: 302, amount: 20, scale: 2 },
      ]);
    });
    expect(result.current.state.dashboard.balance).toBe(30500);
    expect(
      result.current.state.dashboard.contracts.map((c) => c.balanceRaw),
    ).toEqual([15250, 6850, 8400]);
    expect(readDemoState().transactions).toHaveLength(27);
  });

  it("updates the displayed profile and preserves it across simulated logout and login", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user).toBeTruthy());
    await act(async () => {
      await result.current.updateProfile({
        firstName: "Test Demo",
        phone: "000",
      });
    });
    expect(result.current.user.firstName).toBe("Test Demo");
    expect(readDemoState().user.phone).toBe("000");
    await act(async () => {
      await result.current.logout();
    });
    expect(result.current.user).toBeNull();
    await act(async () => {
      await result.current.login("", "");
    });
    expect(result.current.user.firstName).toBe("Test Demo");
  });

  it("keeps the demo usable when browser persistence is unavailable", async () => {
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("Storage unavailable");
      });
    try {
      const { result } = renderHook(() => useApp(), { wrapper });
      await waitFor(() => expect(result.current.state?.dashboard).toBeTruthy());
      await act(async () => {
        await result.current.recharge(10);
      });
      expect(result.current.state.dashboard.balance).toBe(23500);
    } finally {
      setItem.mockRestore();
    }
  });
});
