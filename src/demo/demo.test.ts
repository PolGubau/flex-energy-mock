import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HttpCore } from "@/lib/smartsphere/core";
import { apiService } from "@/services/api";
import { getClient } from "./client";
import {
  DEMO_STORAGE_KEY,
  readDemoState,
  resetDemoState,
  updateDemoState,
} from "./store";

beforeEach(() => {
  localStorage.clear();
  resetDemoState();
  vi.stubGlobal(
    "fetch",
    vi.fn(() => {
      throw new Error("Unexpected network request");
    }),
  );
  vi.spyOn(XMLHttpRequest.prototype, "open").mockImplementation(() => {
    throw new Error("Unexpected XHR");
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("local JSON demo", () => {
  it("supports mobile HTTP previews without crypto.randomUUID", async () => {
    vi.stubGlobal("crypto", {});
    await apiService.rechargeBalance(271, 300, 1000, 2);
    const transactions = await apiService.getTransactions(271, 300);
    expect(transactions[0].orderId).toMatch(/^DEMO-/);
    expect(transactions[0].amountMinor).toBe(1000);
  });

  it("loads three contracts, seeded notifications and a consistent balance without network", async () => {
    const state = await apiService.getAppState(271);
    expect(state.dashboard.contracts).toHaveLength(3);
    expect(state.dashboard.balance).toBe(22500);
    expect(state.notifications).toHaveLength(3);
    expect(state.meterState).toBe("Online");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("updates the contract, total, history and receipt on recharge", async () => {
    await apiService.rechargeBalance(271, 301, 5000, 2);
    const state = await apiService.getAppState(271);
    expect(state.dashboard.balance).toBe(27500);
    expect(
      state.dashboard.contracts.find((c) => c.contractId === 301).balanceRaw,
    ).toBe(6850);
    const transactions = await apiService.getTransactions(271, 301);
    expect(transactions[0]).toMatchObject({
      amountMinor: 5000,
      transactionStatus: "Settled",
    });
    expect(transactions[0].exportId).toContain("demo-receipt-");
    expect(
      JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY)).contracts[1]
        .balanceRaw,
    ).toBe(6850);
  });

  it("rejects invalid amounts and unknown contracts without changing balances", async () => {
    for (const amount of [-100, 0, Number.NaN, Number.POSITIVE_INFINITY]) {
      await expect(
        apiService.rechargeBalance(271, 300, amount, 2),
      ).rejects.toThrow();
    }
    await expect(
      apiService.rechargeBalance(271, 999, 1000, 2),
    ).rejects.toThrow();
    expect((await apiService.getAppState(271)).dashboard.balance).toBe(22500);
  });

  it("does not persist entered card details", async () => {
    await apiService.rechargeWithCard(271, 300, 2500, 2, {
      cardHolder: "Dummy Cardholder",
      cardNumber: "4242424242424242",
      cardBrand: "Visa",
    });
    const saved = localStorage.getItem(DEMO_STORAGE_KEY);
    expect(saved).not.toContain("4242");
    expect(saved).not.toContain("Dummy Cardholder");
    expect((await apiService.getTransactions(271, 300))[0].amountMinor).toBe(
      2500,
    );
  });

  it.each([
    ["day", 24],
    ["week", 7],
    ["month", 30],
    ["year", 12],
  ] as const)("provides populated %s charts with additive contract totals", async (period, count) => {
    const single = await apiService.getGroupedCostsData(period, [300], "kwh");
    const other = await apiService.getGroupedCostsData(period, [301], "kwh");
    const all = await apiService.getGroupedCostsData(period, [300, 301], "kwh");
    const costs = await apiService.getGroupedCostsData(period, [300], "cost");
    expect(single).toHaveLength(count);
    expect(single.every((point) => point.value > 0)).toBe(true);
    expect(all[0].value).toBeCloseTo(single[0].value + other[0].value, 2);
    expect(costs[0].unit).toBe("CHF");
    expect(costs[0].value).toBeCloseTo(single[0].value * 0.29, 2);
  });

  it("honors explicit historical chart ranges", async () => {
    const from = new Date("2025-06-01T00:00:00Z");
    const to = new Date("2025-06-08T00:00:00Z");
    const data = await apiService.getGroupedCostsDataRange(
      "month",
      [300],
      "kwh",
      from,
      to,
    );
    expect(data).toHaveLength(7);
    expect(
      data.every(
        (point) =>
          new Date(point.timestamp) >= from && new Date(point.timestamp) <= to,
      ),
    ).toBe(true);
  });

  it("saves settings, display names and notification changes locally", async () => {
    await apiService.updateContractDisplayName(300, "  My home  ");
    const alerts = {
      lowBalance: false,
      peakUsage: true,
      startHour: "10:00",
      endHour: "18:00",
    };
    await apiService.updateAlerts(271, alerts);
    await apiService.updateNotifications([]);
    const state = await apiService.getAppState(271);
    expect(state.alerts).toEqual(alerts);
    expect(state.notifications).toEqual([]);
    expect(state.dashboard.contracts[0].displayName).toBe("My home");
  });

  it("offers tariffs, suggestions and paginated local PDF exports", async () => {
    const client = getClient();
    expect(
      (await client.tariffs.listElectricalTariffs({ enabled: true })).tariffs,
    ).toHaveLength(1);
    expect(
      (
        await client.tariffs.listElectricalTariffRates({
          tariffId: "demo-flex-green",
        })
      ).tariffRates,
    ).toHaveLength(2);
    const suggestions = await apiService.suggestRecharge([301], 30);
    expect(suggestions[0].suggestedAmount).toBeGreaterThan(0);
    const first = await client.fileManager.listExports({
      page: 1,
      pageSize: 5,
    });
    const second = await client.fileManager.listExports({
      page: 2,
      pageSize: 5,
    });
    expect(first.total).toBe(24);
    expect(first.items).toHaveLength(5);
    expect(second.items[0].id).not.toBe(first.items[0].id);
    const blob = await (
      await client.fileManager.downloadExport(first.items[0].id)
    ).blob();
    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBeGreaterThan(500);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("restores initial data without touching theme or language preferences", async () => {
    localStorage.setItem("tenant-theme", "keep");
    updateDemoState((state) => {
      state.user.firstName = "Changed";
    });
    await apiService.rechargeBalance(271, 300, 1000, 2);
    resetDemoState();
    expect(readDemoState().user.firstName).toBe("Alex");
    expect((await apiService.getAppState(271)).dashboard.balance).toBe(22500);
    expect(localStorage.getItem("tenant-theme")).toBe("keep");
  });

  it("blocks the legacy SDK even with a custom transport configured", async () => {
    const transport = vi.fn();
    const legacy = new HttpCore({ baseUrl: "", fetch: transport });
    await expect(legacy.get("/disabled")).rejects.toThrow(
      "Network access is disabled",
    );
    await expect(legacy.post("/disabled", {})).rejects.toThrow(
      "Network access is disabled",
    );
    expect(transport).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
});
