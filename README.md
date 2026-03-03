# PG Living App

A full-featured **PG (Paying Guest) management app** built with React Native and Expo. It covers the complete lifecycle: finding a PG, booking a bed, paying monthly rent, viewing mess menus, and managing properties as an admin.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [App Roles & Flows](#app-roles--flows)
- [Test Credentials](#test-credentials)
- [Architecture Overview](#architecture-overview)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### For Tenants (Users)
- Browse PG listings with search, filters (budget, gender, premium), and map view
- View PG details with image gallery, facilities, safety measures, and reviews
- Book a bed and pay rent via Razorpay-style checkout (simulated for Expo Go)
- **My PG Dashboard** — rent status, due dates, today's mess menu, quick actions
- **Weekly Mess Menu** — 7-day view with breakfast, lunch, dinner and timings
- **Payment History** — month-wise transaction log with status badges
- Favorites — save and revisit PGs of interest
- Community board — post and browse jobs, services, sale items
- Profile management

### For PG Admins
- Register business and submit for Super Admin approval
- Add and edit PG properties with images, facilities, pricing
- Manage weekly mess menu per property
- View property stats (rooms, beds, occupancy)

### For Super Admin
- Approve or reject new PG admin registrations
- Manage all users (suspend/activate)
- Resolve disputes raised by tenants
- Platform settings (platform fee %)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.81 + Expo SDK 54 |
| Navigation | React Navigation 7 (Stack + Bottom Tabs) |
| State Management | React Context API + Custom Hooks |
| Persistence | AsyncStorage (offline-first, no backend) |
| Maps | react-native-maps |
| Payments | Razorpay-compatible PaymentService (simulated) |
| UI | Custom component library + Ionicons |
| Styling | StyleSheet with centralized theme constants |

---

## Project Structure

```
src/
├── components/
│   ├── cards/                  # PGCard, PostCard
│   └── common/                 # Reusable UI: ScreenHeader, SearchBar,
│                               #   FilterChips, EmptyState, CustomButton,
│                               #   CustomInput, PillSelector, GenderSelector,
│                               #   ImagePickerSection
├── constants/
│   └── theme.js                # COLORS, SPACING, FONT_SIZES, TYPOGRAPHY, etc.
├── context/
│   ├── AuthContext.js           # Authentication state + login/logout
│   └── DataContext.js           # All app data: PGs, bookings, payments, menus
├── hooks/
│   ├── useAuth.js               # Typed wrapper for AuthContext
│   └── useData.js               # Typed wrapper for DataContext
├── navigation/
│   ├── AppNavigator.js          # Root stack navigator (all screens)
│   ├── UserTabNavigator.js      # Bottom tab bar (Home, My PG, Bookings, etc.)
│   └── routes.js                # Centralized route name constants
├── screens/
│   ├── admin/                   # AdminDashboard, AddPG, EditPG, ManageMenu, etc.
│   ├── common/                  # ProfileScreen (shared between user/admin)
│   ├── superadmin/              # SuperAdminDashboard
│   ├── user/                    # UserDashboard, MyPG, Payment, WeeklyMenu, etc.
│   └── LoginScreen.js           # Auth entry point
├── services/
│   ├── PaymentService.js        # Razorpay integration layer (simulated for Expo Go)
│   └── StorageService.js        # AsyncStorage wrapper with domain methods
└── utils/
    └── pgFormConfig.js          # PG form validation, options, converters
```

**Stats:** 20 screens | 12 components | 2 services | 2 hooks | 2 contexts

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (or Android/iOS emulator)

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd pg-finder-app

# Install dependencies
npm install

# Start the dev server
npx expo start
```

Scan the QR code with Expo Go (Android) or Camera app (iOS) to run on your device.

### Clear Old Data (if upgrading)

If you're upgrading from an older version, clear AsyncStorage to avoid stale data issues:

- **Android:** Settings > Apps > Expo Go > Clear Data
- **iOS:** Delete and reinstall Expo Go
- **Programmatic:** Add `AsyncStorage.clear()` temporarily in App.js

---

## App Roles & Flows

### Environment Variables

Create a `.env` file (or configure Expo env vars) for privileged flows:

```bash
EXPO_PUBLIC_SUPER_ADMIN_EMAIL=superadmin@pg.com
EXPO_PUBLIC_SUPER_ADMIN_PASSWORD=strong-password
EXPO_PUBLIC_USE_REAL_RAZORPAY=false
EXPO_PUBLIC_RAZORPAY_KEY=rzp_test_xxx
EXPO_PUBLIC_PAYMENTS_API_BASE_URL=https://your-api.example.com
```


### User Flow
```
Login (as User) → Browse PGs → View Details → Book Bed → Pay →
My PG Dashboard (rent status, mess menu) → Pay Monthly Rent → Payment History
```

### Admin Flow
```
Login (as Admin) → Fill Business Details → Awaits Super Admin Approval →
Admin Dashboard → Add/Edit PGs → Manage Mess Menu
```

### Super Admin Flow
```
Login (configured via EXPO_PUBLIC_SUPER_ADMIN_EMAIL / EXPO_PUBLIC_SUPER_ADMIN_PASSWORD) → Approve Pending Admins →
Manage Users → Resolve Disputes → Platform Settings
```

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | Set via `EXPO_PUBLIC_SUPER_ADMIN_EMAIL` | Set via `EXPO_PUBLIC_SUPER_ADMIN_PASSWORD` |
| Admin | Any email (e.g. `admin@test.com`) | Any password |
| User | Any email (e.g. `user@test.com`) | Any password |

> **Note:** Super admin login is disabled unless the two env vars above are configured. Admin and user accounts are still local/demo-only and are role-locked per email.

---

## Architecture Overview

### State Management

```
App.js
  └── AuthProvider (login, logout, user session)
        └── DataProvider (PGs, bookings, payments, menus, posts, disputes)
              └── AppNavigator (all screens consume context via hooks)
```

- **AuthContext** — Handles login/logout, session persistence, user profile updates
- **DataContext** — Single source of truth for all domain data. Uses a `persistAndSet` helper to atomically save to AsyncStorage and update React state
- **useAuth() / useData()** — Custom hooks with error boundaries for context access

### Data Entities

| Entity | Key Fields |
|--------|-----------|
| PG | id, name, address, location, rent, facilities, adminId |
| Booking | id, userId, pgId, status, monthlyRent, nextDueDate |
| Payment | id, bookingId, userId, amount, method, transactionId, status, month, year |
| MessMenu | pgId, weeklyMenu (7 days × 3 meals), todaysSpecial, mealPlanPrice |
| CommunityPost | id, userId, title, description, category, contactInfo |
| Dispute | id, userId, pgId, title, description, status |

### Payment Architecture

The app uses a **PaymentService** abstraction layer:

- **Current (Expo Go):** Simulated 2-second checkout with mock transaction IDs
- **Production Ready:** Swap `USE_REAL_RAZORPAY = true` in `PaymentService.js`, install `react-native-razorpay`, and use `expo-dev-client`

---

## Roadmap

### High Priority
- [ ] **Backend API** — Replace AsyncStorage with a real backend (Node.js/Express + MongoDB or Firebase)
- [ ] **Real Authentication** — Email/password with JWT or Firebase Auth, including password hashing and validation
- [ ] **Real Payment Gateway** — Integrate Razorpay/Stripe with server-side order verification
- [ ] **Push Notifications** — Rent due reminders, booking confirmations, community post alerts

### Medium Priority
- [ ] **Room/Bed Selection** — Let users pick specific rooms and beds during booking
- [ ] **Reviews & Ratings** — Full review system with text, photos, and verified-stay badges
- [ ] **Mess Feedback** — Daily meal rating system for residents
- [ ] **Rent Receipts** — Downloadable PDF receipts for each payment
- [ ] **Multi-PG Admin** — Let admins manage multiple properties with a PG selector
- [ ] **In-App Chat** — Direct messaging between tenants and admins

### Low Priority / Nice to Have
- [ ] **Dark Mode** — Theme toggle using the existing theme constants
- [ ] **Localization** — Hindi, Marathi, and other regional language support
- [ ] **Onboarding Flow** — First-time user walkthrough
- [ ] **Analytics Dashboard** — Admin revenue charts, occupancy trends
- [ ] **Maintenance Requests** — Ticket system for room repairs, complaints
- [ ] **Referral System** — Earn credits for referring new tenants

---

## Contributing

Contributions are welcome! Here's how to get started:

### 1. Fork & Clone

```bash
git fork <repo-url>
git clone <your-fork-url>
cd pg-finder-app
npm install
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Code Guidelines

- **Components** go in `src/components/common/` (reusable) or `src/components/cards/` (data cards)
- **Screens** go in `src/screens/<role>/` (user, admin, superadmin, common)
- **New routes** must be added to `src/navigation/routes.js` first, then registered in `AppNavigator.js`
- **Styling** — use theme constants from `src/constants/theme.js`. Never hardcode colors or spacing
- **State** — add new entities to `DataContext.js` with matching `StorageService` methods
- **Hooks** — use `useAuth()` and `useData()` instead of direct `useContext()` calls
- **No inline comments** explaining what code does — only document non-obvious trade-offs

### 4. Commit & PR

```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

Open a Pull Request with:
- Summary of changes
- Screenshots (for UI changes)
- Test plan (how you verified it works)

### Project Conventions

| Convention | Example |
|-----------|---------|
| File naming | PascalCase for components/screens, camelCase for utils/hooks |
| Route names | `ROUTES.USER.MY_PG` (constant from routes.js) |
| Colors | `COLORS.primary` (never `'#FF385C'` directly) |
| Spacing | `SPACING.lg` (never `16` directly) |
| State persistence | Always use `persistAndSet` pattern in DataContext |

---

## License

This project is for educational and portfolio purposes. Feel free to use it as a reference or starting point for your own PG management app.
