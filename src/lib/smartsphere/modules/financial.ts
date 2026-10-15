import type {
  DateInput,
  HttpCore,
  Precision,
  ReceiptGenStatus,
  TransactionSource,
  TransactionStatus,
} from "../core";

// ─── DTOs ──────────────────────────────────────────────────────────────────────
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
  getBalance?: boolean;
  getAverageCost?: boolean;
  getDebt?: boolean;
  getForecast?: boolean;
  forecastHorizonDays?: number;
}
export interface GetContractBalanceResponse {
  status: boolean;
  balance: number;
  balanceRaw: number;
  averageCost: number;
  debt: number;
  scale: number;
  currency?: string | null;
  forecastTotalCost: number;
  depletionDate: DateInput;
}

export interface ApiTransaction {
  buContractID?: string | null;
  orderId?: string | null;
  exportId?: string | null;
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
}

export interface ListTransactionsRequest {
  customerId: number;
  contractId: number;
  ownerId?: number;
}
export interface ListTransactionsResponse {
  status: boolean;
  scale: number;
  currency?: string | null;
  transactions?: ApiTransaction[] | null;
}

export interface GenerateOrderIdRequest {
  customerId?: number;
  contractId?: number;
}
export interface GenerateOrderIdResponse {
  status: boolean;
  orderId?: string | null;
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

export interface ListRevenuesRequest {
  precision: Precision;
  dateFrom: DateInput;
  dateTo: DateInput;
  transactionStatus: TransactionStatus;
}

// ─── Module ────────────────────────────────────────────────────────────────────
export class FinancialModule {
  constructor(private readonly http: HttpCore) {}

  getCustomerBalance(body: GetCustomerBalanceRequest) {
    return this.http.post<GetCustomerBalanceResponse>(
      "/Api/v1/Financial/GetCustomerBalance",
      body,
    );
  }
  getContractBalance(body: GetContractBalanceRequestDto) {
    return this.http.post<GetContractBalanceResponse>(
      "/Api/v1/Financial/GetContractBalance",
      body,
    );
  }
  listTransactions(body: ListTransactionsRequest) {
    return this.http.post<ListTransactionsResponse>(
      "/Api/v1/Financial/ListTransactions",
      body,
    );
  }
  setTransaction(body: SetTransactionRequest) {
    return this.http.post<SetTransactionResponseDto>(
      "/Api/v1/Financial/SetTransaction",
      body,
    );
  }
  updateTransaction(body: UpdateTransactionRequest) {
    return this.http.post<UpdateTransactionResponse>(
      "/Api/v1/Financial/UpdateTransaction",
      body,
    );
  }
  generateOrderId(body: GenerateOrderIdRequest) {
    return this.http.post<GenerateOrderIdResponse>(
      "/Api/v1/Financial/GenerateOrderId",
      body,
    );
  }
  setIncomeStatement(body: SetIncomeStatementRequestDto) {
    return this.http.post<SetIncomeStatementResponseDto>(
      "/Api/v1/Financial/SetIncomeStatement",
      body,
    );
  }
}
