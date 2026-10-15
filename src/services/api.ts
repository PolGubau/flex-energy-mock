import { getClient, SOURCE_ID } from "../demo/client";
import { readDemoState, updateDemoState } from "../demo/store";
import type { ApiTransaction } from "../lib/smartsphere/modules/financial";
import type { GraphicMulti } from "../lib/smartsphere/modules/graphics";
import type {
  AlertSettings,
  AppState,
  CustomerDashboard,
  MeasureData,
  MeterState,
  Notification,
  Transaction,
} from "../types";

// ─── Notification settings helpers ────────────────────────────────────────────
/** Maps backend notification settings to the frontend AlertSettings shape. */
function notificationSettingsToAlerts(
  emailEnabled: boolean,
  smsEnabled: boolean,
  startHour = "08:00",
  endHour = "22:00",
): AlertSettings {
  return {
    lowBalance: emailEnabled,
    peakUsage: smsEnabled,
    startHour,
    endHour,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function toIsoString(v: string | Date | null | undefined): string {
  if (!v) return new Date(0).toISOString();
  if (typeof v === "string") return v;
  return (v as Date).toISOString();
}

// ─── Mappers ───────────────────────────────────────────────────────────────────
const TX_SOURCE: Record<number, Transaction["transactionSource"]> = {
  0: "System",
  1: "Stripe",
  2: "Manual",
  3: "Shop",
};
const TX_STATUS: Record<number, Transaction["transactionStatus"]> = {
  0: "Pending",
  1: "Settled",
  2: "Failed",
  3: "Refunded",
  4: "Cancelled",
};

function mapTransaction(
  tx: ApiTransaction,
  scale: number,
  currency: string,
): Transaction {
  return {
    customerId: tx.customerId,
    contractId: tx.contractId,
    orderId: tx.orderId ?? undefined,
    buContractId: tx.buContractID ?? undefined,
    exportId: tx.exportId ?? undefined,
    amountMinor: tx.amountRaw,
    scale,
    currency,
    transactionSource: TX_SOURCE[tx.transactionSource ?? 0] ?? "System",
    transactionStatus: TX_STATUS[tx.transactionStatus ?? 0] ?? "Settled",
    description: tx.description ?? undefined,
    cardBrand: tx.cardBrand ?? undefined,
    cardNumber: tx.cardNumber ?? undefined,
    cardHolder: tx.cardHolder ?? undefined,
    paymentId: tx.paymentId ?? undefined,
    transactionDate:
      typeof tx.createdAt === "string"
        ? tx.createdAt
        : new Date(tx.createdAt as Date).toISOString(),
  };
}

function mapGraphicMultiToMeasures(
  data: GraphicMulti,
  period: "day" | "week" | "month" | "year",
  mode: "kwh" | "cost" = "kwh",
): MeasureData[] {
  const labels = data.categories?.[0]?.category ?? [];
  const datasets = data.dataset ?? [];
  if (labels.length === 0 || datasets.length === 0) return [];

  const count = labels.length;
  const unit = mode === "cost" ? "CHF" : "kWh";

  // Sum all datasets (contracts) at each time bucket
  const summedValues = Array.from({ length: count }, (_, i) => {
    const sum = datasets.reduce((acc, ds) => {
      const val = parseFloat(ds.data?.[i]?.value ?? "0");
      return acc + (Number.isNaN(val) ? 0 : val);
    }, 0);
    return sum;
  });

  // Interval per data point matched to sumMethod granularity:
  // day view:   1 hour/point (sumMethod=1 daily precision)
  // month view: 1 day/point (sumMethod=2 monthly precision)
  // year view:  ~30 days/point (sumMethod=3 annual precision)
  const interval =
    period === "year"
      ? 2_592_000_000 // ~30 days
      : period === "day"
        ? 3_600_000 // 1 hour
        : 86_400_000; // 1 day
  const now = Date.now();

  const baseData = Array.from({ length: count }, (_, i) => {
    let ts = now - interval * (count - 1 - i);

    // Round to nearest hour for day view, nearest day for others
    if (period === "day") {
      ts = Math.round(ts / 3_600_000) * 3_600_000;
    } else {
      ts = Math.round(ts / 86_400_000) * 86_400_000;
    }

    return {
      timestamp: labels[i]?.label ?? new Date(ts).toISOString(),
      value: summedValues[i],
      unit,
    };
  });

  return baseData;
}

// Notifications share the versioned local demo store with the other data.
function loadNotifications(): Notification[] {
  return readDemoState().notifications;
}

// ─── Date Range Validation Helper ─────────────────────────────────────────────
/**
 * Clamps date range to valid contract boundaries.
 * - dateFrom cannot be before contract startDate
 * - dateTo cannot exceed contract endDate
 */
export function validateAndClampDateRange(
  dateFrom: Date,
  dateTo: Date,
  contracts: Array<{ startDate: string; endDate: string }>,
): { dateFrom: Date; dateTo: Date } {
  if (contracts.length === 0) {
    return { dateFrom, dateTo };
  }

  // Find the earliest start date and latest end date across all contracts
  let earliestStart = dateFrom;
  let latestEnd = dateTo;

  for (const contract of contracts) {
    const startDate = new Date(contract.startDate);
    const endDate = new Date(contract.endDate);

    // dateFrom should not be before the earliest contract start date
    if (startDate > earliestStart) {
      earliestStart = startDate;
    }

    // dateTo should not exceed the latest contract end date
    if (endDate < latestEnd) {
      latestEnd = endDate;
    }
  }

  // Ensure dateFrom doesn't exceed dateTo after clamping
  if (earliestStart > latestEnd) {
    // If no valid range exists, return the contract's range
    const validStart = contracts[0];
    if (validStart) {
      return {
        dateFrom: new Date(validStart.startDate),
        dateTo: new Date(validStart.endDate),
      };
    }
  }

  const result = {
    dateFrom: new Date(Math.max(dateFrom.getTime(), earliestStart.getTime())),
    dateTo: new Date(Math.min(dateTo.getTime(), latestEnd.getTime())),
  };

  // Safety check: if result.dateFrom > result.dateTo, return original to avoid inverting
  if (result.dateFrom > result.dateTo) {
    return { dateFrom, dateTo };
  }

  return result;
}

// ─── Service ───────────────────────────────────────────────────────────────────
export const apiService = {
  /**
   * Loads the full app state from bundled JSON and local browser changes.
   */
  async getAppState(customerId: number): Promise<AppState> {
    const client = getClient();

    const dashRes = await client.contract.getCustomerDashboard({
      sourceID: SOURCE_ID,
      customerID: customerId,
    });

    const dashboard: CustomerDashboard = {
      sourceId: dashRes.sourceID,
      status: dashRes.status,
      balance: dashRes.balanceRaw,
      consume: dashRes.consume,
      scale: dashRes.scale,
      contracts: (dashRes.contracts ?? []).map((c) => {
        // Validate currency code is a valid 3-letter ISO 4217 code
        const baseCurrency = c.currency ?? dashRes.currency ?? "CHF";
        const currency = /^[A-Z]{3}$/.test(baseCurrency) ? baseCurrency : "CHF";
        return {
          contractId: c.contractID,
          buContractId: c.buContractID ?? undefined,
          displayName: c.displayName ?? undefined,
          serviceStatus: c.serviceStatus ?? "Active",
          customerId,
          startDate: toIsoString(c.startDate),
          endDate: toIsoString(c.endDate),
          lastMeasure: toIsoString(c.lastMeasure),
          balanceRaw: c.balanceRaw,
          scale: c.scale,
          currency,
          averageCost: c.averageCost,
          forecastTotalCost: c.forecastTotalCost,
          depletionDate: toIsoString(c.depletionDate),
        };
      }),
    };

    // Fetch notification settings from backend; fall back to safe defaults
    let alerts: AlertSettings = {
      lowBalance: true,
      peakUsage: false,
      startHour: "08:00",
      endHour: "22:00",
    };
    try {
      const notifRes = await client.notifications.getSettings({
        customerID: customerId,
      });
      alerts = notificationSettingsToAlerts(
        notifRes.email?.enabled ?? true,
        notifRes.sms?.enabled ?? false,
        notifRes.startHour || "08:00",
        notifRes.endHour || "22:00",
      );
    } catch {
      // non-fatal — keep defaults
    }

    // Fetch meter state for the first contract
    let meterState: MeterState = "Unknown";
    const firstContractId = dashboard.contracts[0]?.contractId;
    if (firstContractId) {
      try {
        const meterRes = await client.infrastructure.listMeterStatus({});
        const meter = meterRes.meters?.find(
          (m) => m.contractID === firstContractId,
        );
        if (meter) {
          meterState = meter.warningState === 0 ? "Online" : "Offline";
        }
      } catch {
        // non-fatal
      }
    }

    return {
      dashboard,
      contracts: [],
      alerts,
      notifications: loadNotifications(),
      meterState,
    };
  },

  async getTransactions(
    customerId: number,
    contractId: number,
  ): Promise<Transaction[]> {
    const res = await getClient().financial.listTransactions({
      customerId,
      contractId,
    });
    return (res.transactions ?? []).map((tx) =>
      mapTransaction(tx, res.scale, res.currency ?? "CHF"),
    );
  },

  async updateContractDisplayName(
    contractId: number,
    displayName: string,
  ): Promise<void> {
    await getClient().contract.updateContractDisplayName({
      contractId,
      displayName,
    });
  },

  async getUsageData(
    period: "day" | "month",
    contractId: number,
  ): Promise<MeasureData[]> {
    const now = new Date();
    const msBack = period === "day" ? 86_400_000 : 2_592_000_000;
    const dateFrom = new Date(now.getTime() - msBack);
    // SumMethod: day=3, month=2
    const sumMethod = period === "month" ? 2 : 3;

    const res = await getClient().graphics.getMeasures({
      contractID: contractId,
      dateFrom: dateFrom.toISOString(),
      dateTo: now.toISOString(),
      sumMethod,
    });

    return mapGraphicMultiToMeasures(res, period);
  },

  /**
   * Two-step recharge: generate an orderId first for traceability, then settle.
   */
  async rechargeBalance(
    customerId: number,
    contractId: number,
    amountMinor: number,
    scale: number,
  ): Promise<void> {
    const client = getClient();
    const amount = amountMinor / 10 ** scale;

    // Step 1 — reserve an orderId so the transaction is traceable
    const orderRes = await client.financial.generateOrderId({
      customerId,
      contractId,
    });
    const orderId = orderRes.orderId ?? undefined;

    // Step 2 — settle via Shop endpoint (bypasses Stripe)
    await client.financial.setTransaction({
      transactionDate: new Date().toISOString(),
      contractId,
      customerId,
      orderId,
      amount,
      transactionSource: 3, // Shop (client's custom flow — no Stripe)
      transactionStatus: 1, // Settled
      description: "Recharge via portal",
    });
  },

  /**
   * Card-payment recharge: GenerateOrderId → SetTransaction with card details.
   * cardNumber should be the raw digits (no spaces); only last 4 are stored.
   */
  async rechargeWithCard(
    customerId: number,
    contractId: number,
    amountMinor: number,
    scale: number,
    card: {
      cardHolder: string;
      cardNumber: string; // raw digits
      cardBrand: string;
    },
  ): Promise<void> {
    const client = getClient();
    const amount = amountMinor / 10 ** scale;

    const orderRes = await client.financial.generateOrderId({
      customerId,
      contractId,
    });
    const orderId = orderRes.orderId ?? undefined;

    await client.financial.setTransaction({
      transactionDate: new Date().toISOString(),
      contractId,
      customerId,
      orderId,
      amount,
      transactionSource: 3, // Shop / card-direct (client bypasses Stripe)
      transactionStatus: 1, // Settled
      description: "Card payment via portal",
      cardBrand: card.cardBrand,
      cardNumber: card.cardNumber.slice(-4), // store only last 4 digits
      cardHolder: card.cardHolder,
    });
  },

  /**
   * Calls Shop/Suggest to recommend recharge amounts per contract based on days.
   */
  async suggestRecharge(
    contractIds: number[],
    days: number,
  ): Promise<
    Array<{
      contractID: number;
      suggestedAmount: number;
      suggestedAmountRaw: number;
    }>
  > {
    const res = await getClient().shop.suggestBulk({
      contracts: contractIds,
      days,
      groupID: "electrical",
    });
    return (res.contracts ?? []).map((c) => ({
      contractID: c.contractID ?? 0,
      suggestedAmount: c.suggestedAmount ?? 0,
      suggestedAmountRaw: c.suggestedAmountRaw ?? 0,
    }));
  },

  /**
   * Persists notification toggles to the backend.
   * `customerId` is required to identify the user's settings record.
   */
  async updateAlerts(
    customerId: number,
    alerts: AlertSettings,
  ): Promise<AlertSettings> {
    await getClient().notifications.updateSettings({
      customerID: customerId,
      emailEnabled: alerts.lowBalance,
      smsEnabled: alerts.peakUsage,
      startHour: alerts.startHour || "08:00",
      endHour: alerts.endHour || "22:00",
    });
    return alerts;
  },

  async getCostData(
    period: "day" | "month" | "year",
    contractId: number,
  ): Promise<MeasureData[]> {
    const now = new Date();
    // SumMethod: day=3, month=2, year=3 (per senior engineer)
    const msBack =
      period === "year"
        ? 365 * 86_400_000 // 12 months
        : period === "month"
          ? 30 * 86_400_000 // 30 days
          : 86_400_000; // 1 day
    const dateFrom = new Date(now.getTime() - msBack);
    const sumMethod = period === "day" ? 3 : period === "month" ? 2 : 3;

    const res = await getClient().graphics.getCosts({
      contractID: contractId,
      dateFrom: dateFrom.toISOString(),
      dateTo: now.toISOString(),
      sumMethod,
    });

    return mapGraphicMultiToMeasures(res, period, "cost");
  },

  async getGroupedCostsData(
    period: "day" | "week" | "month" | "year",
    contractIDs: number[],
    mode: "kwh" | "cost" = "cost",
    contracts?: Array<{ startDate: string; endDate: string }>,
  ): Promise<MeasureData[]> {
    const now = new Date();
    const msBack =
      period === "year"
        ? 365 * 86_400_000 // 12 months
        : period === "week"
          ? 7 * 86_400_000 // 7 days
        : period === "month"
          ? 30 * 86_400_000 // 30 days
          : 86_400_000; // 1 day
    const rawDateFrom = new Date(now.getTime() - msBack);

    const { dateFrom, dateTo } =
      contracts && contracts.length > 0
        ? validateAndClampDateRange(rawDateFrom, now, contracts)
        : { dateFrom: rawDateFrom, dateTo: now };

    // SumMethod: day=3, month=2, year=3 (per senior engineer)
    const sumMethod =
      period === "day" || period === "week"
        ? 3
        : period === "month"
          ? 2
          : 3;

    // Single call with contractIDs array
    const res = await (mode === "cost"
      ? getClient().graphics.getCosts({
          contractIDs,
          dateFrom: dateFrom.toISOString(),
          dateTo: dateTo.toISOString(),
          sumMethod,
        })
      : getClient().graphics.getMeasures({
          contractIDs,
          dateFrom: dateFrom.toISOString(),
          dateTo: dateTo.toISOString(),
          sumMethod,
        }));

    return mapGraphicMultiToMeasures(res, period, mode);
  },

  async getGroupedCostsDataRange(
    period: "day" | "month" | "year",
    contractIDs: number[],
    mode: "kwh" | "cost" = "cost",
    dateFrom: Date,
    dateTo: Date,
    contracts?: Array<{ startDate: string; endDate: string }>,
  ): Promise<MeasureData[]> {
    const { dateFrom: validFrom, dateTo: validTo } =
      contracts && contracts.length > 0
        ? validateAndClampDateRange(dateFrom, dateTo, contracts)
        : { dateFrom, dateTo };

    // SumMethod: day=3, month=2, year=3 (per senior engineer)
    const sumMethod = period === "day" ? 3 : period === "month" ? 2 : 3;

    // Single call with contractIDs array
    const res = await (mode === "cost"
      ? getClient().graphics.getCosts({
          contractIDs,
          dateFrom: validFrom.toISOString(),
          dateTo: validTo.toISOString(),
          sumMethod,
        })
      : getClient().graphics.getMeasures({
          contractIDs,
          dateFrom: validFrom.toISOString(),
          dateTo: validTo.toISOString(),
          sumMethod,
        }));

    return mapGraphicMultiToMeasures(res, period, mode);
  },

  async updateNotifications(
    notifications: Notification[],
  ): Promise<Notification[]> {
    return updateDemoState((state) => { state.notifications = structuredClone(notifications); }).notifications;
  },
};
