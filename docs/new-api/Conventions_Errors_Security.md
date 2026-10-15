# Untrusted API v3 — Convenzioni, JSON, errori e sicurezza

## 1. Base path

```text
/api/v3
```

`v3` è la versione della superficie HTTP. Non fa parte dei package Protobuf interni.

## 2. Naming delle route

### Gerarchia con `/`

```text
/me/identification/qr
/me/notification/preferences
/me/push/devices
/auth/password/recovery
/energy/electrical/meters
/payments/intents/{id}
```

### Concetti composti con `-`

```text
display-name
status-change
second-factor
setup-intent
read-all
```

## 3. JSON field naming

I field Protobuf `snake_case` vengono esposti come `lowerCamelCase`.

```text
payment_intent_id -> paymentIntentId
amount_raw        -> amountRaw
created_at_utc    -> createdAtUtc
```

## 4. Tipi 64-bit

Per regola ProtoJSON, i tipi Protobuf `int64`, `uint64` e simili sono serializzati come **stringhe JSON**.

Esempi:

```json
{
  "amountRaw": "15000",
  "totalCount": "48",
  "unreadCount": "3"
}
```

Non fare affidamento sul tipo JavaScript `number` per questi campi.

Gli `int32` rimangono numeri JSON.

## 5. Money

### Response

```json
{
  "amountRaw": "15000",
  "scale": 2,
  "currency": "CHF",
  "amountDecimal": "150.00"
}
```

Valore:

```text
15000 / 10^2 = 150.00 CHF
```

`amountDecimal` è una stringa invariant e può essere usata per display/formattazione locale.

### Input

`MoneyInput` accetta **uno solo** tra:

```json
{
  "amountRaw": "15000",
  "scale": 2,
  "currency": "CHF"
}
```

oppure:

```json
{
  "amountDecimal": "150.00",
  "scale": 2,
  "currency": "CHF"
}
```

Non inviare contemporaneamente `amountRaw` e `amountDecimal`: sono un `oneof`.

Non usare floating-point per calcoli finanziari.

## 6. ScaledValue

Per misure fisiche:

```json
{
  "rawValue": "136970",
  "scale": 3,
  "decimalValue": "136.970",
  "unitCode": "kWh"
}
```

`unitCode` è sempre esplicito; non assumere che tutte le metriche siano elettriche.

## 7. Timestamp

I `google.protobuf.Timestamp` sono esposti in formato RFC 3339, normalmente UTC:

```text
2026-08-24T10:30:00Z
```

I campi optional possono essere omessi quando non valorizzati.

## 8. Enum

Il JSON standard espone il **nome simbolico Protobuf**.

Esempi:

```text
LIFECYCLE_STATUS_ACTIVE
SERVICE_DELIVERY_STATUS_OPERATIONAL
PAYMENT_STATUS_SUCCEEDED
TRANSACTION_DIRECTION_CREDIT
PUSH_DEVICE_PLATFORM_IOS
```

Il client deve mappare il nome simbolico e non il valore numerico.

## 9. ID

Gli ID pubblici sono stringhe opache:

```json
{
  "contractId": "CO-20260721085812-9806"
}
```

Possono derivare temporaneamente da ID legacy oppure da nuovi identificatori. Il client non deve dedurne il formato.

## 10. Pagination

Le liste paginabili usano cursor pagination:

```text
pageSize
pageToken
sortDesc
```

Esempio:

```http
GET /api/v3/contracts/CO-123/financial/transactions?pageSize=20&sortDesc=true
```

Response:

```json
{
  "nextPageToken": "opaque-token",
  "totalCount": "48"
}
```

`pageToken` è opaco e non deve essere costruito dal client.

## 11. OperationResult

Le response applicative contengono normalmente:

```json
{
  "result": {
    "success": true,
    "code": "<operation-code>",
    "translationKey": "<translation-key>",
    "issues": []
  }
}
```

Un issue può contenere:

```json
{
  "code": "<issue-code>",
  "translationKey": "<issue-translation-key>",
  "field": "email",
  "severity": "ISSUE_SEVERITY_ERROR",
  "parameters": {
    "maxLength": "100"
  }
}
```

Il testo finale viene tradotto dal client; non fare affidamento su messaggi tecnici provenienti dal server.

## 12. HTTP status

Mapping di riferimento:

| HTTP | Caso |
|---:|---|
| 200 | RPC completata / risultato applicativo |
| 400 | richiesta malformata o argomento non valido |
| 401 | token assente, scaduto o non valido |
| 403 | caller autenticato ma non autorizzato |
| 404 | risorsa non disponibile nello scope del caller |
| 409 | conflitto/idempotenza |
| 429 | rate limit |
| 500 | errore inatteso |
| 503 | dipendenza temporaneamente indisponibile |
| 504 | deadline superata |

La forma finale del body per gli errori di puro trasporto sarà formalizzata dall'host/OpenAPI. Per gli errori applicativi il riferimento è `OperationResult`.

## 13. Bearer

Endpoint protetti:

```http
Authorization: Bearer eyJ...
```

Non inserire access token in query string o URL.

## 14. Header diagnostici

Il client può propagare/registrare il request ID restituito dal sistema. Il tracing infrastrutturale può usare:

```text
traceparent
tracestate
x-request-id
```

Non usare questi valori come identificatori business.

## 15. Idempotency

`CreateRecharge` contiene `idempotencyKey` nel body.

Regole client:

- generare una chiave stabile per il singolo tentativo business;
- riutilizzare la stessa chiave quando si ripete **la stessa operazione** dopo un timeout incerto;
- non generare una nuova chiave per ogni retry di rete della stessa intenzione;
- non riutilizzare la chiave per un'altra ricarica.

## 16. Dati sensibili

Il consumer deve evitare di loggare:

- password;
- OTP;
- access token;
- refresh token;
- client secret Payment/SetupIntent;
- push token;
- QR value completo;
- validation code;
- dati carta.

## 17. Resource ownership

Un `contractId`, `documentId`, `paymentMethodId` o `paymentIntentId` noto non garantisce accesso.

Il backend esegue sempre la verifica sul subject autenticato.

Per ridurre l'enumerazione, un ID inesistente e un ID non appartenente al caller possono essere presentati entrambi come `404`.

## 18. Capability professionali

Alcune RPC esistono nel catalogo ma non appartengono al profilo customer standard:

- QR resolve;
- meter status change;
- meter status confirm;
- generic document export.

Non integrarle nell'app customer salvo esplicita abilitazione del profilo.
