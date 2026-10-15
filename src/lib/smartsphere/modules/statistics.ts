import type { HttpCore } from "../core";

// ─── DTOs ──────────────────────────────────────────────────────────────────────
export type GetDashboardAdminRequest = Record<string, never>;

export interface GetDashboardAdminResponseDto {
  status: boolean;
  mWh: number;
  revenueAmountRaw: number;
  revenueAmount: number;
  currency?: string | null;
  scale: number;
  revenueCount: number;
  contractReady: number;
  contractGrace: number;
  contractLocked: number;
  contractTotal: number;
  contractClosed: number;
  contractActive: number;
  contractActivePercentual: number;
  dayForMeasure?: string | null;
  dayForAccounting?: string | null;
}

// ─── Module ────────────────────────────────────────────────────────────────────
export class StatisticsModule {
  constructor(private readonly http: HttpCore) {}

  getDashboardAdmin(body: GetDashboardAdminRequest = {}) {
    return this.http.post<GetDashboardAdminResponseDto>("/Api/v1/Statistics/GetDashboardAdmin", body);
  }
}
