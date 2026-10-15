/**
 * SmartSphere HTTP Core — shared primitives + HTTP layer
 * All feature modules receive an instance of HttpCore.
 */

// ─── Primitive Types ───────────────────────────────────────────────────────────
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

// ─── Shared Enums ──────────────────────────────────────────────────────────────
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

// ─── Shared Response Shapes ────────────────────────────────────────────────────
export interface GenericResponse {
  status: boolean;
}
export interface GenericMessageResponse {
  status: boolean;
  response?: string | null;
}
export interface ElectricalReply {
  sourceID: number;
  status: boolean;
}

// ─── Client Config ─────────────────────────────────────────────────────────────
export interface SmartSphereClientConfig {
  baseUrl: string;
  fetch?: typeof fetch;
  headers?: HeadersInit;
  accessToken?: string;
  credentials?: RequestCredentials;
}

// ─── Error ─────────────────────────────────────────────────────────────────────
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

// ─── Helpers ───────────────────────────────────────────────────────────────────
type RequestBody = BodyInit | Record<string, unknown> | object | undefined;

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

function toIso(v: Date): string {
  return v.toISOString();
}

function normalizeValue(v: unknown): unknown {
  if (v instanceof Date) return toIso(v);
  if (Array.isArray(v)) return v.map(normalizeValue);
  if (v && typeof v === "object") {
    if (v instanceof Blob) return v;
    const out: Record<string, unknown> = {};
    for (const [k, nested] of Object.entries(v as Record<string, unknown>)) {
      if (nested !== undefined) out[k] = normalizeValue(nested);
    }
    return out;
  }
  return v;
}

function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      for (const item of v) {
        if (item !== null && item !== undefined)
          search.append(k, item instanceof Date ? toIso(item) : String(item));
      }
      continue;
    }
    search.append(k, v instanceof Date ? toIso(v) : String(v));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

// ─── HTTP Core ─────────────────────────────────────────────────────────────────
export class HttpCore {
  constructor(private readonly config: SmartSphereClientConfig) {}

  private get fetchImpl() {
    // Legacy SDK retained for reference only. Never allow it to reach a server.
    const disabledFetch: typeof fetch = async () => {
      throw new Error("Network access is disabled in the local FlexEnergy demo");
    };
    return disabledFetch;
  }

  private buildHeaders(extra?: HeadersInit): Headers {
    const h = new Headers(this.config.headers);
    if (this.config.accessToken)
      h.set("authorization", `Bearer ${this.config.accessToken}`);
    if (extra) {
      const e = new Headers(extra);
      for (const [k, v] of e.entries()) h.set(k, v);
    }
    return h;
  }

  private async safeParseResponse(res: Response): Promise<unknown> {
    if (res.status === 204) return undefined;
    const ct = res.headers.get("content-type") ?? "";
    return ct.includes("application/json") ? res.json() : res.text();
  }

  private async handleError(res: Response): Promise<never> {
    const payload = await this.safeParseResponse(res);
    throw new SmartSphereApiError(
      `SmartSphere API error ${res.status} ${res.statusText}`,
      { status: res.status, payload },
    );
  }

  async post<T>(path: string, body?: RequestBody): Promise<T> {
    const url = joinUrl(this.config.baseUrl, path);
    const headers = this.buildHeaders();
    if (body !== undefined) headers.set("content-type", "application/json");
    const res = await this.fetchImpl(url, {
      method: "POST",
      headers,
      credentials: this.config.credentials,
      body:
        body !== undefined
          ? typeof body === "string" ||
            body instanceof Blob ||
            body instanceof FormData
            ? body
            : JSON.stringify(normalizeValue(body))
          : undefined,
    });
    if (!res.ok) return this.handleError(res);
    return (await this.safeParseResponse(res)) as T;
  }

  async postUrlEncoded<T>(
    path: string,
    values: Record<string, string | number>,
  ): Promise<T> {
    const url = joinUrl(this.config.baseUrl, path);
    const headers = this.buildHeaders({
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
    });
    const body = new URLSearchParams(
      Object.entries(values).map(([key, value]) => [key, String(value)]),
    );
    const res = await this.fetchImpl(url, {
      method: "POST",
      headers,
      credentials: this.config.credentials,
      body,
    });
    if (!res.ok) return this.handleError(res);
    return (await this.safeParseResponse(res)) as T;
  }

  async get<T>(path: string, query?: Record<string, unknown>): Promise<T> {
    const url = joinUrl(this.config.baseUrl, path) + buildQuery(query);
    const headers = this.buildHeaders();
    const res = await this.fetchImpl(url, {
      method: "GET",
      headers,
      credentials: this.config.credentials,
    });
    if (!res.ok) return this.handleError(res);
    return (await this.safeParseResponse(res)) as T;
  }

  async getRaw(
    path: string,
    query?: Record<string, unknown>,
    extraHeaders?: HeadersInit,
  ): Promise<Response> {
    const url = joinUrl(this.config.baseUrl, path) + buildQuery(query);
    const headers = this.buildHeaders(extraHeaders);
    const res = await this.fetchImpl(url, {
      method: "GET",
      headers,
      credentials: this.config.credentials,
    });
    if (!res.ok) return this.handleError(res);
    return res;
  }

  async postForm<T>(path: string, form: FormData): Promise<T> {
    return this.post<T>(path, form);
  }
}
