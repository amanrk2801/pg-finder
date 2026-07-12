# PG Finder

A full-stack **PG (Paying Guest) accommodation platform** — a React Native (Expo) mobile app backed by a Node.js/Express + MongoDB REST API. It covers the complete lifecycle: discovering PGs on a map, booking a bed, paying rent, viewing mess menus, raising issues, and managing properties as an owner — with a superadmin overseeing the whole platform.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [App Roles & Flows](#app-roles--flows)
- [API Overview](#api-overview)
- [Architecture](#architecture)
- [Scripts](#scripts)
- [Roadmap](#roadmap)
- [License](#license)

---

## Features

### For Tenants (Users)
- Browse PG listings with search, filters, and an interactive **map view** (price markers with a home icon; tap a marker for a callout card with **Book Now** directly on the map)
- PG details with image gallery, facilities, safety measures, and reviews
- **Book a bed** with a Razorpay-style checkout (simulated in Expo Go); duplicate bookings for the same PG are blocked both client- and server-side
- **My PG dashboard** — rent status (paid / due / overdue), next due date, today's mess menu, quick actions (pay rent, raise issue, leave PG)
- **Weekly mess menu** — 7 days × breakfast/lunch/dinner, plus today's special
- **Payment history** — month-wise transaction log with amounts and status
- Favorites (stored on-device)
- **Community board** — post/browse Sale, Job, and Service listings; the contact button deep-links to **WhatsApp** with a pre-filled message referencing the post
- Leave-PG requests that the admin approves/rejects

### For PG Owners (Admins)
- Register as an owner with **verification details** (business registration number + property ownership proof reference); account stays `pending_admin` until superadmin approval
- Add/edit properties with photos, facilities, safety measures, pricing, and **GPS location capture** (tap once while standing at the property — coordinates are saved and the full address is auto-filled via reverse geocoding)
- Manage the weekly mess menu per property
- **Bookings tab with notifications** — new bookings (last 24 h) show a tab badge and highlighted card with tenant name/contact, booked-at time, amount paid, transaction ID, and payment method
- Approve/reject tenant leave requests

### For the Super Admin
- Verify and publish pending PG listings
- Approve/reject new owner registrations (verification details shown on the approval card)
- **Manage PGs** — see every onboarded property with LIVE/DEACTIVATED status; deactivate (hide from users, reversible), reactivate, or permanently delete any PG
- Manage users (suspend/activate)
- Resolve disputes raised by tenants
- Platform analytics (revenue from commission) and settings (platform fee %)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile app | React Native 0.81 + Expo SDK 54 |
| Navigation | React Navigation 7 (Stack + Bottom Tabs) |
| App state | React Context API + custom hooks (`useAuth`, `useData`) |
| Backend | Node.js + Express 4 |
| Database | MongoDB + Mongoose 8 |
| Auth | JWT (7-day tokens), bcrypt password hashing, role-based middleware |
| API docs | Swagger UI at `/api/docs` (swagger-jsdoc) |
| Maps & location | react-native-maps, expo-location (GPS + reverse geocoding) |
| Payments | PaymentService abstraction (simulated Razorpay checkout in Expo Go) |
| On-device storage | AsyncStorage — session token and favorites only |

---

## Project Structure

```
pg-finder-app/
├── App.js / index.js            # Expo entry (AuthProvider → DataProvider → AppNavigator)
├── .env.example                 # Frontend env template
├── src/
│   ├── components/
│   │   ├── cards/               # PGCard, PostCard
│   │   └── common/              # CustomButton, CustomInput, ScreenHeader, SearchBar,
│   │                            #   FilterChips, EmptyState, PillSelector, GenderSelector,
│   │                            #   ImagePickerSection
│   ├── constants/
│   │   ├── config.js            # API_BASE_URL from EXPO_PUBLIC_API_BASE_URL
│   │   ├── theme.js             # COLORS, SPACING, TYPOGRAPHY, SHADOWS
│   │   └── auth.js              # Superadmin bypass config (env-driven)
│   ├── context/
│   │   ├── AuthContext.js       # Login/register/logout, JWT session
│   │   └── DataContext.js       # All domain data, fetched from the API
│   ├── hooks/                   # useAuth(), useData()
│   ├── navigation/              # AppNavigator, UserTabNavigator, AdminTabNavigator, routes.js
│   ├── screens/
│   │   ├── user/                # Dashboard, Map, PG details, Payment, MyPG, Bookings,
│   │   │                        #   Community, Menus, Favorites, RaiseIssue, ...
│   │   ├── admin/               # Dashboard, Add/Edit PG, ManageMenu, Bookings, Leaves, ...
│   │   ├── superadmin/          # SuperAdminDashboard (tabs: requests, manage PGs, owners,
│   │   │                        #   analytics, users, settings)
│   │   └── common/              # ProfileScreen
│   ├── services/                # ApiClient (fetch + JWT), PaymentService, StorageService
│   └── utils/                   # id.js, pgFormConfig.js
├── backend/
│   ├── .env.example             # Backend env template
│   ├── eslint.config.js
│   ├── src/
│   │   ├── config/              # env.js, db.js, swagger.js
│   │   ├── controllers/         # One per domain (auth, pg, booking, payment, community,
│   │   │                        #   settings, review, mess, leave, dispute)
│   │   ├── middleware/          # auth (JWT + roles), errorHandler
│   │   ├── models/              # User, PG, Booking, Payment, CommunityPost, Review,
│   │   │                        #   MessMenu, LeaveRequest, Dispute, Settings
│   │   ├── routes/              # Thin routers + index.js mount point
│   │   ├── utils/               # jwt.js
│   │   ├── app.js               # Express assembly (middleware, routes, error handler)
│   │   └── server.js            # Bootstrap: connect DB, listen
│   └── tests/                   # Node test runner (uses a dedicated test database)
├── scripts/lint.js              # Repo-wide merge-marker/tab checks
└── tests/                       # Frontend unit tests (node:test)
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB running locally (or a connection string, e.g. Atlas)
- Expo Go app on your phone (or an emulator)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # then edit values
npm run dev                 # nodemon on http://localhost:4000
```

API docs are served at `http://localhost:4000/api/docs`, health check at `/api/health`.

### 2. Mobile app

```bash
# from the repo root
npm install
cp .env.example .env        # set EXPO_PUBLIC_API_BASE_URL to YOUR machine's LAN IP
npx expo start
```

Scan the QR code with Expo Go. **Important:** your phone and computer must be on the same Wi-Fi network, and `EXPO_PUBLIC_API_BASE_URL` must use your machine's LAN IP (e.g. `http://192.168.1.5:4000/api`) — `localhost` won't work from a physical device. Env vars are baked in at bundle time, so restart Expo (`npx expo start -c`) after changing `.env`.

---

## Environment Variables

### Frontend (`.env`)

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_API_BASE_URL` | Backend base URL, reachable from the device |
| `EXPO_PUBLIC_USE_BACKEND` | `true` (backend-driven mode) |
| `EXPO_PUBLIC_SUPER_ADMIN_EMAIL` / `_PASSWORD` | Enables the superadmin login (dev only) |

### Backend (`backend/.env`)

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default 4000) |
| `MONGODB_URI` | MongoDB connection string (default `mongodb://localhost:27017/pg_finder`) |
| `JWT_SECRET` | **Required in production** — token signing key |
| `SUPER_ADMIN_EMAIL` / `_PASSWORD` | Env-based superadmin account (not stored in DB) |
| `MONGODB_TEST_URI` | Test database (tests drop it on teardown — never point at real data) |

`.env` files are gitignored; commit changes to the `.env.example` templates instead.

---

## App Roles & Flows

### Tenant flow
```
Register (as Tenant) → Browse / Map → PG details or map callout → Book Bed →
Pay (booking auto-confirms, bed count decrements server-side) →
My PG dashboard → Pay monthly rent → Payment history → Leave request when moving out
```

### Owner flow
```
Register (as Owner, with business reg no. + ownership proof) → pending approval →
Superadmin approves → Add property (photos, GPS location, details) → pending verification →
Superadmin publishes → Manage menu / view bookings with payment details / handle leaves
```

### Superadmin flow
```
Login (env credentials) → Verify PG listings → Approve owners (check documents) →
Manage PGs (deactivate / reactivate / delete) → Users / Disputes / Analytics / Settings
```

Bookings are **auto-confirmed on payment** — the owner is notified in-app (Bookings tab badge + transaction details) rather than gating each booking on manual approval.

---

## API Overview

All routes are prefixed with `/api`. Auth is a `Bearer <JWT>` header.

| Domain | Endpoints |
|--------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/users`*, `GET /auth/pending-admins`*, `PUT /auth/approve-admin/:id`*, `PUT /auth/status/:id`* |
| PGs | `GET /pgs` (role-scoped visibility), `GET /pgs/:id`, `POST /pgs` (admin), `PUT /pgs/:id` (owner/superadmin), `DELETE /pgs/:id`* |
| Bookings | `POST /bookings` (blocks duplicates, decrements vacant beds), `GET /bookings/me`, `GET /bookings/owner` (admin) |
| Payments | `POST /payments`, `GET /payments/me`, `GET /payments/owner` (admin) |
| Mess menus | `GET /mess`, `GET /mess/:pgId`, `PUT /mess` (admin) |
| Community | `GET /community`, `POST /community` |
| Reviews | `GET /reviews?pgId=`, `POST /reviews` |
| Leaves | `POST /leaves`, `GET /leaves/me`, `GET /leaves/pg/:pgId`, `PUT /leaves/:id` |
| Disputes | `POST /disputes`, `GET /disputes/me`, `GET /disputes`*, `PUT /disputes/:id`* |
| Settings | `GET /settings`, `PUT /settings`* |

\* superadmin only. Full request/response schemas: `http://localhost:4000/api/docs`.

### Data model highlights

| Entity | Key fields |
|--------|-----------|
| User | email, passwordHash, type (`user` / `admin` / `pending_admin` / `superadmin`), status, businessRegNumber, ownershipProofRef |
| PG | name, address, location `{latitude, longitude}`, rent, beds/rooms, facilities, images, adminId, status (`pending` / `approved` / `rejected` / `deactivated`) |
| Booking | userId, pgId, monthlyRent, status (`active` / `completed` / `cancelled`), nextDueDate |
| Payment | bookingId, userId, amount, commissionAmount, transactionId, method, month/year, status (`paid` / `failed` / `pending`) |
| MessMenu | pgId, weeklyMenu (7 days × 3 meals), todaysSpecial, mealPlanPrice, isVegOnly |

---

## Architecture

```
Mobile app                              Backend
─────────────────────────               ────────────────────────────
AuthProvider ── login/register ───────► /api/auth (JWT issued)
     │
DataProvider ── loadAllData ──────────► /api/pgs, /community, /settings, /mess
     │            (role-aware)          /bookings/me, /payments/me, /leaves/me ...
     │                                  /bookings/owner, /payments/owner (admins)
     ▼
Screens consume useAuth() / useData()   routes → controllers → models (Mongoose)
ApiClient attaches the stored JWT       auth middleware enforces roles per route
```

- **On-device storage is minimal by design** — only the session (JWT + user) and favorites live in AsyncStorage; everything else is fetched fresh from the API.
- **Bed inventory is server-authoritative** — vacant-bed decrement happens inside the booking endpoint, not the client.
- **PaymentService** simulates a Razorpay checkout (2-second flow, mock transaction IDs) so the full booking/rent flow works in Expo Go. Swap in `react-native-razorpay` + a dev client for real payments.

---

## Scripts

| Where | Command | What it does |
|-------|---------|--------------|
| root | `npm start` | Expo dev server |
| root | `npm run check` | Lint + frontend unit tests |
| backend | `npm run dev` | API with nodemon |
| backend | `npm run lint` | ESLint (flat config) |
| backend | `npm test` | Node test runner against `MONGODB_TEST_URI` |

---

## Roadmap

- [ ] Push notifications (Expo push) — rent reminders, booking alerts for owners
- [ ] Real Razorpay/Stripe integration with server-side order verification
- [ ] Document upload (S3/Cloudinary) for owner verification instead of reference numbers
- [ ] Room/bed-level selection during booking
- [ ] In-app chat between tenants and owners
- [ ] PDF rent receipts
- [ ] Dark mode, localization (Hindi/Marathi), analytics dashboards

---

## License

This project is for educational and portfolio purposes. Feel free to use it as a reference or starting point for your own PG management app.
