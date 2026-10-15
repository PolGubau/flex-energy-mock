import type { HttpCore, DateInput, ApplicationFrequency } from "../core";

// ─── DTOs ──────────────────────────────────────────────────────────────────────
export interface TariffDataDto {
  tariffId?: string | null;
  tariffName?: string | null;
  extTariffId?: string | null;
  enabled: boolean;
  assigned: boolean;
  currency?: string | null;
}

export interface ListTariffsRequestDto { enabled?: boolean; }
export interface ListTariffsResponseDto {
  status: boolean;
  response?: string | null;
  tariffs?: TariffDataDto[] | null;
}

export interface GetTariffRequestDto { tariffId?: string | null; }
export interface GetTariffResponseDto {
  status: boolean;
  response?: string | null;
  tariffId?: string | null;
  tariffName?: string | null;
  extTariffId?: string | null;
  enabled: boolean;
  assigned: boolean;
  currency?: string | null;
}

export interface AddTariffRequestDto { tariffName?: string | null; extTariffId?: string | null; enabled: boolean; }
export interface AddTariffResponseDto { status: boolean; tariffId?: string | null; response?: string | null; }
export interface UpdateTariffRequestDto { tariffId?: string | null; tariffName?: string | null; extTariffId?: string | null; enabled: boolean; }
export interface UpdateTariffResponseDto { status: boolean; response?: string | null; }
export interface DeleteTariffRequestDto { tariffId?: string | null; }
export interface DeleteTariffResponseDto { status: boolean; response?: string | null; }

export interface TimeWindow { from?: string | null; to?: string | null; }
export interface Tier { upToQuantity: number; priceMinor: number; }

export interface AddTariffRateRequestDto {
  tariffId?: string | null;
  description?: string | null;
  validFrom?: DateInput;
  validTo?: DateInput;
  amount?: number;
  unitOfMeasure?: string | null;
  applicableDaysOfWeek?: number[] | null;
  applicableMonths?: number[] | null;
  timeWindows?: TimeWindow[] | null;
  vatRatePercent?: number;
}
export interface AddTariffRateResponseDto { status: boolean; tariffId?: string | null; tariffRateId?: string | null; response?: string | null; }
export interface DeleteTariffRateRequestDto { tariffRateId?: string | null; }
export interface DeleteTariffRateResponseDto { status: boolean; response?: string | null; }
export interface ListTariffRatesRequestDto { tariffId?: string | null; }
export interface TariffRateDataDto { tariffId?: string | null; tariffRateId?: string | null; validFrom: DateInput; validTo: DateInput; scale: number; amountMinor: number; amount: number; unitOfMeasure?: string | null; priority: number; assigned: boolean; }
export interface ListTariffRatesResponseDto { status: boolean; tariffRates?: TariffRateDataDto[] | null; response?: string | null; }

export interface AddTariffDebtRequestDto {
  customerId: number;
  contractId: number;
  contractServiceId: number;
  groupId: string;
  debtAmount: number;
  debtAmortisationAmount: number;
  debtStartDate?: DateInput;
  endDate?: DateInput;
  applicationFrequency: ApplicationFrequency;
}
export interface AddTariffDebtResponse { status: boolean; message?: string | null; hasMessage?: boolean; }
export interface UpdateDebtAmortisationRequestDto {
  contractId: number;
  customerId: number;
  contractServiceId: number;
  groupId: string;
  debtAmortisationAmount: number;
}
export interface UpdateDebtAmortisationResponse { status: boolean; message?: string | null; hasMessage?: boolean; }

// ─── Module ────────────────────────────────────────────────────────────────────
export class TariffsModule {
  constructor(private readonly http: HttpCore) {}

  listElectricalTariffs(body: ListTariffsRequestDto) {
    return this.http.post<ListTariffsResponseDto>("/Api/v1/Tariffs/ListElectricalTariffs", body);
  }
  getElectricalTariff(body: GetTariffRequestDto) {
    return this.http.post<GetTariffResponseDto>("/Api/v1/Tariffs/GetElectricalTariff", body);
  }
  addElectricalTariff(body: AddTariffRequestDto) {
    return this.http.post<AddTariffResponseDto>("/Api/v1/Tariffs/AddElectricalTariff", body);
  }
  updateElectricalTariff(body: UpdateTariffRequestDto) {
    return this.http.post<UpdateTariffResponseDto>("/Api/v1/Tariffs/UpdateElectricalTariff", body);
  }
  deleteElectricalTariff(body: DeleteTariffRequestDto) {
    return this.http.post<DeleteTariffResponseDto>("/Api/v1/Tariffs/DeleteElectricalTariff", body);
  }
  addElectricalTariffRate(body: AddTariffRateRequestDto) {
    return this.http.post<AddTariffRateResponseDto>("/Api/v1/Tariffs/AddElectricalTariffRate", body);
  }
  listElectricalTariffRates(body: ListTariffRatesRequestDto) {
    return this.http.post<ListTariffRatesResponseDto>("/Api/v1/Tariffs/ListElectricalTariffRates", body);
  }
  deleteElectricalTariffRate(body: DeleteTariffRateRequestDto) {
    return this.http.post<DeleteTariffRateResponseDto>("/Api/v1/Tariffs/DeleteElectricalTariffRate", body);
  }
  addTariffDebt(body: AddTariffDebtRequestDto) {
    return this.http.post<AddTariffDebtResponse>("/Api/v1/Tariffs/AddTariffDebt", body);
  }
  updateDebtAmortisation(body: UpdateDebtAmortisationRequestDto) {
    return this.http.post<UpdateDebtAmortisationResponse>("/Api/v1/Tariffs/UpdateDebtAmortisation", body);
  }
}
