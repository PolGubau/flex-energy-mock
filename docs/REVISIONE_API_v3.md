# Revisione Documentazione API v3 — Richieste di Chiarimento

**Data:** 26.08.2026  
**Preparato per:** Review esterna documentazione API v3  
**Status:** Richieste aperte e decisioni necessarie

---

## 📊 Copertura Proposta v2 → v3

Mapping dei 41 endpoint proposti in docs/api-v2.md contro la specifica v3. **Risultato: 38 di 41 coperti (92%).**


| Proposta v2 | Endpoint v3 | Status | Note |
|---|---|---|---|
| `POST /auth/token` | `POST /auth/login` | ✅ | Login. Payload: `username`/`password` → `accessToken`/`refreshToken`. |
| `POST /auth/password-reset` | `POST /auth/password/recovery` | ✅ | Recupero password. |
| `POST /customers` | — | ❌ | v3 esplicitamente esclude customer registration per 2.11 (BackOffice-only). |
| `GET /dashboard` | `GET /me/overview` | ✅ | Bootstrap endpoint: contratti + financial + usage + preferenze. |
| `GET /contracts` | `GET /contracts` | ✅ | Lista contratti con balances e meter status. |
| `PUT /contracts/{contractId}/display-name` | `PUT /me/contracts/{contract_id}/display-name` | ✅ | Etichetta contratto. Max 24 chars (v2 proponeva 100), rimuovi via `""`. |
| `GET /usage` | `POST /energy/usage/query` | ⚠️ | Endpoint presente ma **formato nested vs flat** (vedi Gap 1.1). |
| `GET /transactions` | `GET /contracts/{contract_id}/financial/transactions` | ✅ | Cronologia paginata con filtri (direction, status, date range). |
| `POST /payment/setup-intent` | `POST /payments/setup-intent` | ✅ | Crea Stripe SetupIntent. Response: `clientSecret` + `setupIntentId`. |
| `POST /payment/methods` | `POST /payments/methods` | ✅ | Salva PaymentMethod post-confirmation. |
| `GET /payment/methods` | `GET /payments/methods` | ✅ | Lista PaymentMethod salvati. |
| `DELETE /payment/methods/{id}` | `DELETE /payments/methods/{payment_method_id}` | ✅ | Elimina PaymentMethod. |
| `POST /recharge/intent` | `POST /financial/recharges` (idempotent) | ✅ | Crea ricarica new card/wallet. Payload: `items[]` + `preferredMethod` OR `paymentMethodId` (oneof). |
| `POST /recharge` | `POST /financial/recharges` (idempotent) | ✅ | Crea ricarica saved card (stesso endpoint, via `paymentMethodId`). |
| `POST /recharge/suggest` | `POST /financial/recharges/suggest` | ✅ | Suggerisci importi per giorni di copertura. |
| `POST /recharge/split` | `POST /financial/recharges/allocation` | ✅ | Alloca/splitta importo tra contratti. |
| `PUT /notifications/settings` | `PUT /me/notification/preferences` | ✅ | Modifica preferenze notifiche. |
| `POST /notifications/push-token` | `POST /me/push/devices` | ✅ | Registra dispositivo push. |
| `DELETE /notifications/push-token` | `DELETE /me/push/devices/{device_id}` | ✅ | Cancella dispositivo push. |
| `GET /notifications` | `GET /me/notifications` | ✅ | Lista notifiche. |
| `PUT /notifications/{id}/read` | `PUT /me/notifications/{notification_id}/read` | ✅ | Marca notifica letta. |
| `PUT /notifications/read-all` | `PUT /me/notifications/read-all` | ✅ | Marca tutte lette. |
| `GET /exports` | `GET /me/documents/receipts` + `GET /me/documents/invoices` | ✅ | Listing diviso ricevute vs fatture (gestibile via merge frontend). |
| `GET /exports/{id}/download` | `GET /me/documents/{type}/{id}/download` | ✅ | Download diviso per tipo. |
| `GET /company` | `GET /company` | ✅ | Info azienda (endpoint anonimo). |
| `GET /meters` | `GET /energy/electrical/meters` | ✅ | Lista meter con status. |
| `POST /meters/{contractId}/change` | `POST /energy/electrical/meters/status-change` (+ `/confirm`) | ✅ | Cambio stato meter. |
| `GET /me` | `GET /me` | ✅ | Profilo utente + anagrafica. |
| `PUT /me/profile` | `PUT /me/profile` | ✅ | Modifica profilo (parziale). Campi: firstName, lastName, email, phone, companyName. |
| `PUT /me/preferences` | `PUT /me/preferences` | ✅ | Modifica preferenze. Campi: themeId, culture. |
| — | `POST /auth/second-factor/verify` | ℹ️ | MFA verify (aggiunto in v3). |
| — | `POST /auth/refresh` | ℹ️ | Refresh token (aggiunto in v3). |
| — | `POST /auth/logout` | ℹ️ | Logout server-side (aggiunto in v3). |
| — | `GET /auth/session` | ℹ️ | Session introspection (aggiunto in v3). |
| — | `GET /me/financial/overview` | ℹ️ | Riepilogo finanziario customer (aggiunto in v3). |
| — | `GET /contracts/{contract_id}/financial/overview` | ℹ️ | Riepilogo finanziario per contratto (aggiunto in v3). |
| — | `GET /payments/configuration` | ℹ️ | Configurazione payment provider (aggiunto in v3). |
| — | `GET /payments/intents/{payment_intent_id}` | ℹ️ | Verifica stato PaymentIntent (aggiunto in v3). |
| — | `GET /me/notifications/summary` | ℹ️ | Riepilogo notifiche (aggiunto in v3). |
| — | `GET /me/identification/qr` | ℹ️ | QR customer (aggiunto in v3). |
| — | `POST /me/identification/qr/refresh` | ℹ️ | Rigenera QR customer (aggiunto in v3). |
| — | `GET /me/contracts/{contract_id}/identification/qr` | ℹ️ | QR contratto (aggiunto in v3). |
| — | `POST /me/contracts/{contract_id}/identification/qr/refresh` | ℹ️ | Rigenera QR contratto (aggiunto in v3). |
| `listElectricalTariffs`, `listElectricalTariffRates` (implicito v2) | — | ❌ **Gap 1.2** | Usato da `TariffDrawer.tsx`. Non nel matrix v3. |
| `listGasTariffs`, `setGasTariff`, `closeGasTariffs` (implicito v2) | — | ❌ **Gap 1.3** | UI frontend preparata ma zero endpoint gas nel matrix v3. |

---

## 1. Problematiche Identificate dal Report di Copertura

### 1.1 Usage Charts — Richiesta format semplice

**Situazione v3 (adesso):**
- Endpoint: `POST /api/v3/energy/usage/query`
- Ritorna dati nested:
```json
{
  "result": { "success": true },
  "series": [{
    "contractAgreementIds": ["agreement-1"],
    "metric": "USAGE_METRIC_CONSUMPTION",
    "granularity": "USAGE_GRANULARITY_DAILY",
    "points": [{
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
    }],
    "summary": {}
  }]
}
```

**Domande:**

1. **Metodo HTTP:** Per una query di lettura, non sarebbe meglio un **GET** (cacheable, RESTful)?

2. **Formato dati:** Qual è il motivo del nesting profondo? Non sarebbe più semplice tornare i dati flat direttamente, evitando trasformazioni nel frontend?
```json
[
  {
    "timestamp": "2026-08-23T00:00:00Z",
    "value": 55.8,
    "unit": "kWh"
  }
]
```

---

### 1.2 Contratti — Rate Details per Tariff Electrical

**Uso nell'app:**
- Dashboard → Contract card → Click → TariffDrawer
- Contracts View → Contract card → Click → TariffDrawer
- Recharge View → Contract selection → TariffDrawer

**Situazione attuale (v2):**
- Frontend chiama `listElectricalTariffRates(tariffId)` per ottenere:
  - Prezzo CHF/kWh
  - Validità (validFrom/validTo)
  - Quale rate è attivo

**Nella documentazione v3:**
- `GET /api/v3/contracts` fornisce i tariff summary: `tariffId`, `tariffName`, `validFromUtc`, `isCurrent`
- **MA non specifica dove ottenere i rate details** (prezzi, fasce orarie, ecc.)
- Per Gas c'è `dailyCost`, ma per Electrical no

**Dubbio:**
Dove otteniamo i rate details per electrical tariff in v3? Endpoint separato oppure inclusi da qualche parte?

---

### 1.3 Gas — Endpoint missing?

**Osservazione:** v3 spec include `GasAgreementSummary` nel modello (sezione 18.2), ma **zero endpoint gas** nel matrix (solo "Electrical" area).

Nel frontend:
- ✅ UI preparata: mostra "gas" nei filtri, ma nessun dato arriva dal backend

**Domanda per backend:**
- Sono previsti endpoint gas v3? Se sì: quando e quali?

---

### 1.4 Dashboard — Consumo odierno (Nice to Have)

**Idea:**
Sarebbe utile mostrare nella dashboard "Consumo odierno fino ad ora: X kWh" per dare al cliente visibilità immediata del trend giornaliero.

**Domanda:**
Se implementiamo questa feature, quali dati dovreste fornire nell'overview?

Opzioni:
- A) Niente: il frontend fa `POST /energy/usage/query` con `granularity=HOURLY` oggi + calcola la somma
- B) Aggiungere `todayConsumptionValue` direttamente in `AgreementUsageSummary`

---