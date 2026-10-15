import type { HttpCore } from "../core";

// ─── DTOs ──────────────────────────────────────────────────────────────────────
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
}

// ─── Module ────────────────────────────────────────────────────────────────────
export class LanguageModule {
  constructor(private readonly http: HttpCore) {}

  getCompany() {
    return this.http.get<CompanyResponse>("/Api/v1/Language/GetCompany");
  }
}
