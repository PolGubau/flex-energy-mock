# SmartSphere / EnergyDynamics — REST API v3

**Audience:** sviluppatori esterni  
**Base URL:** `https://<host>/api/v3`  
**Formato:** JSON salvo download binari  
**Autenticazione:** Bearer salvo endpoint esplicitamente anonimi/session-based  
**Stato:** specifica prototipo pre-implementazione  
**Data:** 24.08.2026

> Baseline contratti: `crimanet/SmartSphere-Legacy`, branch `alpha`, commit `1cdf3868910938ceb2c32da1c1a470faa98fdb5e`.

---

## 1. Regole rapide

- Field JSON in `lowerCamelCase`.
- `int64` Protobuf in JSON è una **stringa** (`"15000"`).
- Timestamp RFC 3339/UTC.
- Enum come nome simbolico Protobuf.
- ID come stringhe opache.
- Route `/me/...` scoped sul caller autenticato.
- Non inviare `customerId` per selezionare un altro customer.
- Nessun endpoint di customer registration nella 2.11.
- Per importi usare `amountRaw + scale + currency` oppure `amountDecimal + scale + currency`.
- Endpoint finanziari con side effect devono rispettare l'idempotenza.

---

## 2. Indice endpoint customer

### Identity

```text
POST /auth/login
POST /auth/second-factor/verify
POST /auth/refresh
POST /auth/logout
POST /auth/password/recovery
GET  /auth/session
GET  /me
PUT  /me/profile
PUT  /me/preferences
```

### CRM

```text
GET /me/overview
GET /contracts
PUT /me/contracts/{contract_id}/display-name
GET/POST /me/identification/qr...
```

### Energy

```text
POST /energy/usage/query
GET  /energy/electrical/meters
```

### Financial / Payment

```text
GET  /me/financial/overview
GET  /contracts/{contract_id}/financial/overview
GET  /contracts/{contract_id}/financial/transactions
POST /financial/recharges/suggest
POST /financial/recharges/allocation
POST /financial/recharges
GET/POST/DELETE /payments/...
```

### Notification

```text
GET/PUT /me/notification/preferences
GET     /me/notifications
GET     /me/notifications/summary
PUT     /me/notifications/{notification_id}/read
PUT     /me/notifications/read-all
POST    /me/push/devices
DELETE  /me/push/devices/{device_id}
```

### Documents

```text
GET /me/documents/receipts
GET /me/documents/invoices
GET /me/documents/receipts/{document_id}/download
GET /me/documents/invoices/{document_id}/download
```

### Company

```text
GET /company
```

---

# 3. Identity

Per login/MFA/refresh esempi completi vedere anche `Authentication.md`.

## 3.1 POST `/api/v3/auth/login`

Autentica username/e-mail e password.

**Request**

```json
{
  "usernameOrEmail": "mario.rossi@example.ch",
  "password": "<password>"
}
```

**Response senza MFA**

```json
{
  "result": {
    "success": true,
    "code": "<authentication-code>",
    "translationKey": "<authentication-translation-key>",
    "issues": []
  },
  "secondFactorRequired": false,
  "session": {
    "accessToken": "<access-token>",
    "refreshToken": "<refresh-token>",
    "accessTokenExpiresAtUtc": "2026-08-24T11:30:00Z",
    "refreshTokenExpiresAtUtc": "2026-09-23T10:30:00Z",
    "culture": "it-CH",
    "passwordChangeRequired": false
  }
}
```

**Response MFA**

```json
{
  "result": { "success": true, "code": "<authentication-code>" },
  "secondFactorRequired": true,
  "challengeId": "<challenge>",
  "secondFactorChannel": "OTP_CHANNEL_EMAIL"
}
```

## 3.2 POST `/api/v3/auth/second-factor/verify`

```json
{
  "challengeId": "<challenge>",
  "otpCode": "123456"
}
```

Response: `verified` + `session` se la verifica è riuscita.

## 3.3 POST `/api/v3/auth/refresh`

```json
{
  "refreshToken": "<refresh-token>"
}
```

Response: nuova `session`.

## 3.4 POST `/api/v3/auth/logout`

```json
{
  "refreshToken": "<refresh-token>"
}
```

`refreshToken` è optional nel contratto; il client deve comunque eliminare la sessione locale dopo l'esito del logout.

## 3.5 POST `/api/v3/auth/password/recovery`

```json
{
  "usernameOrEmail": "mario.rossi@example.ch"
}
```

Response non enumerabile:

```json
{
  "result": { "success": true },
  "accepted": true
}
```

## 3.6 GET `/api/v3/auth/session`

**Bearer:** sì.

Response:

```json
{
  "result": { "success": true },
  "profile": {
    "subjectId": "subject-123",
    "email": "mario.rossi@example.ch",
    "culture": "it-CH",
    "passwordChangeRequired": false
  }
}
```

---

# 4. Profilo e preferenze

## 4.1 GET `/api/v3/me`

Restituisce il profilo del caller e l'anagrafica canonica.

### UserProfile

| Campo | Tipo | Note |
|---|---|---|
| `subjectId` | string | subject Identity |
| `customerId` | string? | customer CRM associato |
| `email` | string? | e-mail Identity |
| `emailVerified` | bool | stato verifica e-mail |
| `twoFactorEnabled` | bool | MFA abilitato |
| `masterdata` | object | anagrafica Directory |

### MasterdataOverview

```json
{
  "masterdata": {
    "masterdataId": "md-123",
    "masterdataType": "MASTERDATA_TYPE_PERSON",
    "firstName": "Mario",
    "lastName": "Rossi",
    "companyName": "",
    "genderType": "GENDER_TYPE_UNSPECIFIED"
  },
  "displayName": "Rossi Mario",
  "addresses": [
    {
      "addressId": "addr-1",
      "masterdataId": "md-123",
      "addressType": "ADDRESS_TYPE_PRIMARY",
      "sortOrder": 0,
      "street": "Via Esempio",
      "houseNo": "1",
      "postalCode": "6616",
      "city": "Losone",
      "countryCode": "CH",
      "active": true
    }
  ],
  "contacts": [
    {
      "contactId": "contact-1",
      "masterdataId": "md-123",
      "contactType": "CONTACT_TYPE_PRIVATE",
      "contactGroup": "CONTACT_GROUP_PHONE_MOBILE",
      "sortOrder": 0,
      "contactValue": "+41790000000",
      "primary": true,
      "active": true
    }
  ]
}
```

## 4.2 PUT `/api/v3/me/profile`

Update parziale: inviare solo i campi da modificare.

| Campo | Tipo | Obbligatorio | Owner |
|---|---|---:|---|
| `firstName` | string | no | Directory |
| `lastName` | string | no | Directory |
| `email` | string | no | Identity |
| `phone` | string | no | Directory contact |
| `companyName` | string | no | Directory |

```json
{
  "phone": "+41790000000",
  "email": "mario.nuovo@example.ch"
}
```

Response:

```json
{
  "result": { "success": true },
  "profile": { "...": "UserProfile aggiornato" },
  "emailVerificationRequired": true
}
```

Se cambia l'e-mail, il backend può richiedere una nuova verifica.

## 4.3 PUT `/api/v3/me/preferences`

```json
{
  "themeId": "solar",
  "culture": "it-CH"
}
```

Entrambi i field sono optional e l'update è parziale.

Response:

```json
{
  "result": { "success": true },
  "preferences": {
    "themeId": "solar",
    "culture": "it-CH"
  }
}
```

---

# 5. CRM / overview

## 5.1 GET `/api/v3/me/overview`

Endpoint di bootstrap dell'app.

Response root:

| Campo | Tipo | Descrizione |
|---|---|---|
| `result` | OperationResult | esito |
| `overview.customer` | Customer | root CRM |
| `overview.masterdata` | MasterdataOverview | anagrafica |
| `overview.contracts` | ContractOverview[] | portafoglio contratti |
| `overview.financial` | CustomerFinancialOverview | posizione finanziaria aggregata |
| `overview.notificationPreferences` | NotificationPreferences | canali e finestra |
| `overview.recentUsage` | UsageSeries[] | serie recenti per dashboard |
| `overview.generatedAtUtc` | Timestamp | timestamp aggregazione |
| `overview.userPreferences` | UserPreferences | tema/culture |
| `overview.notificationInboxSummary` | object | `totalCount`, `unreadCount` |

Esempio ridotto:

```json
{
  "result": { "success": true },
  "overview": {
    "customer": {
      "customerId": "customer-42",
      "customerCode": "CU-20260709141843-1915"
    },
    "masterdata": {
      "displayName": "Rossi Mario"
    },
    "contracts": [],
    "financial": {},
    "notificationPreferences": {},
    "recentUsage": [],
    "generatedAtUtc": "2026-08-24T10:30:00Z",
    "userPreferences": {
      "themeId": "default",
      "culture": "it-CH"
    },
    "notificationInboxSummary": {
      "totalCount": "15",
      "unreadCount": "3"
    }
  }
}
```

## 5.2 GET `/api/v3/contracts`

Restituisce `ContractOverview[]` del customer autenticato.

### Contract

| Campo | Tipo | Note |
|---|---|---|
| `contractId` | string | ID opaco |
| `legacyContractId` | int32? | compatibilità temporanea |
| `extContractId` | string? | riferimento esterno |
| `contractCode` | string? | codice contratto |
| `description` | string? | descrizione |
| `dateFrom` | Timestamp | inizio |
| `dateTo` | Timestamp | fine se presente |
| `status` | LifecycleStatus | lifecycle CRM |
| `customerId` | string | owner |
| `contractAccountId` | string? | conto contrattuale |
| `contractCodeAlias` | string? | alias tecnico/commerciale |
| `displayName` | string? | etichetta customer-facing |

### LifecycleStatus

```text
LIFECYCLE_STATUS_UNSPECIFIED
LIFECYCLE_STATUS_DRAFT
LIFECYCLE_STATUS_OPENING
LIFECYCLE_STATUS_ACTIVE
LIFECYCLE_STATUS_SUSPENDED
LIFECYCLE_STATUS_CLOSING
LIFECYCLE_STATUS_CLOSED
```

### ContractAccount

| Campo | Tipo |
|---|---|
| `contractAccountId` | string |
| `legacyContractAccountId` | int32? |
| `extContractAccountId` | string? |
| `contractAccountCode` | string? |
| `customerId` | string |
| `description` | string? |
| `dateFrom` | Timestamp |
| `dateTo` | Timestamp |
| `status` | LifecycleStatus |

### AgreementSummary

| Campo | Tipo | Note |
|---|---|---|
| `agreement` | ContractAgreement | servizio contrattuale |
| `usage` | AgreementUsageSummary | sintesi usage |
| `deliveryStatus` | ServiceDeliveryStatus | stato erogazione |
| `pendingDeliveryStatus` | ServiceDeliveryStatus? | richiesta pendente |
| `electrical` | ElectricalAgreementSummary? | oneof dominio |
| `gas` | GasAgreementSummary? | oneof dominio |

### ContractAgreement

| Campo | Tipo |
|---|---|
| `contractAgreementId` | string |
| `contractId` | string |
| `serviceTypeId` | string |
| `agreementCode` | string? |
| `displayName` | string? |
| `dateFrom` | Timestamp |
| `dateTo` | Timestamp |
| `status` | LifecycleStatus |
| `statusDateTime` | Timestamp |
| `extAgreementId` | string? |
| `sourceService` | string? |
| `sourceDocumentId` | string? |
| `description` | string? |

### ServiceDeliveryStatus

```text
SERVICE_DELIVERY_STATUS_UNSPECIFIED
SERVICE_DELIVERY_STATUS_UNAVAILABLE
SERVICE_DELIVERY_STATUS_OPERATIONAL
SERVICE_DELIVERY_STATUS_REDUCED
SERVICE_DELIVERY_STATUS_BLOCKED
```

Lifecycle e delivery status sono volutamente distinti.

## 5.3 PUT `/api/v3/me/contracts/{contract_id}/display-name`

Imposta/rimuove l'etichetta visuale del Contract.

**Path**

| Parametro | Tipo |
|---|---|
| `contract_id` | string |

**Body**

```json
{
  "displayName": "B&B"
}
```

Per rimuovere il valore il client invia `"displayName": ""`. Il limite backend attuale consolidato è 24 caratteri.

Response:

```json
{
  "result": { "success": true },
  "contract": {
    "contractId": "CO-...",
    "displayName": "B&B"
  }
}
```

---

# 6. Identification QR

Il QR appartiene al CRM ed è un identificatore opaco. Non contiene in chiaro `customerId` o `contractId`.

## 6.1 GET `/api/v3/me/identification/qr`

Restituisce il QR del customer autenticato.

```json
{
  "result": { "success": true },
  "identificationQr": {
    "customerId": "customer-42",
    "qr": {
      "value": "<opaque-qr-value>",
      "issuedAtUtc": "2026-08-24T10:30:00Z"
    }
  }
}
```

Il client può usare `qr.value` per generare/rappresentare il QR. Non deve interpretarne il contenuto.

## 6.2 POST `/api/v3/me/identification/qr/refresh`

Rigenera il Customer QR.

Body JSON vuoto:

```json
{}
```

Response: stesso schema di `GET /me/identification/qr`, con nuovo valore e timestamp.

## 6.3 GET `/api/v3/me/contracts/{contract_id}/identification/qr`

Restituisce il QR di un Contract appartenente al caller.

```json
{
  "result": { "success": true },
  "identificationQr": {
    "contractId": "CO-20260721085812-9806",
    "customerId": "customer-42",
    "qr": {
      "value": "<opaque-contract-qr>",
      "issuedAtUtc": "2026-08-24T10:31:00Z"
    }
  }
}
```

## 6.4 POST `/api/v3/me/contracts/{contract_id}/identification/qr/refresh`

Rigenera il QR del Contract.

Body:

```json
{}
```

Il server verifica che `contract_id` appartenga al customer autenticato.

## 6.5 POST `/api/v3/me/identification/qr/resolve` — profilo professionale

**Non integrare nella normale app customer.** È pensato per sportello/retailer/professional app con diritto dedicato.

Request:

```json
{
  "qrValue": "<scanned-opaque-value>"
}
```

Response Customer target:

```json
{
  "result": { "success": true },
  "customer": {
    "customer": { "customerId": "customer-42" },
    "masterdata": { "displayName": "Rossi Mario" },
    "contracts": [
      { "contractId": "CO-...", "displayName": "Casa" }
    ]
  }
}
```

Response Contract target:

```json
{
  "result": { "success": true },
  "contract": {
    "contract": { "contractId": "CO-...", "displayName": "Casa" },
    "customer": { "customerId": "customer-42" },
    "masterdata": { "displayName": "Rossi Mario" }
  }
}
```

`customer` e `contract` sono membri alternativi dello stesso `oneof`.

---

# 7. Energy Usage

## 7.1 POST `/api/v3/energy/usage/query`

Query trasversale per elettricità, gas e futuri vettori/servizi.

### Request

| Campo | Tipo | Obbligatorio | Note |
|---|---|---:|---|
| `contractAgreementIds` | string[] | sì | Agreement autorizzati |
| `fromUtc` | Timestamp | sì | inizio intervallo |
| `toUtc` | Timestamp | sì | fine intervallo |
| `granularity` | enum | sì | granularità richiesta |
| `metrics` | enum[] | sì | metriche |
| `aggregationMode` | enum | sì | per Agreement o aggregazione compatibile |

Granularity:

```text
USAGE_GRANULARITY_FIFTEEN_MINUTES
USAGE_GRANULARITY_HOURLY
USAGE_GRANULARITY_DAILY
USAGE_GRANULARITY_MONTHLY
USAGE_GRANULARITY_YEARLY
USAGE_GRANULARITY_TOTAL
```

Metrics:

```text
USAGE_METRIC_CONSUMPTION
USAGE_METRIC_PRODUCTION
USAGE_METRIC_COST
```

Aggregation:

```text
USAGE_AGGREGATION_MODE_PER_AGREEMENT
USAGE_AGGREGATION_MODE_COMBINED_COMPATIBLE
```

Esempio:

```json
{
  "contractAgreementIds": ["agreement-1"],
  "fromUtc": "2026-08-18T00:00:00Z",
  "toUtc": "2026-08-24T00:00:00Z",
  "granularity": "USAGE_GRANULARITY_DAILY",
  "metrics": ["USAGE_METRIC_CONSUMPTION", "USAGE_METRIC_COST"],
  "aggregationMode": "USAGE_AGGREGATION_MODE_PER_AGREEMENT"
}
```

### Response

Ogni serie contiene:

- `contractAgreementIds[]`;
- `metric`;
- `granularity`;
- `points[]`;
- `summary`.

Un `UsageValue` è alternativamente:

```json
{
  "measuredValue": {
    "rawValue": "136970",
    "scale": 3,
    "decimalValue": "136.970",
    "unitCode": "kWh"
  }
}
```

oppure:

```json
{
  "monetaryValue": {
    "amountRaw": "1488",
    "scale": 2,
    "currency": "CHF",
    "amountDecimal": "14.88"
  }
}
```

Esempio ridotto:

```json
{
  "result": { "success": true },
  "series": [
    {
      "contractAgreementIds": ["agreement-1"],
      "metric": "USAGE_METRIC_CONSUMPTION",
      "granularity": "USAGE_GRANULARITY_DAILY",
      "points": [
        {
          "periodStartUtc": "2026-08-23T00:00:00Z",
          "periodEndUtc": "2026-08-24T00:00:00Z",
          "value": {
            "measuredValue": {
              "rawValue": "55800",
              "scale": 3,
              "decimalValue": "55.800",
              "unitCode": "kWh"
            }
          }
        }
      ],
      "summary": {}
    }
  ]
}
```

---

# 8. Electrical Meter

## 8.1 GET `/api/v3/energy/electrical/meters`

Endpoint di lettura customer.

Query parameter ripetibile:

```text
contractAgreementIds=<id>&contractAgreementIds=<id2>
```

Se il consumer non ha diritto sull'Agreement, il backend non deve restituire il meter.

### ElectricalMeterSummary

| Campo | Tipo |
|---|---|
| `key` | MeterKey |
| `currentStatus` | MeterStatus |
| `statusChangedAtUtc` | Timestamp? |
| `hasPendingStatusChange` | bool |
| `requestedStatus` | MeterStatus |
| `connectivityStatus` | MeterConnectivityStatus |
| `validationStatus` | MeterValidationStatus |
| `changeMode` | MeterChangeMode |
| `warningCode` | string? |
| `warningTranslationKey` | string? |
| `firstSampleAtUtc` | Timestamp? |
| `lastSampleAtUtc` | Timestamp? |
| `requiredValidationCount` | int32 |
| `completedValidationCount` | int32 |

MeterKey:

```json
{
  "contractAgreementId": "agreement-1",
  "zpb": "CH0000000000-T-000-000000-000001",
  "obisCode": "1-1:1.29.0*255"
}
```

MeterStatus:

```text
METER_STATUS_OPERATIONAL
METER_STATUS_POWER_REDUCED
METER_STATUS_BLOCKED
```

Connectivity:

```text
METER_CONNECTIVITY_STATUS_ONLINE
METER_CONNECTIVITY_STATUS_OFFLINE
METER_CONNECTIVITY_STATUS_UNAVAILABLE
```

Le operazioni di cambio stato sono **professional profile**, non customer standard:

```text
POST /api/v3/energy/electrical/meters/status-change
POST /api/v3/energy/electrical/meters/status-change/{change_request_id}/confirm
```

---

# 9. Financial Overview

## 9.1 GET `/api/v3/me/financial/overview`

Restituisce la posizione aggregata del customer e le posizioni dei Contract.

### FinancialPosition

| Campo | Tipo Money / altro | Semantica |
|---|---|---|
| `balance` | Money | saldo disponibile |
| `debt` | Money | debito residuo positivo |
| `netPosition` | Money | balance - debt |
| `debtAmortisation` | Money | quota ammortamento corrente |
| `averageDailyCost` | Money | costo medio giornaliero |
| `forecastTotalCost` | Money | costo stimato nell'orizzonte configurato |
| `estimatedDepletionAtUtc` | Timestamp? | data esaurimento stimata |
| `estimatedRemainingDays` | int32? | giorni residui stimati |

Response ridotta:

```json
{
  "result": { "success": true },
  "overview": {
    "customerId": "customer-42",
    "total": {
      "balance": {
        "amountRaw": "-195056",
        "scale": 2,
        "currency": "CHF",
        "amountDecimal": "-1950.56"
      }
    },
    "contracts": []
  }
}
```

## 9.2 GET `/api/v3/contracts/{contract_id}/financial/overview`

Restituisce la posizione del singolo Contract.

`ContractFinancialOverview`:

| Campo | Tipo |
|---|---|
| `contractId` | string |
| `position` | FinancialPosition |
| `freshnessGuaranteed` | bool |
| `freshnessCode` | string? |

Il server verifica sempre l'ownership del Contract.

---

# 10. Financial Transactions

## 10.1 GET `/api/v3/contracts/{contract_id}/financial/transactions`

Query parameters:

| Parametro | Tipo | Note |
|---|---|---|
| `pageSize` | int32 | dimensione pagina |
| `pageToken` | string | cursor opaco |
| `sortDesc` | bool | default newest first |
| `direction` | enum | filtro opzionale/unspecified |
| `status` | enum | filtro opzionale/unspecified |
| `dateFromUtc` | Timestamp | filtro data |
| `dateToUtc` | Timestamp | filtro data |

Direction:

```text
TRANSACTION_DIRECTION_CREDIT
TRANSACTION_DIRECTION_DEBIT
```

Status disponibili includono:

```text
TRANSACTION_STATUS_PENDING
TRANSACTION_STATUS_AUTHORIZED
TRANSACTION_STATUS_CONFIRMED
TRANSACTION_STATUS_SETTLED
TRANSACTION_STATUS_CANCELLED
TRANSACTION_STATUS_REJECTED
TRANSACTION_STATUS_FAILED
TRANSACTION_STATUS_REVERSED
TRANSACTION_STATUS_REFUNDED
TRANSACTION_STATUS_IN_REVIEW
```

### FinancialTransaction

| Campo | Tipo |
|---|---|
| `transactionId` | string |
| `orderId` | string? |
| `contractId` | string |
| `customerId` | string |
| `amount` | Money |
| `direction` | TransactionDirection |
| `source` | TransactionSource |
| `status` | TransactionStatus |
| `description` | string? |
| `payment` | TransactionPaymentSummary |
| `createdAtUtc` | Timestamp |
| `statusAtUtc` | Timestamp? |

Response:

```json
{
  "result": { "success": true },
  "transactions": [],
  "nextPageToken": "opaque-token",
  "totalCount": "82"
}
```

---

# 11. Financial Recharge

## 11.1 POST `/api/v3/financial/recharges/suggest`

Calcola importi suggeriti per uno o più Contract in base ai giorni di copertura richiesti.

### Request

```json
{
  "contractIds": [
    "CO-20260721085812-9806",
    "CO-20260721090500-6970"
  ],
  "coverageDays": 30
}
```

| Campo | Tipo | Obbligatorio |
|---|---|---:|
| `contractIds` | string[] | sì |
| `coverageDays` | int32 | sì |

### Response

```json
{
  "result": { "success": true },
  "suggestion": {
    "coverageDays": 30,
    "items": [
      {
        "contractId": "CO-20260721085812-9806",
        "suggestedAmount": {
          "amountRaw": "44640",
          "scale": 2,
          "currency": "CHF",
          "amountDecimal": "446.40"
        }
      }
    ],
    "total": {
      "amountRaw": "44640",
      "scale": 2,
      "currency": "CHF",
      "amountDecimal": "446.40"
    }
  }
}
```

## 11.2 POST `/api/v3/financial/recharges/allocation`

Ripartisce un importo complessivo sui Contract indicati.

### Request

```json
{
  "contractIds": ["CO-1", "CO-2"],
  "amount": {
    "amountRaw": "10000",
    "scale": 2,
    "currency": "CHF"
  },
  "coverageDays": 30
}
```

### Response

```json
{
  "result": { "success": true },
  "allocation": {
    "items": [
      {
        "contractId": "CO-1",
        "amount": {
          "amountRaw": "6000",
          "scale": 2,
          "currency": "CHF",
          "amountDecimal": "60.00"
        }
      },
      {
        "contractId": "CO-2",
        "amount": {
          "amountRaw": "4000",
          "scale": 2,
          "currency": "CHF",
          "amountDecimal": "40.00"
        }
      }
    ],
    "total": {
      "amountRaw": "10000",
      "scale": 2,
      "currency": "CHF",
      "amountDecimal": "100.00"
    }
  }
}
```

## 11.3 POST `/api/v3/financial/recharges`

Crea il checkout business.

### Request — payment preference

```json
{
  "items": [
    {
      "contractId": "CO-1",
      "amount": {
        "amountRaw": "10000",
        "scale": 2,
        "currency": "CHF"
      }
    }
  ],
  "idempotencyKey": "9c6c5108-6958-4d15-97c5-3131d3072605",
  "preferredMethod": "PAYMENT_METHOD_PREFERENCE_CARD"
}
```

### Request — saved payment method

```json
{
  "items": [
    {
      "contractId": "CO-1",
      "amount": {
        "amountDecimal": "100.00",
        "scale": 2,
        "currency": "CHF"
      }
    }
  ],
  "idempotencyKey": "9c6c5108-6958-4d15-97c5-3131d3072605",
  "paymentMethodId": "pm-saved-123"
}
```

`preferredMethod` e `paymentMethodId` sono un `oneof`: inviarne **uno solo**.

Preferenze:

```text
PAYMENT_METHOD_PREFERENCE_AUTOMATIC
PAYMENT_METHOD_PREFERENCE_CARD
PAYMENT_METHOD_PREFERENCE_TWINT
```

### Response

```json
{
  "result": { "success": true },
  "checkout": {
    "allocation": {
      "items": [],
      "total": {
        "amountRaw": "10000",
        "scale": 2,
        "currency": "CHF",
        "amountDecimal": "100.00"
      }
    },
    "payment": {
      "paymentIntentId": "pi-123",
      "operationId": "operation-123",
      "status": "PAYMENT_STATUS_REQUIRES_ACTION",
      "clientSecret": "<provider-client-secret>",
      "expiresAtUtc": "2026-08-24T11:00:00Z",
      "requiresAction": true
    }
  }
}
```

`clientSecret` è sensibile e deve essere consegnato solo al componente client/provider che ne ha bisogno. Non deve essere registrato nei log.

Per controllare lo stato successivo usare `GET /payments/intents/{id}`.

---

# 12. Payment

## 12.1 GET `/api/v3/payments/configuration`

Restituisce la configurazione pubblica utilizzabile dal client SDK.

```json
{
  "result": { "success": true },
  "configuration": {
    "provider": "PAYMENT_PROVIDER_STRIPE",
    "publicClientKey": "pk_...",
    "defaultCurrency": "CHF",
    "environment": "Test",
    "supportedMethods": [
      "PAYMENT_METHOD_TYPE_CARD",
      "PAYMENT_METHOD_TYPE_TWINT"
    ]
  }
}
```

Il server non deve esporre secret key del provider.

## 12.2 POST `/api/v3/payments/setup-intent`

Avvia il setup per salvare un nuovo metodo di pagamento.

Body:

```json
{}
```

Response:

```json
{
  "result": { "success": true },
  "setup": {
    "provider": "PAYMENT_PROVIDER_STRIPE",
    "setupId": "seti-123",
    "clientSecret": "<setup-client-secret>"
  }
}
```

Il `clientSecret` del setup è sensibile.

## 12.3 POST `/api/v3/payments/methods`

Dopo il completamento del setup lato SDK/provider registra il metodo per il customer.

```json
{
  "providerPaymentMethodId": "pm_provider_123",
  "setAsDefault": true
}
```

Response:

```json
{
  "result": { "success": true },
  "paymentMethod": {
    "paymentMethodId": "pm-saved-123",
    "provider": "PAYMENT_PROVIDER_STRIPE",
    "methodType": "PAYMENT_METHOD_TYPE_CARD",
    "brand": "visa",
    "lastFour": "4242",
    "expirationMonth": 12,
    "expirationYear": 2029,
    "isDefault": true
  }
}
```

`providerPaymentMethodId` viene validato server-side e deve essere collegabile al customer autenticato.

## 12.4 GET `/api/v3/payments/methods`

Restituisce i metodi salvati del customer.

```json
{
  "result": { "success": true },
  "paymentMethods": [
    {
      "paymentMethodId": "pm-saved-123",
      "provider": "PAYMENT_PROVIDER_STRIPE",
      "methodType": "PAYMENT_METHOD_TYPE_CARD",
      "brand": "visa",
      "lastFour": "4242",
      "expirationMonth": 12,
      "expirationYear": 2029,
      "isDefault": true
    }
  ]
}
```

## 12.5 DELETE `/api/v3/payments/methods/{payment_method_id}`

Rimuove un metodo salvato del caller.

Response:

```json
{
  "result": { "success": true }
}
```

L'ID non viene considerato autorizzazione: il backend verifica sempre l'owner.

## 12.6 GET `/api/v3/payments/intents/{payment_intent_id}`

Restituisce lo stato corrente **senza riesporre il client secret**.

```json
{
  "result": { "success": true },
  "payment": {
    "paymentIntentId": "pi-123",
    "operationId": "operation-123",
    "status": "PAYMENT_STATUS_SUCCEEDED",
    "requiresAction": false,
    "paymentMethod": {
      "methodType": "PAYMENT_METHOD_TYPE_CARD",
      "cardBrand": "visa",
      "cardLastFour": "4242",
      "cardHolder": "M ROSSI",
      "paymentMethodId": "pm-saved-123"
    }
  }
}
```

Stati principali:

```text
PAYMENT_STATUS_REQUIRES_PAYMENT_METHOD
PAYMENT_STATUS_REQUIRES_ACTION
PAYMENT_STATUS_PROCESSING
PAYMENT_STATUS_SUCCEEDED
PAYMENT_STATUS_CANCELED
PAYMENT_STATUS_FAILED
PAYMENT_STATUS_REFUNDED
PAYMENT_STATUS_DISPUTED
```

---

# 13. Notification Preferences

## 13.1 GET `/api/v3/me/notification/preferences`

Response:

```json
{
  "result": { "success": true },
  "preferences": {
    "culture": "it-CH",
    "channels": [
      {
        "channel": "NOTIFICATION_CHANNEL_EMAIL",
        "enabled": true,
        "maskedDestination": "m***@example.ch"
      },
      {
        "channel": "NOTIFICATION_CHANNEL_SMS",
        "enabled": false,
        "maskedDestination": "+41******123"
      },
      {
        "channel": "NOTIFICATION_CHANNEL_PUSH",
        "enabled": true
      }
    ],
    "deliveryWindow": {
      "startMinuteOfDay": 480,
      "endMinuteOfDay": 1200,
      "timeZoneId": "Europe/Zurich"
    }
  }
}
```

Canali:

```text
NOTIFICATION_CHANNEL_EMAIL
NOTIFICATION_CHANNEL_SMS
NOTIFICATION_CHANNEL_PUSH
```

`startMinuteOfDay` e `endMinuteOfDay` sono minuti dalla mezzanotte locale (`0..1439`).

## 13.2 PUT `/api/v3/me/notification/preferences`

```json
{
  "channels": [
    {
      "channel": "NOTIFICATION_CHANNEL_EMAIL",
      "enabled": true
    },
    {
      "channel": "NOTIFICATION_CHANNEL_SMS",
      "enabled": false
    },
    {
      "channel": "NOTIFICATION_CHANNEL_PUSH",
      "enabled": true
    }
  ],
  "deliveryWindow": {
    "startMinuteOfDay": 480,
    "endMinuteOfDay": 1200,
    "timeZoneId": "Europe/Zurich"
  }
}
```

La culture delle notifiche è informativa in questo contratto; la modifica della lingua utente avviene tramite `/me/preferences`.

---

# 14. Notification Inbox

## 14.1 GET `/api/v3/me/notifications`

Query:

| Parametro | Tipo |
|---|---|
| `pageSize` | int32 |
| `pageToken` | string? |
| `unreadOnly` | bool? |
| `fromUtc` | Timestamp? |
| `toUtc` | Timestamp? |

Response:

```json
{
  "result": { "success": true },
  "notifications": [
    {
      "notificationId": "notification-123",
      "typeCode": "balance_warning",
      "title": "Saldo in esaurimento",
      "body": "Il saldo del contratto sta per esaurirsi.",
      "createdAtUtc": "2026-08-24T08:00:00Z",
      "actionUri": "<client-action-uri>",
      "actionParameters": {
        "contractId": "CO-1"
      }
    }
  ],
  "nextPageToken": "opaque-token",
  "summary": {
    "totalCount": "15",
    "unreadCount": "3"
  }
}
```

`readAtUtc` è assente per una notifica non letta.

## 14.2 GET `/api/v3/me/notifications/summary`

```json
{
  "result": { "success": true },
  "summary": {
    "totalCount": "15",
    "unreadCount": "3"
  }
}
```

## 14.3 PUT `/api/v3/me/notifications/{notification_id}/read`

Body:

```json
{}
```

Response restituisce la notifica aggiornata.

## 14.4 PUT `/api/v3/me/notifications/read-all`

Body:

```json
{}
```

Response:

```json
{
  "result": { "success": true },
  "updatedCount": "3"
}
```

---

# 15. Push Devices

## 15.1 POST `/api/v3/me/push/devices`

Registra o aggiorna una installazione client.

```json
{
  "deviceId": "install-1a2b3c",
  "platform": "PUSH_DEVICE_PLATFORM_IOS",
  "pushToken": "<opaque-push-token>",
  "appVersion": "3.0.0",
  "deviceModel": "iPhone",
  "culture": "it-CH"
}
```

Platform:

```text
PUSH_DEVICE_PLATFORM_IOS
PUSH_DEVICE_PLATFORM_ANDROID
PUSH_DEVICE_PLATFORM_WEB
```

`deviceId` identifica l'installazione applicativa, non un identificatore hardware permanente.

Response:

```json
{
  "result": { "success": true },
  "registration": {
    "deviceId": "install-1a2b3c",
    "platform": "PUSH_DEVICE_PLATFORM_IOS",
    "appVersion": "3.0.0",
    "deviceModel": "iPhone",
    "culture": "it-CH",
    "registeredAtUtc": "2026-08-24T10:30:00Z",
    "lastSeenAtUtc": "2026-08-24T10:30:00Z"
  }
}
```

`pushToken` non viene riesposto nella response.

## 15.2 DELETE `/api/v3/me/push/devices/{device_id}`

Rimuove una installazione push del caller.

```json
{
  "result": { "success": true }
}
```

---

# 16. Documents

Per dettagli di sicurezza e streaming vedere `Documents_and_Downloads.md`.

## 16.1 GET `/api/v3/me/documents/receipts`

Query:

```text
pageSize
pageToken
dateFromUtc
dateToUtc
sortDesc
```

Response contiene `receipts[]`, `nextPageToken`, `totalCount`.

Ogni record:

```json
{
  "documentId": "doc-123",
  "fileName": "receipt-123.pdf",
  "contentType": "application/pdf",
  "sizeBytes": "84231",
  "format": "DOCUMENT_FORMAT_PDF",
  "createdAtUtc": "2026-08-24T09:15:00Z",
  "documentType": "DOCUMENT_TYPE_RECEIPT"
}
```

Il client non invia type/format.

## 16.2 GET `/api/v3/me/documents/invoices`

Stesso schema, con `DOCUMENT_TYPE_INVOICE` e `DOCUMENT_FORMAT_PDF` fissati server-side.

## 16.3 GET `/api/v3/me/documents/receipts/{document_id}/download`

REST nativo.

```http
Accept: application/pdf
Authorization: Bearer <access-token>
```

Response body: PDF binario. Nessun JSON/Base64.

## 16.4 GET `/api/v3/me/documents/invoices/{document_id}/download`

Come Receipt, con validazione obbligatoria di owner + Invoice + PDF.

---

# 17. Company

## 17.1 GET `/api/v3/company`

Profilo pubblico/supporto della company configurata.

```json
{
  "result": { "success": true },
  "company": {
    "name": "Company Name",
    "displayName": "Company Display Name",
    "addressLine1": "Via Esempio 1",
    "addressLine2": "",
    "postalCode": "6616",
    "city": "Losone",
    "countryCode": "CH",
    "email": "info@example.ch",
    "phone": "+41910000000",
    "web": "https://example.ch"
  }
}
```

Non contiene configurazioni interne o secret.

---

# 18. Electrical e Gas nell'Overview

## 18.1 ElectricalAgreementSummary

```json
{
  "contractAgreementId": "agreement-ele-1",
  "meters": [],
  "tariffs": [
    {
      "tariffId": "tariff-1",
      "tariffName": "Default - Completa",
      "isHidden": false,
      "validFromUtc": "2026-01-01T00:00:00Z",
      "isCurrent": true
    }
  ]
}
```

Le tariffe sono una matrice. La superficie customer deve normalmente ricevere soltanto le tariffe visibili; `isHidden` resta parte del modello riutilizzabile.

## 18.2 GasAgreementSummary

```json
{
  "contractAgreementId": "agreement-gas-1",
  "currentTariff": {
    "tariffId": "gas-tariff-1",
    "tariffName": "Tariffa Gas",
    "dailyCost": {
      "amountRaw": "250",
      "scale": 2,
      "currency": "CHF",
      "amountDecimal": "2.50"
    },
    "validFromUtc": "2026-07-22T00:00:00Z"
  }
}
```

---

# 19. Endpoint non customer-standard

Le seguenti route esistono nel catalogo contrattuale ma non devono essere consumate dall'app customer senza un profilo esplicito:

```text
POST /api/v3/me/identification/qr/resolve
POST /api/v3/energy/electrical/meters/status-change
POST /api/v3/energy/electrical/meters/status-change/{change_request_id}/confirm
GET  /api/v3/exports
```

Motivi:

- QR resolve: sportello/retailer;
- meter status change: professional/operator app;
- generic export: superficie privilegiata/integrativa.

---

# 20. Endpoint non presente

La 2.11 non offre customer self-registration:

```text
POST /api/v3/customers  <-- NON PREVISTO
```

La creazione customer rimane nel BackOffice/PortalAPI durante la migrazione.

---

# 21. Checklist client

Prima di integrare:

- [ ] Supporto Bearer access + refresh token.
- [ ] Supporto MFA challenge.
- [ ] `int64` letto come stringa JSON.
- [ ] Money calcolato con raw/scale, non floating-point.
- [ ] Enum gestiti tramite nome simbolico.
- [ ] Timestamp RFC3339.
- [ ] `pageToken` trattato come opaco.
- [ ] ID trattati come stringhe opache.
- [ ] `idempotencyKey` stabile sui retry della stessa recharge.
- [ ] `clientSecret`, token, OTP, push token e QR non finiscono nei log.
- [ ] PDF scaricati come stream binario.
- [ ] Non usare endpoint Professional senza grant.
- [ ] Non aspettarsi un endpoint di registrazione customer.

---

# 22. Feedback richiesto agli sviluppatori esterni

Durante la revisione del prototipo segnalare in particolare:

1. dati mancanti per il bootstrap `/me/overview`;
2. campi mancanti per lista/dettaglio Contract;
3. granularità Usage non coperte;
4. comportamento necessario per payment SDK;
5. necessità reali di filtri/paginazione;
6. informazioni mancanti nelle notifiche;
7. necessità di ulteriori document type customer-safe;
8. eventuali conflitti tra naming REST e SDK/app routing;
9. requisiti per refresh/session expiry;
10. eventuali capability customer che risultano assenti.

Le segnalazioni vengono valutate prima del freeze della API v3 2.11.
