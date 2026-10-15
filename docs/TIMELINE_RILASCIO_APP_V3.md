# Timeline Rilascio FlexEnergy App v3
## Integrazione API v3 → Delivery Finale

**Deadline finale:** 1 Ottobre 2026  
**Data corrente:** 26 Agosto 2026  
**Giorni disponibili:** 36 giorni (~5 settimane)

---

## ⚠️ NOTA CRITICA

**Le tempistiche del frontend (Fase 2-8) partono DA QUANDO l'API v3 verrà consegnata dal backend team.**

- **Fase 1** (API Delivery) = **Responsabilità Backend**
- **Fase 2-8** (Frontend Integration, Testing, Deploy) = **Nostra timeline**

Se l'API v3 ritarda, TUTTA la timeline slitterà di conseguenza. 

---

## 📋 Fasi Principali

| Fase | Giorni da API | Inizio | Fine | Durata | Status | Dipendenze |
|---|---|---|---|---|---|---|
| **0. API v3 Delivery** | — | — | — | ?? | ⏳ BACKEND | — |
| **1. Integrazione Backend** | Giorno 1-4 | Giorno 1 | Giorno 4 | 4 gg | — | Fase 0 ✓ |
| **2. Raffinamento Grafica** | Giorno 1-3 | Giorno 1 | Giorno 3 | 3 gg | — | Parallelo a Fase 1 |
| **2b. Adattamenti API** | Giorno 5-7 | Giorno 5 | Giorno 7 | 2 gg | — | Fase 1 ✓ (if needed) |
| **3. Prototipo + Testing** | Giorno 7-14 | Giorno 7 | Giorno 14 | 7 gg | — | Fase 1 ✓ + Fase 2 ✓ |
| **4. Approvazione Cliente** | Giorno 14-16 | Giorno 14 | Giorno 16 | 2 gg | — | Fase 3 ✓ |
| **5. React Native Migration** | Giorno 16-23 | Giorno 16 | Giorno 23 | 7 gg | — | Fase 4 ✓ |
| **6. Testing RN + Bug Fix** | Giorno 23-26 | Giorno 23 | Giorno 26 | 3 gg | — | Fase 5 ✓ |
| **7. Build Finale + Deploy** | Giorno 26-31 | Giorno 26 | Giorno 31 | 2 gg | — | Fase 6 ✓ |

**Total: 31 giorni DA API DELIVERY → 1 Ottobre deadline**
**Legenda:** "Giorno 1" = primo giorno dopo consegna API v3 ✓

---

## 🔴 Fase 1: API v3 Delivery (BACKEND TEAM)

**Responsabile:** Backend Team  
**Durata:** ?? (TBD dal backend team)  
**Output:** Specifica v3 completa + endpoint live (staging/production)


### Backend Team deve fornire:
- [ ] Documentazione API v3 finalizzata e validata
- [ ] Endpoint raggiungibili in staging (almeno)
- [ ] Authentication/refresh token funzionanti
- [ ] Nessun cambi major dopo consegna


| Scenario | API Delivery | Fase 2 Start | Impact |
|---|---|---|---|
| ✅ On time | 10 Set | 11 Set | Abbiamo 21 giorni per Fase 2-8 (tight ma feasible) |
| ⚠️ +3 giorni | 13 Set | 14 Set | Abbiamo 18 giorni (rischio alto!) |
| 🔴 +7 giorni | 17 Set | 18 Set | Impossibile! Deploy slitterebbe a metà Ott |

---

## 🟡 Fase 2: Integrazione Backend (2 Set - 6 Set)

**Responsabile:** Frontend Team  
**Durata:** 4 giorni  
**Dipendenza:** API v3 ✓

### Attività (Compressed)
1. **Aggiorna API client** (giorno 1)
   - Update SmartSphere client library
   - Adatta endpoint v2 → v3 (mapping rapido)
   - Focus su 38 endpoint covered (ignora Gap 1.2/1.3)

2. **Refactor services + hooks** (giorni 2-3)
   - Aggiorna `src/services/api.ts`
   - Adatta hook principali (useAuth, useDashboard, useHistory)
   - Workaround/mock per Gap 1.1 (usage nested format)

3. **Quick integration test** (giorno 4)
   - E2E smoke test principale flow
   - Valida token/auth
   - Check data format

### ⚠️ NOTA: Cambi API Durante Implementazione
**Rischio reale:** L'API v3 potrebbe avere modifiche/bug durante l'implementazione che richiedono correzioni lato frontend.

**Scenario contingency:** Fase 2b "Adattamenti API" (2 giorni)
- Se durante Fase 4 (Testing) scopriamo che endpoint v3 ha comportamenti inattesi
- Oppure if v3 payload cambia rispetto alla documentazione
- O se authentication/refresh token ha issue

**Mitigazione:**
- ✅ Pre-testing API con mock data (Fase 2)
- ✅ Tester dedicato verifica v3 live prima Fase 4
- ✅ Buffer 2gg in timeline per adattamenti

### Deliverables
- ✅ Integrazione backend 100%
- ✅ Componenti aggiornati e testati
- ✅ Fallback per Gap 1.2/1.3

---

## 🟡 Fase 2b: Adattamenti API (SE NECESSARI) (6 Set - 8 Set)

**Responsabile:** Frontend Team  
**Durata:** 2 giorni (contingency only)  
**Trigger:** Se Fase 2 scopre discrepanze API

### Attività
- Fix payload format non attesi
- Adatta error handling per nuovi status code
- Verifica auth flow se cambiato
- Re-test integrazione

### Success Criteria
- ✅ Tutti gli endpoint v3 funzionano come documentati
- ✅ Nessuna sorpresa in Fase 4

---

## 🟡 Fase 3: Raffinamento Grafica (2 Set - 5 Set)

**Responsabile:** Design + Frontend Team  
**Durata:** 3 giorni  
**Parallelo:** Sì, con Fase 2

### Attività (Compressed)
1. **Polish & Refinement** (giorni 1-2)
   - CSS/tailwind cleanup
   - Responsive check (mobile/tablet)
   - Accessibility pass (WCAG AA)

2. **Visual testing** (giorno 3)
   - Screenshot spot check
   - Browser testing rapido 

### Deliverables
- ✅ UI raffinata e responsive
- ✅ Nessun bug visivo critico
- ✅ Performance baseline OK

---

## 🟢 Fase 3: Testing Finale Prototipo (Giorno 7-14)

**Responsabile:** QA + Frontend  
**Durata:** 7 giorni  
**Dipendenza:** Fase 1 ✓ + Fase 2 ✓

### Attività
1. **UAT (User Acceptance Testing)** (giorni 1-5)
   - ✅ Test tutti gli endpoint v3
   - ✅ Verifica flusso login/auth
   - ✅ Test charts/dashboard (Gap 1.1 format nested)
   - ✅ Test payments, recharge, notifications
   - ✅ Test offline behavior (PWA)
   - ✅ Performance test (4G, mobile)

2. **Bug triage & fix** (giorni 6-7)
   - P0 (blocker) → fix immediato
   - P1 (major) → plan per Fase 6
   - P2 (minor) → post-launch

### Deliverables
- ✅ Prototipo stabile + testato completamente
- ✅ Test report con risultati
- ✅ Nessun P0 bug aperto
- ✅ Ready per approvazione cliente

---

## 🟢 Fase 4: Approvazione Cliente (Giorno 14-16)

**Responsabile:** PM + Cliente  
**Durata:** 2 giorni  
**Dipendenza:** Fase 3 ✓

### Che cosa succede?
1. **Giorno 14:** Demo prototipo al cliente
   - Presentazione live app web
   - Demo tutte feature nuove
   - Raccolta feedback

2. **Giorno 15-16:** Valutazione + Go/No-Go
   - Cliente testa in autonomia (se richiesto)
   - Raccolta feedback finali
   - **Green light** per migrazione React Native

### Success Criteria
- ✅ Cliente approva prototipo
- ✅ Go per Fase 5 (React Native)

---

## 🟠 Fase 5: React Native Migration (Giorno 16-23)

**Responsabile:** Frontend Team (RN specialist)  
**Durata:** 7 giorni  
**Dipendenza:** Fase 4 ✓

### Attività
1. **Setup RN project** (giorni 1-2)
   - Init React Native (Expo o bare)
   - Configure build pipeline (iOS + Android)
   - Setup CI/CD

2. **Port componenti core** (giorni 3-5)
   - Porta layout base, navigation
   - Porta UI components (button, input, card, etc.)
   - Porta hook e context (auth, API client)

3. **Integrazione API** (giorni 6-7)
   - Verifica API client su RN
   - Adatta per AsyncStorage/SecureStore
   - Test geolocation, notifiche push

### Deliverables
- ✅ App RN completamente funzionante
- ✅ Tutti gli endpoint v3 accessibili
- ✅ APK + IPA buildabili

---

## 🔴 Fase 6: Testing RN + Bug Fix (Giorno 23-26)

**Responsabile:** QA + Frontend  
**Durata:** 3 giorni  
**Dipendenza:** Fase 5 ✓

### Attività
1. **Functional testing** (giorni 1-2)
   - Test tutti gli endpoint su device reali
   - Verifica offline behavior
   - Test push notification
   - Test deep linking

2. **Performance + Stability** (giorni 2-3)
   - Memory leaks detection
   - Battery drain test
   - Crash reporting setup

### Success Criteria
- ✅ Nessun P0 bug
- ✅ App stabile su iOS + Android

---

## 🟢 Fase 7: Build Finale + Deploy (Giorno 26-31)

**Responsabile:** DevOps + Frontend  
**Durata:** 2 giorni  
**Dipendenza:** Fase 6 ✓

### Attività
1. **Production build** (giorno 1)
   - Compile APK + IPA con signature production
   - Versioning (es. v1.0.0)
   - Generate release notes

2. **Store submission + Deploy** (giorno 2)
   - Upload su App Store + Google Play
   - Setup TestFlight (per iOS beta)
   - Deploy backend migration (se necessaria)

### Success Criteria
- ✅ App live su App Store
- ✅ App live su Google Play
- ✅ Deployment completato

---


**Preparato da:** Francesco Fabrissin  
**Data:** 26 Agosto 2026  
**Status:** READY FOR PM REVIEW

