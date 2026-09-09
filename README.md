# Ayodeji Anifowose Bookstore

A production-grade, full-stack digital and physical bookstore powered by **Medusa v2** and **Next.js 15**.

The platform supports physical editions (Hardcover, Paperback) with real-world shipping, alongside instant digital products (Ebooks, Audiobooks) featuring secure in-browser media players, progress synchronization, and automatic library entitlement.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Key Features](#key-features)
  - [Physical vs. Digital Workflow](#physical-vs-digital-workflow)
  - [In-Browser Readers & Players](#in-browser-readers--players)
  - [Duplicate Purchase & Authentication Guards](#duplicate-purchase--authentication-guards)
  - [Digital Delivery Isolation](#digital-delivery-isolation)
- [Digital Assets & Metadata Specification](#digital-assets--metadata-specification)
  - [Product-Level Metadata](#product-level-metadata)
  - [Variant-Level Metadata](#variant-level-metadata)
  - [Audiobook Tracks JSON Schema](#audiobook-tracks-json-schema)
- [Admin Dashboard & File Uploads](#admin-dashboard--file-uploads)
- [Prerequisites](#prerequisites)
- [Quick Start Guide](#quick-start-guide)
  - [1. Install Dependencies](#1-install-dependencies)
  - [2. Configure Backend](#2-configure-backend)
  - [3. Run Database Migrations](#3-run-database-migrations)
  - [4. Create Admin User](#4-create-admin-user)
  - [5. Seed Digital Delivery Option](#5-seed-digital-delivery-option)
  - [6. Configure Storefront](#6-configure-storefront)
  - [7. Run Development Servers](#7-run-development-servers)
  - [8. Configure Stripe Payments](#8-configure-stripe-payments)
  - [9. Configure Resend Email Notifications](#9-configure-resend-email-notifications)
- [Environment Variables Reference](#environment-variables-reference)
  - [Backend (`apps/backend/.env`)](#backend-appsbackendenv)
  - [Storefront (`apps/storefront/.env.local`)](#storefront-appsstorefrontenvlocal)
- [Available Commands](#available-commands)
- [Security & Media Protection](#security--media-protection)

---

## Architecture Overview

This project is organized as a Turborepo monorepo:

```text
ayollc-bookstore/
├── apps/
│   ├── backend/                     # Medusa v2 Commerce Engine (Node 20+, PostgreSQL)
│   │   ├── medusa-config.ts         # Medusa config (DB, CORS, Cloudflare R2 / S3 file service)
│   │   └── src/
│   │       ├── admin/widgets/       # Custom Admin widgets (Digital Asset Uploader)
│   │       ├── api/                 # File-based API endpoints (Admin & Store)
│   │       ├── modules/library/     # Custom customer library module (entitlements & progress)
│   │       ├── scripts/             # Utility and seed scripts (seed-digital-shipping.ts)
│   │       └── subscribers/         # Event subscribers (order.placed entitlement granting)
│   └── storefront/                  # Next.js 15 App Router Frontend
│       ├── public/images/           # Brand assets and logo
│       └── src/
│           ├── app/                 # App router pages (store, checkout, cart, account, library)
│           ├── app/api/library/     # Secure streaming routes (/audio, /document)
│           ├── lib/                 # SDK config, data fetchers, and cart utilities
│           └── modules/             # UI components (readers, audiobook player, checkout)
├── turbo.json                       # Turborepo pipeline configuration
└── package.json                     # Root dependencies (managed with npm)
```

---

## Key Features

### Physical vs. Digital Workflow

Each book title can offer both physical and digital formats as variants under a single product:
- **Physical Formats (`Hardcover`, `Paperback`)**: Require shipping addresses, physical carrier selection, and standard fulfillment.
- **Digital Formats (`Ebook`, `Audiobook`)**: Require only billing details (First name, Last name, Email, Country), automatically use the free `$0.00` Digital Delivery method, and grant access to the customer's library immediately upon payment.

### In-Browser Readers & Players

Digital media is accessed directly inside the customer account area (`/account/library`) with no download links:
- **EPUB & PDF Reader**: Interactive reader with chapter sidebar navigation, pagination controls, font resizing, and progress saving.
- **Audiobook Player**: Dedicated player featuring:
  - Persistent bottom audio dock and responsive expanded player.
  - Interactive scrub bar with real-time timestamp and duration.
  - Play / Pause, Skip Back 15s, and Skip Forward 15s buttons.
  - Multi-track / chapter playlist selector with active track indicators.
  - Playback speed switcher (0.75x, 1x, 1.25x, 1.5x, 2x) and volume control.
  - Byte-range audio streaming (`Accept-Ranges: bytes`) for smooth seeking.

### Duplicate Purchase & Authentication Guards

- **Guest Interception**: If a guest adds a digital book to their cart, proceeding to checkout redirects them to log in or register, then returns them directly to checkout via `return_url`.
- **Duplicate Prevention**: Customers cannot purchase a digital book format they already own.
  - When viewing the cart, an alert banner notifies the user of any already-owned digital titles.
  - The "Go to checkout" button is disabled until the duplicate item is removed.
  - Direct navigation to `/checkout` intercepts duplicate items and redirects back to `/cart` with an actionable notice.

### Digital Delivery Isolation

- Carts containing physical books (or mixed carts) **never** display or permit selection of the free "Digital Delivery" option.
- Purely digital carts automatically skip the shipping step and attach the digital fulfillment option.
- Server-side validation in `setShippingMethod` prevents physical orders from bypassing real shipping rates.

---

## Digital Assets & Metadata Specification

Books and their formats use Medusa's native `metadata` fields to configure digital behavior, author details, and streaming sources.

### Product-Level Metadata

Set these metadata keys on the **Product**:

| Key | Type | Description | Example |
|---|---|---|---|
| `author` | `string` | Author name(s) | `"Ayodeji Anifowose"` |
| `publisher` | `string` | Publishing house or imprint | `"Ayo LLC Publishing"` |
| `narrator` | `string` | Voice artist (audiobooks) | `"John Doe"` |
| `duration` | `string` | Total runtime for audiobooks | `"6 hrs 15 mins"` |
| `isbn` | `string` | International Standard Book Number | `"978-3-16-148410-0"` |
| `publication_date` | `string` | Original release date | `"2025-06-01"` |
| `language` | `string` | Language of the edition | `"English"` |
| `sample_url` | `string` | Optional URL to preview sample (PDF / MP3) | `"https://cdn.example.com/sample.pdf"` |

### Variant-Level Metadata

Set these metadata keys on each specific **Product Variant**:

#### For Ebooks (Variant title: "Ebook" or "eBook")
| Key | Type | Description | Example |
|---|---|---|---|
| `format` | `string` | Must be `"ebook"` | `"ebook"` |
| `is_digital` | `boolean` | Flags variant as digital | `true` |
| `file_url` | `string` | Full URL or CDN link to EPUB/PDF | `"https://pub-xyz.r2.dev/books/book.epub"` |
| `file_key` | `string` | Storage object key | `"digital/books/book.epub"` |

#### For Audiobooks (Variant title: "Audiobook" or "Audio Book")
| Key | Type | Description | Example |
|---|---|---|---|
| `format` | `string` | Must be `"audiobook"` | `"audiobook"` |
| `is_digital` | `boolean` | Flags variant as digital | `true` |
| `file_url` | `string` | Primary audio file URL (single-track or default) | `"https://pub-xyz.r2.dev/audio/complete.mp3"` |
| `file_key` | `string` | Storage object key | `"digital/audio/complete.mp3"` |
| `audio_tracks` | `string` (JSON) | Array of chapter tracks (see schema below) | *JSON string* |

### Audiobook Tracks JSON Schema

For multi-chapter audiobooks, store the track listing in the variant's `metadata.audio_tracks` field as a JSON string:

```json
[
  {
    "id": 1,
    "title": "Prologue & Chapter 1",
    "duration": "14:25",
    "url": "https://pub-xyz.r2.dev/audio/chapter-01.mp3"
  },
  {
    "id": 2,
    "title": "Chapter 2: The Journey",
    "duration": "18:40",
    "url": "https://pub-xyz.r2.dev/audio/chapter-02.mp3"
  },
  {
    "id": 3,
    "title": "Chapter 3: Discovery",
    "duration": "22:15",
    "url": "https://pub-xyz.r2.dev/audio/chapter-03.mp3"
  }
]
```

---

## Admin Dashboard & File Uploads

You do not need to upload files manually outside the platform. An integrated **Digital Book Assets** widget is available directly inside the Medusa Admin Dashboard:

1. Start the backend (`npm run backend:dev`) and navigate to `http://localhost:9000/app`.
2. Go to **Products** and select any book.
3. Scroll to the **Digital Book Assets** widget on the product details page.
4. The widget automatically filters variants to only display digital editions (`Ebook`, `Audiobook`), hiding physical formats.
5. Click **Upload / Edit Asset** on the desired variant:
   - Select and upload a PDF, EPUB, MP3, or M4A file directly.
   - Alternatively, paste an existing Cloudflare R2 / S3 public URL or object key.
6. Click **Save Changes**. The variant metadata is updated automatically.

---

## Prerequisites

- **Node.js**: `v20.19.0` or `>=22.12.0`
- **PostgreSQL**: `v15+`
- **Package Manager**: `npm` (`v11.19.0+`)
- **Cloudflare R2 or AWS S3**: Required for production media hosting.

---

## Quick Start Guide

### 1. Install Dependencies

From the repository root:

```bash
npm install
```

### 2. Configure Backend

Create the backend environment file:

```bash
cp apps/backend/.env.template apps/backend/.env
```

Edit `apps/backend/.env` and provide your PostgreSQL connection string and secrets:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ayollc_bookstore
JWT_SECRET=your_jwt_secret_here
COOKIE_SECRET=your_cookie_secret_here
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:9000
AUTH_CORS=http://localhost:9000
```

*(Optional: configure Cloudflare R2 variables if using S3 file storage).*

### 3. Run Database Migrations

Apply Medusa core schema and custom library module migrations:

```bash
cd apps/backend
npx medusa db:migrate
```

### 4. Create Admin User

Create your initial administrative account for the dashboard:

```bash
cd apps/backend
npx medusa user -e admin@example.com -p YourSecurePassword123
```

### 5. Seed Digital Delivery Option

Ensure the free `$0.00` "Digital Delivery" shipping option exists in your default service zone:

```bash
cd apps/backend
npx medusa exec ./src/scripts/seed-digital-shipping.ts
```

### 6. Configure Storefront

Create the storefront environment file:

```bash
cp apps/storefront/.env.template apps/storefront/.env.local
```

Edit `apps/storefront/.env.local`:

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_REGION=us
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
```

> **Where to get `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`?**
> Log into the Admin Dashboard (`http://localhost:9000/app`) -> **Settings** -> **Publishable API Keys** -> Copy the active key (or create a new one linked to your default sales channel).

### 7. Run Development Servers

Run both backend and storefront concurrently from the repository root:

```bash
npm run dev
```

Or start them individually:

```bash
npm run backend:dev     # Backend at http://localhost:9000 (Admin at http://localhost:9000/app)
npm run storefront:dev  # Storefront at http://localhost:8000
```

### 8. Configure Stripe Payments

To enable live or test credit card payments and digital wallets (Apple Pay, Google Pay) via Stripe:

1. **Add Stripe API Keys**:
   - In `apps/backend/.env`:
     ```env
     STRIPE_API_KEY=sk_test_...
     STRIPE_WEBHOOK_SECRET=whsec_...
     ```
   - In `apps/storefront/.env.local`:
     ```env
     NEXT_PUBLIC_STRIPE_KEY=pk_test_...
     ```

2. **Link Stripe Provider to Store Regions**:
   Run the seeding script to enable `pp_stripe_stripe` on all existing store regions:
   ```bash
   cd apps/backend
   npx medusa exec ./src/scripts/seed-stripe-provider.ts
   ```
   *(Alternatively, toggle Stripe on your regions in the Admin Dashboard at **Settings** -> **Regions**).*

3. **Configure Stripe Webhooks**:
   - Webhook endpoint URL: `https://<your-backend-domain>/hooks/payment/stripe`
   - Subscribed events: `payment_intent.succeeded`, `payment_intent.amount_capturable_updated`, `payment_intent.payment_failed`
   - **Local Testing**: Forward events using the Stripe CLI:
     ```bash
     stripe listen --forward-to localhost:9000/hooks/payment/stripe
     ```

### 9. Configure Resend Email Notifications

To enable branded transactional emails (Order Confirmations with direct Digital Library links, Password Reset links):

1. **Add Resend API Keys**:
   - In `apps/backend/.env`:
     ```env
     RESEND_API_KEY=re_...
     RESEND_FROM_EMAIL="Ayodeji Anifowose Bookstore <onboarding@resend.dev>"
     STOREFRONT_URL=http://localhost:8000
     ```

2. **Development Mode**:
   - If `RESEND_API_KEY` is not provided, the notification provider safely simulates email delivery and outputs preview logs to the terminal (`[Resend Dev Mode] Simulated email to: ...`), preventing failed transactions during local testing.

---

## Environment Variables Reference

### Backend (`apps/backend/.env`)

| Variable | Required | Description | Default |
|---|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection URI | — |
| `STORE_CORS` | Yes | Allowed origins for storefront requests | `http://localhost:8000` |
| `ADMIN_CORS` | Yes | Allowed origins for admin requests | `http://localhost:9000` |
| `AUTH_CORS` | Yes | Allowed origins for authentication | `http://localhost:9000` |
| `JWT_SECRET` | Yes | Secret for signing JWT authentication tokens | — |
| `COOKIE_SECRET` | Yes | Secret for signing session cookies | — |
| `REDIS_URL` | Optional | Redis connection URI for events and cache | `redis://localhost:6379` |
| `R2_ENDPOINT` | Optional | Cloudflare R2 S3-compatible API endpoint | — |
| `R2_BUCKET` | Optional | Cloudflare R2 bucket name | — |
| `R2_ACCESS_KEY_ID` | Optional | Cloudflare R2 API token access key | — |
| `R2_SECRET_ACCESS_KEY` | Optional | Cloudflare R2 API token secret key | — |
| `R2_FILE_URL` | Optional | Public or custom domain URL for media files | — |
| `R2_REGION` | Optional | R2 region (typically `auto`) | `auto` |
| `STRIPE_API_KEY` | Optional | Stripe secret key (`sk_test_...`) | — |
| `STRIPE_WEBHOOK_SECRET` | Optional | Stripe webhook signing secret (`whsec_...`) | — |
| `RESEND_API_KEY` | Optional | Resend API key (`re_...`) | — |
| `RESEND_FROM_EMAIL` | Optional | Sender address (e.g. `Bookstore <orders@domain.com>`) | `onboarding@resend.dev` |
| `STOREFRONT_URL` | Optional | Storefront URL for links in email templates | `http://localhost:8000` |

### Storefront (`apps/storefront/.env.local`)

| Variable | Required | Description | Default |
|---|---|---|---|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | Yes | URL of your Medusa backend | `http://localhost:9000` |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Yes | Medusa publishable API key | — |
| `NEXT_PUBLIC_BASE_URL` | Yes | Public URL of the storefront | `http://localhost:8000` |
| `NEXT_PUBLIC_DEFAULT_REGION` | No | Default region country code | `us` |
| `NEXT_PUBLIC_STRIPE_KEY` | Optional | Stripe publishable key (`pk_test_...`) | — |

---

## Available Commands

Run from the repository root:

```bash
npm run dev               # Start both backend and storefront via Turborepo
npm run backend:dev       # Start backend only
npm run storefront:dev    # Start storefront only
npm run build             # Build all apps for production
npm run lint              # Run linting across all workspaces
npm run test              # Run test suites
```

Backend-specific commands (`cd apps/backend`):

```bash
npx medusa db:migrate                                 # Run database migrations
npx medusa user -e <email> -p <password>              # Create admin user
npx medusa exec ./src/scripts/seed-digital-shipping.ts # Seed digital delivery option
npx medusa exec ./src/scripts/seed-stripe-provider.ts   # Enable Stripe on all store regions
npm run lint                                          # Run Medusa framework linter
```

---

## Security & Media Protection

1. **Authenticated Access**: Ebooks and Audiobooks in `/account/library` require an authenticated customer session. Unauthenticated requests are rejected.
2. **Streaming Gateway**: Audio files are served through Next.js streaming route handlers (`/api/library/[id]/audio`), supporting standard `Range: bytes=...` headers. This allows instant seeking, scrubbing, and background buffering without exposing direct download links to customers.
3. **Entitlement Verification**: Before streaming any audio or document, the backend verifies that the requesting customer's account owns an active entitlement for that specific product ID and format.
