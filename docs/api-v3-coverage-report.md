# Frontend ↔ Untrusted API v3 — Full Endpoint Coverage Report

**Purpose:** map every backend call the `flex-energy-web` frontend makes today (via the SmartSphere client modules) against the Untrusted API v3 prototype spec (`docs/new-api/Endpoint_Matrix.md`), so the backend team can see exactly what's covered, what changed, and what's still missing before the 2.11 freeze.

**Legend:** ✅ Covered · ⚠️ Partial / shape differs / needs confirmation · ❌ Missing (no v3 equivalent)

---

## 1. Identity / Auth

| Frontend call (current v2) | v3 equivalent | Status | Notes |
|---|---|---|---|
| `POST /api/v2/Authentication/RequestToken` (login) | `POST /api/v3/auth/login` | ✅ | Base path change (`v2→v3`), payload rename: `requiresTwoFactor`/`sessionToken` → `secondFactorRequired`/`challengeId`. |
| 2FA verify (currently a no-op in `AuthContext`, not yet wired to a client method) | `POST /api/v3/auth/second-factor/verify` | ✅ | Needs `challengeId` + `otpCode` instead of `sessionToken` + `code`. Frontend needs to implement this call for real (today it's mocked). |
| — (not implemented) | `POST /api/v3/auth/refresh` | ✅ | Available, not yet wired client-side. |
| `clearAuthToken()` (local only, no logout call today) | `POST /api/v3/auth/logout` | ✅ | Should be wired so logout also revokes server-side session. |
| `POST /Api/v1/Account/ResetPassword` | `POST /api/v3/auth/password/recovery` | ✅ | Base path + naming change (`Account/ResetPassword` → `auth/password/recovery`). |
| `POST /api/v2/Authentication/BridgeTicket/Create` / `.../Consume` | — | ➖ Not needed | Defined in the client (`auth.ts`) but **no UI code calls them** — dead code from an SSO bridge flow that was never wired up. No need to request a v3 equivalent. |
| — (`TwoFactorAuthView` "Resend code" — currently `setTimeout` mock) | — | ❌ **Missing (Gap 1)** | See highlighted section below. |
| — (`EmailVerificationView` "Resend email" — currently `setTimeout` mock) | — | ❌ **Missing (Gap 2)** | See highlighted section below. |
| — (email verification confirmation link) | — | ❌ **Missing (Gap 2)** | See highlighted section below. |
| — (Settings → Security: enable/confirm/disable 2FA — not yet built in UI, but planned) | — | ❌ **Missing (Gap 3)** | See highlighted section below. |

---

## 2. Profile / Preferences

| Frontend call | v3 equivalent | Status | Notes |
|---|---|---|---|
| `POST /Api/v1/Account/SetUser` | `PUT /api/v3/me/profile` | ✅ | Base path + payload shape change (partial update object vs. full `SetUserRequest`). |
| `POST /Api/v1/Account/SetAccountLanguage` | `PUT /api/v3/me/preferences` | ✅ | Folded into generic preferences (theme/culture) instead of a dedicated language endpoint. |
| — | `GET /api/v3/me` | ✅ | New — replaces piecing together user info from login response; also exposes `emailVerified`, `is2FAEnabled`. |
| `POST /Api/v1/Customers/CreateCustomer` (used today in `ProfileEditForm.tsx` to save profile edits — address, phone, etc.) | — | ⚠️ | v3 explicitly states customer **creation** stays BackOffice-only (`POST /customers` "Non presente in 2.11 customer"). If `PUT /me/profile` doesn't cover all fields this form edits (address, city, postal code, phone), there's a functional gap — needs confirmation of `PUT /me/profile`'s exact field set. |

---

## 3. Contracts / Dashboard

| Frontend call | v3 equivalent | Status | Notes |
|---|---|---|---|
| `POST /Api/v1/ContractService/GetCustomerDashboard` | `GET /api/v3/me/overview` | ✅ | Aggregate bootstrap endpoint replaces bespoke dashboard call. |
| `POST /Api/v1/ContractService/GetCustomerContracts` / `ListActiveContracts` | `GET /api/v3/contracts` | ✅ | Consolidated single list (Contract + Agreement + Financial) — response shape will differ, needs a mapping layer. |
| `POST /Api/v1/ContractService/ContractServiceDetails` | `GET /api/v3/contracts` (per-item) | ⚠️ | Likely folded into the same list response; confirm all detail fields (status, balance, dates) are present per-contract. |
| `POST /Api/v1/ContractService/GetContractStatus` | — | ⚠️ | No standalone status endpoint in v3; presumably part of `GET /contracts` payload — confirm. |
| `POST /Api/v1/ContractService/GetCustomerConsume` | `POST /api/v3/energy/usage/query` | ✅ | Naming/payload change; v3 is multi-agreement capable. |
| — (no "rename contract" feature built in the UI yet) | `PUT /api/v3/me/contracts/{contract_id}/display-name` | ✅ | We proposed this in v2 (`PUT /contracts/{contractId}/display-name`) and v3 actually implements it — max 24 chars (we proposed 100) and clears via `""` instead of `null`. Not a gap; a ready-to-build feature once the UI exists. |
| `SetContract`, `CloseContractService`, `SetContractTariff`, `ListContractTariffs`, `UpdateStatus`, `SetContractMeta`, `SetContractDescription` | — | ⚠️/backoffice | Actualmente sin uso — no UI call sites found for any of them. Look like backoffice/admin operations; v2 corroborates this, our own proposal never had contract-admin endpoints either. Confirmar con el equipo si se planea una vista separada (p. ej. panel de gestión de contrato) antes de descartarlos por completo. |

---

## 4. Financial / Payments

| Frontend call | v3 equivalent | Status | Notes |
|---|---|---|---|
| `POST /Api/v1/Financial/GetCustomerBalance` | `GET /api/v3/me/financial/overview` | ➖ Not needed | No UI call sites — the balance shown on screen comes from `GetCustomerDashboard`, not this method. v3 equivalent exists regardless, just currently unused dead code in the client. |
| `POST /Api/v1/Financial/GetContractBalance` | `GET /api/v3/contracts/{contract_id}/financial/overview` | ➖ Not needed | Same — no call sites; per-contract balance display also relies on the dashboard aggregate. |
| `POST /Api/v1/Financial/ListTransactions` | `GET /api/v3/contracts/{contract_id}/financial/transactions` | ✅ | v3 paginates; current frontend fetches full list — needs pagination handling. |
| `POST /Api/v1/Financial/GenerateOrderId` + `POST /Api/v1/Financial/SetTransaction` (custom checkout flow) | `POST /api/v3/financial/recharges` (idempotent checkout) + full Stripe-native flow: `GET /payments/configuration`, `POST /payments/setup-intent`, `POST/GET/DELETE /payments/methods`, `GET /payments/intents/{id}` | ⚠️ | **Architecture change, not a gap** — v3 replaces the custom order-id/transaction dance with a proper Stripe payment-methods + intents model. This is a larger frontend rework, not a missing endpoint, but worth flagging since it's not a drop-in replacement. |
| `POST /Api/v1/Financial/UpdateTransaction` | — | ⚠️ | Superseded by Stripe intent status handling (`GET /payments/intents/{id}`) — no direct 1:1 mapping. |
| `POST /Api/v1/Financial/SetIncomeStatement` | — | ❌/backoffice | Not customer-facing; not in matrix. |

---

## 5. Recharge Suggestions (Shop)

| Frontend call | v3 equivalent | Status | Notes |
|---|---|---|---|
| `POST /Api/v1/Shop/SuggestBulk` | `POST /api/v3/financial/recharges/suggest` | ✅ | Naming + base path change (`Shop/SuggestBulk` → `financial/recharges/suggest`). |
| `POST /Api/v1/Shop/Suggest` (single, non-bulk) | — | ➖ Not needed | No UI call sites — only the bulk variant is used. |
| `POST /Api/v1/Shop/Split` | `POST /api/v3/financial/recharges/allocation` | ✅ | Naming change (`Split` → `allocation`). |

---

## 6. Usage Charts (Graphics)

| Frontend call | v3 equivalent | Status | Notes |
|---|---|---|---|
| `getMeasures`, `getCosts` (`/Api/v1/Graphics/*`, called internally by the `apiService.getGroupedCostsData` wrapper) | `POST /api/v3/energy/usage/query` | ⚠️ | v3 has **no dedicated chart-shaped endpoint** — it returns raw usage data, while today's frontend gets chart-ready structures (`categories`/`dataset`, FusionCharts-style). This means either the backend needs to keep returning chart-shaped payloads, or the frontend needs a transformation layer over the raw usage query. Needs a decision before migration. |
| `getCostsAndMeasures`, `getGroupedCosts` (`/Api/v1/Graphics/*`) | — | ➖ Not needed | No UI/wrapper call sites — `apiService.getGroupedCostsData` calls `getCosts`/`getMeasures` directly, not this method. |
| `listRevenues` (`/Api/v1/Graphics/ListRevenues`) | — | ❌/backoffice | Not in matrix; not called from any customer UI path found in the scan. |

---

## 7. Gas

| Frontend call | v3 equivalent | Status | Notes |
|---|---|---|---|
| `listGasTariffs`, `setGasTariff`, `closeGasTariffs` (`/Api/v1/Gas/*`) | — | ❌ | The v3 matrix only documents an "Electrical" area (meters, status-change). There's no "Gas" section at all. If the app still needs to support gas contracts, this is a real gap to raise with backend — otherwise confirm gas is fully out of scope for v3. |

---

## 8. Tariffs

| Frontend call | v3 equivalent | Status | Notes |
|---|---|---|---|
| `listElectricalTariffs`, `listElectricalTariffRates` (used in `TariffDrawer.tsx` to show a contract's current plan/rates to the customer) | — | ⚠️ | Not present in the v3 customer matrix. If tariff/rate details are meant to be embedded in `GET /contracts` instead of separate endpoints, confirm that response includes tariff name, rate schedule, etc. — otherwise this is a functional gap for the "view my plan" screen. |
| `getElectricalTariff` (single-tariff getter) | — | ➖ Not needed | No UI call sites — `TariffDrawer.tsx` uses `listElectricalTariffs`/`listElectricalTariffRates` instead. |
| `addElectricalTariff`, `updateElectricalTariff`, `deleteElectricalTariff`, `addElectricalTariffRate`, `deleteElectricalTariffRate`, `addTariffDebt`, `updateDebtAmortisation` | — | ❌/backoffice | Admin-only tariff management, not customer-facing; no UI call sites found. |

---

## 9. Infrastructure / Meters

| Frontend call | v3 equivalent | Status | Notes |
|---|---|---|---|
| `POST /Api/v1/Infrastructure/ListMeterStatus` | `GET /api/v3/energy/electrical/meters` | ✅ | Base path + method change. |
| `listContractMeters` | — | ➖ Not needed | No UI call sites — meter listing uses `ListMeterStatus` instead. |
| `changeMeterStatus`, `issueMeterValidationCodeBulk`, `validateChangeMeterStatusBulk` | `POST /api/v3/energy/electrical/meters/status-change` + `.../confirm` (Professional access) | ⚠️ | v3 covers single status-change + confirmation; no explicit bulk equivalent. Confirm if bulk operations are still needed for the frontend or are backoffice-only now. |
| `validateChangeMeterStatus` (non-bulk variant) | — | ➖ Not needed | No UI call sites — only the bulk variant (`validateChangeMeterStatusBulk`) is used. |

---

## 10. Notifications

| Frontend call | v3 equivalent | Status | Notes |
|---|---|---|---|
| `POST /Api/v1/UserNotificationSettings/Get` | `GET /api/v3/me/notification/preferences` | ✅ | Base path + method + naming change. |
| `POST /Api/v1/UserNotificationSettings/Update` | `PUT /api/v3/me/notification/preferences` | ✅ | Same. |
| — (not yet used by frontend) | `GET /me/notifications`, `GET /me/notifications/summary`, `PUT /me/notifications/{id}/read`, `PUT /me/notifications/read-all`, `POST/DELETE /me/push/devices` | ℹ️ | **New capabilities** in v3 (notification inbox + push registration) that the frontend doesn't use yet — not a gap, but worth noting as available for future features (in-app notification center is currently client-side only in `AppContext.tsx`). |

---

## 11. Documents / Exports

| Frontend call | v3 equivalent | Status | Notes |
|---|---|---|---|
| `GET /Api/v1/FileManager/Exports` (list), `GET /Api/v1/FileManager/Exports/{id}/Download` | `GET /api/v3/me/documents/receipts`, `GET /api/v3/me/documents/invoices`, `.../{document_id}/download` | ⚠️ | Structural change: generic "Exports" collection → two typed collections (receipts vs. invoices), each with its own download endpoint. Frontend currently treats exports as one generic list keyed by `exportId` — will need to fetch/merge both collections or pick the right one per transaction type. |
| `downloadLatestImport`, `uploadFile` (`/Api/v1/FileManager/Imports`, `/Uploads`) | — | ❌/backoffice | Not customer-facing; no v3 equivalent, none needed. |
| — | `GET /api/v3/exports` | ℹ️ | Present in matrix but marked **Privileged**, not customer-standard — not usable by this frontend anyway. |

---

## 12. Company / Language

| Frontend call | v3 equivalent | Status | Notes |
|---|---|---|---|
| `GET /Api/v1/Language/GetCompany` | `GET /api/v3/company` | ✅ | Base path + naming change, anonymous/public in both. |

---

## 13. Statistics (Admin)

| Frontend call | v3 equivalent | Status | Notes |
|---|---|---|---|
| `POST /Api/v1/Statistics/GetDashboardAdmin` | — | ❌/backoffice | Admin dashboard, not customer-facing, no UI call sites — out of scope by design. |

---

## 14. QR Identification

| Frontend need | v3 equivalent | Status | Notes |
|---|---|---|---|
| Customer/Contract QR codes (not yet implemented client-side, but planned) | `GET/POST /me/identification/qr(/refresh)`, `GET/POST /me/contracts/{id}/identification/qr(/refresh)` | ✅ | Fully covered, ready to wire up when the feature is built. |

---

## 🔴 Highlighted — Missing Auth Endpoints (unchanged from previous gap analysis)

These three gaps were already raised and given provisional contracts in `docs/api-v2.md`; v3 still doesn't cover them:

1. **`POST /auth/2fa/resend`** — resend OTP mid-MFA-challenge (needed by `TwoFactorAuthView`'s "Resend code", before the challenge is verified, so it can't reuse `/auth/second-factor/verify`).
2. **Email verification lifecycle** — `POST /me/email-verification/resend` (or `/auth/email-verification/resend`) + `GET /auth/verify-email?token=...` (needed by `EmailVerificationView`'s "Resend email" and the confirmation link opened from the verification email).
3. **2FA management in settings** — `POST /me/2fa/enable`, `POST /me/2fa/confirm`, `DELETE /me/2fa` (needed for the planned Settings → Security screen to let users turn 2FA on/off, independent of the login-time MFA challenge).

**Proposed contracts:** already drafted in full (request/response shapes, error codes) in `docs/api-v2.md`, sections "Password recovery / email verification" (lines ~219–270) and "Two-Factor Authentication management" (lines ~1403 onward). These can be handed to the backend team as-is as a starting proposal.

---

## 📋 Comparison with our v2 proposal (`docs/api-v2.md`)

`docs/api-v2.md` was our own spec — 41 endpoints, written from what the frontend actually needs. Checking v3 against it, endpoint by endpoint:

### Fully matched (we asked, v3 delivers — naming/shape differs but functionally equivalent)

| v2 proposal | v3 delivers |
|---|---|
| `POST /auth/token` | `POST /auth/login` |
| `POST /auth/2fa/verify` | `POST /auth/second-factor/verify` |
| `POST /auth/password-reset` | `POST /auth/password/recovery` |
| `GET /dashboard` | `GET /me/overview` |
| `GET /contracts` | `GET /contracts` |
| `PUT /contracts/{contractId}/display-name` | `PUT /me/contracts/{contract_id}/display-name` |
| `GET /usage` | `POST /energy/usage/query` |
| `GET /transactions` | `GET /contracts/{contract_id}/financial/transactions` |
| `POST /payment/setup-intent`, `/payment/methods` (POST/GET), `DELETE /payment/methods/{id}` | `POST /payments/setup-intent`, `/payments/methods` (POST/GET/DELETE), `GET /payments/intents/{id}` |
| `POST /recharge/intent`, `/recharge` | `POST /financial/recharges` (idempotent, unified) |
| `POST /recharge/suggest` | `POST /financial/recharges/suggest` |
| `POST /recharge/split` | `POST /financial/recharges/allocation` |
| `PUT /notifications/settings` | `PUT /me/notification/preferences` |
| `POST`/`DELETE /notifications/push-token` | `POST`/`DELETE /me/push/devices` |
| `GET /notifications`, `PUT /notifications/{id}/read`, `PUT /notifications/read-all` | `GET /me/notifications`, `PUT /me/notifications/{id}/read`, `PUT /me/notifications/read-all` — implemented but not yet used by the frontend (see §10) |
| `GET /exports`, `GET /exports/{id}/download` | Split into `/me/documents/receipts` + `/me/documents/invoices`, each with its own `.../download` |
| `GET /company` | `GET /company` |
| `GET /meters`, `POST /meters/{contractId}/change` | `GET /energy/electrical/meters`, `POST /energy/electrical/meters/status-change` (+ `/confirm`) |
| `GET /me`, `PUT /me/profile`, `PUT /me/preferences` | `GET /me`, `PUT /me/profile`, `PUT /me/preferences` |
| `GET`/`POST /contracts/{contractId}/qr-token(/refresh)` | `GET`/`POST /me/contracts/{id}/identification/qr(/refresh)` |
| `GET /qr/{token}`, `POST /qr/{token}/recharge` | `POST /me/identification/qr/resolve` — present but explicitly flagged "non customer-standard" (operator/terminal profile, §19 of `REST_API_v3.md`), consistent with our intent that these serve the terminal, not the customer app |

### Proposed in v2, still missing from v3 (the 3 confirmed gaps above)

- `POST /auth/2fa/resend`
- `POST /auth/email-verification/resend`, `GET /auth/verify-email`
- `POST /me/2fa/enable`, `POST /me/2fa/confirm`, `DELETE /me/2fa`

These are the same three gaps already highlighted. v2 had explicit request/response contracts for all of them, so v3's silence here is a regression against what we asked for — not something we forgot to specify.

### In our v2 proposal but declined in v3

- `POST /customers` (customer self-registration) — v2 proposed it as a public endpoint; v3 explicitly documents it as "NON PREVISTO" (§20 of `REST_API_v3.md`), staying BackOffice-only through the 2.11 migration. Worth confirming whether self-registration is still a product requirement.

### In v3 but never proposed in v2 (net-new)

- `GET /auth/session` — session introspection, no v2 equivalent.
- Richer contract model: `GET /contracts` aggregates Contract + Agreement + Financial, beyond our flat `/contracts`.

### Open items that are *not* v3 regressions

- **Gas** (`listGasTariffs`, `setGasTariff`, `closeGasTariffs`) — absent from v3, but also absent from our own v2 proposal. This is a gap in what we asked for, not something v3 dropped; needs a fresh ask.
- **Tariff / rate details** (used by `TariffDrawer`) — same situation: never part of v2 either.
- **Chart-shaped usage data** — v2 proposed `GET /usage` returning a time series, which is close to v3's raw `energy/usage/query`. The chart-ready `categories`/`dataset` shape the current `Graphics` module returns was never in our v2 ask, so the frontend transformation layer was already implied by our own proposal.

### Net takeaway

Of the 41 endpoints in our v2 proposal, v3 covers **38** (some 1:1, some consolidated or renamed), leaves **3 unaddressed** (all auth: 2FA resend, email verification lifecycle, 2FA settings management), and explicitly declines **1** (`POST /customers`, by design for 2.11). One pleasant surprise: v3 *did* implement the contract `display-name` endpoint we proposed, even though no UI uses it yet (24-char limit vs. the 100 we proposed, and clears via `""` rather than `null`).

---

## Summary

- **Core flows fully covered:** login, MFA verify, refresh, logout, password recovery, profile/preferences, contracts overview, usage, financial overview/transactions, recharges, meters, notifications settings, documents, company info, QR.
- **3 confirmed auth gaps** (unchanged): 2FA resend, email verification resend/confirm, 2FA settings management.
- **New open questions for backend** (not previously raised): Gas tariffs area appears entirely absent from v3; tariff/rate detail endpoints used by `TariffDrawer` have no clear v3 home; chart-shaped usage data (`Graphics` module) vs. raw `energy/usage/query`; customer profile edit (`CreateCustomer` today) vs. `PUT /me/profile` field coverage.
- **Not a gap:** Bridge Ticket (SSO) endpoints exist in the current client but are unused dead code — no need to ask backend for a v3 equivalent.
- **Architecture note (not a gap):** the payment/checkout flow moves from a custom order-id/transaction model to a full Stripe payment-methods/intents model — this is a larger frontend change than a simple endpoint swap.
- **Against our own v2 proposal:** 38 of 41 endpoints covered, 3 unaddressed (the auth gaps), 1 explicitly declined (`POST /customers`). Gas and tariff details were never in v2 either, so they need a fresh ask rather than being framed as v3 regressions.
- **Additional dead code confirmed** (no UI call sites, beyond Bridge Ticket): `getElectricalTariff`, `getCustomerBalance`, `getContractBalance`, `getCostsAndMeasures`, `getGroupedCosts`, `listContractMeters`, `validateChangeMeterStatus` (non-bulk), `Shop.Suggest` (non-bulk) — all marked "➖ Not needed" above. Separately, the contract-admin cluster (`SetContract`, `CloseContractService`, `SetContractTariff`, `ListContractTariffs`, `UpdateStatus`, `SetContractMeta`, `SetContractDescription`) is also unused today but left with a clarifying note rather than "not needed", pending confirmation on whether a separate contract-management view is planned.
