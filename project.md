# PG Finder App - Complete Architecture & Status Document

## 1. Project Overview
A professional high-end PG Finder ecosystem with a React Native (Expo) frontend and a Node.js/Express/MongoDB backend.

### Current Status (March 19, 2026)
- **Phase:** Completion & Integration.
- **Frontend:** Fully integrated with the live backend. No longer using mock demo data.
- **Backend:** Operational with 10 modules, MongoDB persistence, and Swagger documentation.
- **Connectivity:** Hardcoded IP `192.168.0.113` used for seamless local network mobile testing.

### User Roles & Auth
| Role | State | Workflow |
|------|-------|----------|
| **User (Tenant)** | Active | Browse approved PGs, Book, Pay, Reviews, Community. |
| **Admin (Owner)** | Pending | Registers, awaits Superadmin approval before listing PGs. |
| **Admin (Owner)** | Approved | Manage own PGs, Mess Menus, Bookings, Leaves. |
| **Super Admin** | Master | Approve Owners, Verify PGs, Platform Settings, Analytics (Commission Tracking). |

---

## 2. Technical Stack & Configuration

### Frontend (mobile/)
- **Core:** React Native + Expo SDK 54.
- **State:** Context API (`AuthContext`, `DataContext`) with full backend sync.
- **Networking:** `ApiClient` with automatic JWT attachment, `_id` to `id` normalization, and descriptive error handling.
- **Stability:** Defensive null checks and Pull-to-Refresh implemented across all dashboards.
- **Web Support:** Custom `MapScreen.web.js` to bypass native map limitations.

### Backend (backend/)
- **Runtime:** Node.js + Express.
- **Database:** MongoDB (Mongoose) with numeric validation and `safetyMeasures` support.
- **Auth:** JWT-based role protection with Superadmin priority check for `.env` credentials.
- **API Docs:** Interactive Swagger UI at `http://192.168.0.113:4000/api/docs`.
- **CORS:** Enabled for all origins (`*`) to support multi-device local testing.

---

## 3. Core Credentials & Endpoints

- **Backend API:** `http://192.168.0.113:4000/api`
- **Super Admin Login:**
  - Email: `admin@pgfinder.com`
  - Password: `admin123`
- **Database Name:** `pg_finder`

---

## 4. Key Implementation Details (Session Memory)

### Recent Fixes & Features:
1. **Superadmin UI Revamp:** Modern high-end UI with gradients, quick-stats, and a professional verification queue.
2. **Login Differentiation:** Fixed role detection so users are correctly routed to their respective dashboards (Tenant, Owner, or Superadmin) upon login.
3. **Property Editing:** Fixed numeric data type mismatch between frontend integers and backend strings.
4. **Safety Measures:** Synchronized frontend safety field with backend schema for full persistence.
5. **Mobile Connectivity:** Fixed "Network Request Failed" by switching from `localhost` to local IP and enabling Android cleartext traffic in `app.json`.

---

## 5. Pending / Next Steps
- Implement real image uploading to Cloudinary (currently using local paths/simulated URLs).
- Integrate real Razorpay verification (currently recording success locally).
- Add Push Notifications via FCM for rent reminders and leave approvals.
