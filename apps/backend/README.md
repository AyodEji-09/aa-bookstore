# Ayodeji Anifowose Store — Backend

The backend commerce application for the Ayodeji Anifowose Store, powered by **Medusa v2** (`@medusajs/medusa`).

---

## Directory Structure

```text
apps/backend/
├── medusa-config.ts            # Medusa configuration: database, CORS, R2/S3 storage, modules
├── src/
│   ├── admin/
│   │   └── widgets/            # Admin dashboard extensions (Digital Book Assets uploader)
│   ├── api/
│   │   ├── admin/              # File-based admin endpoints (/admin/products/:id/digital-assets)
│   │   └── store/              # File-based store endpoints (/store/me/library)
│   ├── modules/
│   │   └── library/            # Custom digital library module (models, service, migrations)
│   ├── scripts/
│   │   └── seed-digital-shipping.ts # Seed script for $0.00 Digital Delivery option
│   └── subscribers/
│       └── order-placed-digital-entitlement.ts # Grants digital book access on order placement
```

---

## Custom Architecture & Features

### 1. Custom Library Module (`src/modules/library`)
Stores and manages digital library items for customers:
- Tracks product ID, format (`ebook` or `audiobook`), and customer association.
- Persists reading progress: last read chapter, completion status, and audio timestamp.
- Accessible by the customer via `/store/me/library` endpoints with customer session authentication.

### 2. Order Placed Entitlement Subscriber (`src/subscribers/order-placed-digital-entitlement.ts`)
Listens to the `order.placed` event:
- Checks order line items for digital formats (`ebook`, `audiobook`).
- Automatically creates library entitlement records in the `library` module for the purchasing customer.
- Prevents duplicate entitlements if a customer somehow completed an order for an already owned item.

### 3. Digital Book Assets Admin Widget (`src/admin/widgets/product-digital-assets.tsx`)
Injected directly into the Medusa Admin Product Details page:
- Filters variants to show only digital editions (`Ebook`, `Audiobook`).
- Hides physical variants (`Hardcover`, `Paperback`).
- Provides a direct file uploader (PDF, EPUB, MP3, M4A) and URL/Key editor that writes directly to the variant's `metadata`.

### 4. Digital Shipping Seed Script (`src/scripts/seed-digital-shipping.ts`)
A dedicated Medusa script that creates the free `$0.00` "Digital Delivery" shipping option attached to your default shipping profile and service zone.

Run with:
```bash
npx medusa exec ./src/scripts/seed-digital-shipping.ts
```

### 5. Cloudflare R2 / S3 File Service
Configured in `medusa-config.ts` using `@medusajs/medusa/file-s3`:
- Enabled automatically when `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, and `R2_ENDPOINT` are set.
- Media uploaded through the Admin dashboard or widgets is saved directly to your R2 bucket.

---

## Development Setup

### 1. Environment Setup

Copy the environment template:
```bash
cp .env.template .env
```

Ensure the following variables are configured in `.env`:
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ayollc_bookstore
JWT_SECRET=supersecret_jwt_key
COOKIE_SECRET=supersecret_cookie_key
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:9000
AUTH_CORS=http://localhost:9000
```

### 2. Database Migrations

Apply database migrations:
```bash
npx medusa db:migrate
```

### 3. Create Admin User

Create an admin account:
```bash
npx medusa user -e admin@example.com -p YourPassword123
```

### 4. Seed Digital Shipping

```bash
npx medusa exec ./src/scripts/seed-digital-shipping.ts
```

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:9000` and the Admin dashboard at `http://localhost:9000/app`.

---

## Code Style & Guidelines

- **Linting**: The backend must satisfy `@medusajs/eslint-plugin` rules.
  Run `npm run lint` before committing.
- **Formatting**: 2-space indentation, double quotes, no semicolons.
- **Conventions**:
  - File-based routing in `src/api/store/*` and `src/api/admin/*`.
  - Business logic belongs in workflows and custom module services.
  - No emojis in code, comments, or commit messages.
