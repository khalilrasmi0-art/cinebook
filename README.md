# CineBook - Production-Ready Cinema Ticket Booking Web App

CineBook is a full-stack cinema ticket booking web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Neon Serverless PostgreSQL**, and **Drizzle ORM**, engineered for deployment on **Vercel**.

---

## 🚀 Key Features & Agent Responsibilities

### 🎬 Agent 1 - App Agent (UI/UX & Client Workflows)
- **Home & Movie Catalog**: Hero banner, premiere listings, real-time search and multi-filtering (by title, genre, language, cinema, and date).
- **Movie Details**: Full synopsis, director, starring cast, MPAA rating, trailer links, and grouped daily showtimes.
- **Cinemas & Auditoriums**: Browse theater branches, screen formats (IMAX Laser, Dolby Atmos, 4DX, VIP Lounger), addresses, and amenities.
- **Interactive Seat Map**:
  - Realistic auditorium layout with screen curve indicator and walkway partitions.
  - Tiered seat types: **Standard**, **VIP Recliner**, and **Accessible**.
  - Real-time seat availability, live multi-seat selection (up to 8 seats).
  - Real-time fee calculations: subtotal, convenience booking fee, and sales tax.
- **Checkout & Payment**:
  - Test-mode Stripe payment checkout simulation with secure card inputs.
  - Zero leakage of database or payment credentials in browser code.
- **Digital Ticket Pass & QR Code**:
  - Printable and mobile-ready cinema pass.
  - Unique booking reference code (e.g. `CB-XXXX-XXXX`).
  - High-contrast scannable QR code generated dynamically on ticket creation.
- **Booking History & Cancellations**:
  - View all active and past bookings.
  - Self-service cancellation with immediate seat release and automated refund status.
- **Admin Operations Dashboard**:
  - Revenue and ticket sales metrics.
  - Add new movie titles and generate showtimes.
  - Live ledger of all customer booking transactions.
- **Authentication**:
  - Secure bcrypt password hashing and JWT sessions stored in HTTP-only cookies.
  - Role-based access control (`user` vs `admin`).
  - Strict authorization preventing unauthorized access to another user's bookings or tickets.

---

### 🗄️ Agent 2 - Database Engine Agent (Neon PostgreSQL, Drizzle ORM, Security & Transactions)
- **14 Relational Tables**: `users`, `movies`, `genres`, `movie_genres`, `cinemas`, `auditoriums`, `seats`, `showtimes`, `showtime_seats`, `bookings`, `booking_items`, `payments`, `tickets`, and `audit_logs`.
- **Primary Keys & UTC**: All primary keys are UUIDs (`gen_random_uuid()`), and all timestamps are stored in UTC.
- **Financial Integrity**: Stored exclusively as integer minor units (cents, never floats).
- **Constraints & Enums**:
  - `seat_status`: `AVAILABLE`, `HELD`, `BOOKED`, `BLOCKED`.
  - `booking_status`: `PENDING`, `CONFIRMED`, `CANCELLED`, `EXPIRED`, `REFUNDED`.
  - `payment_status`: `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED` (decoupled from booking status).
  - Composite unique indexes on `(cinema_id, name)` for auditoriums, `(auditorium_id, row_label, seat_number)` for seats, and `(showtime_id, seat_id)` to prevent double booking.
- **10-Step Booking Transaction**:
  1. Begin database transaction
  2. Lock requested showtime-seat records (`SELECT ... FOR UPDATE`)
  3. Confirm every requested seat is available
  4. Create temporary seat hold with expiration time
  5. Calculate price on server
  6. Create pending booking
  7. Commit transaction
  8. Confirm seats only after verified payment
  9. Idempotency keys on payment
  10. Rejection if any selected seat is unavailable
- **Idempotent Expired Hold Release**:
  - Endpoint: `/api/cron/release-holds` protected by `CRON_SECRET`.
  - Scheduled automatically in `vercel.json` as a Vercel Cron job (`* * * * *`).

---

### 🧪 Agent 3 - QA Agent (Testing & Verification)
Comprehensive automated test suite executed via `npm run test:qa`:
1. **Authentication**: Password hashing and JWT session verification.
2. **Movie Queries & Seat Maps**: Accurate layout generation across 80 seats per screen.
3. **Concurrent Seat-Booking**: Simultaneous booking collision test confirming Session A succeeds while Session B is rejected.
4. **Digital Pass & QR**: Validation of unique reference numbers, PNG QR codes, and subtotal + fee + tax integrity.
5. **Cancellation & Seat Release**: Verifies that cancelled bookings release seats immediately for other users to book.
6. **Expired Seat Holds**: Verified idempotent execution with zero runtime conflicts.

---

## 🧑‍💻 Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Customer** | `alex@cinebook.com` | `password123` |
| **Admin** | `admin@cinebook.com` | `password123` |

*(You can also register a new account anytime on the sign-up page).*

---

## 📦 Getting Started Locally

1. **Clone and Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Database Setup & Migrations**:
   - To connect your Neon PostgreSQL instance, add your connection string in `.env`:
     ```env
     DATABASE_URL="postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require"
     ```
   - Run Drizzle migrations on clean database:
     ```bash
     npm run db:push
     # or
     npm run db:generate
     ```
   - Seed sample data (movies, cinemas, auditoriums, seats, showtimes):
     ```bash
     npm run db:seed
     ```

4. **Run QA Test Suite**:
   ```bash
   npm run test:qa
   ```

5. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

6. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🚀 Deploying to Vercel

1. Push this repository to GitHub/GitLab.
2. In the [Vercel Dashboard](https://vercel.com):
   - Click **Add New Project** and select this repository.
   - Go to **Marketplace** and attach **Neon Serverless Postgres** to automatically provision a pooled `DATABASE_URL`.
   - Add Environment Variables under Project Settings (configured for Preview & Production):
     - `DATABASE_URL`: Your pooled Neon connection string.
     - `CRON_SECRET`: Secret token protecting `/api/cron/release-holds`.
     - `JWT_SECRET`: Random 32+ character string.
     - `AUTH_COOKIE_NAME`: `cinebook_session`.
     - `NEXT_PUBLIC_APP_URL`: Your Vercel domain.
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `pk_test_...`.
     - `STRIPE_SECRET_KEY`: `sk_test_...`.
     - `STRIPE_WEBHOOK_SECRET`: `whsec_...`.
3. Click **Deploy**. Vercel will run `npm run build` and automatically schedule the cron job in `vercel.json`.
