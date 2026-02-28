# PG Finder App - Complete Architecture Document

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [High-Level Design (HLD)](#2-high-level-design-hld)
3. [Low-Level Design (LLD)](#3-low-level-design-lld)
4. [Current Frontend Architecture](#4-current-frontend-architecture)
5. [Proposed Backend Architecture](#5-proposed-backend-architecture)
6. [Database Design](#6-database-design)
7. [API Design](#7-api-design)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Recommended Project Structure](#9-recommended-project-structure-best-practices)
10. [Deployment & DevOps](#10-deployment--devops)
11. [Migration Roadmap](#11-migration-roadmap)

---

## 1. Project Overview

**PG Finder App** ek React Native (Expo) based mobile application hai jo Paying Guest (PG) accommodations dhundhne, manage karne aur book karne ke liye banayi gayi hai.

### Current State
- **Frontend Only** - React Native + Expo SDK 54
- **No Real Backend** - Sab data AsyncStorage (local device storage) me store hota hai
- **No Real Auth** - Mock authentication (koi bhi email/password accept hota hai)
- **No Real Payment** - Razorpay simulated mode me hai

### User Roles
| Role | Description |
|------|-------------|
| **User (Tenant)** | PG search, book, rent pay, mess menu dekhe, community use kare |
| **Admin (PG Owner)** | Apni PG property manage kare, menu manage kare, bookings dekhe |
| **Super Admin** | Platform manage kare, admins approve kare, disputes resolve kare |

### Key Features
- PG Search with Filters (Budget, Gender, Location)
- Map View Integration
- PG Booking & Rent Payment (Razorpay)
- Weekly Mess Menu Management
- Community Board (Jobs, Services, Sale items)
- Admin Dashboard with Analytics
- Super Admin Panel (User Management, Dispute Resolution)
- Favorites & Reviews System

---

## 2. High-Level Design (HLD)

### 2.1 System Architecture (Proposed Full-Stack)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │            React Native (Expo) Mobile App                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │  │   User   │  │  Admin   │  │  Super   │  │   Auth   │   │   │
│  │  │  Module  │  │  Module  │  │  Admin   │  │  Module  │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS / REST API
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY / LOAD BALANCER                    │
│                    (Nginx / AWS ALB / Cloudflare)                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       BACKEND SERVER                                │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Node.js + Express.js Server                     │   │
│  │                                                              │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐    │   │
│  │  │  Auth      │  │  PG        │  │  Booking &         │    │   │
│  │  │  Service   │  │  Service   │  │  Payment Service   │    │   │
│  │  └────────────┘  └────────────┘  └────────────────────┘    │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐    │   │
│  │  │  User      │  │  Community │  │  Notification      │    │   │
│  │  │  Service   │  │  Service   │  │  Service           │    │   │
│  │  └────────────┘  └────────────┘  └────────────────────┘    │   │
│  │  ┌────────────┐  ┌────────────┐                             │   │
│  │  │  Mess Menu │  │  Dispute   │                             │   │
│  │  │  Service   │  │  Service   │                             │   │
│  │  └────────────┘  └────────────┘                             │   │
│  └──────────────────────────────────────────────────────────────┘   │
└───────┬──────────────────┬──────────────────┬───────────────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐
│   MongoDB    │  │    Redis     │  │  External Services   │
│  (Primary    │  │  (Caching,   │  │                      │
│   Database)  │  │   Sessions)  │  │  - Razorpay          │
│              │  │              │  │  - Cloudinary         │
│              │  │              │  │  - Firebase (Push)    │
│              │  │              │  │  - Google Maps API    │
│              │  │              │  │  - SendGrid (Email)   │
└──────────────┘  └──────────────┘  └──────────────────────┘
```

### 2.2 Data Flow Diagram

```
User Action (App) 
    │
    ▼
API Request (Axios/Fetch) ──── JWT Token (Header)
    │
    ▼
API Gateway (Rate Limiting, CORS)
    │
    ▼
Auth Middleware (JWT Verify + Role Check)
    │
    ▼
Route Handler → Controller → Service → Model → MongoDB
    │
    ▼
Response (JSON) ──── Back to App ──── Update State (Context)
```

### 2.3 Component Interaction Diagram

```
┌────────────────────────────────────────────────────────┐
│                    Mobile App                           │
│                                                         │
│  AuthProvider ─────────────────────────────┐            │
│       │                                    │            │
│       ▼                                    ▼            │
│  DataProvider                       AppNavigator        │
│       │                                    │            │
│       ├── PG State                         ├── Stack    │
│       ├── Booking State                    │   Nav      │
│       ├── Payment State      ┌─────────────┤            │
│       ├── Community State    │             │            │
│       ├── Menu State         ▼             ▼            │
│       └── User State    Tab Nav       Auth Screen       │
│                             │                           │
│              ┌──────────────┼──────────┐               │
│              ▼              ▼          ▼               │
│          Dashboard     Favorites   Profile             │
│              │                                          │
│              ▼                                          │
│      API Service Layer ←──── Replaces StorageService    │
│              │                                          │
│              ▼                                          │
│       Backend REST API                                  │
└────────────────────────────────────────────────────────┘
```

---

## 3. Low-Level Design (LLD)

### 3.1 Frontend Module Design

#### 3.1.1 Navigation Architecture

```
AppNavigator (Stack)
│
├── LoginScreen (Unauthenticated)
│
├── [User Authenticated] ─── UserTabNavigator (Bottom Tabs)
│   ├── Tab: Home ──── UserDashboard
│   │                       ├── PGDetailsUserScreen
│   │                       └── MapScreen
│   ├── Tab: Favorites ──── FavoritesScreen
│   ├── Tab: My PG ──── MyPGScreen
│   │                    ├── PaymentScreen
│   │                    ├── PaymentHistoryScreen
│   │                    └── WeeklyMenuScreen
│   ├── Tab: Community ──── CommunityScreen
│   │                        └── CreatePostScreen
│   └── Tab: Profile ──── ProfileScreen
│
├── [Admin Authenticated]
│   ├── AdminDashboard
│   │   ├── AddPGScreen
│   │   ├── EditPGScreen
│   │   ├── PGDetailsScreen
│   │   └── ManageMenuScreen
│   ├── PendingApprovalScreen
│   └── AdminProfile
│
└── [SuperAdmin Authenticated]
    └── SuperAdminDashboard
```

#### 3.1.2 State Management Design

```
AuthContext (Global Auth State)
│
├── State:
│   ├── user: { id, email, name, phone }
│   ├── userType: 'user' | 'admin' | 'pending_admin' | 'superadmin'
│   └── isLoading: boolean
│
├── Actions:
│   ├── login(email, password, type) → boolean
│   ├── logout() → void
│   └── updateUserProfile(data) → boolean
│
DataContext (Global App Data State)
│
├── State:
│   ├── pgs: PG[]
│   ├── bookings: Booking[]
│   ├── favorites: string[]
│   ├── reviews: Review[]
│   ├── communityPosts: Post[]
│   ├── pendingPgs: PendingPG[]
│   ├── users: User[]
│   ├── disputes: Dispute[]
│   ├── settings: Settings
│   ├── payments: Payment[]
│   ├── messMenus: MessMenu[]
│   └── isLoading: boolean
│
├── PG Actions: addPg, updatePg, deletePg
├── Booking Actions: addBooking, updateBooking, clearBookings
├── Favorite Actions: toggleFavorite
├── Review Actions: addReview
├── Community Actions: addPost, updatePost, deletePost
├── Pending PG Actions: addPendingPg, approvePendingPg, rejectPendingPg
├── User Actions: toggleUserStatus
├── Dispute Actions: addDispute, updateDisputeStatus
├── Settings Actions: updateSettings
├── Payment Actions: addPayment
└── Menu Actions: getMessMenuForPg, updateMessMenu
```

#### 3.1.3 Service Layer Design

```
Current (Local):                    Proposed (API):
─────────────────                   ──────────────────
StorageService                      ApiService
  ├── getItem(key)                    ├── apiClient (Axios instance)
  ├── setItem(key, val)               │     ├── baseURL
  └── removeItem(key)                 │     ├── interceptors (JWT)
                                      │     └── error handling
PaymentService                        │
  ├── createOrder()                   ├── AuthApi
  ├── processPayment()                │     ├── login()
  └── isSimulated()                   │     ├── register()
                                      │     ├── verifyOTP()
                                      │     └── refreshToken()
                                      │
                                      ├── PGApi
                                      │     ├── getAllPGs(filters)
                                      │     ├── getPGById(id)
                                      │     ├── createPG(data)
                                      │     ├── updatePG(id, data)
                                      │     └── deletePG(id)
                                      │
                                      ├── BookingApi
                                      │     ├── createBooking()
                                      │     ├── getMyBookings()
                                      │     └── cancelBooking()
                                      │
                                      ├── PaymentApi
                                      │     ├── createOrder()
                                      │     ├── verifyPayment()
                                      │     └── getPaymentHistory()
                                      │
                                      ├── CommunityApi
                                      │     ├── getPosts()
                                      │     ├── createPost()
                                      │     └── deletePost()
                                      │
                                      └── MenuApi
                                            ├── getMenu(pgId)
                                            └── updateMenu(pgId, data)
```

### 3.2 Backend Module Design (Proposed)

#### 3.2.1 Controller-Service-Repository Pattern

```
Request Flow:
─────────────
Route → Middleware → Controller → Service → Repository → Database

Example - Create Booking:
─────────────────────────
POST /api/bookings
    │
    ├── authMiddleware ──── JWT verify, extract userId
    │
    ├── bookingController.create()
    │       │
    │       ├── Validate request body (Joi/Zod)
    │       │
    │       ├── bookingService.createBooking(userId, pgId, data)
    │       │       │
    │       │       ├── Check PG exists & has vacant beds
    │       │       ├── Check user doesn't already have active booking
    │       │       ├── Create booking record
    │       │       ├── Update PG vacantBeds count
    │       │       ├── Trigger payment order creation
    │       │       └── Send notification to admin
    │       │
    │       └── Return booking + payment order
    │
    └── Response: 201 { booking, paymentOrder }
```

#### 3.2.2 Middleware Chain

```
Request
  │
  ▼
cors() ─── CORS headers
  │
  ▼
helmet() ─── Security headers
  │
  ▼
rateLimit() ─── Rate limiting (100 req/15min)
  │
  ▼
express.json() ─── Body parsing
  │
  ▼
morgan() ─── Request logging
  │
  ▼
authMiddleware ─── JWT verification (protected routes only)
  │
  ▼
roleMiddleware ─── Role-based access (admin/superadmin routes)
  │
  ▼
validationMiddleware ─── Request body validation (Zod)
  │
  ▼
Controller ─── Business logic
  │
  ▼
errorHandler ─── Global error handler
```

---

## 4. Current Frontend Architecture

### 4.1 Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | React Native | 0.81.5 |
| Platform | Expo SDK | 54 |
| Language | JavaScript | ES6+ |
| Navigation | React Navigation | 7.x |
| Storage | AsyncStorage | 2.2.0 |
| Maps | React Native Maps | 1.20.1 |
| Location | Expo Location | 19.0.8 |
| Images | Expo Image Picker | 17.0.10 |

### 4.2 Current Project Structure

```
pg-finder-app/
├── App.js                          # Entry point
├── app.json                        # Expo config
├── metro.config.js                 # Metro bundler config
├── package.json                    # Dependencies
│
├── assets/                         # Static assets (icons, splash)
│
└── src/
    ├── components/
    │   ├── cards/
    │   │   ├── PGCard.js           # PG listing card
    │   │   └── PostCard.js         # Community post card
    │   │
    │   └── common/
    │       ├── index.js            # Barrel exports
    │       ├── CustomButton.js     # Reusable button
    │       ├── CustomInput.js      # Form input with icon
    │       ├── ScreenHeader.js     # Page header
    │       ├── SearchBar.js        # Search component
    │       ├── FilterChips.js      # Filter selection
    │       ├── EmptyState.js       # Empty placeholder
    │       ├── GenderSelector.js   # Gender picker
    │       ├── PillSelector.js     # Multi-select pills
    │       └── ImagePickerSection.js # Image picker
    │
    ├── constants/
    │   └── theme.js                # Design tokens (Colors, Spacing, Typography)
    │
    ├── context/
    │   ├── AuthContext.js           # Authentication state
    │   └── DataContext.js           # App data state
    │
    ├── hooks/
    │   ├── index.js                # Barrel exports
    │   ├── useAuth.js              # Auth context hook
    │   └── useData.js              # Data context hook
    │
    ├── navigation/
    │   ├── AppNavigator.js         # Main stack navigator
    │   ├── UserTabNavigator.js     # Bottom tab navigator
    │   └── routes.js               # Route name constants
    │
    ├── screens/
    │   ├── LoginScreen.js          # Login page
    │   ├── admin/
    │   │   ├── AdminDashboard.js
    │   │   ├── AddPGScreen.js
    │   │   ├── EditPGScreen.js
    │   │   ├── PGDetailsScreen.js
    │   │   ├── ManageMenuScreen.js
    │   │   └── PendingApprovalScreen.js
    │   ├── user/
    │   │   ├── UserDashboard.js
    │   │   ├── PGDetailsUserScreen.js
    │   │   ├── MyPGScreen.js
    │   │   ├── MyBookingsScreen.js
    │   │   ├── PaymentScreen.js
    │   │   ├── PaymentHistoryScreen.js
    │   │   ├── WeeklyMenuScreen.js
    │   │   ├── FavoritesScreen.js
    │   │   ├── CommunityScreen.js
    │   │   ├── CreatePostScreen.js
    │   │   └── MapScreen.js
    │   ├── common/
    │   │   └── ProfileScreen.js
    │   └── superadmin/
    │       └── SuperAdminDashboard.js
    │
    ├── services/
    │   ├── StorageService.js       # AsyncStorage wrapper
    │   └── PaymentService.js       # Razorpay (simulated)
    │
    └── utils/
        └── pgFormConfig.js         # PG form configuration
```

### 4.3 Design System

App ek Airbnb-inspired design system use karta hai centralized theme constants ke sath:

- **Primary Color:** `#FF385C` (Airbnb Red)
- **Secondary Color:** `#00A699` (Teal Green)
- **Spacing Scale:** 4px base (xs:4, sm:8, md:12, lg:16, xl:20, xxl:24)
- **Typography:** 10px-36px range with 5 weight levels
- **Shadows:** Small, Medium, Large + Brand colored shadows
- **Components:** Pre-built Button, Input, Card style presets

---

## 5. Proposed Backend Architecture

### 5.1 Technology Stack

| Category | Technology | Reason |
|----------|-----------|--------|
| Runtime | Node.js 20 LTS | JavaScript ecosystem match with frontend |
| Framework | Express.js 4.x | Lightweight, flexible, huge ecosystem |
| Database | MongoDB 7.x | Document-based, flexible schema, good for PG data |
| ODM | Mongoose 8.x | Schema validation, middleware, query building |
| Auth | JWT + bcrypt | Stateless auth, industry standard |
| Validation | Zod | TypeScript-first schema validation |
| File Upload | Cloudinary + Multer | Cloud image storage, CDN delivery |
| Payment | Razorpay SDK | Indian payment gateway, UPI support |
| Caching | Redis | Session caching, OTP storage, rate limiting |
| Email | Nodemailer + SendGrid | OTP delivery, booking confirmations |
| Push Notifications | Firebase Cloud Messaging | Rent reminders, booking updates |
| Logging | Winston + Morgan | Structured logging |
| Testing | Jest + Supertest | Unit + Integration tests |

### 5.2 Backend Folder Structure (Best Practice)

```
backend/
├── package.json
├── .env.example
├── .env
├── .eslintrc.js
├── jest.config.js
│
├── src/
│   ├── server.js                    # App entry point, DB connection
│   ├── app.js                       # Express app setup, middleware
│   │
│   ├── config/
│   │   ├── index.js                 # Environment config loader
│   │   ├── db.js                    # MongoDB connection
│   │   ├── redis.js                 # Redis connection
│   │   └── cloudinary.js            # Cloudinary config
│   │
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   ├── roleCheck.js             # Role-based access control
│   │   ├── validate.js              # Zod validation middleware
│   │   ├── upload.js                # Multer file upload
│   │   ├── rateLimiter.js           # Rate limiting
│   │   └── errorHandler.js          # Global error handler
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── PG.js
│   │   ├── Booking.js
│   │   ├── Payment.js
│   │   ├── Review.js
│   │   ├── CommunityPost.js
│   │   ├── MessMenu.js
│   │   ├── Dispute.js
│   │   └── Settings.js
│   │
│   ├── routes/
│   │   ├── index.js                 # Route aggregator
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── pg.routes.js
│   │   ├── booking.routes.js
│   │   ├── payment.routes.js
│   │   ├── review.routes.js
│   │   ├── community.routes.js
│   │   ├── menu.routes.js
│   │   ├── dispute.routes.js
│   │   └── admin.routes.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── pg.controller.js
│   │   ├── booking.controller.js
│   │   ├── payment.controller.js
│   │   ├── review.controller.js
│   │   ├── community.controller.js
│   │   ├── menu.controller.js
│   │   ├── dispute.controller.js
│   │   └── admin.controller.js
│   │
│   ├── services/
│   │   ├── auth.service.js          # JWT, OTP, password hashing
│   │   ├── user.service.js
│   │   ├── pg.service.js
│   │   ├── booking.service.js
│   │   ├── payment.service.js       # Razorpay integration
│   │   ├── review.service.js
│   │   ├── community.service.js
│   │   ├── menu.service.js
│   │   ├── dispute.service.js
│   │   ├── notification.service.js  # FCM push notifications
│   │   ├── email.service.js         # SendGrid emails
│   │   └── upload.service.js        # Cloudinary uploads
│   │
│   ├── validators/
│   │   ├── auth.validator.js        # Login/Register schemas
│   │   ├── pg.validator.js          # PG CRUD schemas
│   │   ├── booking.validator.js
│   │   └── common.validator.js      # Shared schemas (pagination, etc.)
│   │
│   ├── utils/
│   │   ├── ApiError.js              # Custom error class
│   │   ├── ApiResponse.js           # Standard response format
│   │   ├── asyncHandler.js          # Async/await error wrapper
│   │   ├── constants.js             # App constants
│   │   └── helpers.js               # Utility functions
│   │
│   └── seeds/
│       ├── index.js                 # Seed runner
│       ├── users.seed.js
│       └── pgs.seed.js
│
└── tests/
    ├── unit/
    │   ├── services/
    │   └── utils/
    └── integration/
        ├── auth.test.js
        ├── pg.test.js
        └── booking.test.js
```

---

## 6. Database Design

### 6.1 MongoDB Collections & Schemas

#### Users Collection

```javascript
{
  _id: ObjectId,
  name: String,                    // required
  email: String,                   // required, unique, indexed
  phone: String,                   // required, unique
  password: String,                // bcrypt hashed
  role: enum ['user', 'admin', 'superadmin'],  // indexed
  status: enum ['active', 'suspended', 'pending'],
  avatar: String,                  // Cloudinary URL
  
  // Admin-specific
  businessName: String,
  businessAddress: String,
  isApproved: Boolean,             // Super admin approval
  
  // Metadata
  fcmToken: String,                // Push notification token
  lastLogin: Date,
  createdAt: Date,                 // auto (timestamps)
  updatedAt: Date,                 // auto (timestamps)
}

// Indexes: { email: 1 }, { phone: 1 }, { role: 1, status: 1 }
```

#### PGs Collection

```javascript
{
  _id: ObjectId,
  adminId: ObjectId,               // ref: Users, indexed
  name: String,                    // required, indexed (text search)
  description: String,
  address: String,                 // required, indexed (text search)
  
  location: {                      // GeoJSON for geo-queries
    type: 'Point',
    coordinates: [longitude, latitude]  // 2dsphere index
  },
  
  city: String,                    // indexed
  area: String,                    // indexed
  pincode: String,
  
  totalRooms: Number,
  occupiedRooms: Number,
  totalBeds: Number,
  vacantBeds: Number,              // indexed
  
  rent: Number,                    // required, indexed
  securityDeposit: Number,
  
  gender: enum ['Male', 'Female', 'Any'],  // indexed
  
  facilities: [String],            // ['WiFi', 'Mess', 'Laundry', ...]
  safetyMeasures: [String],        // ['CCTV', 'Biometric', ...]
  
  images: [{
    url: String,                   // Cloudinary URL
    publicId: String,              // Cloudinary public ID (for deletion)
  }],
  
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  
  isActive: Boolean,               // Soft delete / visibility toggle
  isApproved: Boolean,             // Super admin approval
  
  createdAt: Date,
  updatedAt: Date,
}

// Indexes:
// { location: '2dsphere' } — geo-queries (nearby PGs)
// { rent: 1, gender: 1, city: 1 } — filter queries
// { name: 'text', address: 'text', area: 'text' } — text search
// { adminId: 1 }
```

#### Bookings Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,                // ref: Users, indexed
  pgId: ObjectId,                  // ref: PGs, indexed
  
  status: enum ['Confirmed', 'Cancelled', 'Completed'],  // indexed
  
  roomNumber: String,
  bedNumber: String,
  
  monthlyRent: Number,
  securityDeposit: Number,
  
  mealPlan: {
    included: Boolean,
    price: Number,
    type: enum ['Veg', 'Non-Veg', 'Both'],
  },
  
  paymentMethod: enum ['upi', 'card', 'netbanking', 'cash'],
  
  checkInDate: Date,
  nextDueDate: Date,               // indexed (for rent reminders)
  checkOutDate: Date,
  
  createdAt: Date,
  updatedAt: Date,
}

// Indexes: { userId: 1, status: 1 }, { pgId: 1 }, { nextDueDate: 1 }
```

#### Payments Collection

```javascript
{
  _id: ObjectId,
  bookingId: ObjectId,             // ref: Bookings, indexed
  userId: ObjectId,                // ref: Users, indexed
  pgId: ObjectId,                  // ref: PGs
  
  amount: Number,                  // required
  currency: String,                // default: 'INR'
  
  type: enum ['rent', 'security_deposit', 'meal_plan'],
  method: enum ['upi', 'card', 'netbanking', 'wallet'],
  
  // Razorpay details
  razorpayOrderId: String,
  razorpayPaymentId: String,       // indexed
  razorpaySignature: String,
  
  status: enum ['pending', 'success', 'failed', 'refunded'],  // indexed
  
  month: Number,                   // Payment month (1-12)
  year: Number,                    // Payment year
  
  receipt: String,
  
  createdAt: Date,
}

// Indexes: { userId: 1, status: 1 }, { bookingId: 1 }, { razorpayPaymentId: 1 }
```

#### Reviews Collection

```javascript
{
  _id: ObjectId,
  pgId: ObjectId,                  // ref: PGs, indexed
  userId: ObjectId,                // ref: Users, indexed
  bookingId: ObjectId,             // ref: Bookings
  
  rating: Number,                  // 1-5, required
  title: String,
  comment: String,
  
  isVerified: Boolean,             // User actually stayed here
  
  createdAt: Date,
  updatedAt: Date,
}

// Indexes: { pgId: 1, createdAt: -1 }, { userId: 1 }
// Constraint: One review per user per PG
```

#### MessMenus Collection

```javascript
{
  _id: ObjectId,
  pgId: ObjectId,                  // ref: PGs, unique indexed
  
  weeklyMenu: {
    monday:    { breakfast: String, lunch: String, dinner: String },
    tuesday:   { breakfast: String, lunch: String, dinner: String },
    wednesday: { breakfast: String, lunch: String, dinner: String },
    thursday:  { breakfast: String, lunch: String, dinner: String },
    friday:    { breakfast: String, lunch: String, dinner: String },
    saturday:  { breakfast: String, lunch: String, dinner: String },
    sunday:    { breakfast: String, lunch: String, dinner: String },
  },
  
  todaysSpecial: String,
  mealPlanPrice: Number,
  isVegOnly: Boolean,
  
  updatedAt: Date,
}

// Index: { pgId: 1 } (unique)
```

#### CommunityPosts Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,                // ref: Users, indexed
  authorName: String,
  
  title: String,                   // required
  description: String,             // required
  
  category: enum ['Service', 'Job', 'Sale', 'General'],  // indexed
  
  contactInfo: String,
  images: [String],
  
  status: enum ['Active', 'Removed', 'Expired'],
  
  expiresAt: Date,                 // TTL index
  createdAt: Date,
}

// Indexes: { category: 1, status: 1, createdAt: -1 }, { expiresAt: 1 } (TTL)
```

#### Disputes Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,                // ref: Users
  pgId: ObjectId,                  // ref: PGs
  
  title: String,
  description: String,
  
  status: enum ['Open', 'InProgress', 'Resolved', 'Closed'],  // indexed
  
  resolution: String,
  resolvedBy: ObjectId,            // ref: Users (superadmin)
  resolvedAt: Date,
  
  createdAt: Date,
  updatedAt: Date,
}
```

#### Settings Collection (Singleton)

```javascript
{
  _id: ObjectId,
  platformFee: Number,             // percentage (e.g., 5)
  minRent: Number,
  maxRent: Number,
  supportEmail: String,
  supportPhone: String,
  termsUrl: String,
  privacyUrl: String,
  updatedAt: Date,
}
```

### 6.2 Entity Relationship Diagram

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│  Users   │ 1───N │ Bookings │ N───1 │   PGs    │
│          │       │          │       │          │
│ id       │       │ id       │       │ id       │
│ name     │       │ userId   │───┐   │ adminId  │──── Users (admin)
│ email    │       │ pgId     │   │   │ name     │
│ role     │       │ status   │   │   │ rent     │
│ status   │       │ rent     │   │   │ location │
└──────────┘       └──────────┘   │   └──────────┘
     │                   │        │        │
     │ 1───N             │ 1───N  │        │ 1───1
     ▼                   ▼        │        ▼
┌──────────┐       ┌──────────┐   │   ┌──────────┐
│ Reviews  │       │ Payments │   │   │ MessMenu │
│          │       │          │   │   │          │
│ userId   │       │ bookingId│   │   │ pgId     │
│ pgId     │───────│ userId   │───┘   │ weekMenu │
│ rating   │  ┌───│ amount   │       │ price    │
│ comment  │  │   └──────────┘       └──────────┘
└──────────┘  │
              │   ┌──────────────┐     ┌──────────┐
              │   │ Community    │     │ Disputes │
              │   │ Posts        │     │          │
              └──│ userId       │     │ userId   │
                  │ title        │     │ pgId     │
                  │ category     │     │ status   │
                  └──────────────┘     └──────────┘
```

---

## 7. API Design

### 7.1 REST API Endpoints

#### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login with email/password | No |
| POST | `/api/auth/send-otp` | Send OTP to phone/email | No |
| POST | `/api/auth/verify-otp` | Verify OTP | No |
| POST | `/api/auth/refresh-token` | Refresh JWT token | Yes |
| POST | `/api/auth/logout` | Logout (invalidate token) | Yes |
| POST | `/api/auth/forgot-password` | Send reset link | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |

#### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/me` | Get current user profile | User |
| PUT | `/api/users/me` | Update profile | User |
| PUT | `/api/users/me/avatar` | Upload profile picture | User |
| PUT | `/api/users/me/fcm-token` | Update FCM token | User |

#### PGs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/pgs` | List PGs (with filters, pagination, search) | No |
| GET | `/api/pgs/:id` | Get PG details | No |
| GET | `/api/pgs/nearby` | Get nearby PGs (geo-query) | No |
| POST | `/api/pgs` | Create PG | Admin |
| PUT | `/api/pgs/:id` | Update PG | Admin (owner) |
| DELETE | `/api/pgs/:id` | Delete PG | Admin (owner) |
| GET | `/api/pgs/admin/my-pgs` | Get admin's PGs | Admin |

**Query Parameters for GET `/api/pgs`:**
```
?search=hinjewadi          # Text search
&city=pune                 # Filter by city
&gender=Female             # Filter by gender
&minRent=5000              # Min rent
&maxRent=12000             # Max rent
&facilities=WiFi,Mess      # Filter by facilities
&sort=rent_asc             # Sorting
&page=1&limit=20           # Pagination
&lat=18.59&lng=73.73&radius=5  # Geo filter (5km radius)
```

#### Bookings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/bookings` | Create booking | User |
| GET | `/api/bookings/my` | Get user's bookings | User |
| GET | `/api/bookings/:id` | Get booking details | User |
| PUT | `/api/bookings/:id/cancel` | Cancel booking | User |
| GET | `/api/bookings/pg/:pgId` | Get PG's bookings | Admin |

#### Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/payments/create-order` | Create Razorpay order | User |
| POST | `/api/payments/verify` | Verify payment signature | User |
| GET | `/api/payments/history` | Get payment history | User |
| POST | `/api/payments/webhook` | Razorpay webhook | No (signature verify) |

#### Reviews

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/reviews/pg/:pgId` | Get PG reviews | No |
| POST | `/api/reviews` | Add review | User |
| PUT | `/api/reviews/:id` | Update review | User (author) |
| DELETE | `/api/reviews/:id` | Delete review | User (author) |

#### Community

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/community` | Get posts (with category filter) | User |
| POST | `/api/community` | Create post | User |
| PUT | `/api/community/:id` | Update post | User (author) |
| DELETE | `/api/community/:id` | Delete post | User (author) / SuperAdmin |

#### Mess Menu

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/menus/:pgId` | Get PG mess menu | User |
| PUT | `/api/menus/:pgId` | Update mess menu | Admin (PG owner) |

#### Super Admin

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/users` | List all users | SuperAdmin |
| PUT | `/api/admin/users/:id/status` | Suspend/Activate user | SuperAdmin |
| GET | `/api/admin/pending-pgs` | List pending PG approvals | SuperAdmin |
| PUT | `/api/admin/pending-pgs/:id/approve` | Approve PG | SuperAdmin |
| PUT | `/api/admin/pending-pgs/:id/reject` | Reject PG | SuperAdmin |
| GET | `/api/admin/disputes` | List disputes | SuperAdmin |
| PUT | `/api/admin/disputes/:id` | Resolve dispute | SuperAdmin |
| GET | `/api/admin/settings` | Get platform settings | SuperAdmin |
| PUT | `/api/admin/settings` | Update platform settings | SuperAdmin |
| GET | `/api/admin/dashboard` | Dashboard stats | SuperAdmin |

### 7.2 Standard API Response Format

```javascript
// Success Response
{
  "success": true,
  "message": "PGs fetched successfully",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}

// Error Response
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

---

## 8. Authentication & Authorization

### 8.1 Auth Flow (Proposed)

```
REGISTRATION:
─────────────
1. User submits: name, email, phone, password, role
2. Backend validates, hashes password (bcrypt, 12 rounds)
3. Send OTP to phone/email
4. User verifies OTP
5. Create user in DB
6. Generate JWT access token (15min) + refresh token (7 days)
7. Return tokens to client

LOGIN:
──────
1. User submits: email, password
2. Backend verifies password with bcrypt.compare()
3. Generate new JWT pair
4. Return tokens

TOKEN REFRESH:
──────────────
1. Client sends expired access token + valid refresh token
2. Backend verifies refresh token
3. Generate new JWT pair
4. Invalidate old refresh token (rotation)
5. Return new tokens

PROTECTED ROUTE:
────────────────
1. Client sends request with header: Authorization: Bearer <access_token>
2. authMiddleware extracts & verifies JWT
3. Attaches user data to req.user
4. roleCheck middleware verifies req.user.role
5. Controller processes request
```

### 8.2 JWT Token Structure

```javascript
// Access Token Payload
{
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "email": "user@example.com",
  "role": "user",
  "iat": 1709123456,
  "exp": 1709124356    // 15 minutes
}

// Refresh Token Payload
{
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "tokenVersion": 1,   // Increment to invalidate all refresh tokens
  "iat": 1709123456,
  "exp": 1709728256    // 7 days
}
```

### 8.3 Role-Based Access Control Matrix

| Resource | User | Admin | SuperAdmin |
|----------|------|-------|------------|
| Browse PGs | Read | Read | Read + Approve |
| Manage PG | -- | Own PG only | All PGs |
| Book PG | Create/Read | -- | -- |
| Pay Rent | Own bookings | -- | -- |
| Mess Menu | Read | Own PG edit | Read All |
| Community | CRUD (own) | CRUD (own) | CRUD (all) + Moderate |
| Disputes | Create (own) | -- | Manage all |
| Users | Own profile | Own profile | Manage all |
| Settings | -- | -- | Full access |
| Dashboard Stats | -- | Own PG stats | Platform-wide stats |

---

## 9. Recommended Project Structure (Best Practices)

### 9.1 Complete Full-Stack Monorepo Structure

```
pg-finder-app/
│
├── README.md                        # Project documentation
├── project.md                       # This architecture file
├── .gitignore
├── .prettierrc
├── .eslintrc.js
│
├── mobile/                          # React Native App (Current src/)
│   ├── App.js
│   ├── app.json
│   ├── metro.config.js
│   ├── package.json
│   │
│   └── src/
│       ├── api/                     # NEW: API client layer
│       │   ├── client.js            # Axios instance with interceptors
│       │   ├── auth.api.js
│       │   ├── pg.api.js
│       │   ├── booking.api.js
│       │   ├── payment.api.js
│       │   ├── community.api.js
│       │   └── menu.api.js
│       │
│       ├── components/
│       │   ├── cards/
│       │   │   ├── PGCard.js
│       │   │   └── PostCard.js
│       │   ├── common/
│       │   │   ├── CustomButton.js
│       │   │   ├── CustomInput.js
│       │   │   ├── ScreenHeader.js
│       │   │   ├── SearchBar.js
│       │   │   ├── FilterChips.js
│       │   │   ├── EmptyState.js
│       │   │   └── ...
│       │   └── skeletons/           # NEW: Loading skeletons
│       │       ├── PGCardSkeleton.js
│       │       └── ListSkeleton.js
│       │
│       ├── constants/
│       │   ├── theme.js
│       │   ├── config.js            # NEW: API_URL, constants
│       │   └── queryKeys.js         # NEW: React Query keys
│       │
│       ├── context/
│       │   ├── AuthContext.js
│       │   └── ThemeContext.js       # NEW: Dark mode support
│       │
│       ├── hooks/
│       │   ├── useAuth.js
│       │   ├── usePGs.js            # NEW: PG data hooks (React Query)
│       │   ├── useBookings.js
│       │   └── usePayments.js
│       │
│       ├── navigation/
│       │   ├── AppNavigator.js
│       │   ├── UserTabNavigator.js
│       │   ├── AdminNavigator.js    # NEW: Separate admin stack
│       │   └── routes.js
│       │
│       ├── screens/
│       │   ├── auth/                # NEW: Separate auth folder
│       │   │   ├── LoginScreen.js
│       │   │   ├── RegisterScreen.js
│       │   │   ├── OTPScreen.js
│       │   │   └── ForgotPasswordScreen.js
│       │   ├── user/
│       │   ├── admin/
│       │   ├── superadmin/
│       │   └── common/
│       │
│       ├── services/
│       │   ├── StorageService.js    # Keep for offline caching
│       │   ├── PaymentService.js
│       │   └── NotificationService.js  # NEW: FCM setup
│       │
│       └── utils/
│           ├── pgFormConfig.js
│           ├── formatters.js        # NEW: Date, currency formatters
│           └── validators.js        # NEW: Client-side validation
│
├── backend/                         # NEW: Backend Server
│   ├── package.json
│   ├── .env.example
│   ├── Dockerfile
│   │
│   └── src/
│       ├── server.js
│       ├── app.js
│       ├── config/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── validators/
│       ├── utils/
│       └── seeds/
│
├── shared/                          # NEW: Shared code
│   ├── constants.js                 # Shared enums (roles, statuses)
│   └── types.js                     # Shared type definitions
│
└── docker-compose.yml               # NEW: MongoDB + Redis + Backend
```

### 9.2 Key Best Practices Applied

| Practice | Description |
|----------|-------------|
| **Separation of Concerns** | Controllers handle HTTP, Services handle business logic, Models handle data |
| **Environment Config** | All secrets in `.env`, loaded via `dotenv`, validated at startup |
| **Error Handling** | Custom `ApiError` class, global `errorHandler` middleware, async wrapper |
| **Validation** | Zod schemas validate all incoming data before it reaches controllers |
| **Authentication** | JWT with refresh token rotation, bcrypt password hashing |
| **Authorization** | Role-based middleware, resource ownership checks in services |
| **Pagination** | All list endpoints support `page`, `limit`, `sort` |
| **Rate Limiting** | Global rate limit + stricter limits on auth endpoints |
| **Logging** | Structured logging with Winston, request logging with Morgan |
| **Testing** | Unit tests for services, integration tests for API endpoints |
| **API Versioning** | Prefix routes with `/api/v1/` for future compatibility |
| **CORS** | Configured for specific origins, not wildcard |
| **Security Headers** | Helmet.js for HTTP security headers |
| **Input Sanitization** | mongo-sanitize to prevent NoSQL injection |
| **File Uploads** | Multer for multipart, Cloudinary for storage, size limits enforced |
| **Caching** | Redis for OTP, session blacklist, frequent queries |

---

## 10. Deployment & DevOps

### 10.1 Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│                   PRODUCTION                      │
│                                                   │
│  ┌──────────────────────────────────────────┐    │
│  │           Mobile App Distribution         │    │
│  │  ┌──────────┐  ┌──────────┐              │    │
│  │  │ Google   │  │  Apple   │              │    │
│  │  │ Play     │  │  App     │              │    │
│  │  │ Store    │  │  Store   │              │    │
│  │  └──────────┘  └──────────┘              │    │
│  └──────────────────────────────────────────┘    │
│                       │                           │
│                       ▼                           │
│  ┌──────────────────────────────────────────┐    │
│  │          Backend Hosting                   │    │
│  │                                            │    │
│  │  Option A: Railway.app (Easy)              │    │
│  │  Option B: AWS EC2 + Docker               │    │
│  │  Option C: DigitalOcean App Platform      │    │
│  │  Option D: Render.com (Free tier)         │    │
│  │                                            │    │
│  │  ┌────────────┐  ┌────────────────────┐   │    │
│  │  │  Node.js   │  │  Nginx (Reverse    │   │    │
│  │  │  Server    │◄─│  Proxy + SSL)      │   │    │
│  │  └────────────┘  └────────────────────┘   │    │
│  └──────────────────────────────────────────┘    │
│                       │                           │
│         ┌─────────────┼─────────────┐            │
│         ▼             ▼             ▼            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ MongoDB  │  │  Redis   │  │Cloudinary│      │
│  │ Atlas    │  │  Cloud   │  │  (CDN)   │      │
│  │ (Cloud)  │  │          │  │          │      │
│  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘
```

### 10.2 Environment Variables

```bash
# .env.example

# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/pgfinder
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Razorpay
RAZORPAY_KEY_ID=rzp_test_XXXXX
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@pgfinder.com

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=your_project
FIREBASE_PRIVATE_KEY=your_key
FIREBASE_CLIENT_EMAIL=your_email

# CORS
ALLOWED_ORIGINS=http://localhost:19006,exp://192.168.x.x:8081

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 10.3 Docker Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongo:27017/pgfinder
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mongo_data:
```

---

## 11. Migration Roadmap

### Phase 1: Backend Foundation (Week 1-2)
- [ ] Setup Node.js + Express project
- [ ] MongoDB connection with Mongoose
- [ ] User model + Auth (register, login, JWT)
- [ ] Basic middleware (auth, error handler, validation)
- [ ] Environment configuration

### Phase 2: Core APIs (Week 3-4)
- [ ] PG CRUD APIs with image upload (Cloudinary)
- [ ] Booking APIs
- [ ] Payment integration (Razorpay server-side)
- [ ] Review APIs
- [ ] Mess Menu APIs

### Phase 3: Frontend Integration (Week 5-6)
- [ ] Create `api/` layer in mobile app
- [ ] Replace `StorageService` calls with API calls in contexts
- [ ] Implement real authentication flow (register, login, OTP)
- [ ] Add loading states, error handling, retry logic
- [ ] Offline caching strategy (AsyncStorage as fallback)

### Phase 4: Advanced Features (Week 7-8)
- [ ] Super Admin APIs (user management, PG approval, disputes)
- [ ] Community APIs
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Email notifications (booking confirmations, rent reminders)
- [ ] Geo-based PG search (MongoDB 2dsphere)

### Phase 5: Production Readiness (Week 9-10)
- [ ] Unit + Integration tests
- [ ] Rate limiting & security hardening
- [ ] Redis caching for frequent queries
- [ ] API documentation (Swagger/Postman)
- [ ] Docker setup + CI/CD pipeline
- [ ] Deploy backend (Railway/Render)
- [ ] Deploy MongoDB (Atlas)
- [ ] Build and publish app (EAS Build)

---

## Summary

| Aspect | Current | Proposed |
|--------|---------|----------|
| **Frontend** | React Native + Expo | Same (keep as is) |
| **Backend** | None (AsyncStorage) | Node.js + Express.js |
| **Database** | AsyncStorage (local) | MongoDB Atlas (cloud) |
| **Auth** | Mock (no real auth) | JWT + bcrypt + OTP |
| **Payments** | Simulated Razorpay | Real Razorpay (server-verified) |
| **File Storage** | Unsplash URLs | Cloudinary CDN |
| **State Management** | Context API | Context + React Query |
| **Caching** | None | Redis + AsyncStorage offline cache |
| **Notifications** | None | FCM Push + Email (SendGrid) |
| **Deployment** | Expo Go (dev) | Play Store + App Store + Cloud Backend |

---

*Document created: February 28, 2026*
*Project: PG Finder App*
*Version: 1.0*
