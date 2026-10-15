/**
 * SmartSphere API Client — public interface
 *
 * Usage:
 *   import { getClient, setAuthToken, clearAuthToken, SOURCE_ID } from '@/lib/smartsphere';
 *
 * After login:
 *   setAuthToken(tokenResponse.access_token);
 *
 * All subsequent getClient() calls return a client with the token set.
 */
export {
  SmartSphereApiClient,
  getClient,
  setAuthToken,
  clearAuthToken,
  SOURCE_ID,
} from "./client";

// Core types
export type {
  SmartSphereClientConfig,
  DateInput,
  SumMethod,
  TransactionSource,
  TransactionStatus,
} from "./core";
export { SmartSphereApiError } from "./core";
export type { ResetPasswordRequest } from "./modules/account";
// Feature module types (re-export what the services layer needs)
export type { RestRequestToken, TokenResponse } from "./modules/auth";
export type {
  ApiCustomerDashboard,
  ContractServiceReducedDto,
  CustomerDashboardData,
  SimpleRequest,
} from "./modules/contract";
export type {
  ApiTransaction,
  GetCustomerBalanceResponse,
  ListTransactionsRequest,
  ListTransactionsResponse,
  SetTransactionRequest,
} from "./modules/financial";
export type {
  GetCostsAndMeasuresRequest,
  GraphicMulti,
} from "./modules/graphics";
export type { CompanyResponse } from "./modules/language";
export type {
  UpdateUserNotificationSettingsRequest,
  UserNotificationSettingsResponse,
} from "./modules/notifications";
