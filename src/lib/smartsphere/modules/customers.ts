import type { HttpCore } from "../core";

// ─── DTOs ──────────────────────────────────────────────────────────────────────
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

export interface CustomerFieldError {
  field: string;
  errorCode: string;
  translationKey: string;
}

export interface SetCustomerResponseDto {
  status: boolean;
  message?: string | null;
  customeID: number;
  buCustomerID?: string | null;
  errorCode?: string | null;
  translationKey?: string | null;
  messageParams?: string[];
  fieldErrors?: CustomerFieldError[];
}

export class CustomerApiError extends Error {
  constructor(
    public readonly errorCode: string,
    public readonly fieldErrors: CustomerFieldError[],
    message: string,
  ) {
    super(message);
    this.name = "CustomerApiError";
  }
}

// ─── Module ────────────────────────────────────────────────────────────────────
export class CustomersModule {
  constructor(private readonly http: HttpCore) {}

  async createCustomer(
    body: SetCustomerRequestDto,
  ): Promise<SetCustomerResponseDto> {
    const res = await this.http.post<SetCustomerResponseDto>(
      "/Api/v1/Customers/CreateCustomer",
      body,
    );
    if (res.status === false) {
      throw new CustomerApiError(
        res.errorCode ?? "UNKNOWN_ERROR",
        res.fieldErrors ?? [],
        res.message ?? "Create customer failed.",
      );
    }
    return res;
  }
}
