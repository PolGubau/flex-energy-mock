import type {
  ContractFilter,
  DateInput,
  ElectricalReply,
  EnergyFlow,
  GenericMessageResponse,
  HttpCore,
  LifecycleStatus,
} from "../core";

// ─── DTOs ──────────────────────────────────────────────────────────────────────
export interface SimpleRequest {
  sourceID?: number;
  zpb?: string | null;
  values?: number[] | null;
  contractID?: number;
  buContractID?: string | null;
  extContractID?: string | null;
  value?: number;
  customerID?: number;
  date1?: DateInput;
  date2?: DateInput;
  groupId?: string | null;
}

export interface GetContractsRequest {
  filter?: ContractFilter;
}

export interface ServiceByContractRequest {
  sourceID?: number;
  contractID?: number;
  groupId?: string | null;
}

export interface ContractServiceZPB {
  zpb?: string | null;
  obis?: string | null;
  energyFlow?: EnergyFlow;
}

export interface ContractServiceRate {
  startDate: DateInput;
  endDate: DateInput;
  tariffId?: string | null;
  tariffName?: string | null;
}

export interface ContractServiceReducedDto {
  buContractID?: string | null;
  contractID: number;
  customerID: number;
  serviceStatus?: string | null;
  warningStatus?: string | null;
  startDate: DateInput;
  lastMeasure: DateInput;
  endDate: DateInput;
  balanceRaw: number;
  balance: number;
  averageCost: number;
  debt: number;
  scale: number;
  currency?: string | null;
  forecastTotalCost: number;
  depletionDate: DateInput;
}

export interface ContractServiceReducedResponseDto {
  status: boolean;
  contracts?: ContractServiceReducedDto[] | null;
}

export interface ContractServiceByDetails {
  sourceID: number;
  status: boolean;
  buContractID?: string | null;
  contractID: number;
  customerID: number;
  description?: string | null;
  startDate: DateInput;
  endDate: DateInput;
  serviceStatus?: string | null;
  statusDateTime: DateInput;
  balanceRaw: number;
  balance: number;
  scale: number;
  currency?: string | null;
  agreementLifecycleStatus?: LifecycleStatus;
}

export interface CustomerDashboardData {
  buContractID?: string | null;
  displayName?: string | null;
  contractID: number;
  serviceStatus?: string | null;
  currency?: string | null;
  scale: number;
  balanceRaw: number;
  balance: number;
  averageCost: number;
  startDate: DateInput;
  endDate: DateInput;
  lastMeasure: DateInput;
  forecastTotalCost: number;
  depletionDate: DateInput;
}

export interface ApiCustomerDashboard {
  sourceID: number;
  status: boolean;
  scale: number;
  currency?: string | null;
  balanceRaw: number;
  balance: number;
  consume: number;
  contracts?: CustomerDashboardData[] | null;
}

export interface GetContractStatusRequest {
  contractId?: number;
}
export interface GetContractStatusResponseDto {
  status: boolean;
  serviceStatus?: string | null;
  statusDateTime?: DateInput;
}

export interface GetCustomerConsumeRequestDto {
  customerID?: number;
  dateFrom?: DateInput;
  dateTo?: DateInput;
}
export interface GetCustomerConsumeResponseDto {
  status: boolean;
  totalConsume: number;
  totalConsumeRaw: number;
}

export interface SetRate {
  contractId: number;
  date1: DateInput;
  tariffId: string;
}
export interface SetContractServiceRequestDto {
  customerID?: number;
  buContractID?: string | null;
  dateFrom?: DateInput;
  dateTo?: DateInput;
  description?: string | null;
  zpb?: string | null;
  obis?: string | null;
  tariffID?: string | null;
}
export interface SetContractServiceResponse {
  status: boolean;
  contractId: number;
}
export interface CloseContractRequestDto {
  contractId?: number;
  closeDate?: DateInput;
}
export interface CloseContractResponse {
  status: boolean;
}
export interface ListContractTariffsRequest {
  contractId?: number;
}
export interface ElectricalRateDto {
  date1: DateInput;
  date2: DateInput;
  tariffId?: string | null;
  tariffName?: string | null;
}
export interface ListContractTariffsDto {
  status: boolean;
  rates?: ElectricalRateDto[] | null;
}
export interface UpdateContractDisplayNameRequest {
  contractId: number;
  displayName: string;
}

// ─── Module ────────────────────────────────────────────────────────────────────
export class ContractModule {
  constructor(private readonly http: HttpCore) {}

  getCustomerDashboard(body: SimpleRequest) {
    return this.http.post<ApiCustomerDashboard>(
      "/Api/v1/ContractService/GetCustomerDashboard",
      body,
    );
  }
  getCustomerContracts(body: SimpleRequest) {
    return this.http.post<ContractServiceReducedResponseDto>(
      "/Api/v1/ContractService/GetCustomerContracts",
      body,
    );
  }
  listActiveContracts(body: SimpleRequest) {
    return this.http.post<ContractServiceReducedResponseDto>(
      "/Api/v1/ContractService/ListActiveContracts",
      body,
    );
  }
  getContractServiceDetails(body: ServiceByContractRequest) {
    return this.http.post<ContractServiceByDetails>(
      "/Api/v1/ContractService/ContractServiceDetails",
      body,
    );
  }
  getContractStatus(body: GetContractStatusRequest) {
    return this.http.post<GetContractStatusResponseDto>(
      "/Api/v1/ContractService/GetContractStatus",
      body,
    );
  }
  getCustomerConsume(body: GetCustomerConsumeRequestDto) {
    return this.http.post<GetCustomerConsumeResponseDto>(
      "/Api/v1/ContractService/GetCustomerConsume",
      body,
    );
  }
  setContract(body: SetContractServiceRequestDto) {
    return this.http.post<SetContractServiceResponse>(
      "/Api/v1/ContractService/SetContract",
      body,
    );
  }
  closeContractService(body: CloseContractRequestDto) {
    return this.http.post<CloseContractResponse>(
      "/Api/v1/ContractService/CloseContractService",
      body,
    );
  }
  setContractTariff(body: SetRate) {
    return this.http.post<{ status: boolean }>(
      "/Api/v1/ContractService/SetContractTariff",
      body,
    );
  }
  listContractTariffs(body: ListContractTariffsRequest) {
    return this.http.post<ListContractTariffsDto>(
      "/Api/v1/ContractService/ListContractTariffs",
      body,
    );
  }
  updateContractStatus(body: { contractID?: number }) {
    return this.http.post<ElectricalReply>(
      "/Api/v1/ContractService/UpdateStatus",
      body,
    );
  }
  updateContractDisplayName(body: UpdateContractDisplayNameRequest) {
    return this.http.postUrlEncoded<GenericMessageResponse>(
      "/Contracts/UpdateContractDisplayName",
      { ContractId: body.contractId, DisplayName: body.displayName },
    );
  }
}
