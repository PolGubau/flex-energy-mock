import type { ApiTransaction } from "@/lib/smartsphere/modules/financial";
import type { AlertSettings, Notification } from "@/types";
import seed from "./data.json";

export const DEMO_STORAGE_KEY = "flex_energy_demo_v1";
const DAY = 86_400_000;
const copy = <T>(value: T): T => structuredClone(value);

function initialState() {
  const now = Date.now();
  return {
    user: copy(seed.user),
    contracts: seed.contracts.map((contract) => ({
      ...contract,
      startDate: new Date(now - 730 * DAY).toISOString(),
      endDate: new Date(now + 730 * DAY).toISOString(),
      lastMeasure: new Date(now - 3_600_000).toISOString(),
      depletionDate: new Date(
        now + (contract.balanceRaw / contract.averageCost) * DAY,
      ).toISOString(),
    })),
    alerts: copy(seed.alerts) as AlertSettings,
    notifications: seed.notifications.map((notification, index) => ({
      ...notification,
      timestamp: new Date(now - index * 3_600_000).toISOString(),
    })) as Notification[],
    transactions: seed.contracts.flatMap((contract) =>
      seed.transactions.map(
        (tx, index): ApiTransaction => ({
          customerId: seed.user.id,
          contractId: contract.contractID,
          buContractID: contract.buContractID,
          orderId: `DEMO-${contract.contractID}-${index + 1}`,
          exportId: `demo-receipt-${contract.contractID}-${index + 1}`,
          amount: tx.amount,
          amountRaw: Math.round(tx.amount * 10 ** contract.scale),
          transactionSource: tx.amount > 0 ? 3 : 0,
          transactionStatus: tx.status as 0 | 1 | 2,
          description: tx.description,
          createdAt: new Date(now - tx.daysAgo * DAY).toISOString(),
          convalidateAt: new Date(now - tx.daysAgo * DAY).toISOString(),
        }),
      ),
    ),
  };
}

export type DemoState = ReturnType<typeof initialState>;
let state: DemoState | undefined;

function load(): DemoState {
  try {
    const saved = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) ?? "null");
    if (
      saved?.user?.id === seed.user.id &&
      Array.isArray(saved.contracts) &&
      saved.contracts.length === seed.contracts.length &&
      saved.contracts.every(
        (c: DemoState["contracts"][number]) =>
          seed.contracts.some((s) => s.contractID === c.contractID) &&
          Number.isSafeInteger(c.balanceRaw),
      ) &&
      Array.isArray(saved.transactions) &&
      Array.isArray(saved.notifications) &&
      saved.alerts
    ) {
      return saved;
    }
  } catch {
    // Corrupt or unavailable storage must never prevent the demo from opening.
  }
  return initialState();
}

export function readDemoState(): DemoState {
  state ??= load();
  return copy(state);
}

export function updateDemoState(update: (draft: DemoState) => void): DemoState {
  const draft = readDemoState();
  update(draft);
  state = draft;
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private browsing / full storage: keep the demo usable in memory.
  }
  return copy(state);
}

export function resetDemoState(): void {
  state = initialState();
  updateDemoState(() => {});
}
