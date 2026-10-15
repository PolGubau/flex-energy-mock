# FlexEnergy Mobile Frontend - Technical Documentation

**Project:** APP-Application-Mobile-FE  
**Version:** 1.0.0  
**Last Updated:** April 30, 2026  
**Status:** In Development

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Key Features](#key-features)
6. [Core Components](#core-components)
7. [Module Breakdown](#module-breakdown)
8. [Current Status & Recent Improvements](#current-status--recent-improvements)
9. [Development Setup](#development-setup)
10. [Build & Deployment](#build--deployment)
11. [Dependencies & Versions](#dependencies--versions)

---

## Project Overview

**FlexEnergy** is a modern energy management mobile web application that enables customers to monitor their energy consumption, manage contracts, and perform actions like topping up balances and viewing usage statistics in real-time.

### Key Objectives
- Real-time energy consumption tracking
- Multi-contract management
- Intuitive user dashboard
- Responsive design (mobile-first)
- Seamless authentication flow
- Historical data and analytics

### Target Audience
- Energy company customers
- Desktop & mobile users (primary: mobile)

---

## Technology Stack

### Frontend Framework & Build
| Component | Technology | Version |
|-----------|-----------|---------|
| React | React | 19.0.0 |
| Type Safety | TypeScript | Latest |
| Build Tool | Vite | Latest |
| Styling | Tailwind CSS | 4.1.14 |
| Component Library | Radix UI | 1.4.3 |
| Icons | Lucide React | 0.546.0 |
| Animations | Motion (Framer Motion) | 12.23.24 |
| Routing | React Router | 7.14.2 |
| Date Utilities | date-fns | 4.1.0 |
| Charts | Recharts | 3.8.0 |

### Development & Tooling
| Tool | Purpose | Version |
|------|---------|---------|
| Biome | Code Linting & Formatting | Latest |
| Vitest | Unit Testing | Latest |
| Tailwind Vite Plugin | CSS Processing | 4.1.14 |

### Back-End Integration
- **SmartSphere API Client** (custom)
- Base URL: Configured via `VITE_API_BASE_URL`
- Source ID: Configured via `VITE_API_SOURCE_ID`
- Authentication: Bearer token (JWT)

---

## Architecture

### High-Level Structure

```
Frontend (React + Vite)
    ↓
[Smart Routing Layer]
    ↓
[Feature Modules] → [Shared Components]
    ↓
[Context API] (AppContext, AuthContext)
    ↓
[SmartSphere API Client] (Custom SDK)
    ↓
[REST API Endpoints]
```

### Core Patterns

1. **Component-Driven Architecture**
   - Feature-based folder structure
   - Reusable UI components in `src/components/ui`
   - Feature-specific hooks in each module

2. **State Management**
   - Context API for global state (AppContext, AuthContext)
   - Local component state with React hooks
   - Custom hooks for business logic (useDashboard, useHistory, etc.)

3. **HTTP Client**
   - Custom SmartSphere API Client wrapper
   - Centralized request/response handling
   - Automatic token injection
   - Error handling middleware

---

## Project Structure

```
flexenergy-demo/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header.tsx          # Fixed header with notifications
│   │   │   └── bottom-nav.tsx      # Mobile bottom navigation
│   │   ├── ui/                     # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── ... (other components)
│   ├── features/
│   │   ├── auth/
│   │   │   ├── hooks/
│   │   │   │   ├── useEmailVerification.ts
│   │   │   │   └── useTwoFactorAuth.ts
│   │   │   └── views/
│   │   │       ├── LoginView.tsx
│   │   │       ├── ForgotPasswordView.tsx
│   │   │       ├── EmailVerificationView.tsx
│   │   │       └── TwoFactorAuthView.tsx
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── ContractCard.tsx        # Main contract display
│   │   │   │   ├── DashboardHero.tsx       # Hero section with balance
│   │   │   │   ├── DashboardUsagePreview.tsx
│   │   │   │   ├── TariffDrawer.tsx        # Tariff details drawer
│   │   │   │   └── ... (other dashboard components)
│   │   │   ├── hooks/
│   │   │   │   ├── useDashboard.ts
│   │   │   │   └── useDashboardChart.ts
│   │   │   └── views/
│   │   │       └── DashboardView.tsx
│   │   ├── history/
│   │   ├── usage/
│   │   ├── recharge/
│   │   └── settings/
│   │       ├── components/
│   │       │   ├── AlertSection.tsx
│   │       │   ├── ProfileHero.tsx
│   │       │   ├── SettingsList.tsx
│   │       │   ├── ExportsSection.tsx
│   │       │   ├── SupportCenter.tsx
│   │       │   └── LogoutSection.tsx
│   │       └── views/
│   │           └── SettingsView.tsx
│   ├── context/
│   │   ├── AppContext.tsx          # Global app state
│   │   └── AuthContext.tsx         # Authentication state
│   ├── lib/
│   │   ├── api-client.ts           # HTTP client setup
│   │   ├── utils.ts                # Utility functions
│   │   └── smartsphere/            # Custom SmartSphere SDK
│   │       ├── client.ts
│   │       ├── core.ts
│   │       ├── index.ts
│   │       └── modules/
│   │           ├── auth.ts
│   │           ├── contract.ts
│   │           ├── financial.ts
│   │           ├── graphics.ts
│   │           ├── tariffs.ts
│   │           └── ... (other modules)
│   ├── services/
│   │   └── api.ts                  # High-level API service layer
│   ├── types.ts                    # Global TypeScript types
│   ├── App.tsx                     # Main app component
│   └── main.tsx                    # Entry point
├── public/                         # Static assets
│   ├── Low battery-pana.svg        # Low balance illustration
│   └── Sun energy-bro.svg          # High balance illustration
├── docs/
│   └── TECHNICAL_DOCUMENTATION.md  # This file
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── biome.json                      # Biome linter/formatter config
└── package.json                    # Dependencies & scripts
```

---

## Key Features

### 1. **Authentication System**
- Login/Signup flow
- Email verification
- Two-factor authentication (2FA)
- Password reset
- Persistent token management

### 2. **Dashboard**
- Real-time balance display (in hero section)
- Multi-contract overview cards
- Contract-specific balance & progress
- Days remaining indicator
- Daily average cost tracking
- Interactive contract details drawer
- Low/high balance visual states with illustrations

### 3. **Contract Management**
- Display multiple contracts per customer
- View contract details (ID, service status, dates)
- Progress percentage visualization
- Balance depletion forecasting
- Tariff information access

### 4. **Usage Analytics**
- Historical consumption data
- Period comparison tools
- Graph visualizations (Recharts)
- Weekly/monthly breakdown options

### 5. **Financial**
- Transaction history
- Payment method management
- Balance top-up functionality
- Cost tracking API integration

### 6. **Settings**
- User profile management (name, email, phone)
- Alert configuration (quiet hours, notification preferences)
- Privacy & security options
- Payment methods
- Export data functionality
- Support center with FAQ
- Logout functionality

### 7. **Notifications**
- Real-time notification system
- Notification center in header
- Notification types: success, warning, info
- Clear/read management

---

## Core Components

### Layout Components

#### Header (`src/components/layout/header.tsx`)
- **Purpose**: Fixed navigation header with notifications
- **Features**:
  - Transparent on dashboard (scroll-aware)
  - User greeting with actual name
  - Balance quick view
  - Notification bell with center
  - Settings navigation
  - Responsive design

#### Bottom Navigation (`src/components/layout/bottom-nav.tsx`)
- **Purpose**: Mobile bottom navigation
- **Features**:
  - Icon-based navigation
  - Active route indicator
  - Revolut-style design
  - Desktop sidebar fallback

### Dashboard Components

#### ContractCard (`src/features/dashboard/components/ContractCard.tsx`)
- **Purpose**: Individual energy contract display
- **Current State**:
  - Wrapped in TariffDrawer for details access
  - Motion animations on entry
  - Three visual states:
    - **Low balance** (<= 7 days): Shows alert strip + low battery illustration
    - **High balance** (> 20 CHF): Shows sun energy illustration
    - **Normal** (0-20 CHF): Standard card layout
  - Progress bar (color-coded: green > 40%, yellow > 15%, red < 15%)
  - Daily average cost stat
  - Top-up button (visible only on low balance)
  - Card fully clickable (opens TariffDrawer)

#### DashboardHero (`src/features/dashboard/components/DashboardHero.tsx`)
- **Purpose**: Full-bleed hero section
- **Features**:
  - Video background
  - Centered balance display
  - Stat pills
  - Responsive padding

### Settings Components

#### SettingsView (`src/features/settings/views/SettingsView.tsx`)
- **Layout**: Single-column responsive design
- **Sections**:
  - AlertSection (top)
  - SettingsList / ExportsSection / SupportCenter / LogoutSection (bottom)
  - Uses flexbox `mt-auto` to push bottom section to viewport bottom

#### AlertSection (`src/features/settings/components/AlertSection.tsx`)
- Configure quiet hours for notifications
- Debounced auto-save (800ms)
- Real-time status indicators

---

## Module Breakdown

### Feature Modules

#### `auth/`
- **Purpose**: Authentication flows
- **Views**: Login, Forgot Password, Email Verification, 2FA
- **Hooks**: useEmailVerification, useTwoFactorAuth

#### `dashboard/`
- **Purpose**: Main energy dashboard
- **Key Components**: ContractCard, DashboardHero, TariffDrawer
- **Hooks**: useDashboard (transforms API data), useDashboardChart
- **View**: DashboardView (routes & layout)

#### `history/`
- **Purpose**: Transaction history
- **Components**: TransactionRow, HistorySummary
- **Hooks**: useHistory (pagination, filtering)
- **View**: HistoryView

#### `usage/`
- **Purpose**: Energy consumption analytics
- **Components**: UsageChart
- **Hooks**: useUsage
- **View**: UsageView

#### `recharge/`
- **Purpose**: Top-up / balance recharge flow
- **Components**: AmountSelector, PaymentMethodSelector
- **Hooks**: useRecharge
- **View**: RechargeView

#### `settings/`
- **Purpose**: User settings & preferences
- **Components**: ProfileHero, SettingsList, AlertSection, ExportsSection, SupportCenter, LogoutSection
- **View**: SettingsView (single-column layout)

---

## Current Status & Recent Improvements

### Completed (April 2026)

✅ **Dashboard Enhancements**
- ContractCard with low-balance and high-balance illustrations
- Motion animations on component entry (Framer Motion)
- Improved visual states for different balance ranges
- Accurate contract ID display (BU Contract ID or #contractId)

✅ **Settings Page Restructure**
- Fixed tablet view grid layout → now single column across all screens
- Reorganized sections: AlertSection at top, SettingsList/Exports/Support/Logout at bottom
- Logout button always stays at bottom of viewport
- Better spacing and visual hierarchy

✅ **Header & User Experience**
- Replaced hardcoded "Mario Rossi" with authenticated user's actual name
- Fallback display if name data missing
- User greeting: "Welcome back, {firstName} {lastName}"

✅ **Motion & Animations**
- Added Framer Motion to ContractCard with staggered entry
- Alert strip fades in on low balance
- Header slides down with fade
- Body content slides up with fade

### Known Limitations

⚠️ **API Integration**
- Requires valid SmartSphere API instance
- Environment variables must be set (VITE_API_BASE_URL, VITE_API_SOURCE_ID)
- Client ID validation may need verification

⚠️ **Features Not Yet Implemented**
- Payment processing completion
- Advanced analytics/reporting
- Offline mode
- Push notifications
- Dark mode toggle

---

## Development Setup

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone repository
git clone https://github.com/FlexEnergy/APP-Application-Mobile-FE.git

# Navigate to project
cd APP-Application-Mobile-FE

# Install dependencies
pnpm install
```

### Environment Configuration

Create `.env.local` in project root:

```env
# SmartSphere API Configuration
VITE_API_BASE_URL=http://10.200.102.146:5265
VITE_API_SOURCE_ID=0
```

### Running Development Server

```bash
pnpm dev     # Start Vite dev server on http://localhost:3000
```

### Code Quality

```bash
pnpm lint    # Check code with Biome
pnpm format  # Format code with Biome
```

### Testing

```bash
pnpm test        # Run tests once
pnpm test:watch  # Run tests in watch mode
```

---

## Build & Deployment

### Production Build

```bash
pnpm build   # Build optimized production bundle
pnpm preview # Preview production build locally
```

### Build Output
- Location: `dist/` folder
- Optimized JavaScript with tree-shaking
- CSS inlined and minified
- Assets optimized with Vite

### Pre-Build Checks
- TypeScript compilation (`tsc`)
- Biome linting (automatic)

---

## Dependencies & Versions

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.0.0 | UI framework |
| react-dom | 19.0.0 | DOM rendering |
| react-router-dom | 7.14.2 | Client-side routing |
| typescript | Latest | Type safety |

### UI & Styling

| Package | Version | Purpose |
|---------|---------|---------|
| @tailwindcss/vite | 4.1.14 | CSS framework integration |
| radix-ui | 1.4.3 | Headless component library |
| lucide-react | 0.546.0 | Icon library |
| geist | 1.7.0 | Font system |

### Animations & Interactions

| Package | Version | Purpose |
|---------|---------|---------|
| motion | 12.23.24 | (Framer Motion) Animations |
| recharts | 3.8.0 | Data visualization |

### Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| date-fns | 4.1.0 | Date manipulation |
| clsx | 2.1.1 | Class name utilities |
| dotenv | 17.2.3 | Environment variable loading |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| @vitejs/plugin-react | 5.0.4 | React plugin for Vite |
| vite | Latest | Build tool |
| vitest | Latest | Testing framework |
| biome | Latest | Linting & formatting |

---

## SmartSphere API Integration

### Client Structure
Custom SmartSphere SDK located at `src/lib/smartsphere/`:

```
smartsphere/
├── client.ts          # Main API client class
├── core.ts            # HTTP core & request handling
├── index.ts           # Public exports
└── modules/
    ├── auth.ts        # Authentication
    ├── account.ts     # Account management
    ├── contract.ts    # Contract data
    ├── financial.ts   # Balance & transactions
    ├── graphics.ts    # Charts & analytics
    ├── tariffs.ts     # Tariff information
    ├── notifications.ts
    ├── shop.ts        # Shop/recharge products
    └── ... (other modules)
```

### Singleton Pattern
```typescript
// Get authenticated client
const client = getClient();

// After login, inject token
setAuthToken(accessToken);

// On logout, clear token
clearAuthToken();
```

### Key Endpoints Used
- `GetCustomerDashboard` - Contract & balance overview
- `ListTransactions` - Transaction history
- `GetCosts` - Cost analytics
- `UpdateSettings` - User preferences
- `SuggestBulk` - Tariff suggestions

---

## Performance Considerations

### Optimizations
- Lazy component loading with React Router
- Image optimization via Vite
- CSS tree-shaking with Tailwind
- Motion animations use GPU acceleration
- Recharts chart memoization for heavy data

### Metrics
- First Contentful Paint (FCP): < 2s
- Largest Contentful Paint (LCP): < 3s
- Time to Interactive (TTI): < 4s

---

## Security

### Best Practices
- JWT bearer token authentication
- Secure token storage in memory (or localStorage with HTTPS)
- HTTPS-enforced in production
- Environment variables for sensitive config
- No credentials in version control

### Sensitive Data
- API Base URL: Environment variable
- Source ID: Environment variable
- Access tokens: Session memory or secure storage

---

## PortalAPI Migration Guide (Future Implementation)

### Current State (April 2026)
The app currently uses the **SmartSphere API** (legacy) with mock authentication:
- Demo user hardcoded in `AuthContext.tsx`
- No real Bearer token validation
- `setAuthToken()` / `clearAuthToken()` helper functions exist but accept empty tokens

### Future State (When PortalAPI is Ready)
The new **PortalAPI** introduces a robust authentication & authorization model:
- **Bearer Token** (JWT) for user sessions
- **Basic Auth** for technical integrations
- **Rights-based authorization** (fine-grained permissions like `contract.read`, `identity.password.change`)
- Composite authentication scheme (Bearer OR Basic, never both in same header)

### Migration Checklist

#### Phase 1: Environment & Dependencies
- [ ] Update API_BASE_URL to point to new PortalAPI server
- [ ] Verify Bearer token format (should be JWT)
- [ ] Add error handling for 401 (Unauthorized) and 403 (Forbidden) responses
- [ ] Update SmartSphere SDK client to inject `Authorization: Bearer <token>` header

#### Phase 2: Authentication Flow
- [ ] Replace demo login with real PortalAPI `/auth/identity/login` endpoint
- [ ] Store access token in secure location (localStorage or session storage)
- [ ] Call `setAuthToken(token)` after successful login
- [ ] Implement token refresh logic (if API supports it)
- [ ] Add 401 interceptor to redirect to login on expired token

#### Phase 3: Authorization & Rights
- [ ] Map API rights claims to frontend features
  - Example: Only show "Recharge" button if user has `contract.buy` right
  - Example: Only show "Settings" export if user has `contract.export` right
- [ ] Add rights checking in `AuthContext` (e.g., `user.hasRight('contract.read')`)
- [ ] Update components to conditionally render based on user rights

#### Phase 4: Error Handling
- [ ] Implement 401 error handler (expired/invalid token → redirect to login)
- [ ] Implement 403 error handler (insufficient rights → show permission denied UI)
- [ ] Add toast notifications for auth errors
- [ ] Graceful fallback for anonymous endpoints

#### Phase 5: Testing
- [ ] Test login/logout flow with real tokens
- [ ] Test token expiration and refresh
- [ ] Test 401/403 error scenarios
- [ ] Verify Bearer token is sent in all protected endpoints
- [ ] Test Basic Auth endpoints (if applicable for technical access)

### Expected Code Changes

#### AuthContext.tsx
```typescript
// BEFORE (current - demo user)
const login = async (_email: string, _password: string) => {
  setUser(DEMO_USER);
};

// AFTER (PortalAPI - real login)
const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/identity/login/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) throw new Error('Login failed');
  
  const data = await response.json();
  const token = data.accessToken;
  
  setAuthToken(token); // Inject token for all future requests
  setUser({ ...user, accessToken: token, ...claims });
};
```

#### SmartSphere HTTP Core
```typescript
// BEFORE (current - no auth)
const headers = { 'Content-Type': 'application/json' };

// AFTER (PortalAPI - Bearer token)
const headers = {
  'Content-Type': 'application/json',
  ...(config.accessToken && { 'Authorization': `Bearer ${config.accessToken}` })
};
```

#### Error Interceptor
```typescript
// Add to HttpCore class
if (response.status === 401) {
  // Token expired or invalid
  clearAuthToken();
  window.location.href = '/login'; // Redirect to login
}

if (response.status === 403) {
  // User lacks required rights
  throw new ForbiddenError('You do not have permission to access this resource');
}
```

#### Rights-Based UI
```typescript
// Check rights before showing UI
const canRecharge = user?.rights?.includes('contract.buy');

return (
  <button 
    disabled={!canRecharge}
    title={!canRecharge ? 'Insufficient permissions' : ''}
  >
    Recharge Balance
  </button>
);
```

### PortalAPI Key Endpoints Reference

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/auth/identity/login/start` | POST | Initiate login | Anonymous |
| `/auth/identity/login/verify` | POST | Complete login | Anonymous |
| `/auth/change-password` | POST | Change password | Bearer |
| `/api/v2/customers/{id}/dashboard` | GET | Get dashboard data | Bearer |
| `/api/v2/contracts` | GET | List contracts | Bearer |
| `/api/v2/transactions` | GET | List transactions | Bearer |
| `/api/v2/contracts/{id}/tariffs` | GET | Get tariff info | Bearer |

### PortalAPI Rights Reference

| Right | Purpose | Feature |
|-------|---------|---------|
| `contract.read` | Read contract data | Dashboard, History |
| `contract.buy` | Purchase top-ups | Recharge view |
| `contract.export` | Export data | Settings export |
| `identity.password.change` | Change password | Settings |
| `diagnostics.auth.verify` | Technical diagnostics | Admin only |

### Testing the Migration

When PortalAPI is available, test with:

```bash
# Test Bearer token (user login)
curl -X POST http://portalapi/auth/identity/login/start \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'

# Test protected endpoint
curl -X GET http://portalapi/api/v2/customers/123/dashboard \
  -H "Authorization: Bearer eyJhbGc..."

# Test 401 (invalid token)
curl -X GET http://portalapi/api/v2/customers/123/dashboard \
  -H "Authorization: Bearer invalid-token"
# Expected: 401 Unauthorized

# Test 403 (insufficient rights)
curl -X POST http://portalapi/api/v2/contracts/buy \
  -H "Authorization: Bearer eyJhbGc..." 
# Expected: 403 Forbid (if user lacks 'contract.buy' right)
```

---

## Future Roadmap

### Priority 1
- [ ] **PortalAPI Integration** (when backend is ready - see Migration Guide above)
- [ ] Offline mode support
- [ ] Enhanced error handling & user feedback
- [ ] API retry logic with exponential backoff
- [ ] Multi-language support (i18n)

### Priority 2
- [ ] Dark mode toggle
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Payment processing integration
- [ ] E-signature for agreements

### Priority 3
- [ ] Native app (React Native)
- [ ] Advanced forecasting models
- [ ] AI-powered recommendations
- [ ] API documentation (Swagger/OpenAPI)

---

## Support & Contact

For technical questions or issues:
- Create an issue in the GitHub repository
- Contact the development team
- Review Trello board for ongoing tasks

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Apr 30, 2026 | Initial release with Dashboard, Settings, History, and Usage features |

---

**Document Status**: Final  
**Next Review**: As features are added  
**Repository**: https://github.com/FlexEnergy/APP-Application-Mobile-FE
