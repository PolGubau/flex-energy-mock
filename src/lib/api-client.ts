/* SmartSphere API client
   Drop this file into any TS repo with `fetch` available.

   Notes:
   - Uses native fetch only.
   - Handles JSON and multipart/form-data.
   - Supports mixed-case paths exactly as in the OpenAPI spec.
   - Dates can be passed as `string` or `Date`; `Date` is serialized to ISO.
*/

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}

export type DateInput = string | Date;
export interface Timestamp {
  seconds: number;
  nanos: number;
}
export type TimestampInput = string | Date | Timestamp;

export type ApplicationFrequency = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type ContractFilter = 0 | 1 | 2 | 3 | 4;
export type EnergyFlow = 0 | 1 | 2;
export type FileFormat =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14;
export type FileType =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 99;
export type FilterMeterStatus = 0 | 1 | 2 | 3;
export type LifecycleStatus = 0 | 1 | 2 | 3 | 4;
export type MeterChangeMode = 0 | 1 | 2 | 3;
export type MeterStatus = 0 | 1 | 2;
export type MeterValidationStatus = 0 | 1 | 2 | 3 | 4;
export type Precision = 0 | 1 | 2 | 3 | 4;
export type ReceiptGenStatus = 0 | 1 | 2 | 3;
export type SumMethod = 0 | 1 | 2 | 3 | 4 | 5;
export type TransactionSource =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12;
export type TransactionStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type UserRole = 0 | 1 | 10 | 11 | 20 | 30 | 31 | 40 | 41 | 50 | 51;

export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
  [key: string]: unknown;
}

export interface GenericResponse {
  status: boolean;
}

export interface ElectricalReply {
  sourceID: number;
  status: boolean;
}

export interface GenericMessageResponse {
  status: boolean;
  response?: string | null;
}

export interface CompanyResponse {
  sourceID: number;
  status: boolean;
  companyAddress?: string | null;
  companyCity?: string | null;
  companyName?: string | null;
  displayName1?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
  email?: string | null;
  phone?: string | null;
  web?: string | null;
  displayName2?: string | null;
}

export interface SetLanguageRequest {
  accountID: number;
  languageLegacyID: number;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface RestRequestToken {
  userName: string;
  password: string;
}

export interface BridgeClaimsPayloadDto {
  corrId?: string | null;
  returnUrl?: string | null;
  sub?: string | null;
  email?: string | null;
  preferredUsername?: string | null;
  issuer?: string | null;
  authTimeUtc?: DateInput;
}

export interface BridgeTicketCreateRequestDto {
  ttlSeconds?: number | null;
  payload?: BridgeClaimsPayloadDto;
}

export interface BridgeTicketCreateResponseDto {
  status: boolean;
  ticketId?: string | null;
  expiresAtUtc: DateInput;
  message?: string | null;
}

export interface BridgeTicketConsumeRequestDto {
  ticketId?: string | null;
}

export interface BridgeTicketConsumeResponseDto {
  status: boolean;
  ticketId?: string | null;
  expiresAtUtc: DateInput;
  payload?: BridgeClaimsPayloadDto;
  message?: string | null;
}

export interface SetUserRequest {
  customerId?: number;
  extCustomerId?: string | null;
  contractId?: number;
  contractAccountId?: string | null;
  extContractId?: string | null;
  extContractAccountId?: string | null;
  userName?: string | null;
  password?: string | null;
  userRole?: UserRole;
}

export interface SetUserResponse {
  status: boolean;
  responseMessage?: string | null;
}

export interface ServiceByContractRequest {
  sourceID?: number;
  contractID?: number;
  groupId?: string | null;
}

export interface MetaPreset {
  id?: string | null;
  value?: string | null;
  name?: string | null;
}

export interface ListMetaPresetsRequest {
  filter?: string | null;
}

export interface ListMetaPresetsResponse {
  status: boolean;
  presets?: MetaPreset[] | null;
}

export interface GetContractStatusRequest {
  contractId?: number;
}

export interface GetContractStatusResponseDto {
  status: boolean;
  serviceStatus?: string | null;
  statusDateTime?: DateInput;
  warningStatus?: string | null;
  warningStatusDateTime?: DateInput;
}

export interface SimpleRequest {
  sourceID?: number;
  zpb?: string | null;
  values?: number[] | null;
  contractID?: number;
  buContractID?: string | null;
  extContractID?: string | null;
  value?: number;
  customerID?: number;
  date1?: TimestampInput;
  date2?: TimestampInput;
  groupId?: string | null;
}

export interface GetContractsRequest {
  filter?: ContractFilter;
}

export interface ContractServiceReducedDto {
  buContractID?: string | null;
  contractID: number;
  customerID: number;
  serviceStatus?: string | null;
  warningStatus?: string | null;
  startDate: DateInput;
  lastMeasure: DateInput;
  location?: string | null;
  endDate: DateInput;
  balanceRaw: number;
  averageCostRaw: number;
  debtRaw: number;
  balance: number;
  averageCost: number;
  debt: number;
  scale: number;
  currency?: string | null;
  forecastTotalCost: number;
  depletionDate: DateInput;
  contractAccountID?: string | null;
  contractAccountCode?: string | null;
  meterPendingState?: string | null;
  meterState?: string | null;
}

export interface ContractServiceReducedResponseDto {
  status: boolean;
  contracts?: ContractServiceReducedDto[] | null;
}

export interface ContractServiceRate {
  startDate: DateInput;
  endDate: DateInput;
  tariffId?: string | null;
  tariffName?: string | null;
}

export interface ContractServiceZPB {
  zpb?: string | null;
  obis?: string | null;
  energyFlow?: EnergyFlow;
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
  warningStatus?: string | null;
  warningStatusDateTime: DateInput;
  balanceRaw: number;
  averageCostRaw: number;
  debtRaw: number;
  debtAmortisationRaw: number;
  balance: number;
  averageCost: number;
  debt: number;
  debtAmortisation: number;
  scale: number;
  currency?: string | null;
  legacyDebitDailyCost: number;
  triggerLockDays: number;
  triggerPrelockDays: number;
  triggerDeadlineLockDays: number;
  createdDate: DateInput;
  zpBs?: ContractServiceZPB[] | null;
  rates?: ContractServiceRate[] | null;
  forecastTotalCost: number;
  depletionDate: DateInput;
  meta?: string | null;
  contractAccountId?: string | null;
  contractAccountCode?: string | null;
  agreementLifecycleStatus?: LifecycleStatus;
  meterState?: string | null;
  meterPendingState?: string | null;
}

export interface CustomerDashboardData {
  buContractID?: string | null;
  contractID: number;
  serviceStatus?: string | null;
  currency?: string | null;
  scale: number;
  balanceRaw: number;
  averageCostRaw: number;
  balance: number;
  averageCost: number;
  startDate: DateInput;
  endDate: DateInput;
  lastMeasure: DateInput;
  location?: string | null;
  forecastTotalCost: number;
  depletionDate: DateInput;
}

export interface CustomerDashboard {
  sourceID: number;
  status: boolean;
  scale: number;
  currency?: string | null;
  balanceRaw: number;
  balance: number;
  consume: number;
  contracts?: CustomerDashboardData[] | null;
}

export interface LastDateValue {
  lastDate: DateInput;
  amount: number;
}

export interface ContractBalance {
  contractID: number;
  buContractID?: string | null;
  balance: number;
}

export interface TransactionData {
  buContractID?: string | null;
  contractID: number;
  amount: number;
  opeDate: DateInput;
  convalidateDate: DateInput;
  orderID?: string | null;
  operationID: number;
  statusID: number;
  description?: string | null;
  ccbrand?: string | null;
  ccpayid?: string | null;
}

export interface TransactionDashboard {
  sourceID: number;
  status: boolean;
  balance: number;
  consume: number;
  lastTransaction: LastDateValue;
  contracts?: ContractBalance[] | null;
  transactions?: TransactionData[] | null;
}

export interface SetGraceDay {
  sourceID: number;
  serviceID: number;
  value: number;
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
  meta?: string | null;
}

export interface CloseContractRequestDto {
  contractId?: number;
  closeDate?: DateInput;
}

export interface SetContractMetaRequest {
  contractId?: number;
  meta?: string | null;
}

export interface SetContractDescriptionRequest {
  contractId?: number;
  description?: string | null;
}

export interface CloseContractResponse {
  status: boolean;
}

export interface SetContractServiceResponse {
  status: boolean;
  contractId: number;
}

export interface SetContractMetaResponse {
  status: boolean;
}

export interface SetContractDescriptionResponse {
  status: boolean;
}

export interface SetContractTariffResponse {
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

export interface GetCustomerBalanceRequest {
  customerID?: number;
  groupID?: string | null;
}

export interface GetCustomerBalanceResponse {
  status: boolean;
  totalBalance: number;
  totalBalanceRaw: number;
  scale: number;
  currency?: string | null;
}

export interface GetContractBalanceRequestDto {
  contractId: number;
  groupId: string;
  flag1?: string | null;
  flag2?: string | null;
  getAverageCost?: boolean;
  getDebt?: boolean;
  getBalance?: boolean;
  getDebtAmortisation?: boolean;
  getForecast?: boolean;
  forecastHorizonDays?: number;
  tariffId?: string | null;
}

export interface GetContractBalanceResponse {
  status: boolean;
  averageCost: number;
  balance: number;
  debt: number;
  debtAmortisation: number;
  averageCostRaw: number;
  balanceRaw: number;
  debtRaw: number;
  debtAmortisationRaw: number;
  scale: number;
  currency?: string | null;
  forecastTotalCost: number;
  depletionDate: DateInput;
}

export interface ListTransactionsRequest {
  customerId: number;
  contractId: number;
  ownerId?: number;
}

export interface Transaction {
  buContractID?: string | null;
  orderId?: string | null;
  amountRaw: number;
  amount: number;
  transactionSource?: TransactionSource;
  transactionStatus?: TransactionStatus;
  description?: string | null;
  cardBrand?: string | null;
  cardNumber?: string | null;
  cardHolder?: string | null;
  paymentId?: string | null;
  createdAt: DateInput;
  convalidateAt: DateInput;
  contractId: number;
  customerId: number;
  exportId?: string | null;
}

export interface ListTransactionsResponse {
  status: boolean;
  scale: number;
  transactions?: Transaction[] | null;
  currency?: string | null;
}

export interface GetTransactionOrderRequestDto {
  orderId: string;
}

export interface GenerateOrderIdRequest {
  customerId?: number;
  contractId?: number;
}

export interface GenerateOrderIdResponse {
  status: boolean;
  orderId?: string | null;
}

export interface SetIncomeStatementRequestDto {
  entryDate?: DateInput;
  description?: string | null;
  amount?: number;
  contractId?: number;
  customerId?: number;
  entryMode?: string | null;
  opeMode?: string | null;
  groupID?: string | null;
}

export interface SetIncomeStatementResponseDto {
  status: boolean;
}

export interface SetTransactionRequest {
  transactionDate: DateInput;
  contractId: number;
  customerId: number;
  orderId?: string | null;
  amount: number;
  transactionSource: TransactionSource;
  transactionStatus: TransactionStatus;
  description?: string | null;
  cardBrand?: string | null;
  cardNumber?: string | null;
  cardHolder?: string | null;
  paymentId?: string | null;
  sourceId?: string | null;
  ownerId?: number;
  groupId?: string | null;
  flag1?: string | null;
  flag2?: string | null;
}

export interface SetTransactionResponseDto {
  status: boolean;
  transactionId?: string | null;
  orderId?: string | null;
  receiptExportId?: string | null;
  receiptMessage?: string | null;
  receiptStatus?: ReceiptGenStatus;
}

export interface UpdateTransactionRequest {
  orderId: string;
  transactionStatus: TransactionStatus;
  cardBrand?: string | null;
  cardNumber?: string | null;
  cardHolder?: string | null;
  paymentId?: string | null;
}

export interface UpdateTransactionResponse {
  status: boolean;
}

export interface ListMeterStatusRequestDto {
  dateToCheck?: DateInput;
}

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
  lastChangeCompetenceDate?: DateInput;
  lastChangeResult?: string | null;
  lastChangeResultMessage?: string | null;
}

export interface ListContractMetersRequest {
  filter?: FilterMeterStatus;
  contractId?: number;
  contractServiceId?: number;
  pageSize?: number;
  pageToken?: string | null;
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
  requestedBy?: string | null;
  validatedBy?: string | null;
}

export interface ListContractMetersResponse {
  status: boolean;
  response?: string | null;
  contractMeters?: ContractMeter[] | null;
  nextPageToken?: string | null;
}

export interface ListPendingMeterChangesRequest {
  contractId?: number;
  contractServiceId?: number;
  requestedBy?: string | null;
  targetStatusFilter?: FilterMeterStatus;
}

export interface PendingMeterChangeGroup {
  targetStatus?: MeterStatus;
  meters?: ContractMeter[] | null;
}

export interface ListPendingMeterChangesResponse {
  status: boolean;
  response?: string | null;
  meters?: ContractMeter[] | null;
}

export interface ListPendingMeterChangesByStatusRequest {
  contractId?: number;
  contractServiceId?: number;
  requestedBy?: string | null;
}

export interface ListPendingMeterChangesByStatusResponse {
  status: boolean;
  response?: string | null;
  groups?: PendingMeterChangeGroup[] | null;
}

export interface ListPendingMeterChangesSummaryResponse {
  status: boolean;
  block: number;
  powerReduced: number;
  operational: number;
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

export interface ListExportsQuery extends Record<string, unknown> {
  page?: number;
  pageSize?: number;
  fromUtc?: DateInput;
  toUtc?: DateInput;
  groupId?: string;
  search?: string;
  sortDesc?: boolean;
}

export interface ExportItemDto {
  id?: string | null;
  fileName?: string | null;
  contentType?: string | null;
  createdAtUtc: DateInput;
  fileType?: string | null;
  fileFormat?: string | null;
  contentLength: number;
  sha256?: string | null;
  meta?: string | null;
  details?: unknown;
}

export interface ListExportsResponseDto {
  status: boolean;
  total: number;
  items?: ExportItemDto[] | null;
  message?: string | null;
}

export interface UploadInboxResponseDto {
  status: boolean;
  message?: string | null;
  inboxId?: string | null;
}

export interface UploadInboxRequest {
  file: Blob;
  fileType?: FileType;
  fileFormat?: FileFormat;
  groupId?: string;
  uploader?: string;
  sourceEndpoint?: string;
}

export interface ListGasTariffsRequestDto {
  contractId?: number;
}

export interface GasTariffDataDto {
  dateFrom: DateInput;
  dateTo: DateInput;
  interval?: Precision;
  tariffAmountRaw: number;
  tariffAmount: number;
  scale: number;
  currency?: string | null;
}

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

export interface SetGasTariffResponseDto {
  status: boolean;
}

export interface CloseGasTariffsRequestDto {
  contractId?: number;
  closeDate?: DateInput;
}

export interface CloseGasTariffsResponseDto {
  status: boolean;
}

export interface ListRevenuesRequest {
  precision: Precision;
  dateFrom: DateInput;
  dateTo: DateInput;
  transactionStatus: TransactionStatus;
}

export interface GraphicData {
  label?: string | null;
  value?: string | null;
}

export interface GraphicChart {
  subcaption?: string | null;
  yAxisName?: string | null;
  sYAxisName?: string | null;
  xAxisName?: string | null;
  pYAxisName?: string | null;
  labelStep?: string | null;
  caption?: string | null;
  theme?: string | null;
  axisname?: string | null;
  showValues?: string | null;
}

export interface GraphicSimple {
  data?: GraphicData[] | null;
  chart?: GraphicChart[] | null;
}

export interface GraphicCategoryLabel {
  label?: string | null;
}

export interface GraphicCategory {
  category?: GraphicCategoryLabel[] | null;
}

export interface DataValue {
  value?: string | null;
}

export interface DatasetValue {
  seriesname?: string | null;
  showValues?: string | null;
  parentYAxis?: string | null;
  renderas?: string | null;
  label?: string | null;
  color?: string | null;
  data?: DataValue[] | null;
}

export interface GraphicMulti {
  categories?: GraphicCategory[] | null;
  chart?: GraphicChart;
  dataset?: DatasetValue[] | null;
}

export interface GetCostsAndMeasuresRequest {
  contractID?: number;
  dateFrom?: DateInput;
  dateTo?: DateInput;
  sumMethod?: SumMethod;
  costRender?: string | null;
  consumeRender?: string | null;
  costShow?: boolean;
  consumeShow?: boolean;
  contractIDs?: number[] | null;
}

export type GetDashboardAdminRequest = {};

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

export interface SuggestRequest {
  contracts?: number[] | null;
  days?: number;
  groupID?: string | null;
}

export interface SuggestedContract {
  contractID: number;
  suggestedAmount: number;
  suggestedAmountRaw: number;
}

export interface SuggestResponse {
  status: boolean;
  contracts?: SuggestedContract[] | null;
  scale: number;
  currency?: string | null;
}

export interface SplitRequest {
  contracts?: number[] | null;
  amount?: number;
  days?: number;
  groupID?: string | null;
}

export interface SplitResponse {
  status: boolean;
  contracts?: SuggestedContract[] | null;
  scale: number;
  currency?: string | null;
}

export interface SetCustomerRequestDto {
  buCustomerID?: string | null;
  lastName?: string | null;
  firstName?: string | null;
  companyName?: string | null;
  address1?: string | null;
  postalCode?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  poBox?: string | null;
  address2?: string | null;
  country?: string | null;
}

export interface SetCustomerResponseDto {
  status: boolean;
  message?: string | null;
  customeID: number;
  buCustomerID?: string | null;
}

export interface GetTariffRequestDto {
  tariffId?: string | null;
}

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

export interface AddTariffRequestDto {
  tariffName?: string | null;
  extTariffId?: string | null;
  enabled: boolean;
}

export interface AddTariffResponseDto {
  status: boolean;
  tariffId?: string | null;
  response?: string | null;
}

export interface UpdateTariffRequestDto {
  tariffId?: string | null;
  tariffName?: string | null;
  extTariffId?: string | null;
  enabled: boolean;
}

export interface UpdateTariffResponseDto {
  status: boolean;
  response?: string | null;
}

export interface DeleteTariffRequestDto {
  tariffId?: string | null;
}

export interface DeleteTariffResponseDto {
  status: boolean;
  response?: string | null;
}

export interface AddTariffRateRequestDto {
  tariffId?: string | null;
  description?: string | null;
  validFrom?: DateInput;
  validTo?: DateInput;
  applicationFrequency?: string | null;
  amountBasis?: string | null;
  period?: string | null;
  postingDirection?: string | null;
  generalLedgerAccount?: number;
  amount?: number;
  unitOfMeasure?: string | null;
  quantitySource?: string | null;
  applicableDaysOfWeek?: number[] | null;
  applicableMonths?: number[] | null;
  timeWindows?: TimeWindow[] | null;
  vatRatePercent?: number;
  vatRateLedgerAccount?: number;
  vatRateId?: string | null;
  tags?: string[] | null;
}

export interface AddTariffRateResponseDto {
  status: boolean;
  tariffId?: string | null;
  tariffRateId?: string | null;
  response?: string | null;
}

export interface ListTariffsRequestDto {
  enabled?: boolean;
}

export interface TariffDataDto {
  tariffId?: string | null;
  tariffName?: string | null;
  extTariffId?: string | null;
  enabled: boolean;
  assigned: boolean;
  currency?: string | null;
}

export interface ListTariffsResponseDto {
  status: boolean;
  response?: string | null;
  tariffs?: TariffDataDto[] | null;
}

export interface GetTariffRateRequestDto {
  tariffRateId?: string | null;
}

export interface TimeWindow {
  from?: string | null;
  to?: string | null;
}

export interface Tier {
  upToQuantity: number;
  priceMinor: number;
}

export interface GetTariffRateResponseDto {
  status: boolean;
  response?: string | null;
  tariffId?: string | null;
  tariffRateId?: string | null;
  description?: string | null;
  validFrom: DateInput;
  validTo: DateInput;
  applicationFrequency?: string | null;
  amountBasis?: string | null;
  period?: string | null;
  postingDirection?: string | null;
  generalLedgerAccount: number;
  scale: number;
  amountMinor: number;
  amount: number;
  unitOfMeasure?: string | null;
  quantitySource?: string | null;
  timeZoneId?: string | null;
  applicableDaysOfWeek?: number[] | null;
  applicableMonths?: number[] | null;
  timeWindows?: TimeWindow[] | null;
  pricingCalendarId?: string | null;
  calendarRuleMode?: string | null;
  useCalendarExclusions: boolean;
  holidayPolicy?: string | null;
  prorationPolicy?: string | null;
  stackingMode?: string | null;
  priority: number;
  tiers?: Tier[] | null;
  vatRatePercent: number;
  vatRateLedgerAccount: number;
  vatRateId?: string | null;
  costCenter?: string | null;
  tags?: string[] | null;
  assigned: boolean;
}

export interface DeleteTariffRateRequestDto {
  tariffRateId?: string | null;
}

export interface DeleteTariffRateResponseDto {
  status: boolean;
  response?: string | null;
}

export interface ListTariffRatesRequestDto {
  tariffId?: string | null;
}

export interface TariffRateDataDto {
  tariffId?: string | null;
  tariffRateId?: string | null;
  description?: string | null;
  validFrom: DateInput;
  validTo: DateInput;
  applicationFrequency?: string | null;
  amountBasis?: string | null;
  period?: string | null;
  postingDirection?: string | null;
  generalLedgerAccount: number;
  scale: number;
  amountMinor: number;
  amount: number;
  unitOfMeasure?: string | null;
  quantitySource?: string | null;
  timeZoneId?: string | null;
  applicableDaysOfWeek?: number[] | null;
  applicableMonths?: number[] | null;
  timeWindows?: TimeWindow[] | null;
  pricingCalendarId?: string | null;
  calendarRuleMode?: string | null;
  useCalendarExclusions: boolean;
  holidayPolicy?: string | null;
  prorationPolicy?: string | null;
  stackingMode?: string | null;
  priority: number;
  tiers?: Tier[] | null;
  vatRatePercent: number;
  vatRateLedgerAccount: number;
  vatRateId?: string | null;
  costCenter?: string | null;
  tags?: string[] | null;
  assigned: boolean;
}

export interface ListTariffRatesResponseDto {
  status: boolean;
  tariffRates?: TariffRateDataDto[] | null;
  response?: string | null;
}

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

export interface AddTariffDebtResponse {
  status: boolean;
  message?: string | null;
  hasMessage?: boolean;
}

export interface UpdateDebtAmortisationRequestDto {
  contractId: number;
  customerId: number;
  contractServiceId: number;
  groupId: string;
  debtAmortisationAmount: number;
}

export interface UpdateDebtAmortisationResponse {
  status: boolean;
  message?: string | null;
  hasMessage?: boolean;
}

export interface ListOverviewResponse<T> {
  status: boolean;
  items?: T[] | null;
}

export class SmartSphereApiError extends Error {
  status?: number;
  payload?: unknown;

  constructor(
    message: string,
    options?: { status?: number; payload?: unknown },
  ) {
    super(message);
    this.name = "SmartSphereApiError";
    this.status = options?.status;
    this.payload = options?.payload;
  }
}

export interface SmartSphereClientConfig {
  baseUrl: string;
  fetch?: typeof fetch;
  headers?: HeadersInit;
  accessToken?: string;
  credentials?: RequestCredentials;
}

type RequestBody = BodyInit | Record<string, unknown> | object | undefined;

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

function toIso(value: Date): string {
  return value.toISOString();
}

function normalizeValue(value: unknown): unknown {
  if (value instanceof Date) return toIso(value);
  if (Array.isArray(value)) return value.map(normalizeValue);
  if (value && typeof value === "object") {
    if (
      typeof (value as Blob).arrayBuffer === "function" &&
      value instanceof Blob
    )
      return value;
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(
      value as Record<string, unknown>,
    )) {
      if (nested !== undefined) out[key] = normalizeValue(nested);
    }
    return out;
  }
  return value;
}

function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return "";
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null) continue;
        search.append(key, item instanceof Date ? toIso(item) : String(item));
      }
      continue;
    }
    search.append(key, value instanceof Date ? toIso(value) : String(value));
  }

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function headersToRecord(headers?: HeadersInit): Record<string, string> {
  const record: Record<string, string> = {};
  if (!headers) return record;
  const h = new Headers(headers);
  for (const [key, value] of h.entries()) record[key] = value;
  return record;
}

export class SmartSphereApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly defaultHeaders?: HeadersInit;
  private readonly accessToken?: string;
  private readonly credentials?: RequestCredentials;

  constructor(config: SmartSphereClientConfig) {
    this.baseUrl = config.baseUrl;
    this.fetchImpl = config.fetch ?? fetch;
    this.defaultHeaders = config.headers;
    this.accessToken = config.accessToken;
    this.credentials = config.credentials;
  }

  private async requestJson<TResponse>(
    method: string,
    path: string,
    body?: RequestBody,
    query?: Record<string, unknown>,
    extraHeaders?: HeadersInit,
  ): Promise<TResponse> {
    const url = joinUrl(this.baseUrl, path) + buildQuery(query);
    const headers = new Headers(this.defaultHeaders);

    if (this.accessToken) {
      headers.set("authorization", `Bearer ${this.accessToken}`);
    }

    if (extraHeaders) {
      const extra = new Headers(extraHeaders);
      for (const [key, value] of extra.entries()) headers.set(key, value);
    }

    const init: RequestInit = {
      method,
      headers,
      credentials: this.credentials,
    };

    if (body !== undefined) {
      headers.set("content-type", "application/json");
      init.body =
        typeof body === "string" ||
        body instanceof Blob ||
        body instanceof FormData
          ? body
          : JSON.stringify(normalizeValue(body));
    }

    const response = await this.fetchImpl(url, init);

    if (!response.ok) {
      const payload = await this.safeParseResponse(response);
      throw new SmartSphereApiError(
        `SmartSphere API error ${response.status} ${response.statusText}`,
        {
          status: response.status,
          payload,
        },
      );
    }

    if (response.status === 204) return undefined as TResponse;
    return (await this.safeParseResponse(response)) as TResponse;
  }

  private async requestRaw(
    method: string,
    path: string,
    body?: RequestBody,
    query?: Record<string, unknown>,
    extraHeaders?: HeadersInit,
  ): Promise<Response> {
    const url = joinUrl(this.baseUrl, path) + buildQuery(query);
    const headers = new Headers(this.defaultHeaders);

    if (this.accessToken) {
      headers.set("authorization", `Bearer ${this.accessToken}`);
    }

    if (extraHeaders) {
      const extra = new Headers(extraHeaders);
      for (const [key, value] of extra.entries()) headers.set(key, value);
    }

    const init: RequestInit = {
      method,
      headers,
      credentials: this.credentials,
    };

    if (body !== undefined) {
      if (
        body instanceof FormData ||
        body instanceof Blob ||
        typeof body === "string"
      ) {
        init.body = body;
      } else {
        headers.set("content-type", "application/json");
        init.body = JSON.stringify(normalizeValue(body));
      }
    }

    const response = await this.fetchImpl(url, init);

    if (!response.ok) {
      const payload = await this.safeParseResponse(response);
      throw new SmartSphereApiError(
        `SmartSphere API error ${response.status} ${response.statusText}`,
        {
          status: response.status,
          payload,
        },
      );
    }

    return response;
  }

  private async safeParseResponse(response: Response): Promise<unknown> {
    const contentType = response.headers.get("content-type") ?? "";
    if (response.status === 204) return undefined;
    if (contentType.includes("application/json")) return response.json();
    return response.text();
  }

  private async requestForm<TResponse>(
    path: string,
    input: UploadInboxRequest,
  ): Promise<TResponse> {
    const form = new FormData();
    form.append("File", input.file);
    if (input.fileType !== undefined)
      form.append("FileType", String(input.fileType));
    if (input.fileFormat !== undefined)
      form.append("FileFormat", String(input.fileFormat));
    if (input.groupId !== undefined) form.append("GroupId", input.groupId);
    if (input.uploader !== undefined) form.append("Uploader", input.uploader);
    if (input.sourceEndpoint !== undefined)
      form.append("SourceEndpoint", input.sourceEndpoint);
    return this.requestJson<TResponse>("POST", path, form);
  }

  // Account
  resetPassword(body: ResetPasswordRequest) {
    return this.requestJson<GenericResponse>(
      "POST",
      "/Api/v1/Account/ResetPassword",
      body,
    );
  }

  setAccountLanguage(body: SetLanguageRequest) {
    return this.requestJson<GenericResponse>(
      "POST",
      "/Api/v1/Account/SetAccountLanguage",
      body,
    );
  }

  setUser(body: SetUserRequest) {
    return this.requestJson<SetUserResponse>(
      "POST",
      "/Api/v1/Account/SetUser",
      body,
    );
  }

  // Authentication
  requestToken(body: RestRequestToken) {
    return this.requestJson<unknown>(
      "POST",
      "/api/v2/Authentication/RequestToken",
      body,
    );
  }

  createBridgeTicket(body: BridgeTicketCreateRequestDto) {
    return this.requestJson<BridgeTicketCreateResponseDto>(
      "POST",
      "/api/v2/Authentication/BridgeTicket/Create",
      body,
    );
  }

  consumeBridgeTicket(body: BridgeTicketConsumeRequestDto) {
    return this.requestJson<BridgeTicketConsumeResponseDto>(
      "POST",
      "/api/v2/Authentication/BridgeTicket/Consume",
      body,
    );
  }

  // ContractService
  getContractServiceDetails(body: ServiceByContractRequest) {
    return this.requestJson<ContractServiceByDetails>(
      "POST",
      "/Api/v1/ContractService/ContractServiceDetails",
      body,
    );
  }

  getCustomerConsume(body: GetCustomerConsumeRequestDto) {
    return this.requestJson<GetCustomerConsumeResponseDto>(
      "POST",
      "/Api/v1/ContractService/GetCustomerConsume",
      body,
    );
  }

  getContractStatus(body: GetContractStatusRequest) {
    return this.requestJson<GetContractStatusResponseDto>(
      "POST",
      "/Api/v1/ContractService/GetContractStatus",
      body,
    );
  }

  listActiveContracts(body: SimpleRequest) {
    return this.requestJson<ContractServiceReducedResponseDto>(
      "POST",
      "/Api/v1/ContractService/ListActiveContracts",
      body,
    );
  }

  getContractServices(body: GetContractsRequest) {
    return this.requestJson<ContractServiceReducedResponseDto>(
      "POST",
      "/Api/v1/ContractService/GetContractServices",
      body,
    );
  }

  listMetaPresets(body: ListMetaPresetsRequest) {
    return this.requestJson<ListMetaPresetsResponse>(
      "POST",
      "/Api/v1/ContractService/ListMetaPresets",
      body,
    );
  }

  getCustomerContracts(body: SimpleRequest) {
    return this.requestJson<ContractServiceReducedResponseDto>(
      "POST",
      "/Api/v1/ContractService/GetCustomerContracts",
      body,
    );
  }

  getCustomerDashboard(body: SimpleRequest) {
    return this.requestJson<CustomerDashboard>(
      "POST",
      "/Api/v1/ContractService/GetCustomerDashboard",
      body,
    );
  }

  getTransactionDashboard(body: SimpleRequest) {
    return this.requestJson<TransactionDashboard>(
      "POST",
      "/Api/v1/ContractService/GetTransactionDashboard",
      body,
    );
  }

  setDeadlineDay(body: SetGraceDay) {
    return this.requestJson<ElectricalReply>(
      "POST",
      "/Api/v1/ContractService/SetDeadlineDay",
      body,
    );
  }

  setGraceDay(body: SetGraceDay) {
    return this.requestJson<ElectricalReply>(
      "POST",
      "/Api/v1/ContractService/SetGraceDay",
      body,
    );
  }

  setGraceExtraDay(body: SetGraceDay) {
    return this.requestJson<ElectricalReply>(
      "POST",
      "/Api/v1/ContractService/SetGraceExtraDay",
      body,
    );
  }

  setContractTariff(body: SetRate) {
    return this.requestJson<SetContractTariffResponse>(
      "POST",
      "/Api/v1/ContractService/SetContractTariff",
      body,
    );
  }

  listContractTariffs(body: ListContractTariffsRequest) {
    return this.requestJson<ListContractTariffsDto>(
      "POST",
      "/Api/v1/ContractService/ListContractTariffs",
      body,
    );
  }

  updateContractStatus(body: { contractID?: number }) {
    return this.requestJson<ElectricalReply>(
      "POST",
      "/Api/v1/ContractService/UpdateStatus",
      body,
    );
  }

  setContract(body: SetContractServiceRequestDto) {
    return this.requestJson<SetContractServiceResponse>(
      "POST",
      "/Api/v1/ContractService/SetContract",
      body,
    );
  }

  closeContractService(body: CloseContractRequestDto) {
    return this.requestJson<CloseContractResponse>(
      "POST",
      "/Api/v1/ContractService/CloseContractService",
      body,
    );
  }

  setContractMeta(body: SetContractMetaRequest) {
    return this.requestJson<SetContractMetaResponse>(
      "POST",
      "/Api/v1/ContractService/SetContractMeta",
      body,
    );
  }

  setContractDescription(body: SetContractDescriptionRequest) {
    return this.requestJson<SetContractDescriptionResponse>(
      "POST",
      "/Api/v1/ContractService/SetContractDescription",
      body,
    );
  }

  // Customers
  createCustomer(body: SetCustomerRequestDto) {
    return this.requestJson<SetCustomerResponseDto>(
      "POST",
      "/Api/v1/Customers/CreateCustomer",
      body,
    );
  }

  // FileManager
  listExports(query: ListExportsQuery = {}) {
    return this.requestJson<ListExportsResponseDto>(
      "GET",
      "/Api/v1/FileManager/Exports",
      undefined,
      query,
    );
  }

  downloadExport(id: string) {
    return this.requestRaw(
      "GET",
      `/Api/v1/FileManager/Exports/${encodeURIComponent(id)}/Download`,
    );
  }

  downloadLatestImport(fileType?: FileType, fileFormat?: FileFormat) {
    return this.requestRaw(
      "GET",
      "/Api/v1/FileManager/Imports/Latest/Download",
      undefined,
      { fileType, fileFormat },
    );
  }

  uploadFile(body: UploadInboxRequest) {
    return this.requestForm<UploadInboxResponseDto>(
      "/Api/v1/FileManager/Uploads",
      body,
    );
  }

  // Financial
  getCustomerBalance(body: GetCustomerBalanceRequest) {
    return this.requestJson<GetCustomerBalanceResponse>(
      "POST",
      "/Api/v1/Financial/GetCustomerBalance",
      body,
    );
  }

  getContractBalance(body: GetContractBalanceRequestDto) {
    return this.requestJson<GetContractBalanceResponse>(
      "POST",
      "/Api/v1/Financial/GetContractBalance",
      body,
    );
  }

  setTransaction(body: SetTransactionRequest) {
    return this.requestJson<SetTransactionResponseDto>(
      "POST",
      "/Api/v1/Financial/SetTransaction",
      body,
    );
  }

  updateTransaction(body: UpdateTransactionRequest) {
    return this.requestJson<UpdateTransactionResponse>(
      "POST",
      "/Api/v1/Financial/UpdateTransaction",
      body,
    );
  }

  listTransactions(body: ListTransactionsRequest) {
    return this.requestJson<ListTransactionsResponse>(
      "POST",
      "/Api/v1/Financial/ListTransactions",
      body,
    );
  }

  getTransactionOrder(body: GetTransactionOrderRequestDto) {
    return this.requestJson<ListTransactionsResponse>(
      "POST",
      "/Api/v1/Financial/GetTransactionOrder",
      body,
    );
  }

  generateOrderId(body: GenerateOrderIdRequest) {
    return this.requestJson<GenerateOrderIdResponse>(
      "POST",
      "/Api/v1/Financial/GenerateOrderId",
      body,
    );
  }

  setIncomeStatement(body: SetIncomeStatementRequestDto) {
    return this.requestJson<SetIncomeStatementResponseDto>(
      "POST",
      "/Api/v1/Financial/SetIncomeStatement",
      body,
    );
  }

  // Gas
  setGasTariff(body: SetGasTariffRequestDto) {
    return this.requestJson<SetGasTariffResponseDto>(
      "POST",
      "/Api/v1/Gas/SetGasTariff",
      body,
    );
  }

  closeGasTariffs(body: CloseGasTariffsRequestDto) {
    return this.requestJson<CloseGasTariffsResponseDto>(
      "POST",
      "/Api/v1/Gas/CloseGasTariffs",
      body,
    );
  }

  listGasTariffs(body: ListGasTariffsRequestDto) {
    return this.requestJson<ListGasTariffsResponseDto>(
      "POST",
      "/Api/v1/Gas/ListGasTariffs",
      body,
    );
  }

  // Graphics
  listRevenues(body: ListRevenuesRequest) {
    return this.requestJson<GraphicSimple>(
      "POST",
      "/Api/v1/Graphics/ListRevenues",
      body,
    );
  }

  getGroupedCosts(body: GetCostsAndMeasuresRequest) {
    return this.requestJson<GraphicMulti>(
      "POST",
      "/Api/v1/Graphics/GetGroupedCosts",
      body,
    );
  }

  getCosts(body: GetCostsAndMeasuresRequest) {
    return this.requestJson<GraphicMulti>(
      "POST",
      "/Api/v1/Graphics/GetCosts",
      body,
    );
  }

  getCostsAndMeasures(body: GetCostsAndMeasuresRequest) {
    return this.requestJson<GraphicMulti>(
      "POST",
      "/Api/v1/Graphics/GetCostsAndMeasures",
      body,
    );
  }

  getMeasures(body: GetCostsAndMeasuresRequest) {
    return this.requestJson<GraphicMulti>(
      "POST",
      "/Api/v1/Graphics/GetMeasures",
      body,
    );
  }

  // Infrastructure
  listMeterStatus(body: ListMeterStatusRequestDto) {
    return this.requestJson<ListMeterStatusResponseDto>(
      "POST",
      "/Api/v1/Infrastructure/ListMeterStatus",
      body,
    );
  }

  listContractMeters(body: ListContractMetersRequest) {
    return this.requestJson<ListContractMetersResponse>(
      "POST",
      "/Api/v1/Infrastructure/ListContractMeters",
      body,
    );
  }

  getContractMeterState(body: { key?: MeterKey }) {
    return this.requestJson<{
      status: boolean;
      response?: string | null;
      meter?: ContractMeter;
    }>("POST", "/Api/v1/Infrastructure/GetContractMeterState", body);
  }

  validateChangeMeterStatus(body: ValidateChangeMeterStatusRequest) {
    return this.requestJson<ValidateChangeMeterStatusResponse>(
      "POST",
      "/Api/v1/Infrastructure/ValidateChangeMeterStatus",
      body,
    );
  }

  changeMeterStatus(body: ChangeMeterStatusRequest) {
    return this.requestJson<ChangeMeterStatusResponse>(
      "POST",
      "/Api/v1/Infrastructure/ChangeMeterStatus",
      body,
    );
  }

  listPendingMeterChanges(body: ListPendingMeterChangesRequest) {
    return this.requestJson<ListPendingMeterChangesResponse>(
      "POST",
      "/Api/v1/Infrastructure/ListPendingMeterChanges",
      body,
    );
  }

  listPendingMeterChangesByStatus(
    body: ListPendingMeterChangesByStatusRequest,
  ) {
    return this.requestJson<ListPendingMeterChangesByStatusResponse>(
      "POST",
      "/Api/v1/Infrastructure/ListPendingMeterChangesByStatus",
      body,
    );
  }

  listPendingMeterChangesSummary(body: ListPendingMeterChangesRequest) {
    return this.requestJson<ListPendingMeterChangesSummaryResponse>(
      "POST",
      "/Api/v1/Infrastructure/ListPendingMeterChangesSummary",
      body,
    );
  }

  issueMeterValidationCodeBulk(body: IssueMeterValidationCodeBulkRequest) {
    return this.requestJson<IssueMeterValidationCodeBulkResponse>(
      "POST",
      "/Api/v1/Infrastructure/IssueMeterValidationCodeBulk",
      body,
    );
  }

  validateChangeMeterStatusBulk(body: ValidateChangeMeterStatusBulkRequestDto) {
    return this.requestJson<ValidateChangeMeterStatusBulkResponse>(
      "POST",
      "/Api/v1/Infrastructure/ValidateChangeMeterStatusBulk",
      body,
    );
  }

  // Language
  getCompany() {
    return this.requestJson<CompanyResponse>(
      "GET",
      "/Api/v1/Language/GetCompany",
    );
  }

  // Shop
  suggest(body: SuggestRequest) {
    return this.requestJson<SuggestResponse>(
      "POST",
      "/Api/v1/Shop/Suggest",
      body,
    );
  }

  suggestBulk(body: SuggestRequest) {
    return this.requestJson<SuggestResponse>(
      "POST",
      "/Api/v1/Shop/SuggestBulk",
      body,
    );
  }

  split(body: SplitRequest) {
    return this.requestJson<SplitResponse>("POST", "/Api/v1/Shop/Split", body);
  }

  // Statistics
  getDashboardAdmin(body: GetDashboardAdminRequest) {
    return this.requestJson<GetDashboardAdminResponseDto>(
      "POST",
      "/Api/v1/Statistics/GetDashboardAdmin",
      body,
    );
  }

  // Tariffs
  addElectricalTariff(body: AddTariffRequestDto) {
    return this.requestJson<AddTariffResponseDto>(
      "POST",
      "/Api/v1/Tariffs/AddElectricalTariff",
      body,
    );
  }

  listElectricalTariffs(body: ListTariffsRequestDto) {
    return this.requestJson<ListTariffsResponseDto>(
      "POST",
      "/Api/v1/Tariffs/ListElectricalTariffs",
      body,
    );
  }

  getElectricalTariff(body: GetTariffRequestDto) {
    return this.requestJson<GetTariffResponseDto>(
      "POST",
      "/Api/v1/Tariffs/GetElectricalTariff",
      body,
    );
  }

  deleteElectricalTariff(body: DeleteTariffRequestDto) {
    return this.requestJson<DeleteTariffResponseDto>(
      "POST",
      "/Api/v1/Tariffs/DeleteElectricalTariff",
      body,
    );
  }

  updateElectricalTariff(body: UpdateTariffRequestDto) {
    return this.requestJson<UpdateTariffResponseDto>(
      "POST",
      "/Api/v1/Tariffs/UpdateElectricalTariff",
      body,
    );
  }

  addElectricalTariffRate(body: AddTariffRateRequestDto) {
    return this.requestJson<AddTariffRateResponseDto>(
      "POST",
      "/Api/v1/Tariffs/AddElectricalTariffRate",
      body,
    );
  }

  listElectricalTariffRates(body: ListTariffRatesRequestDto) {
    return this.requestJson<ListTariffRatesResponseDto>(
      "POST",
      "/Api/v1/Tariffs/ListElectricalTariffRates",
      body,
    );
  }

  getElectricalTariffRate(body: GetTariffRateRequestDto) {
    return this.requestJson<GetTariffRateResponseDto>(
      "POST",
      "/Api/v1/Tariffs/GetElectricalTariffRate",
      body,
    );
  }

  deleteElectricalTariffRate(body: DeleteTariffRateRequestDto) {
    return this.requestJson<DeleteTariffRateResponseDto>(
      "POST",
      "/Api/v1/Tariffs/DeleteElectricalTariffRate",
      body,
    );
  }

  addTariffDebt(body: AddTariffDebtRequestDto) {
    return this.requestJson<AddTariffDebtResponse>(
      "POST",
      "/Api/v1/Tariffs/AddTariffDebt",
      body,
    );
  }

  updateDebtAmortisation(body: UpdateDebtAmortisationRequestDto) {
    return this.requestJson<UpdateDebtAmortisationResponse>(
      "POST",
      "/Api/v1/Tariffs/UpdateDebtAmortisation",
      body,
    );
  }

  // Raw escape hatch
  call<TResponse = unknown>(
    method: string,
    path: string,
    body?: RequestBody,
    query?: Record<string, unknown>,
  ) {
    return this.requestJson<TResponse>(method, path, body, query);
  }
}

export function createSmartSphereApiClient(config: SmartSphereClientConfig) {
  return new SmartSphereApiClient(config);
}
