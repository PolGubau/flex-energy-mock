import type {
  HttpCore, DateInput,
  MeterStatus, MeterValidationStatus, MeterChangeMode, FilterMeterStatus,
} from "../core";

// ─── DTOs ──────────────────────────────────────────────────────────────────────
export interface ListMeterStatusRequestDto { dateToCheck?: DateInput; }
export interface MeterStatusDto {
  contractID: number;
  customerID: number;
  buContractID?: string | null;
  lastProcessedMeasureAt: DateInput;
  lastSampleMeasure: DateInput;
  firstSampleMeasure: DateInput;
  warningState: number;
  warningStateText?: string | null;
  zpb?: string | null;
  obis?: string | null;
}
export interface ListMeterStatusResponseDto {
  status: boolean;
  meters?: MeterStatusDto[] | null;
}

export interface MeterKey {
  contractId?: number;
  contractServiceId?: number;
  zpb?: string | null;
  obisCode?: string | null;
}
export interface BulkMeterKeyDto {
  contractId?: number;
  contractServiceId?: number;
  zpb?: string | null;
  obis?: string | null;
  obisCode?: string | null;
}

export interface ContractMeter {
  key?: MeterKey;
  currentMeterStatus?: MeterStatus;
  lastChangeCompetenceDate?: DateInput;
  lastValidateCompetenceDate?: DateInput;
  lastChangeResult?: string | null;
  lastChangeResultMessage?: string | null;
  requestMeterStatus?: MeterStatus;
  requestMeterStatusReason?: string | null;
  changeMode?: MeterChangeMode;
  requestSecondUser: boolean;
  requestValidationCode?: string | null;
  expireValidationCode?: DateInput;
  validationStatus?: MeterValidationStatus;
  meta?: string | null;
}

export interface ListContractMetersRequest {
  filter?: FilterMeterStatus;
  contractId?: number;
  contractServiceId?: number;
  pageSize?: number;
  pageToken?: string | null;
}
export interface ListContractMetersResponse {
  status: boolean;
  response?: string | null;
  contractMeters?: ContractMeter[] | null;
  nextPageToken?: string | null;
}

export interface ValidateChangeMeterStatusRequest {
  key?: MeterKey;
  reason?: string | null;
  requestValidationCode?: string | null;
  meta?: string | null;
  changeRequestBy?: string | null;
}
export interface ValidateChangeMeterStatusResponse {
  status: boolean;
  response?: string | null;
  currentMeterStatus?: MeterStatus;
  validationStatus?: MeterValidationStatus;
}

export interface ChangeMeterStatusRequest {
  key?: MeterKey;
  targetMeterStatus?: MeterStatus;
  reason?: string | null;
  meta?: string | null;
  changedBy?: string | null;
}
export interface ChangeMeterStatusResponse {
  status: boolean;
  response?: string | null;
  currentMeterStatus?: MeterStatus;
}

export interface IssueMeterValidationCodeBulkRequest {
  keys?: MeterKey[] | null;
  issuedTo?: string | null;
}
export interface IssueMeterValidationCodeBulkResponse {
  status: boolean;
  response?: string | null;
  okCount: number;
  failCount: number;
  expireAtUtc?: DateInput;
}

export interface ValidateChangeMeterStatusBulkRequestDto {
  keys?: BulkMeterKeyDto[] | null;
  validationCode?: string | null;
  changeRequestBy?: string | null;
}
export interface ValidateChangeMeterStatusBulkResponse {
  status: boolean;
  response?: string | null;
  okCount: number;
  failCount: number;
}

// ─── Module ────────────────────────────────────────────────────────────────────
export class InfrastructureModule {
  constructor(private readonly http: HttpCore) {}

  listMeterStatus(body: ListMeterStatusRequestDto) {
    return this.http.post<ListMeterStatusResponseDto>("/Api/v1/Infrastructure/ListMeterStatus", body);
  }
  listContractMeters(body: ListContractMetersRequest) {
    return this.http.post<ListContractMetersResponse>("/Api/v1/Infrastructure/ListContractMeters", body);
  }
  validateChangeMeterStatus(body: ValidateChangeMeterStatusRequest) {
    return this.http.post<ValidateChangeMeterStatusResponse>("/Api/v1/Infrastructure/ValidateChangeMeterStatus", body);
  }
  changeMeterStatus(body: ChangeMeterStatusRequest) {
    return this.http.post<ChangeMeterStatusResponse>("/Api/v1/Infrastructure/ChangeMeterStatus", body);
  }
  issueMeterValidationCodeBulk(body: IssueMeterValidationCodeBulkRequest) {
    return this.http.post<IssueMeterValidationCodeBulkResponse>("/Api/v1/Infrastructure/IssueMeterValidationCodeBulk", body);
  }
  validateChangeMeterStatusBulk(body: ValidateChangeMeterStatusBulkRequestDto) {
    return this.http.post<ValidateChangeMeterStatusBulkResponse>("/Api/v1/Infrastructure/ValidateChangeMeterStatusBulk", body);
  }
}
