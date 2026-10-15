# Untrusted API v3 — Endpoint matrix

Legenda accesso:

- **Anonymous**: non richiede access Bearer.
- **Session**: usa challenge/refresh/session credential specifica.
- **Customer**: Bearer customer standard.
- **Professional**: endpoint presente nel contratto ma non assegnato al profilo customer standard.
- **Privileged**: integrazione/backoffice, non documentato come customer API.
- **Native REST**: implementato direttamente HTTP, non tramite JSON transcoding.

| Metodo | Path | Accesso | Area | Note |
|---|---|---|---|---|
| POST | `/api/v3/auth/login` | Anonymous | Identity | Login / avvio MFA |
| POST | `/api/v3/auth/second-factor/verify` | Session | Identity | Verifica challenge MFA |
| POST | `/api/v3/auth/refresh` | Session | Identity | Refresh token |
| POST | `/api/v3/auth/logout` | Session/Customer | Identity | Logout/revoca |
| POST | `/api/v3/auth/password/recovery` | Anonymous | Identity | Recovery non enumerabile |
| GET | `/api/v3/auth/session` | Customer | Identity | Profilo sessione |
| GET | `/api/v3/me` | Customer | Identity/Directory | Profilo utente |
| PUT | `/api/v3/me/profile` | Customer | Identity/Directory | Update parziale profilo |
| PUT | `/api/v3/me/preferences` | Customer | Identity | Tema/culture |
| GET | `/api/v3/me/overview` | Customer | CRM aggregate | Bootstrap app |
| GET | `/api/v3/contracts` | Customer | CRM | Contratti + Agreement + Financial |
| PUT | `/api/v3/me/contracts/{contract_id}/display-name` | Customer | CRM | Nome descrittivo |
| GET | `/api/v3/me/identification/qr` | Customer | CRM | Customer QR |
| POST | `/api/v3/me/identification/qr/refresh` | Customer | CRM | Rigenera Customer QR |
| GET | `/api/v3/me/contracts/{contract_id}/identification/qr` | Customer | CRM | Contract QR |
| POST | `/api/v3/me/contracts/{contract_id}/identification/qr/refresh` | Customer | CRM | Rigenera Contract QR |
| POST | `/api/v3/me/identification/qr/resolve` | Professional | CRM | Risolve Customer/Contract per sportello |
| POST | `/api/v3/energy/usage/query` | Customer | Energy | Usage multi-Agreement |
| GET | `/api/v3/energy/electrical/meters` | Customer | Electrical | Lettura meter |
| POST | `/api/v3/energy/electrical/meters/status-change` | Professional | Electrical | Cambio stato meter |
| POST | `/api/v3/energy/electrical/meters/status-change/{change_request_id}/confirm` | Professional | Electrical | Seconda validazione |
| GET | `/api/v3/me/financial/overview` | Customer | Financial | Posizione customer |
| GET | `/api/v3/contracts/{contract_id}/financial/overview` | Customer | Financial | Posizione contract |
| GET | `/api/v3/contracts/{contract_id}/financial/transactions` | Customer | Financial | Movimenti paginati |
| POST | `/api/v3/financial/recharges/suggest` | Customer | Financial | Importi suggeriti |
| POST | `/api/v3/financial/recharges/allocation` | Customer | Financial | Ripartizione importo |
| POST | `/api/v3/financial/recharges` | Customer | Financial/Payment | Checkout idempotente |
| GET | `/api/v3/payments/configuration` | Customer | Payment | Configurazione client |
| POST | `/api/v3/payments/setup-intent` | Customer | Payment | Setup metodo |
| POST | `/api/v3/payments/methods` | Customer | Payment | Registra metodo |
| GET | `/api/v3/payments/methods` | Customer | Payment | Lista metodi |
| DELETE | `/api/v3/payments/methods/{payment_method_id}` | Customer | Payment | Elimina metodo |
| GET | `/api/v3/payments/intents/{payment_intent_id}` | Customer | Payment | Stato senza client secret |
| GET | `/api/v3/me/notification/preferences` | Customer | Notification | Preferenze |
| PUT | `/api/v3/me/notification/preferences` | Customer | Notification | Update preferenze |
| GET | `/api/v3/me/notifications` | Customer | Notification | Inbox paginata |
| GET | `/api/v3/me/notifications/summary` | Customer | Notification | Unread count |
| PUT | `/api/v3/me/notifications/{notification_id}/read` | Customer | Notification | Mark read |
| PUT | `/api/v3/me/notifications/read-all` | Customer | Notification | Mark all read |
| POST | `/api/v3/me/push/devices` | Customer | Notification | Registra iOS/Android/Web |
| DELETE | `/api/v3/me/push/devices/{device_id}` | Customer | Notification | Deregistra push |
| GET | `/api/v3/me/documents/receipts` | Customer | Document | Solo Receipt PDF |
| GET | `/api/v3/me/documents/invoices` | Customer | Document | Solo Invoice PDF |
| GET | `/api/v3/me/documents/receipts/{document_id}/download` | Customer / Native REST | Document | Stream `application/pdf` |
| GET | `/api/v3/me/documents/invoices/{document_id}/download` | Customer / Native REST | Document | Stream `application/pdf` |
| GET | `/api/v3/exports` | Privileged | Document | Generic listing, non customer-standard |
| GET | `/api/v3/company` | Anonymous/public | Company | Dati company/supporto |

## Non presente in 2.11 customer

Non esiste:

```text
POST /api/v3/customers
```

La creazione Customer resta BackOffice/PortalAPI durante la migrazione.
