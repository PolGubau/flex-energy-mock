# Untrusted API v3 — Receipt, Invoice e download PDF

## 1. Obiettivo di sicurezza

L'app customer non riceve un endpoint generico nel quale possa scegliere liberamente `DocumentType` e `DocumentFormat`.

La route determina il documento ammesso:

```text
receipts -> DOCUMENT_TYPE_RECEIPT + DOCUMENT_FORMAT_PDF
invoices -> DOCUMENT_TYPE_INVOICE + DOCUMENT_FORMAT_PDF
```

L'identità del customer deriva dal Bearer.

## 2. Listing Receipt

### `GET /api/v3/me/documents/receipts`

Query parameters:

| Parametro | Tipo | Obbligatorio | Note |
|---|---|---:|---|
| `pageSize` | int32 | no | dimensione pagina |
| `pageToken` | string | no | cursor opaco |
| `dateFromUtc` | RFC3339 | no | data minima |
| `dateToUtc` | RFC3339 | no | data massima |
| `sortDesc` | boolean | no | default: newest first |

Il server fissa tipo e formato. Il client non invia `documentType` o `format`.

Response:

```json
{
  "result": {
    "success": true,
    "code": "<operation-code>",
    "translationKey": "<translation-key>",
    "issues": []
  },
  "receipts": [
    {
      "documentId": "doc-123",
      "fileName": "receipt-123.pdf",
      "contentType": "application/pdf",
      "sizeBytes": "84231",
      "format": "DOCUMENT_FORMAT_PDF",
      "createdAtUtc": "2026-08-24T09:15:00Z",
      "documentType": "DOCUMENT_TYPE_RECEIPT"
    }
  ],
  "nextPageToken": "opaque-next-token",
  "totalCount": "14"
}
```

## 3. Listing Invoice

### `GET /api/v3/me/documents/invoices`

Stessi parametri del listing Receipt.

Response analoga, con:

```text
documentType = DOCUMENT_TYPE_INVOICE
format       = DOCUMENT_FORMAT_PDF
```

## 4. Download Receipt

### `GET /api/v3/me/documents/receipts/{document_id}/download`

**Tipo:** REST nativo.  
**Bearer:** sì.  
**Response body:** binario PDF.  
**Content-Type:** `application/pdf`.

Esempio:

```http
GET /api/v3/me/documents/receipts/doc-123/download HTTP/1.1
Host: <host>
Authorization: Bearer <access-token>
Accept: application/pdf
```

La response non è JSON e non contiene Base64.

## 5. Download Invoice

### `GET /api/v3/me/documents/invoices/{document_id}/download`

Stesso comportamento del download Receipt, ma il server ammette esclusivamente Invoice PDF appartenenti al customer.

## 6. Controlli server-side

Receipt:

```text
document_id == requested
AND owner == authenticated customer
AND document_type == RECEIPT
AND format == PDF
```

Invoice:

```text
document_id == requested
AND owner == authenticated customer
AND document_type == INVOICE
AND format == PDF
```

## 7. Anti-enumeration

Documento:

- inesistente;
- di un altro customer;
- del tipo errato;
- del formato errato;

deve essere trattato in modo indistinguibile dal punto di vista del consumer, preferibilmente come `404`.

## 8. Perché non usare JSON transcoding per il PDF

Il servizio interno `DocumentContentService` usa server streaming gRPC. La Untrusted API apre lo stream e copia direttamente i bytes nella response HTTP.

Vantaggi:

- nessun overhead Base64;
- nessun JSON inutile;
- streaming naturale;
- migliore gestione file grandi;
- `Content-Type` corretto;
- minore memoria richiesta.

## 9. Generic export

`GET /api/v3/exports` è una capability generica/privilegiata. Non deve essere usata dall'app customer standard e non sostituisce i listing tipizzati Receipt/Invoice.
