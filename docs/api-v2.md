# FlexEnergy — API v2

Base URL: `/api/v2`
Version: 2
Audience: backend engineering team

---

## Conventions

### Authentication

All endpoints except `POST /auth/token`, `POST /auth/password-reset`, and `POST /customers` require:

```
Authorization: Bearer <accessToken>
```

The token is returned by `POST /auth/token`. There is no refresh-token flow — the client re-authenticates when the token expires (`expiresIn` seconds).

---

### Monetary amounts

All monetary values are expressed in two complementary forms to avoid floating-point errors.

| Field | Type | Example | Description |
|---|---|---|---|
| `amountRaw` | integer | `15000` | Minor units (e.g. centimes for CHF) |
| `scale` | integer | `2` | Decimal places: `amount = amountRaw / 10^scale` |
| `amount` | number | `150.00` | Convenience decimal — display only |
| `currency` | string | `"CHF"` | ISO 4217 three-letter code |

The frontend uses `amountRaw` + `scale` for all calculations. `amount` is for display only and should always equal `amountRaw / 10^scale`.

---

### Dates

All timestamps are ISO 8601, UTC: `"2025-07-26T22:00:00Z"`. Times of day (e.g. notification windows) use `"HH:MM"` 24-hour strings.

---

### Pagination

Paginated endpoints share a consistent interface.

**Query params:** `page` (integer, 1-based, default `1`) · `pageSize` (integer, max `100`) · `sortDesc` (boolean, default `true`)

**Response envelope:**

```json
{ "page": 1, "pageSize": 20, "total": 137, "hasMore": true, "items": [] }
```

---

### Error format

All error responses return a consistent JSON body regardless of status code.

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Username or password is incorrect.",
    "fieldErrors": [
      { "field": "email", "code": "INVALID_FORMAT", "message": "Must be a valid email address." }
    ]
  }
}
```

`fieldErrors` is present only for validation errors (HTTP 422). `code` is a machine-readable constant the frontend maps to localised strings.

---

### HTTP status codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created (registration) |
| `400` | Bad request — malformed body or missing required field |
| `401` | Unauthenticated — missing or expired token |
| `403` | Forbidden — authenticated but not authorised for this resource |
| `404` | Resource not found |
| `409` | Conflict — e.g. email already registered |
| `422` | Validation error — see `fieldErrors` |
| `500` | Server error |

---

## Auth

### `POST /auth/token`

Authenticates the user. Returns a JWT and the full user record so the frontend does not need to decode the token.

**Replaces:** `POST /api/v2/Authentication/RequestToken`

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `username` | string | Yes | Customer email address |
| `password` | string | Yes | Plain-text (HTTPS only) |

```json
// request
{ "username": "ana@example.com", "password": "secret123" }
```

**Response 200 — standard login (2FA disabled)**

```json
{
  "accessToken": "eyJhbGci...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "customerId": 42,
    "firstName": "Ana",
    "lastName": "García",
    "email": "ana@example.com",
    "companyName": "Empresa SA",
    "isEmailVerified": true,
    "is2FAEnabled": false,
    "language": "en",
    "themeId": "default"
  }
}
```

**Response 200 — 2FA challenge (2FA enabled)**

When `is2FAEnabled` is `true` the backend does **not** issue an `accessToken` yet. Instead it returns a short-lived `sessionToken` that the frontend must pass to `POST /auth/2fa/verify`. No `user` object is included to avoid leaking data before the second factor is confirmed.

```json
{
  "requiresTwoFactor": true,
  "sessionToken": "2fa_sess_Abc123...",
  "sessionExpiresIn": 300
}
```

| Field | Notes |
|---|---|
| `requiresTwoFactor` | Always `true` in this branch |
| `sessionToken` | Opaque token scoped to this login attempt. Valid for `sessionExpiresIn` seconds (default 300 s). Pass it to `POST /auth/2fa/verify` and `POST /auth/2fa/resend`. |
| `sessionExpiresIn` | Seconds until the session token expires. Frontend should display a countdown if desired. |

**Errors:** `401 INVALID_CREDENTIALS` · `422 VALIDATION_ERROR`

---

### `POST /auth/2fa/verify`

Validates the one-time code entered by the user during the 2FA challenge. On success, issues the real `accessToken` and the full `user` object — identical shape to the standard `POST /auth/token` 200 response.

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `sessionToken` | string | Yes | The `sessionToken` returned by `POST /auth/token` |
| `code` | string | Yes | 6-digit OTP from the authenticator app or SMS |

```json
// request
{ "sessionToken": "2fa_sess_Abc123...", "code": "482910" }

// response 200
{
  "accessToken": "eyJhbGci...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "customerId": 42,
    "firstName": "Ana",
    "lastName": "García",
    "email": "ana@example.com",
    "companyName": "Empresa SA",
    "isEmailVerified": true,
    "is2FAEnabled": true,
    "language": "en",
    "themeId": "default"
  }
}
```

**Errors:** `401 INVALID_2FA_CODE` · `401 SESSION_EXPIRED` · `422 VALIDATION_ERROR`

---

### `POST /auth/2fa/resend`

Re-sends the 2FA code to the user's registered channel (email or SMS, depending on their account configuration). Always returns `200` — prevents enumeration. Rate-limited server-side.

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `sessionToken` | string | Yes | The same `sessionToken` from `POST /auth/token` |

```json
// request → response
{ "sessionToken": "2fa_sess_Abc123..." }
→
{ "success": true }
```

**Errors:** `401 SESSION_EXPIRED` · `429 TOO_MANY_REQUESTS`

---

### `POST /auth/password-reset`

Sends a password recovery email. Always returns `200` regardless of whether the email exists — prevents user enumeration.

**Request body**

| Field | Type | Required |
|---|---|---|
| `email` | string | Yes |

```json
// request → response
{ "email": "ana@example.com" }
→
{ "success": true }
```

**Errors:** `422 VALIDATION_ERROR` (invalid email format)

---

### `POST /auth/email-verification/resend`

Re-sends the email verification link to the authenticated user's address. Intended for the in-app "Resend email" button shown when `isEmailVerified` is `false`. Always returns `200`.

**Auth:** Yes.

```json
// response 200
{ "success": true }
```

**Errors:** `401` · `409 ALREADY_VERIFIED` · `429 TOO_MANY_REQUESTS`

---

### `GET /auth/verify-email`

Confirms the user's email address using the token embedded in the verification link sent to their inbox. This endpoint is opened by the mail client, not called by the frontend directly — the backend should redirect to the app after processing.

**Auth:** No. The token in the URL is the only credential.

**Query parameters**

| Param | Type | Required | Notes |
|---|---|---|---|
| `token` | string | Yes | One-time verification token from the email link |

**Behaviour**

- On success (`200`): marks `isEmailVerified = true` for the matching user and returns a JSON confirmation (for clients that do not follow redirects) or redirects to a deep link such as `flexenergy://email-verified`. The exact redirect target is configured server-side.
- Token is single-use and expires after 24 hours.

```json
// response 200
{ "success": true, "message": "Email address verified." }
```

**Errors:** `400 INVALID_TOKEN` · `410 TOKEN_EXPIRED`

---

## Registration

### `POST /customers`

Creates a new customer account.

**Replaces:** `POST /Api/v1/Customers/CreateCustomer`

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `firstName` | string | Yes | |
| `lastName` | string | Yes | |
| `email` | string | Yes | Unique — triggers `409` if already registered |
| `password` | string | Yes | |
| `companyName` | string | No | |
| `phone` | string | No | |
| `address` | string | No | |
| `postalCode` | string | No | |
| `city` | string | No | |
| `country` | string | No | ISO 3166-1 alpha-2 (e.g. `"ES"`) |

```json
// request
{
  "firstName": "Ana",
  "lastName": "García",
  "email": "ana@example.com",
  "password": "secret123",
  "companyName": "Empresa SA",
  "phone": "+34 600 000 000",
  "country": "ES"
}
```

**Response 201**

```json
{ "success": true, "customerId": 42 }
```

**Errors:** `409 EMAIL_ALREADY_EXISTS` · `422 VALIDATION_ERROR` (with `fieldErrors`)

---

## Dashboard

### `GET /dashboard`

**Priority endpoint.** Returns everything needed to render the initial app state in a single call: contracts with balances, per-contract meter status, notification preferences and user display preferences.

**Replaces three sequential v1 calls:**
- `POST /Api/v1/ContractService/GetCustomerDashboard`
- `POST /Api/v1/UserNotificationSettings/Get`
- `POST /Api/v1/Infrastructure/ListMeterStatus`

**Response 200**

```json
{
  "customerId": 42,
  "totalBalance": 150.00,
  "totalBalanceRaw": 15000,
  "scale": 2,
  "currency": "CHF",
  "contracts": [
    {
      "contractId": 101,
      "externalContractId": "CO-20260721090634-1076",
      "displayName": "Appartamento Milano",
      "serviceType": "electricity",
      "serviceStatus": "active",
      "supplyStatus": "operational",
      "tariffName": "Default - Completa",
      "balance": 30.05,
      "balanceRaw": 3005,
      "debt": 0.00,
      "debtRaw": 0,
      "netPosition": 30.05,
      "netPositionRaw": 3005,
      "scale": 2,
      "currency": "CHF",
      "averageDailyCost": 3.50,
      "estimatedDepletionDate": "2026-08-01T00:00:00Z",
      "remainingDays": 4,
      "startDate": "2026-01-01T00:00:00Z",
      "endDate": null,
      "lastUpdateAt": "2026-07-21T09:06:00Z",
      "severity": "neutral",
      "meter": {
        "pod": "CH00000000000-T-000-000000-000005",
        "obis": "1-1:1.29.0*255",
        "status": "unavailable",
        "isOnline": false,
        "warningText": null,
        "lastSampleAt": "2026-07-21T09:06:00Z"
      }
    }
  ],
  "notifications": {
    "emailEnabled": true,
    "smsEnabled": false,
    "pushEnabled": true,
    "activeFrom": "08:00",
    "activeTo": "22:00",
    "unreadCount": 3
  },
  "preferences": {
    "themeId": "solar",
    "language": "en"
  },
  "weeklyUsage": {
    "currency": "CHF",
    "days": [
      { "date": "2025-07-21", "kwh": 11.2, "cost": 2.91 },
      { "date": "2025-07-22", "kwh": 9.8,  "cost": 2.55 },
      { "date": "2025-07-23", "kwh": 13.1, "cost": 3.41 },
      { "date": "2025-07-24", "kwh": 10.4, "cost": 2.70 },
      { "date": "2025-07-25", "kwh": 12.0, "cost": 3.12 },
      { "date": "2025-07-26", "kwh": 8.7,  "cost": 2.26 },
      { "date": "2025-07-27", "kwh": 11.6, "cost": 3.02 }
    ],
    "totalKwh": 76.8,
    "totalCost": 19.97
  }
}
```

**Field reference**

| Field | Values / notes |
|---|---|
| `serviceStatus` | `"active"` · `"suspended"` · `"terminated"` |
| `serviceType` | `"electricity"` · `"gas"` · `"water"` |
| `supplyStatus` | `"operational"` · `"suspended"` · `"cut-off"` |
| `displayName` | Optional user-defined label for the contract (e.g. `"Appartamento Milano"`). `null` if not set. |
| `estimatedDepletionDate` | `null` if balance is sufficient beyond `endDate` |
| `remainingDays` | Estimated days of supply remaining based on average consumption |
| `meter.status` | `"online"` · `"offline"` · `"unavailable"` |
| `meter.warningText` | Human-readable warning string, or `null` if no warning |
| `preferences.themeId` | `"default"` · `"forest"` · `"solar"` · `"wind"` · `"slate"` |
| `preferences.language` | ISO 639-1: `"en"` · `"es"` · `"fr"` · `"de"` · `"it"` |
| `weeklyUsage.days` | Always 7 entries, one per day, ordered ascending. Values are aggregated across all contracts. `date` is `YYYY-MM-DD` local time. |
| `contracts` | Same shape as the items returned by `GET /contracts` (see below). The dashboard embeds them to avoid an extra round-trip on initial load. |

**Errors:** `401` · `403`

---

## Contracts

### `GET /contracts`

Returns the list of contracts belonging to the authenticated customer, including current balances and meter status. This is a lightweight endpoint intended for two scenarios:

1. **Deep-link into `/recharge`** — when the user navigates directly to the recharge tab without having loaded the dashboard first, this endpoint hydrates the contract selector without fetching the full dashboard payload (weekly usage, notification settings, preferences).
2. **Post-recharge refresh** — after a successful top-up the frontend can call this endpoint to refresh balances without reloading the entire dashboard.

The contract object shape is **identical** to the items inside `GET /dashboard → contracts` so that the frontend has a single `Contract` type regardless of which endpoint populated it.

**Response 200**

```json
{
  "currency": "CHF",
  "scale": 2,
  "totalBalance": 150.00,
  "totalBalanceRaw": 15000,
  "contracts": [
    {
      "contractId": 101,
      "externalContractId": "CO-20260721090634-1076",
      "displayName": "Appartamento Milano",
      "serviceType": "electricity",
      "serviceStatus": "active",
      "supplyStatus": "operational",
      "tariffName": "Default - Completa",
      "balance": 30.05,
      "balanceRaw": 3005,
      "debt": 0.00,
      "debtRaw": 0,
      "netPosition": 30.05,
      "netPositionRaw": 3005,
      "scale": 2,
      "currency": "CHF",
      "averageDailyCost": 3.50,
      "estimatedDepletionDate": "2026-08-01T00:00:00Z",
      "remainingDays": 4,
      "startDate": "2026-01-01T00:00:00Z",
      "endDate": null,
      "lastUpdateAt": "2026-07-21T09:06:00Z",
      "severity": "neutral",
      "meter": {
        "pod": "CH00000000000-T-000-000000-000005",
        "obis": "1-1:1.29.0*255",
        "status": "unavailable",
        "isOnline": false,
        "warningText": null,
        "lastSampleAt": "2026-07-21T09:06:00Z"
      }
    }
  ]
}
```

**Field reference**

| Field | Values / notes |
|---|---|
| `serviceStatus` | `"active"` · `"suspended"` · `"terminated"` |
| `serviceType` | `"electricity"` · `"gas"` · `"water"` |
| `supplyStatus` | `"operational"` · `"suspended"` · `"cut-off"` |
| `displayName` | Optional user-defined label. `null` if not set. Updated via `PUT /contracts/{contractId}/display-name`. |
| `estimatedDepletionDate` | `null` if balance is sufficient beyond `endDate` |
| `remainingDays` | Estimated days of supply remaining |
| `debt` | Residual tariff debt (already subtracted from `balance` to get `netPosition`) |
| `netPosition` | Current financial standing of the contract (`balance - debt`) |
| `meter.pod` | Point of Delivery identifier (external ID) |
| `meter.obis` | Object Identification System code |
| `meter.status` | `"online"` · `"offline"` · `"unavailable"` |
| `meter.warningText` | Human-readable warning string, or `null` if no warning |
| `totalBalance` | Sum of `balance` across all contracts — convenience field for displaying a global balance badge |
| `severity` | Computed severity level for the contract. See severity legend below. |

**Severity legend**

The backend computes a single `severity` string per contract. The frontend maps it to a color indicator.

| `severity` value | Color | Meaning |
|---|---|---|
| `"normal"` | Green | Everything is in order (balance sufficient, supply operational, meter online) |
| `"attention"` | Amber | Action may be needed soon (low balance, meter offline, minor warning) |
| `"critical"` | Red | Immediate action required (balance depleted, supply cut-off, debt outstanding) |
| `"neutral"` | Grey | Status is unavailable or the contract is not yet active / already terminated |

Severity computation rules (applied in priority order):

1. `"critical"` — any of: `supplyStatus = "cut-off"`, `serviceStatus = "suspended"` or `"terminated"`, `remainingDays <= 0`, `debt > 0`
2. `"attention"` — any of: `remainingDays <= 7`, `meter.status = "offline"`, `meter.warningText` is not null
3. `"neutral"` — `meter.status = "unavailable"` and no critical condition
4. `"normal"` — none of the above

**Errors:** `401`

---

### `PUT /contracts/{contractId}/display-name`

Sets or clears the user-defined display name for a contract. The value is stored per-user (not per-contract), so different users sharing the same contract see their own labels independently.

**Path parameters**

| Param | Type | Required | Notes |
|---|---|---|---|
| `contractId` | integer | Yes | Numeric contract ID |

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `displayName` | string \| null | Yes | New label (max 100 characters). Send `null` to clear. |

```json
// request
{ "displayName": "Appartamento Milano" }

// response 200
{
  "status": true,
  "message": "Contract display name updated.",
  "displayName": "Appartamento Milano"
}
```

To clear the label:

```json
// request
{ "displayName": null }

// response 200
{
  "status": true,
  "message": "Contract display name cleared.",
  "displayName": null
}
```

**Errors:** `401` · `403 FORBIDDEN` (contract does not belong to the authenticated customer) · `404 CONTRACT_NOT_FOUND` · `422 DISPLAY_NAME_TOO_LONG` (max 100 characters)

---

## Usage

### `GET /usage`

Returns energy consumption and/or cost time series for one or more contracts. Aggregates multiple contracts server-side. Replaces the FusionCharts-format endpoints with a flat `{ timestamp, kwh, cost }` array with real ISO timestamps.

**Replaces four v1 endpoints:**
- `POST /Api/v1/Graphics/GetMeasures`
- `POST /Api/v1/Graphics/GetCosts`
- `POST /Api/v1/Graphics/GetCostsAndMeasures`
- `POST /Api/v1/Graphics/GetGroupedCosts`

**Query parameters**

| Param | Type | Required | Notes |
|---|---|---|---|
| `contractIds` | string | Yes | Comma-separated IDs: `"101,102"` |
| `dateFrom` | ISO8601 | Yes | Range start (UTC) |
| `dateTo` | ISO8601 | Yes | Range end (UTC) |
| `granularity` | string | Yes | `"hour"` · `"day"` · `"month"` |
| `mode` | string | No | `"kwh"` · `"cost"` · `"both"` — default `"both"` |

**Response 200**

```json
{
  "currency": "CHF",
  "granularity": "day",
  "series": [
    { "timestamp": "2025-07-01T00:00:00Z", "kwh": 12.4, "cost": 3.22 },
    { "timestamp": "2025-07-02T00:00:00Z", "kwh": 10.1, "cost": 2.63 }
  ],
  "summary": {
    "totalKwh": 22.5,
    "totalCost": 5.85,
    "averageDailyCost": 2.93,
    "peakKwh": 12.4,
    "minKwh": 10.1
  }
}
```

**Field notes**

- When `mode=kwh`, `cost` is `null` in each series item. When `mode=cost`, `kwh` is `null`.
- Series is ordered ascending by `timestamp`.
- When multiple `contractIds` are supplied, values are aggregated (summed) server-side per timestamp bucket. The frontend currently does this aggregation itself — this moves it to the backend.
- The `dateFrom`/`dateTo` range should be clamped server-side to each contract's `startDate`/`endDate`. The frontend currently clamps manually.

**Errors:** `400 INVALID_GRANULARITY` · `400 DATE_RANGE_TOO_LARGE` · `401` · `403`

---

## Transactions

### `GET /transactions`

Paginated transaction history for a contract. The current v1 endpoint returns all records without pagination.

**Replaces:** `POST /Api/v1/Financial/ListTransactions`

**Query parameters**

| Param | Type | Required | Notes |
|---|---|---|---|
| `contractId` | integer | Yes | |
| `page` | integer | No | Default: `1` |
| `pageSize` | integer | No | Default: `20`, max: `100` |
| `sortDesc` | boolean | No | Default: `true` (newest first) |
| `direction` | string | No | Filter: `"credit"` · `"debit"` |
| `status` | string | No | Filter: `"pending"` · `"settled"` · `"failed"` · `"refunded"` · `"cancelled"` |
| `dateFrom` | ISO8601 | No | |
| `dateTo` | ISO8601 | No | |

**Response 200**

```json
{
  "page": 1,
  "pageSize": 20,
  "total": 48,
  "hasMore": true,
  "currency": "CHF",
  "scale": 2,
  "items": [
    {
      "transactionId": "txn_abc123",
      "orderId": "ord_xyz",
      "contractId": 101,
      "customerId": 42,
      "amount": 50.00,
      "amountRaw": 5000,
      "direction": "credit",
      "source": "shop",
      "status": "settled",
      "description": "Top-up via portal",
      "cardBrand": "visa",
      "cardLastFour": "4242",
      "cardHolder": "Ana García",
      "createdAt": "2025-07-20T10:30:00Z",
      "settledAt": "2025-07-20T10:30:01Z"
    }
  ]
}
```

**Enum values**

| Field | Values | v1 numeric mapping |
|---|---|---|
| `direction` | `"credit"` (balance added) · `"debit"` (balance consumed) | — |
| `source` | `"system"` · `"stripe"` · `"manual"` · `"shop"` | 0 · 1 · 2 · 3 |
| `status` | `"pending"` · `"settled"` · `"failed"` · `"refunded"` · `"cancelled"` | 0 · 1 · 2 · 3 · 4 |

**Errors:** `400 MISSING_CONTRACT_ID` · `401` · `403`

---

## Payments

All payments go through **Stripe**. Raw card data never touches the backend — Stripe.js/Stripe Elements handles card collection client-side and returns opaque tokens.

### Payment flow overview

**First-time payment (new card)**

```
Frontend                          Backend                    Stripe
   |                                  |                          |
   |-- POST /recharge/intent -------> |                          |
   |                                  |-- Create PaymentIntent ->|
   |                                  |<- { clientSecret } ------|
   |<- { clientSecret, ... } ---------|                          |
   |                                  |                          |
   |-- stripe.confirmPayment() -----> Stripe (client-side)       |
   |                                  |                          |
   |                                  |<- webhook: PI succeeded -|
   |                                  |   credit balance         |
   |-- GET /contracts --------------> |   (refresh balance)      |
```

**Returning user (saved card)**

```
Frontend                          Backend                    Stripe
   |                                  |                          |
   |-- POST /recharge ---------------> |                         |
   |   { contractId, amount,          |-- Confirm PI off-session>|
   |     stripePaymentMethodId }      |<- succeeded -------------|
   |                                  |   credit balance         |
   |<- { success, newBalance } -------|                          |
```

---

### `POST /payment/setup-intent`

Creates a Stripe SetupIntent so the frontend can collect and save a card using Stripe Elements without exposing card details to the backend.

**Response 200**

```json
{
  "clientSecret": "seti_1Abc...secret_xyz",
  "setupIntentId": "seti_1Abc..."
}
```

After the frontend calls `stripe.confirmSetup({ clientSecret })` and Stripe confirms, the resulting `paymentMethodId` (e.g. `pm_1Abc...`) is passed back to the backend via `POST /payment/methods` to persist the saved card.

**Errors:** `401`

---

### `POST /payment/methods`

Stores a Stripe PaymentMethod ID returned by Stripe after a successful SetupIntent confirmation. The backend attaches it to the Stripe Customer object and saves a reference.

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `stripePaymentMethodId` | string | Yes | `pm_...` ID returned by Stripe after SetupIntent confirmation |
| `setAsDefault` | boolean | No | If `true`, marks this method as the default for future charges. Default: `true` when it is the first method. |

```json
// request
{ "stripePaymentMethodId": "pm_1Abc...", "setAsDefault": true }

// response 200
{
  "success": true,
  "paymentMethod": {
    "id": "pm_1Abc...",
    "brand": "visa",
    "last4": "4242",
    "expMonth": 12,
    "expYear": 2028,
    "isDefault": true
  }
}
```

**Errors:** `401` · `422 INVALID_PAYMENT_METHOD` (Stripe PM not found or not reusable)

---

### `GET /payment/methods`

Returns the list of saved Stripe PaymentMethods for the authenticated customer.

**Response 200**

```json
{
  "paymentMethods": [
    {
      "id": "pm_1Abc...",
      "brand": "visa",
      "last4": "4242",
      "expMonth": 12,
      "expYear": 2028,
      "isDefault": true
    },
    {
      "id": "pm_2Xyz...",
      "brand": "mastercard",
      "last4": "1234",
      "expMonth": 6,
      "expYear": 2027,
      "isDefault": false
    }
  ]
}
```

**Errors:** `401`

---

### `DELETE /payment/methods/{id}`

Detaches a saved PaymentMethod from the customer. If the deleted method was the default, `isDefault` is transferred to the next available method, or left empty if no others exist.

**Path parameters**

| Param | Type | Notes |
|---|---|---|
| `id` | string | Stripe `pm_...` ID |

**Response 200**

```json
{ "success": true }
```

**Errors:** `401` · `404 PAYMENT_METHOD_NOT_FOUND`

---

### Stripe webhook

The backend must expose a webhook endpoint (outside this API, not authenticated via Bearer) to receive Stripe events:

| Event | Action |
|---|---|
| `payment_intent.succeeded` | Credit the balance for the matching `contractId` stored in `PaymentIntent.metadata` |
| `payment_intent.payment_failed` | Mark the pending transaction as `failed` |
| `setup_intent.succeeded` | No action required — PM is registered via `POST /payment/methods` by the frontend |

The webhook secret must be validated using `Stripe-Signature` header before processing any event.

---

## Recharge

### `POST /recharge/intent`

Creates a Stripe PaymentIntent for a top-up and returns the `clientSecret` needed by the frontend to confirm the payment via Stripe.js. Use this when the user pays with a new card or a wallet (Google Pay, Apple Pay).

After the frontend confirms the payment client-side, the balance is credited automatically via the Stripe webhook (`payment_intent.succeeded`). The frontend should then call `GET /contracts` to refresh the displayed balance.

**Replaces (both in sequence):**
- `POST /Api/v1/Financial/GenerateOrderId`
- `POST /Api/v1/Financial/SetTransaction`

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `contractId` | integer | Yes | |
| `amount` | number | Yes | Major units (e.g. `50.00` CHF) |
| `description` | string | No | Stored on the transaction record |

```json
// request
{ "contractId": 101, "amount": 50.00, "description": "Top-up via portal" }

// response 200
{
  "clientSecret": "pi_1Abc...secret_xyz",
  "paymentIntentId": "pi_1Abc...",
  "amount": 50.00,
  "currency": "CHF"
}
```

**Errors:** `400 INVALID_AMOUNT` · `403 CONTRACT_NOT_OWNED` · `401`

---

### `POST /recharge`

Performs an off-session top-up using a previously saved Stripe PaymentMethod. The backend creates and confirms the PaymentIntent server-side and credits the balance synchronously.

Use this when the user selects a saved card. For new cards or wallets, use `POST /recharge/intent` instead.

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `contractId` | integer | Yes | |
| `amount` | number | Yes | Major units (e.g. `50.00` CHF) |
| `stripePaymentMethodId` | string | Yes | `pm_...` ID of a saved payment method |
| `description` | string | No | Stored on the transaction record |

```json
// request
{
  "contractId": 101,
  "amount": 50.00,
  "stripePaymentMethodId": "pm_1Abc...",
  "description": "Top-up via portal"
}
```

**Response 200**

```json
{
  "success": true,
  "transactionId": "txn_abc123",
  "newBalance": 200.00,
  "newBalanceRaw": 20000,
  "scale": 2,
  "currency": "CHF"
}
```

**Errors:** `400 INVALID_AMOUNT` · `401` · `403 CONTRACT_NOT_OWNED` · `402 PAYMENT_FAILED` (Stripe declined) · `409 DUPLICATE_ORDER`

---

### `POST /recharge/suggest`

Returns the recommended top-up amount per contract to cover a given number of days, based on average daily consumption.

**Replaces:** `POST /Api/v1/Shop/SuggestBulk`

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `contractIds` | integer[] | Yes | |
| `days` | integer | Yes | Number of days to cover (e.g. `30`) |

```json
// request
{ "contractIds": [101, 102], "days": 30 }
```

**Response 200**

```json
{
  "currency": "CHF",
  "scale": 2,
  "suggestions": [
    {
      "contractId": 101,
      "suggestedAmount": 105.00,
      "suggestedAmountRaw": 10500,
      "coversDays": 30,
      "averageDailyCost": 3.50
    }
  ],
  "totalSuggestedAmount": 105.00,
  "totalSuggestedAmountRaw": 10500
}
```

**Errors:** `400 MISSING_CONTRACT_IDS` · `401` · `403`

---

### `POST /recharge/split`

Distributes a single total amount across multiple contracts proportionally to their average daily consumption.

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `contractIds` | integer[] | Yes | |
| `totalAmount` | number | Yes | Total amount to distribute |
| `days` | integer | Yes | Reference window used for proportional calculation |

```json
// request
{ "contractIds": [101, 102], "totalAmount": 100.00, "days": 30 }
```

**Response 200**

```json
{
  "currency": "CHF",
  "scale": 2,
  "distribution": [
    { "contractId": 101, "amount": 60.00, "amountRaw": 6000, "proportion": 0.60 },
    { "contractId": 102, "amount": 40.00, "amountRaw": 4000, "proportion": 0.40 }
  ]
}
```

**Errors:** `400 MISSING_CONTRACT_IDS` · `400 INVALID_AMOUNT` · `401` · `403`

---

## Notifications

### `PUT /notifications/settings`

Updates the customer's alert preferences. The current settings are returned inside `GET /dashboard` on load — no separate GET endpoint is needed.

**Replaces:** `POST /Api/v1/UserNotificationSettings/Update`

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `emailEnabled` | boolean | Yes | |
| `smsEnabled` | boolean | Yes | |
| `pushEnabled` | boolean | Yes | Controls in-app and push notifications across all registered devices |
| `activeFrom` | string | Yes | `"HH:MM"` format, 24h, local time |
| `activeTo` | string | Yes | `"HH:MM"` format, 24h, local time |

```json
// request → response
{ "emailEnabled": true, "smsEnabled": false, "pushEnabled": true, "activeFrom": "08:00", "activeTo": "22:00" }
→
{ "success": true }
```

**Errors:** `401` · `422 INVALID_TIME_FORMAT`

---

### `POST /notifications/push-token`

Registers a device push token for the authenticated user. Call this on every app launch after the OS grants push permission — tokens can rotate and duplicates are handled server-side (upsert by token value).

Supports web (via FCM Web Push / Service Worker), Android (FCM), and iOS (APNs via FCM or direct). When the user logs out, call `DELETE /notifications/push-token` to stop receiving notifications on that device.

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `token` | string | Yes | Device push token issued by FCM or APNs |
| `platform` | string | Yes | `"web"` · `"android"` · `"ios"` |
| `provider` | string | No | `"fcm"` (default) · `"apns"` |

```json
// request → response
{ "token": "AAAAxyz...long-token", "platform": "web", "provider": "fcm" }
→
{ "success": true }
```

**Errors:** `401` · `422 INVALID_TOKEN`

---

### `DELETE /notifications/push-token`

Unregisters the current device token. Call on logout to prevent notifications being sent to a device that is no longer authenticated.

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `token` | string | Yes | The token to unregister |

```json
// request → response
{ "token": "AAAAxyz...long-token" }
→
{ "success": true }
```

**Errors:** `401` · `404 TOKEN_NOT_FOUND`

---

### `GET /notifications`

Returns the in-app notification inbox for the authenticated user, paginated and ordered newest first. The `unreadCount` convenience field is also returned inside `GET /dashboard → notifications` on initial load.

**Query parameters**

| Param | Type | Required | Notes |
|---|---|---|---|
| `page` | integer | No | Default: `1` |
| `pageSize` | integer | No | Default: `20`, max: `100` |
| `unreadOnly` | boolean | No | If `true`, returns only unread notifications |

**Response 200**

```json
{
  "page": 1,
  "pageSize": 20,
  "total": 5,
  "unreadCount": 3,
  "hasMore": false,
  "items": [
    {
      "id": "notif_001",
      "type": "recharge_completed",
      "title": "Top-up successful",
      "body": "CHF 50.00 added to contract CO-20260721090634-1076.",
      "contractId": 101,
      "read": false,
      "createdAt": "2026-07-28T10:30:00Z"
    },
    {
      "id": "notif_002",
      "type": "low_balance",
      "title": "Low balance warning",
      "body": "Contract CO-20260721090634-1076 has less than 7 days of supply remaining.",
      "contractId": 101,
      "read": false,
      "createdAt": "2026-07-27T08:00:00Z"
    }
  ]
}
```

**Notification types**

| `type` | Trigger |
|---|---|
| `recharge_completed` | A top-up was processed successfully |
| `recharge_failed` | A top-up attempt failed (payment declined or processing error) |
| `low_balance` | `remainingDays <= 7` for any contract |
| `balance_depleted` | `remainingDays <= 0` — supply at risk |
| `supply_status_changed` | `supplyStatus` changed (e.g. cut-off or restored) |
| `meter_status_changed` | `meter.status` changed (e.g. went offline or came back online) |
| `system` | General platform announcements |

**Errors:** `401`

---

### `PUT /notifications/{id}/read`

Marks a single notification as read.

```json
// response 200
{ "success": true }
```

**Errors:** `401` · `404 NOTIFICATION_NOT_FOUND`

---

### `PUT /notifications/read-all`

Marks all notifications for the authenticated user as read. Returns the count of notifications updated.

```json
// response 200
{ "success": true, "updatedCount": 3 }
```

**Errors:** `401`

---

## Exports

### `GET /exports`

Lists the documents exported for the authenticated user, paginated.

**Replaces:** `GET /Api/v1/FileManager/Exports`

**Query parameters**

| Param | Type | Required | Notes |
|---|---|---|---|
| `page` | integer | No | Default: `1` |
| `pageSize` | integer | No | Default: `5`, max: `100` |
| `dateFrom` | ISO8601 | No | Filter by creation date |
| `dateTo` | ISO8601 | No | |
| `sortDesc` | boolean | No | Default: `true` |

**Response 200**

```json
{
  "page": 1,
  "pageSize": 5,
  "total": 12,
  "hasMore": true,
  "items": [
    {
      "id": "exp_001",
      "fileName": "invoice-july-2025.pdf",
      "contentType": "application/pdf",
      "sizeBytes": 45200,
      "format": "pdf",
      "createdAt": "2025-07-01T08:00:00Z"
    }
  ]
}
```

**Errors:** `401`

---

### `GET /exports/{id}/download`

Downloads the binary content of a single export file.

**Replaces:** `GET /Api/v1/FileManager/Exports/{id}/Download`

**Path parameters:** `id` — export identifier from `GET /exports`

**Response 200**

- `Content-Type: application/pdf` (or `application/octet-stream` for other formats)
- `Content-Disposition: attachment; filename="invoice-july-2025.pdf"`
- Body: raw binary stream

**Errors:** `401` · `404 EXPORT_NOT_FOUND`

---

## Company

### `GET /company`

Returns static company contact details shown in the in-app support centre. No authentication required. Should be aggressively cached (`Cache-Control: max-age=86400`).

**Replaces:** `GET /Api/v1/Language/GetCompany`

**Response 200**

```json
{
  "name": "FlexEnergy SA",
  "address": "Carrer Major 1",
  "city": "Barcelona",
  "postalCode": "08001",
  "country": "ES",
  "email": "support@flexenergy.com",
  "phone": "+34 900 000 000",
  "web": "https://flexenergy.com"
}
```

---

## Meters

### `GET /meters`

Returns the real-time status of all meters linked to the authenticated customer's contracts. This data is also embedded in `GET /dashboard` — this standalone endpoint exists for background refresh without reloading the full dashboard.

**Replaces:** `POST /Api/v1/Infrastructure/ListMeterStatus`

**Response 200**

```json
{
  "meters": [
    {
      "contractId": 101,
      "isOnline": true,
      "status": "open",
      "validationStatus": "none",
      "warningText": null,
      "lastSampleAt": "2025-07-26T22:00:00Z",
      "firstSampleAt": "2024-01-01T00:00:00Z",
      "zpb": "ZPB-001",
      "obis": "1.8.0"
    }
  ]
}
```

**Enum values**

| Field | Values |
|---|---|
| `status` | `"open"` (active, receiving measures) · `"closed"` (suspended) |
| `validationStatus` | `"none"` · `"pending"` · `"approved"` · `"rejected"` |

**Errors:** `401`

---

### `POST /meters/{contractId}/change`

Requests a status change for a meter (`open` ↔ `closed`). May require a validation code depending on the contract configuration — the response indicates whether one was needed.

**Replaces:** `POST /Api/v1/Infrastructure/ValidateChangeMeterStatus`

**Path parameters:** `contractId` — integer

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `targetStatus` | string | Yes | `"open"` · `"closed"` |
| `reason` | string | No | Free-text reason stored on the change record |
| `validationCode` | string | Conditional | Required when `validationRequired = true` on the contract |

```json
// request
{ "targetStatus": "closed", "reason": "Holiday", "validationCode": "123456" }
```

**Response 200**

```json
{
  "success": true,
  "currentStatus": "closed",
  "validationRequired": false,
  "message": null
}
```

**Errors:** `400 INVALID_TARGET_STATUS` · `401` · `403 CONTRACT_NOT_OWNED` · `422 INVALID_VALIDATION_CODE`

---

## Profile

### `GET /me`

Returns the authenticated user's full profile record. The JWT contains basic claims only — this endpoint exposes the complete record including fields shown in the profile edit form (phone, address).

**Response 200**

```json
{
  "id": 1,
  "customerId": 42,
  "firstName": "Ana",
  "lastName": "García",
  "email": "ana@example.com",
  "phone": "+34 600 000 000",
  "companyName": "Empresa SA",
  "isEmailVerified": true,
  "is2FAEnabled": false
}
```

**Errors:** `401`

---

### `PUT /me/profile`

Updates the authenticated user's profile. Currently the frontend calls `POST /Customers/CreateCustomer` for this — the new API requires a dedicated update route. All body fields are optional; only supplied fields are updated.

**Request body**

| Field | Type | Notes |
|---|---|---|
| `firstName` | string | |
| `lastName` | string | |
| `email` | string | Triggers re-verification flow if changed |
| `phone` | string | |
| `companyName` | string | |

```json
// request → response
{ "firstName": "Ana", "lastName": "García", "phone": "+34 600 000 000" }
→
{ "success": true }
```

**Errors:** `401` · `409 EMAIL_ALREADY_EXISTS` · `422 VALIDATION_ERROR`

---

## Preferences

### `PUT /me/preferences`

Persists user display preferences to the backend. Currently both `themeId` and `language` are stored only in `localStorage` with no backend sync — this endpoint is required so preferences survive across devices and sessions.

Preferences are returned inside `GET /dashboard` on every login so they load without a separate round-trip.

All body fields are optional; only supplied fields are updated.

**Request body**

| Field | Type | Values |
|---|---|---|
| `themeId` | string | `"default"` · `"forest"` · `"solar"` · `"wind"` · `"slate"` |
| `language` | string | ISO 639-1: `"en"` · `"es"` · `"fr"` · `"de"` · `"it"` |

```json
// request → response
{ "themeId": "solar", "language": "en" }
→
{ "success": true }
```

**Errors:** `401` · `422 INVALID_THEME_ID` · `422 INVALID_LANGUAGE_CODE`

---

## Two-Factor Authentication management

These endpoints let the user enable, confirm, and disable 2FA from within the app settings. The current 2FA status is exposed via `is2FAEnabled` in `GET /me`.

### `POST /me/2fa/enable`

Initiates the 2FA activation flow. The backend generates a TOTP secret, returns it as a `otpAuthUrl` (for QR scanners) and as a plain `secret` (for manual entry), and sends a setup code to the user's email as a fallback. The user must confirm with `POST /me/2fa/confirm` before 2FA is actually activated.

**Auth:** Yes.

**Response 200**

```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "otpAuthUrl": "otpauth://totp/FlexEnergy:ana%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=FlexEnergy",
  "setupToken": "setup_tok_Xyz789...",
  "setupExpiresIn": 600
}
```

| Field | Notes |
|---|---|
| `secret` | Base32 TOTP secret for manual entry in an authenticator app |
| `otpAuthUrl` | `otpauth://` URI — pass directly to a QR code component |
| `setupToken` | Scoped token required by `POST /me/2fa/confirm`. Expires in `setupExpiresIn` seconds (default 600 s). |

**Errors:** `401` · `409 TWO_FA_ALREADY_ENABLED`

---

### `POST /me/2fa/confirm`

Verifies the first OTP code generated by the user's authenticator app and activates 2FA. Returns backup codes the user should store securely — these are shown only once.

**Auth:** Yes.

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `setupToken` | string | Yes | Token returned by `POST /me/2fa/enable` |
| `code` | string | Yes | 6-digit code from the authenticator app |

```json
// request
{ "setupToken": "setup_tok_Xyz789...", "code": "482910" }

// response 200
{
  "success": true,
  "backupCodes": [
    "a1b2-c3d4", "e5f6-g7h8", "i9j0-k1l2",
    "m3n4-o5p6", "q7r8-s9t0", "u1v2-w3x4",
    "y5z6-a7b8", "c9d0-e1f2"
  ]
}
```

`backupCodes` are single-use recovery codes. The frontend must display them immediately after this call — they cannot be retrieved again.

**Errors:** `401` · `401 INVALID_2FA_CODE` · `401 SETUP_TOKEN_EXPIRED` · `409 TWO_FA_ALREADY_ENABLED`

---

### `DELETE /me/2fa`

Disables 2FA for the authenticated user. Requires the user to confirm with their current OTP code (or a backup code) to prevent accidental or unauthorised disabling.

**Auth:** Yes.

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `code` | string | Yes | Current 6-digit OTP or a backup code |

```json
// request → response
{ "code": "482910" }
→
{ "success": true }
```

**Errors:** `401` · `401 INVALID_2FA_CODE` · `409 TWO_FA_NOT_ENABLED`

---

## QR Payment Links

QR codes allow in-person top-ups at a physical terminal or cashier counter. The user opens the app and displays the QR for a specific contract; the operator scans it to identify the contract and process the payment. No login is required on the scanner side.

### Token model

- **One stable token per user + contract.** The backend upserts: repeated calls to the generation endpoint return the same token until explicitly refreshed.
- **Opaque.** The token is a random, non-guessable string. It encodes no readable data and maps to the user + contract via a server-side lookup.
- **No automatic expiry.** Tokens are valid until revoked or refreshed. This suits the recurring in-person use case (same QR shown every visit).
- **Public resolution.** The endpoints that read and pay via a token do not require an `Authorization` header — they are designed to be called by the operator terminal.

### Flow

```
[App — authenticated]          [Terminal — anonymous]
        |                                |
GET /contracts/{id}/qr-token             |
  ← { token, url }                       |
        |                                |
  Display QR (url encoded)               |
        |                                |
        |──── operator scans QR ────────>|
        |                          GET /qr/{token}
        |                          ← { contractRef, holderName, displayName, serviceType, currency, suggestedAmount }
        |                                |
        |                          POST /qr/{token}/recharge
        |                          body: { amount }
        |                          ← { clientSecret, paymentIntentId, amount, currency }
        |                                |
        |                   Terminal confirms via Stripe.js
        |                                |
        |                  Stripe webhook → balance credited
```

---

### `GET /contracts/{contractId}/qr-token`

Returns the stable QR token for the authenticated user + contract. Creates one on first call; subsequent calls return the same token.

**Auth:** Yes (the contract owner).

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `contractId` | integer | Contract to generate the QR for |

```json
// response 200
{
  "token": "qr_9fK2pXr7mNbTqLz8",
  "url": "https://pay.flexenergy.ch/qr/qr_9fK2pXr7mNbTqLz8",
  "generatedAt": "2026-01-15T08:00:00Z"
}
```

The `url` value is what the frontend passes directly to the QR code component. The `token` can be stored locally if needed, but the `url` is sufficient.

**Errors:** `401` · `403 CONTRACT_NOT_OWNED` · `404 CONTRACT_NOT_FOUND`

---

### `POST /contracts/{contractId}/qr-token/refresh`

Invalidates the current token and issues a new one. Use this if the user suspects the QR was photographed or compromised.

**Auth:** Yes.

```json
// response 200
{
  "token": "qr_aB3cDe4fGh5iJk6l",
  "url": "https://pay.flexenergy.ch/qr/qr_aB3cDe4fGh5iJk6l",
  "generatedAt": "2026-07-28T10:30:00Z"
}
```

**Errors:** `401` · `403 CONTRACT_NOT_OWNED` · `404 CONTRACT_NOT_FOUND`

---

### `GET /qr/{token}`

Resolves a QR token to the minimum information needed by the terminal to identify the contract and display a confirmation screen before charging.

**Auth:** No. This endpoint is intentionally public.

**Deliberately excluded from the response:** balance, debt, meter data, user email, address — only what is needed to confirm identity and proceed with payment.

```json
// response 200
{
  "contractRef": "CO-2026-1076",
  "holderName": "Ana García",
  "displayName": "Appartamento Milano",
  "serviceType": "electricity",
  "currency": "CHF",
  "suggestedAmount": 50.00
}
```

| Field | Type | Notes |
|---|---|---|
| `contractRef` | string | Human-readable contract reference for the operator to verify |
| `holderName` | string | Contract holder full name — operator confirms it matches the person |
| `displayName` | string \| null | User-defined label, if set |
| `serviceType` | string | `"electricity"` · `"gas"` · `"water"` |
| `currency` | string | ISO 4217 |
| `suggestedAmount` | number | Pre-computed suggested top-up amount; terminal may allow operator to override |

**Errors:** `404 TOKEN_NOT_FOUND` · `410 TOKEN_REVOKED`

---

### `POST /qr/{token}/recharge`

Creates a Stripe PaymentIntent for the top-up amount chosen by the operator. The terminal uses the returned `clientSecret` to confirm the payment via Stripe.js or Stripe Terminal. On confirmation, the Stripe webhook credits the balance.

**Auth:** No. This endpoint is intentionally public.

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `amount` | number | Yes | Major units (e.g. `50.00` CHF); must be > 0 |
| `description` | string | No | Stored on the transaction record |

```json
// request
{ "amount": 50.00, "description": "In-person top-up" }

// response 200
{
  "clientSecret": "pi_1Abc...secret_xyz",
  "paymentIntentId": "pi_1Abc...",
  "amount": 50.00,
  "currency": "CHF"
}
```

The backend resolves the `contractId` from the token server-side — it is never supplied by the terminal.

**Errors:** `400 INVALID_AMOUNT` · `404 TOKEN_NOT_FOUND` · `410 TOKEN_REVOKED`

---

## Endpoint index

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/token` | No | Login — returns `accessToken` or 2FA challenge |
| `POST` | `/auth/2fa/verify` | No | Verify 2FA OTP and exchange `sessionToken` for `accessToken` |
| `POST` | `/auth/2fa/resend` | No | Resend 2FA code to the user's registered channel |
| `POST` | `/auth/password-reset` | No | Send password reset email |
| `POST` | `/auth/email-verification/resend` | Yes | Resend email verification link |
| `GET` | `/auth/verify-email` | No | Confirm email address via token from the verification link |
| `POST` | `/customers` | No | Register new customer |
| `GET` | `/dashboard` | Yes | Full dashboard — contracts, meters, alerts, preferences, last 7 days usage |
| `GET` | `/contracts` | Yes | Contract list with balances — for deep-links and post-recharge refresh |
| `PUT` | `/contracts/{contractId}/display-name` | Yes | Set or clear a user-defined label for a contract |
| `GET` | `/usage` | Yes | Energy / cost time series (kWh and/or CHF) |
| `GET` | `/transactions` | Yes | Paginated transaction history |
| `POST` | `/payment/setup-intent` | Yes | Create a Stripe SetupIntent to collect and save a new card |
| `POST` | `/payment/methods` | Yes | Register a saved Stripe PaymentMethod after SetupIntent confirmation |
| `GET` | `/payment/methods` | Yes | List saved payment methods |
| `DELETE` | `/payment/methods/{id}` | Yes | Remove a saved payment method |
| `POST` | `/recharge/intent` | Yes | Create a Stripe PaymentIntent for a new-card top-up (returns `clientSecret`) |
| `POST` | `/recharge` | Yes | Off-session top-up using a saved payment method |
| `POST` | `/recharge/suggest` | Yes | Suggested top-up amount per contract |
| `POST` | `/recharge/split` | Yes | Distribute a total amount across contracts |
| `PUT` | `/notifications/settings` | Yes | Update email, SMS and push alert preferences |
| `POST` | `/notifications/push-token` | Yes | Register a device push token (web, Android, iOS) |
| `DELETE` | `/notifications/push-token` | Yes | Unregister a device push token on logout |
| `GET` | `/notifications` | Yes | In-app notification inbox (paginated) |
| `PUT` | `/notifications/{id}/read` | Yes | Mark a single notification as read |
| `PUT` | `/notifications/read-all` | Yes | Mark all notifications as read |
| `GET` | `/exports` | Yes | List exported documents |
| `GET` | `/exports/{id}/download` | Yes | Download export file (binary) |
| `GET` | `/company` | No | Company contact details |
| `GET` | `/meters` | Yes | Real-time meter status |
| `POST` | `/meters/{contractId}/change` | Yes | Request meter open/close |
| `GET` | `/me` | Yes | Full user profile |
| `PUT` | `/me/profile` | Yes | Update profile fields |
| `PUT` | `/me/preferences` | Yes | Persist theme and language |
| `POST` | `/me/2fa/enable` | Yes | Initiate 2FA activation — returns TOTP secret and QR URI |
| `POST` | `/me/2fa/confirm` | Yes | Confirm first OTP and activate 2FA — returns backup codes |
| `DELETE` | `/me/2fa` | Yes | Disable 2FA (requires current OTP confirmation) |
| `GET` | `/contracts/{contractId}/qr-token` | Yes | Get (or create) the stable QR token for in-person recharge |
| `POST` | `/contracts/{contractId}/qr-token/refresh` | Yes | Invalidate and reissue the QR token |
| `GET` | `/qr/{token}` | No | Resolve a QR token to contract identity for the terminal display |
| `POST` | `/qr/{token}/recharge` | No | Create a Stripe PaymentIntent via QR token (operator side) |
