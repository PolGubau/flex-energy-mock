import type { HttpCore, UserRole, GenericResponse } from "../core";

// ─── DTOs ──────────────────────────────────────────────────────────────────────
export interface ResetPasswordRequest {
  email: string;
}

export interface SetLanguageRequest {
  accountID: number;
  languageLegacyID: number;
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

// ─── Module ────────────────────────────────────────────────────────────────────
export class AccountModule {
  constructor(private readonly http: HttpCore) {}

  resetPassword(body: ResetPasswordRequest) {
    return this.http.post<GenericResponse>("/Api/v1/Account/ResetPassword", body);
  }

  setAccountLanguage(body: SetLanguageRequest) {
    return this.http.post<GenericResponse>("/Api/v1/Account/SetAccountLanguage", body);
  }

  setUser(body: SetUserRequest) {
    return this.http.post<SetUserResponse>("/Api/v1/Account/SetUser", body);
  }
}
