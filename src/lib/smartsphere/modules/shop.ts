import type { HttpCore } from "../core";

// ─── DTOs ──────────────────────────────────────────────────────────────────────
export interface SuggestedContract {
  contractID: number;
  suggestedAmount: number;
  suggestedAmountRaw: number;
}

export interface SuggestRequest {
  contracts?: number[] | null;
  days?: number;
  groupID?: string | null;
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

// ─── Module ────────────────────────────────────────────────────────────────────
export class ShopModule {
  constructor(private readonly http: HttpCore) {}

  suggest(body: SuggestRequest) {
    return this.http.post<SuggestResponse>("/Api/v1/Shop/Suggest", body);
  }

  suggestBulk(body: SuggestRequest) {
    return this.http.post<SuggestResponse>("/Api/v1/Shop/SuggestBulk", body);
  }

  split(body: SplitRequest) {
    return this.http.post<SplitResponse>("/Api/v1/Shop/Split", body);
  }
}
