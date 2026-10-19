/**
 * 🔐 Authentication & User
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: "success" | "error";
  token?: string;
  user?: UserInfo;
  error?: string;
}

export interface UserInfo {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

export interface TokenPayload {
  sub: number; // user/customer ID
  email: string;
  iat: number; // issued at
  exp: number; // expiration time
}

/**
 * 👤 Customer/CRM
 */
export interface Customer {
  sourceId: number;
  buCustomerId?: string;
  lastName?: string;
  firstName?: string;
  companyName?: string;
  address?: string;
  postalCode: string;
  city: string;
  phone?: string;
  email?: string;
  country?: string;
  contracts?: Contract[];
}

export interface CustomerSearchRequest {
  sourceId: number;
  filter: string; // BUCustomerID, name, email, etc.
}

export interface GetCustomersReply {
  sourceId: number;
  status: boolean;
  customers: CustomerReduced[];
}

export interface CustomerReduced {
  buCustomerId?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

export interface CompanyInfo {
  companyName: string;
  companyAddress: string;
  companyCity: string;
}

/**
 * 📄 Contracts (Electrical)
 */
export interface Contract {
  contractId: number;
  buContractId?: string;
  customerId: number;
  description?: string;
  startDate: string; // ISO 8601 timestamp
  endDate: string;
  serviceStatus: "Active" | "Warning" | "Grace" | "Suspended" | "Closed";
  statusDateTime: string;
  warningStatus?: string;
  warningStatusDateTime?: string;
  zpbs: ZPB[];
  electricalRates: ElectricalRate[];
  triggerLockDays: number;
  triggerPrelockDays: number;
  triggerDeadlineLockDays: number;
}

export interface ContractServiceReduced {
  contractId: number;
  buContractId: string;
  description: string;
  startDate: string;
  endDate: string;
  serviceStatus: string;
  customerId: number;
}

export interface ZPB {
  zpbId: string; // Metering point identifier
  obis: string;
}

export interface ElectricalRate {
  tariffId: string;
  validFrom: string;
  validTo: string;
  description?: string;
}

export interface ContractStatus {
  contractId: number;
  serviceStatus: string;
  statusDateTime: string;
  warningStatus?: string;
  warningStatusDateTime?: string;
}

/**
 * 💰 Saldi & Forecasting (DeaService)
 */
export interface ContractBalance {
  contractId: number;
  balance: number; // in minor units (centesimi)
  averageCost?: number;
  debt?: number;
  debtAmortisation?: number;
  forecastTotalCost?: number;
  depletionDate?: string; // ISO timestamp quando saldo esaurisce
}

export interface GetContractBalanceRequest {
  contractId: number;
  groupId?: string;
  getBalance: boolean;
  getAverageCost?: boolean;
  getDebt?: boolean;
  getDebtAmortisation?: boolean;
  getForecast?: boolean;
  forecastHorizonDays?: number; // default 30
  tariffId?: string;
}

export interface GetContractBalanceResponse {
  status: boolean;
  balance: number;
  averageCost: number;
  debt: number;
  debtAmortisation: number;
  scale: number; // default 2 (divide by 100 for CHF)
  currency: string; // "CHF"
  forecastTotalCost: number;
  depletionDate?: string; // ISO timestamp
}

export interface GetContractsBalanceResponse {
  status: boolean;
  totalBalance: number;
  balances: ContractBalance[];
  scale: number;
  currency: string;
}

/**
 * 💳 Pagamenti (Stripe)
 */
export interface CreatePaymentIntentRequest {
  customerId: number;
  amountMinor: number; // importo in centesimi
  currency: string; // "CHF"
  items: IntentItem[]; // contratti destinatari
  idempotencyKey?: string;
}

export interface IntentItem {
  contractId: number;
  amountMinor: number;
  description?: string;
}

export interface CreatePaymentIntentResponse {
  status: "success" | "error";
  operationId: string; // internal tracking ID
  paymentIntentId: string; // Stripe ID
  clientSecret: string; // per Payment Element frontend
  status_stripe:
    | "requires_payment_method"
    | "requires_confirmation"
    | "requires_action"
    | "processing"
    | "requires_capture"
    | "succeeded";
  amount: number;
  currency: string;
}

export interface GetPaymentStatusRequest {
  paymentIntentId: string;
}

export interface GetPaymentStatusResponse {
  status: "success" | "error";
  paymentIntentId: string;
  stripe_status:
    | "requires_payment_method"
    | "requires_confirmation"
    | "requires_action"
    | "processing"
    | "requires_capture"
    | "succeeded"
    | "canceled";
  amount: number;
  currency: string;
  lastError?: string; // sanitized error message
  chargeId?: string;
  paymentMethodType?: string; // 'card', ecc.
  cardLastFour?: string;
  cardBrand?: string;
  cardHolder?: string;
}

export interface HandleWebhookRequest {
  rawBody: string; // raw JSON from Stripe
  signatureHeader: string; // "Stripe-Signature" header value
  timestamp: string;
}

export interface HandleWebhookResponse {
  status: boolean;
  message: string;
}

/**
 * 📊 Transactions (Storico Transazioni)
 */
export interface Transaction {
  transactionId?: string;
  orderId?: string;
  buContractId?: string;
  exportId?: string;
  customerId: number;
  contractId: number;
  amountMinor: number;
  scale: number; // default 2
  currency: string;
  transactionSource: "Stripe" | "Manual" | "System" | "Shop";
  transactionStatus:
    | "Pending"
    | "Settled"
    | "Failed"
    | "Refunded"
    | "Cancelled";
  description?: string;
  cardBrand?: string;
  cardNumber?: string;
  cardHolder?: string;
  paymentId?: string;
  sourceId?: string;
  transactionDate: string; // ISO timestamp
}

export interface ListTransactionsRequest {
  customerId: number;
  contractId: number;
  ownerId: number;
  dateFrom: string; // ISO timestamp
  dateTo: string;
}

export interface ListTransactionsResponse {
  status: boolean;
  scale: number;
  currency: string;
  transactions: Transaction[];
}

export interface GetTransactionOrderResponse {
  status: boolean;
  scale: number;
  currency: string;
  transactions: Transaction[];
}

/**
 * 📈 Dashboard
 */
/** Rich contract shape returned by GetCustomerDashboard and used in the Dashboard view. */
export interface DashboardContract {
  contractId: number;
  buContractId?: string;
  displayName?: string;
  serviceStatus: string;
  customerId: number;
  startDate: string; // ISO
  endDate: string; // ISO
  lastMeasure: string; // ISO — last data point recorded
  /** Per-contract balance in minor units */
  balanceRaw: number;
  scale: number;
  currency: string;
  /** Average daily cost in minor units */
  averageCost: number;
  /** Forecast total cost for the billing period, minor units */
  forecastTotalCost: number;
  /** ISO date when the balance is expected to run out */
  depletionDate: string;
}

export interface CustomerDashboard {
  sourceId: number;
  status: boolean;
  /** Aggregated balance across all contracts, in minor units */
  balance: number;
  /** Total consumption in kWh */
  consume: number;
  scale: number;
  contracts: DashboardContract[];
}

export interface GetCustomerDashboardRequest {
  sourceId: number;
  customerId: number;
}

/**
 * 📏 Misure Elettriche (ElectricalMeasureService)
 */
export interface GetProfileMeasuresRequest {
  zpb?: string; // single metering point
  zpbs?: string[]; // multiple metering points
  obis: string;
  timestampFromUtc: string; // ISO timestamp
  timestampToUtc: string;
  sumMethod?:
    | "Raw"
    | "Min15"
    | "Hourly"
    | "Daily"
    | "Monthly"
    | "Yearly"
    | "Total";
}

export interface GetProfileMeasuresResponse {
  complete: boolean;
  zpb: string;
  flow: "Import" | "Export";
  measureBasis: "Energy" | "Power" | "Other";
  measures: MeasureData[];
  measureValidated: boolean;
}

export interface MeasureData {
  timestamp: string; // ISO timestamp UTC
  value: number; // measurement value
  unit?: string;
}

export interface MeasuresStatus {
  zpb: string;
  obis: string;
  firstSampleUtc?: string;
  lastSampleUtc?: string;
  status: "Present" | "Missing" | "Delayed";
}

/**
 * ⚠️ Error Responses
 */
export interface ErrorResponse {
  status: boolean; // always false for errors
  error?: {
    code: string; // es. "INVALID_EMAIL", "UNAUTHORIZED", "NOT_FOUND"
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ValidationError {
  status: false;
  error: {
    code: "VALIDATION_ERROR";
    message: string;
    fields: {
      [fieldName: string]: string[]; // list of error messages per field
    };
  };
}

export type ApiResponse<T> =
  | ({ status: true } & T)
  | { status: false; error: { code: string; message: string } };

/**
 * 🔌 Common Patterns
 */
export interface CoreReply {
  sourceId: number;
  status: boolean;
}

export interface GenericResponse {
  status: boolean;
  message?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface Money {
  amountMinor: number; // 123 = 1.23 CHF
  scale: number; // default 2
  currency: string; // "CHF"
}

export type Timestamp = string; // "2026-03-24T15:30:45Z"

/**
 * 📝 Tariffe (TariffService)
 */
export interface Tariff {
  tariffId: string;
  tariffName: string;
  extTariffId?: string;
  enabled: boolean;
  currency: string;
}

export interface TariffRate {
  tariffRateId: string;
  tariffId: string;
  validFrom: string;
  validTo: string;
  description?: string;
  amountMinor: number; // price in minor units
  unitOfMeasure?: string;
  scale: number;
  vatRatePercent?: number;
  applicableDaysOfWeek?: number[];
  applicableMonths?: number[];
  priority: number;
}

export type ListTariffsRequest = Record<string, never>;

export interface ListTariffsResponse {
  status: boolean;
  tariffs: Tariff[];
  response?: string;
}

/**
 * 🛠️ Utilities
 */
export function fromMinorUnits(amountMinor: number, scale: number = 2): number {
  return amountMinor / 10 ** scale;
}

export function toMinorUnits(amount: number, scale: number = 2): number {
  return Math.round(amount * 10 ** scale);
}

export function formatCurrency(
  amountMinor: number,
  currency: string = "CHF",
  scale: number = 2,
): string {
  const amount = fromMinorUnits(amountMinor, scale);
  // Validate currency code: must be 3 uppercase letters (ISO 4217)
  const validCurrency =
    currency && /^[A-Z]{3}$/.test(currency) ? currency : "CHF";
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: validCurrency,
  }).format(amount);
}

export function isSuccess<T>(
  response: ApiResponse<T>,
): response is T & { status: true } {
  return response.status === true;
}

/**
 * UI Specific Types (Keeping some of the old ones for compatibility)
 */
export type ViewType =
  | "dashboard"
  | "usage"
  | "recharge"
  | "history"
  | "settings";

export interface AlertSettings {
  lowBalance: boolean;
  peakUsage: boolean;
  startHour: string; // "HH:MM"
  endHour: string; // "HH:MM"
}

export type MeterState = "Online" | "Offline" | "Unknown";

export interface Notification {
  id: string;
  title: string;
  message: string;
  translationKey?: string;
  translationValues?: Record<string, string | number>;
  timestamp: string;
  read: boolean;
  type: "info" | "warning" | "success";
}

export interface AppState {
  dashboard: CustomerDashboard | null;
  contracts: Contract[];
  alerts: AlertSettings;
  notifications: Notification[];
  meterState: MeterState;
}
