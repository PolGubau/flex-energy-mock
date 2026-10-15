# Untrusted API v3 — Authentication

## 1. Flusso generale

```text
username/password
      |
      v
POST /auth/login
      |
      +--> sessione immediata
      |
      +--> challenge MFA
                |
                v
     POST /auth/second-factor/verify
                |
                v
             sessione
```

La sessione contiene access token e refresh token.

---

## 2. Login

### `POST /api/v3/auth/login`

**Bearer richiesto:** no  
**Content-Type:** `application/json`

### Request

| Campo | Tipo | Obbligatorio | Note |
|---|---|---:|---|
| `usernameOrEmail` | string | sì | username o indirizzo e-mail |
| `password` | string | sì | inviata solo tramite HTTPS |
| `context` | object | no | normalmente omesso dal client |

```json
{
  "usernameOrEmail": "mario.rossi@example.ch",
  "password": "<password>"
}
```

### Response — sessione immediata

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

### Response — secondo fattore richiesto

```json
{
  "result": {
    "success": true,
    "code": "<authentication-code>",
    "translationKey": "<authentication-translation-key>",
    "issues": []
  },
  "secondFactorRequired": true,
  "challengeId": "<opaque-challenge>",
  "secondFactorChannel": "OTP_CHANNEL_EMAIL"
}
```

Il client non deve considerare `challengeId` un access token.

---

## 3. Verify second factor

### `POST /api/v3/auth/second-factor/verify`

**Bearer richiesto:** no; la challenge è la credenziale temporanea del flusso MFA.

### Request

| Campo | Tipo | Obbligatorio |
|---|---|---:|
| `challengeId` | string | sì |
| `otpCode` | string | sì |

```json
{
  "challengeId": "<opaque-challenge>",
  "otpCode": "123456"
}
```

### Response

```json
{
  "result": {
    "success": true,
    "code": "<authentication-code>",
    "translationKey": "<authentication-translation-key>",
    "issues": []
  },
  "verified": true,
  "session": {
    "accessToken": "<access-token>",
    "refreshToken": "<refresh-token>",
    "accessTokenExpiresAtUtc": "2026-08-24T11:30:00Z",
    "culture": "it-CH",
    "passwordChangeRequired": false
  }
}
```

Non loggare OTP o challenge completa.

---

## 4. Refresh session

### `POST /api/v3/auth/refresh`

**Access Bearer:** non deve essere necessario quando l'access token è scaduto; il `refreshToken` è la credenziale della richiesta.

### Request

```json
{
  "refreshToken": "<refresh-token>"
}
```

### Response

```json
{
  "result": {
    "success": true,
    "code": "<authentication-code>",
    "translationKey": "<authentication-translation-key>",
    "issues": []
  },
  "session": {
    "accessToken": "<new-access-token>",
    "refreshToken": "<new-or-current-refresh-token>",
    "accessTokenExpiresAtUtc": "2026-08-24T12:30:00Z",
    "refreshTokenExpiresAtUtc": "2026-09-23T10:30:00Z",
    "culture": "it-CH",
    "passwordChangeRequired": false
  }
}
```

Il client deve sostituire i token locali con quelli restituiti dalla response.

---

## 5. Logout

### `POST /api/v3/auth/logout`

Il client dovrebbe inviare il Bearer corrente se ancora valido e può inviare il `refreshToken` nel body per consentire la revoca della sessione.

### Request

```json
{
  "refreshToken": "<refresh-token>"
}
```

Il campo è optional nel contratto.

### Response

```json
{
  "result": {
    "success": true,
    "code": "<authentication-code>",
    "translationKey": "<authentication-translation-key>",
    "issues": []
  }
}
```

Dopo il logout il client deve eliminare localmente access e refresh token.

---

## 6. Password recovery

### `POST /api/v3/auth/password/recovery`

**Bearer richiesto:** no.

### Request

```json
{
  "usernameOrEmail": "mario.rossi@example.ch"
}
```

### Response

```json
{
  "result": {
    "success": true,
    "code": "<authentication-code>",
    "translationKey": "<authentication-translation-key>",
    "issues": []
  },
  "accepted": true
}
```

La response è intenzionalmente **non enumerabile**: non deve confermare se l'account esiste.

---

## 7. Session profile

### `GET /api/v3/auth/session`

**Bearer richiesto:** sì.

### Response

```json
{
  "result": {
    "success": true,
    "code": "<operation-code>",
    "translationKey": "<translation-key>",
    "issues": []
  },
  "profile": {
    "subjectId": "<subject-id>",
    "email": "mario.rossi@example.ch",
    "culture": "it-CH",
    "passwordChangeRequired": false
  }
}
```

`subjectId` è un identificatore tecnico Identity e non deve essere usato al posto del `customerId` CRM.

---

## 8. Uso del Bearer

Per una richiesta protetta:

```http
GET /api/v3/me/overview HTTP/1.1
Host: <host>
Authorization: Bearer <access-token>
Accept: application/json
```

Non inserire token in:

- query string;
- path;
- local log;
- crash report;
- analytics event.

---

## 9. Gestione 401

Quando una richiesta protetta restituisce `401`:

1. se esiste un refresh token valido, tentare una singola operazione di refresh;
2. se il refresh riesce, ripetere la query originale se semanticamente sicura;
3. per comandi finanziari, rispettare l'idempotency key;
4. se il refresh fallisce, eliminare la sessione locale e richiedere un nuovo login.

Evitare loop automatici di refresh/retry.
