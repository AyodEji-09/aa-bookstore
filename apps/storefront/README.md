# Ayodeji Anifowose Bookstore — Storefront

The official customer-facing storefront for the Ayodeji Anifowose Bookstore, built with **Next.js 15 (App Router)**, **Tailwind CSS**, and the **Medusa JS SDK**.

---

## Directory Structure

```text
apps/storefront/
├── public/images/              # Brand assets, favicon, logo
├── src/
│   ├── app/
│   │   ├── [countryCode]/      # Localized customer routes
│   │   │   ├── (checkout)/     # Minimal checkout layout (brand logo, no footer)
│   │   │   │   └── checkout/   # Multi-step checkout with digital flow
│   │   │   ├── (main)/         # Main browsing routes (store, cart, products, account)
│   │   │   │   ├── account/    # Customer account, orders, and digital library
│   │   │   │   └── cart/       # Cart with duplicate digital book alerts
│   │   └── api/library/        # Authenticated streaming route handlers
│   │       ├── [id]/audio/     # Byte-range audio streaming gateway
│   │       └── [id]/document/  # Secure PDF/EPUB document delivery
│   ├── lib/
│   │   ├── data/               # Server actions (cart, customer, fulfillment, library)
│   │   └── util/               # Helper utilities (is-digital.ts, money.ts)
│   └── modules/
│       ├── account/components/
│       │   └── library-view/   # In-browser Audiobook Player & Ebook Reader
│       ├── cart/               # Cart item templates & summary calculations
│       ├── checkout/           # Addresses, Shipping, Payment, and Review steps
│       └── products/           # Product showcase, format switcher, and purchase CTA
```

---

## Key Storefront Workflows

### 1. Digital vs. Physical Checkout
- **Digital Orders**:
  - The first stage displays **Billing Details** (First name, Last name, Email, Country).
  - The shipping step is bypassed automatically with the free `$0.00` Digital Delivery method.
  - Closed summary card displays a clean 2-column view of Contact Information and Delivery status.
- **Physical Orders**:
  - Requires full postal address and contact phone number.
  - Presents real-world shipping methods (Standard, Express).
  - Digital Delivery is strictly filtered out and cannot be selected.

### 2. Duplicate Purchase & Login Guards
- **Guest Protection**: If a guest adds an ebook or audiobook to their cart, proceeding to checkout redirects to `/account?return_url=.../checkout`. Once logged in or registered, they are returned directly to the checkout flow.
- **Library Ownership Check**:
  - If an authenticated customer already owns a digital format in their library, the cart page displays an alert:
    *"Action Required: Duplicate Digital Item - You already own this item in your digital library."*
  - The "Go to checkout" button is disabled until the duplicate title is removed.
  - Direct navigation to `/checkout` intercepts duplicate items and redirects back to `/cart`.

### 3. In-Browser Media Players (`/account/library`)
- **Audiobook Player**:
  - Custom audio controls with time scrubber, Play/Pause, 15s skip buttons, playlist chapter selection, and speed switcher (0.75x to 2x).
  - Streams audio via `/api/library/[id]/audio` with byte-range requests (`Accept-Ranges: bytes`) for smooth buffering and instant scrub seeking.
- **Ebook Reader**:
  - Interactive reader with chapter navigation and progress tracking.
  - Renders files directly in-browser with no public download links.

### 4. Book Search & Discovery Bar (`Cmd+K`)
- **Header Trigger & Keyboard Shortcuts**: Accessible from header button or pressing `Cmd+K` / `Ctrl+K` from any page.
- **Search Criteria**: Multi-token search matching book title, author (`metadata.author`), format, and categories.
- **Format Filter Tabs**: Filter results by Audiobook, eBook, Hardcover, or Paperback.
- **Live Preview Results**: Cover thumbnails, author attribution, format badges, and localized price tag.

---

## Environment Setup

Copy `.env.template` to `.env.local`:

```bash
cp .env.template .env.local
```

Configure the variables in `.env.local`:

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_publishable_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_REGION=us

# Resend API for Contact Inquiries & Newsletter Audiences
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL="Ayodeji Anifowose Bookstore <onboarding@resend.dev>"
RESEND_AUDIENCE_ID=e8f882c7-598a-46bd-8720-ab7affbb1185
```

> **Note**: Obtain the `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` from the Medusa Admin Dashboard (**Settings** -> **Publishable API Keys**). Set `RESEND_AUDIENCE_ID` to your Resend segment/audience ID (e.g. `aa-bookstore`) to isolate newsletter subscribers.

---

## Available Commands

Run from `apps/storefront` or from the repository root:

```bash
npm run dev           # Start Next.js development server (http://localhost:8000)
npm run build         # Build production Next.js application
npm run start         # Start production server
npm run lint          # Run ESLint check
```
