import type { HttpCore, DateInput } from "../core";

// ─── DTOs ──────────────────────────────────────────────────────────────────────
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
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

// ─── Module ────────────────────────────────────────────────────────────────────
export class AuthModule {
  constructor(private readonly http: HttpCore) {}

  requestToken(body: RestRequestToken) {
    return this.http.post<TokenResponse>("/api/v2/Authentication/RequestToken", body);
  }

  createBridgeTicket(body: BridgeTicketCreateRequestDto) {
    return this.http.post<BridgeTicketCreateResponseDto>(
      "/api/v2/Authentication/BridgeTicket/Create", body,
    );
  }

  consumeBridgeTicket(body: BridgeTicketConsumeRequestDto) {
    return this.http.post<BridgeTicketConsumeResponseDto>(
      "/api/v2/Authentication/BridgeTicket/Consume", body,
    );
  }
}
