import type { SimpleRequest } from "@/lib/smartsphere/modules/contract";
import type { ListExportsQuery } from "@/lib/smartsphere/modules/file-manager";
import type {
  GenerateOrderIdRequest,
  ListTransactionsRequest,
  SetTransactionRequest,
} from "@/lib/smartsphere/modules/financial";
import type {
  GetCostsAndMeasuresRequest,
  GraphicMulti,
} from "@/lib/smartsphere/modules/graphics";
import seed from "./data.json";
import { createDemoPdf } from "./documents";
import { readDemoState, updateDemoState } from "./store";

export const SOURCE_ID = 0;

function graphic(
  body: GetCostsAndMeasuresRequest,
  cost: boolean,
): GraphicMulti {
  const from = new Date(body.dateFrom ?? Date.now() - 86_400_000).getTime();
  const to = new Date(body.dateTo ?? Date.now()).getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to) || from >= to) return {};
  const days = (to - from) / 86_400_000;
  const profile =
    days <= 1.01
      ? seed.usage.hourly
      : days > 60
        ? seed.usage.monthly
        : seed.usage.daily;
  const count =
    days <= 1.01
      ? 24
      : days > 60
        ? Math.min(12, Math.ceil(days / 30))
        : Math.ceil(days);
  const ids = body.contractIDs ?? (body.contractID ? [body.contractID] : []);
  return {
    categories: [
      {
        category: Array.from({ length: count }, (_, index) => ({
          label: new Date(
            from + ((to - from) * (index + 1)) / count,
          ).toISOString(),
        })),
      },
    ],
    dataset: ids.map((id) => ({
      seriesname: `Contract ${id}`,
      data: Array.from({ length: count }, (_, index) => ({
        value: (
          (profile[index % profile.length] ?? 0) *
          (seed.usage.contractFactors[
            String(id) as keyof typeof seed.usage.contractFactors
          ] ?? 0) *
          (cost ? seed.usage.costPerKwh : 1)
        ).toFixed(3),
      })),
    })),
  };
}

// Local compatibility facade for the existing screens. No HTTP transport.
const client = {
  contract: {
    async getCustomerDashboard(_body: SimpleRequest) {
      const state = readDemoState();
      const balanceRaw = state.contracts.reduce(
        (total, contract) => total + contract.balanceRaw,
        0,
      );
      return {
        sourceID: SOURCE_ID,
        status: true,
        balanceRaw,
        balance: balanceRaw / 100,
        consume: seed.usage.daily.reduce((sum, value) => sum + value, 0),
        scale: 2,
        currency: "CHF",
        contracts: state.contracts,
      };
    },
    async updateContractDisplayName(body: {
      contractId: number;
      displayName: string;
    }) {
      updateDemoState((state) => {
        const contract = state.contracts.find(
          (c) => c.contractID === body.contractId,
        );
        if (!contract) throw new Error("Demo contract not found");
        contract.displayName = body.displayName.trim();
      });
    },
  },
  financial: {
    async listTransactions(body: ListTransactionsRequest) {
      return {
        status: true,
        scale: 2,
        currency: "CHF",
        transactions: readDemoState().transactions.filter(
          (tx) =>
            tx.customerId === body.customerId &&
            tx.contractId === body.contractId,
        ),
      };
    },
    async generateOrderId(_body: GenerateOrderIdRequest) {
      // Mobile previews over a local HTTP address may not have randomUUID.
      const id =
        globalThis.crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      return { status: true, orderId: `DEMO-${id}` };
    },
    async setTransaction(body: SetTransactionRequest) {
      updateDemoState((state) => {
        const contract = state.contracts.find(
          (c) => c.contractID === body.contractId,
        );
        if (!contract || body.customerId !== state.user.id)
          throw new Error("Demo contract not found");
        const amountRaw = Math.round(body.amount * 10 ** contract.scale);
        if (!Number.isSafeInteger(amountRaw) || amountRaw <= 0)
          throw new Error("Invalid demo amount");
        const createdAt = new Date(body.transactionDate).toISOString();
        contract.balanceRaw += amountRaw;
        contract.serviceStatus =
          contract.balanceRaw / contract.averageCost <= 7
            ? "Warning"
            : "Active";
        contract.depletionDate = new Date(
          Date.now() +
            (contract.balanceRaw / contract.averageCost) * 86_400_000,
        ).toISOString();
        state.transactions.unshift({
          customerId: body.customerId,
          contractId: body.contractId,
          orderId: body.orderId,
          buContractID: contract.buContractID,
          exportId: `demo-receipt-${body.orderId}`,
          amountRaw,
          amount: body.amount,
          transactionSource: 3,
          transactionStatus: 1,
          description: "Simulated demo recharge",
          createdAt,
          convalidateAt: createdAt,
          // Never persist entered card details, even in this demo.
        });
      });
    },
  },
  graphics: {
    async getMeasures(body: GetCostsAndMeasuresRequest) {
      return graphic(body, false);
    },
    async getCosts(body: GetCostsAndMeasuresRequest) {
      return graphic(body, true);
    },
  },
  notifications: {
    async getSettings(_body: { customerID: number }) {
      const alerts = readDemoState().alerts;
      return {
        email: { enabled: alerts.lowBalance },
        sms: { enabled: alerts.peakUsage },
        startHour: alerts.startHour,
        endHour: alerts.endHour,
      };
    },
    async updateSettings(body: {
      customerID: number;
      emailEnabled: boolean;
      smsEnabled: boolean;
      startHour: string;
      endHour: string;
    }) {
      updateDemoState((state) => {
        state.alerts = {
          lowBalance: body.emailEnabled,
          peakUsage: body.smsEnabled,
          startHour: body.startHour,
          endHour: body.endHour,
        };
      });
    },
  },
  infrastructure: {
    async listMeterStatus(_body: Record<string, never>) {
      return {
        meters: readDemoState().contracts.map((c) => ({
          contractID: c.contractID,
          warningState: 0,
        })),
      };
    },
  },
  shop: {
    async suggestBulk(body: {
      contracts: number[];
      days: number;
      groupID: string;
    }) {
      return {
        contracts: readDemoState()
          .contracts.filter((c) => body.contracts.includes(c.contractID))
          .map((c) => {
            const raw = Math.max(0, c.averageCost * body.days - c.balanceRaw);
            const suggestedAmount = Math.ceil(raw / 10 ** c.scale / 5) * 5;
            return {
              contractID: c.contractID,
              suggestedAmount,
              suggestedAmountRaw: suggestedAmount * 10 ** c.scale,
            };
          }),
      };
    },
  },
  tariffs: {
    async listElectricalTariffs(_body: { enabled: boolean }) {
      return { tariffs: structuredClone(seed.tariffs) };
    },
    async listElectricalTariffRates(body: { tariffId: string }) {
      return {
        tariffRates: structuredClone(
          seed.tariffRates.filter((r) => r.tariffId === body.tariffId),
        ),
      };
    },
  },
  fileManager: {
    async listExports(query: ListExportsQuery = {}) {
      const items = readDemoState()
        .transactions.filter((tx) => tx.exportId)
        .map((tx) => ({
          id: tx.exportId,
          fileName: `${tx.exportId}.pdf`,
          contentType: "application/pdf",
          createdAtUtc: tx.createdAt,
          contentLength: createDemoPdf(tx.exportId).size,
          fileFormat: "pdf",
        }))
        .sort(
          (a, b) =>
            new Date(b.createdAtUtc).getTime() -
            new Date(a.createdAtUtc).getTime(),
        );
      const page = Math.max(1, query.page ?? 1);
      const pageSize = Math.max(1, query.pageSize ?? 5);
      return {
        total: items.length,
        items: items.slice((page - 1) * pageSize, page * pageSize),
      };
    },
    async downloadExport(id: string) {
      if (!readDemoState().transactions.some((tx) => tx.exportId === id))
        throw new Error("Demo document not found");
      return { blob: async () => createDemoPdf(id) };
    },
  },
};

export function getClient() {
  return client;
}
