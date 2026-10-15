# SmartSphere / EnergyDynamics — Untrusted API v3

**Audience:** sviluppatori esterni app/customer self-service  
**Protocollo pubblico:** HTTPS REST/JSON  
**Autenticazione:** Bearer  
**Base path:** `/api/v3`  
**Stato:** specifica prototipo pre-implementazione  
**Data:** 24.08.2026

> Baseline contratti: `crimanet/SmartSphere-Legacy`, branch `alpha`, commit `1cdf3868910938ceb2c32da1c1a470faa98fdb5e`.

## 1. Obiettivo

Questo documento descrive **come il consumer esterno vedrà l'API**. I consumer non devono conoscere i dettagli gRPC interni.

```text
App mobile
   |
   | HTTPS REST/JSON + Bearer
   v
Untrusted API
   |
   | gRPC + Protobuf + mTLS
   v
Trusted API
```

## 2. Base URL

Il dominio definitivo dipende dall'ambiente. Nei documenti si usa:

```text
https://<host>/api/v3
```

Esempio:

```http
GET https://<host>/api/v3/me/overview
Authorization: Bearer <access-token>
```

## 3. Cosa contiene l'archivio

- `REST_API_v3.md` — riferimento dettagliato degli endpoint customer.
- `Authentication.md` — login, MFA, refresh, logout, recovery e sessione.
- `Conventions_Errors_Security.md` — ProtoJSON, Money, ID, errori e sicurezza.
- `Endpoint_Matrix.md` — matrice rapida delle route e del profilo di accesso.
- `Documents_and_Downloads.md` — listing e download binario Receipt/Invoice.

## 4. Autenticazione

Quasi tutte le route customer richiedono:

```http
Authorization: Bearer <access-token>
```

Le operazioni di bootstrap dell'autenticazione usano invece credenziali/challenge/refresh token specifici.

## 5. Nessuna registrazione customer

La 2.11 **non** espone un endpoint per creare un nuovo Customer. Il provisioning rimane nel BackOffice/PortalAPI durante la migrazione.

## 6. Identità

Le route `/me/...` sono sempre riferite all'utente/customer della sessione autenticata. Non viene accettato un customer ID arbitrario per cambiare scope.

## 7. Contratti e Agreement

Il modello target è:

```text
Customer
└── ContractAccount
    └── Contract
        └── ContractAgreement[]
```

Un Contract può avere più Agreement, anche di domini differenti.

## 8. REST generato e REST nativo

La maggior parte delle route usa gRPC JSON transcoding.

Eccezioni correnti:

- download Receipt PDF;
- download Invoice PDF;
- webhook tecnici provider.

Questi endpoint usano HTTP nativo per poter lavorare con body/stream binari senza Base64 JSON.

## 9. Stabilità

Questa è una specifica di prototipo destinata alla validazione con gli sviluppatori esterni **prima dell'implementazione definitiva**. Le osservazioni sui requisiti funzionali possono quindi produrre modifiche deliberate dei contratti prima del freeze della 2.11.
