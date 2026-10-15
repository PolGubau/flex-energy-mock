import type { HttpCore, DateInput, Precision } from "../core";

// ─── DTOs ──────────────────────────────────────────────────────────────────────
export interface GasTariffDataDto {
  dateFrom: DateInput;
  dateTo: DateInput;
  interval?: Precision;
  tariffAmountRaw: number;
  tariffAmount: number;
  scale: number;
  currency?: string | null;
}

export interface ListGasTariffsRequestDto { contractId?: number; }
export interface ListGasTariffsResponseDto {
  status: boolean;
  scale: number;
  currency?: string | null;
  tariffs?: GasTariffDataDto[] | null;
}

export interface SetGasTariffRequestDto {
  customerId?: number;
  contractId?: number;
  groupId?: string | null;
  tariffAmount?: number;
  interval?: Precision;
  dateFrom?: DateInput;
  dateTo?: DateInput;
}
export interface SetGasTariffResponseDto { status: boolean; }

export interface CloseGasTariffsRequestDto { contractId?: number; closeDate?: DateInput; }
export interface CloseGasTariffsResponseDto { status: boolean; }

// ─── Module ────────────────────────────────────────────────────────────────────
export class GasModule {
  constructor(private readonly http: HttpCore) {}

  listGasTariffs(body: ListGasTariffsRequestDto) {
    return this.http.post<ListGasTariffsResponseDto>("/Api/v1/Gas/ListGasTariffs", body);
  }

  setGasTariff(body: SetGasTariffRequestDto) {
    return this.http.post<SetGasTariffResponseDto>("/Api/v1/Gas/SetGasTariff", body);
  }

  closeGasTariffs(body: CloseGasTariffsRequestDto) {
    return this.http.post<CloseGasTariffsResponseDto>("/Api/v1/Gas/CloseGasTariffs", body);
  }
}
