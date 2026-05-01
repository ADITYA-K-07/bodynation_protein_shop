# Body Nation — Admin Portal Build Plan

> **Scope:** Internal admin dashboard for Body Nation supplement storefront  
> **Stack:** React + TypeScript (Vite) · Node.js + Express · MongoDB + Mongoose · Cloudinary (images)  
> **Auth:** JWT-based, single admin user (env-configured credentials, no registration flow)  
> **Port convention:** Backend on `:4000`, Admin frontend on `:5174` (separate Vite dev server)

---

## Folder Structure

```
bodynation/
├── backend/                        # Already partially exists — extend it
│   ├── server.js
│   ├── routes/
│   │   ├── products.js             # Already exists — add PUT/DELETE/PATCH routes
│   │   ├── orders.js               # Already exists — add PATCH /status route
│   │   ├── payment.js              # Already exists — untouched
│   │   └── admin.js                # NEW — POST /admin/login
│   ├── models/
│   │   ├── Product.js              # Already exists — verify isActive + stock fields
│   │   └── Order.js                # Already exists — verify status + fulfilledAt fields
│   ├── middleware/
│   │   └── auth.js                 # NEW — JWT verify middleware for admin routes
│   └── .env                        # Add: ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET, CLOUDINARY_*
│
└── admin/                          # NEW — entirely separate Vite + React + TS project
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig.json
    ├── package.json
    └── src/
        ├── main.tsx
        ├── App.tsx                 # Route declarations
        ├── api/
        │   ├── client.ts           # Axios instance with JWT interceptor
        │   ├── orders.ts           # Order API calls
        │   └── products.ts         # Product API calls
        ├── context/
        │   └── AuthContext.tsx     # Login state + token storage
        ├── hooks/
        │   ├── useOrders.ts
        │   └── useProducts.ts
        ├── pages/
        │   ├── LoginPage.tsx
        │   ├── DashboardPage.tsx   # Stats bar + quick-action tiles
        │   ├── OrdersPage.tsx      # Order table + fulfill toggle + filters
        │   └── ProductsPage.tsx    # Product table + add/edit/remove/stock toggle
        ├── components/
        │   ├── Layout.tsx          # Sidebar + topbar shell
        │   ├── StatCard.tsx        # Reusable KPI card
        │   ├── OrderRow.tsx        # Single order table row
        │   ├── ProductRow.tsx      # Single product table row
        │   ├── ProductFormModal.tsx # Add / Edit product modal
        │   ├── ConfirmDialog.tsx   # Generic delete confirmation
        │   ├── LowStockBadge.tsx   # Red badge for stock ≤ 5
        │   └── Toast.tsx           # Success / error toasts
        └── styles/
            └── admin.css           # Admin-specific CSS (uses same token set as storefront)
```

---

## Phase 1 — Backend Extensions

### 1.1 New `.env` keys

```
ADMIN_EMAIL=owner@bodynation.in
ADMIN_PASSWORD=strong_password_here
JWT_SECRET=some_long_random_string
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 1.2 `middleware/auth.js` — JWT Guard

```js
// Verify Authorization: Bearer <token> on every /api/admin/* route
import jwt from 'jsonwebtoken';

export function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

### 1.3 `routes/admin.js` — Login Route

```
POST /api/admin/login
Body: { email, password }
Response: { token }    // JWT, 7-day expiry
```

- Compare against `process.env.ADMIN_EMAIL` and `process.env.ADMIN_PASSWORD` (bcrypt-hash on first boot or store pre-hashed in env)
- On match → sign JWT → return token
- On mismatch → 401

### 1.4 Product Route Extensions (`routes/products.js`)

All routes below require `requireAdmin` middleware.

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/products` | Add new product |
| `PUT` | `/api/products/:id` | Full update (edit product) |
| `DELETE` | `/api/products/:id` | Hard delete product |
| `PATCH` | `/api/products/:id/active` | Toggle `isActive` (show/hide) |
| `PATCH` | `/api/products/:id/stock` | Set a variant's stock to 0 (out of stock toggle) |

**Product model fields to confirm exist:**
```js
isActive: { type: Boolean, default: true }
// variants already have stock: Number
```

### 1.5 Order Route Extensions (`routes/orders.js`)

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/orders` | List all orders (admin only) |
| `PATCH` | `/api/orders/:id/fulfill` | Toggle `fulfilled: true/false` + set `fulfilledAt` |

**Order model fields to add:**
```js
fulfilled: { type: Boolean, default: false }
fulfilledAt: { type: Date, default: null }
```

### 1.6 Dashboard Stats Route

```
GET /api/admin/stats
Response: {
  totalOrders: number,
  totalRevenue: number,
  pendingFulfillments: number,
  todayOrders: number
}
```

Computed with simple MongoDB aggregations. No new collection needed.

---

## Phase 2 — Admin Frontend (`admin/`)

### 2.1 Project Setup

```bash
npm create vite@latest admin -- --template react-ts
cd admin
npm install axios react-router-dom
```

No UI library. Custom CSS only, reusing the same CSS token set as the storefront (`--primary: #FF6600`, `--surface: #2f4fa2`, etc.) so the admin looks like it belongs to the same brand.

### 2.2 Auth Flow

**`src/context/AuthContext.tsx`**
- Stores JWT token in `localStorage`
- Exposes `login(email, password)` → calls `POST /api/admin/login` → stores token
- Exposes `logout()` → clears token
- `isAuthenticated` boolean derived from token existence + non-expiry check

**`src/api/client.ts`**
- Axios instance with `baseURL: import.meta.env.VITE_API_BASE`
- Request interceptor: attach `Authorization: Bearer <token>` from localStorage
- Response interceptor: on 401 → call `logout()` → redirect to `/login`

**Route guard:** `<PrivateRoute>` wrapper component — if not authenticated, redirect to `/login`.

### 2.3 Pages

#### `LoginPage.tsx`

- Full-screen centered card
- Email + password fields
- On submit → `AuthContext.login()` → navigate to `/`
- Show error toast on wrong credentials
- Body Nation branding (logo + orange CTA button)

---

#### `DashboardPage.tsx` — Stats Overview

**Stats bar (4 cards):**

| Card | Value | How computed |
|------|-------|-------------|
| Total Orders | Count of all orders | `GET /api/admin/stats` |
| Total Revenue | Sum of all `order.total` | same |
| Pending Fulfillments | Orders where `fulfilled === false` | same |
| Today's Orders | Orders created on today's date | same |

**Quick-action tiles below stats:**
- "Go to Orders" → `/orders`
- "Add New Product" → opens ProductFormModal
- "Manage Products" → `/products`

No charts. Just numbers in styled cards. Fast to implement, high business value.

---

#### `OrdersPage.tsx` — Order Management

**Toolbar:**
- Search input: filters by customer name or orderId (client-side on fetched data)
- Date range: two `<input type="date">` fields — filters by `createdAt`
- Payment status dropdown: All / Paid / COD / Demo
- Results count label

**Order table columns:**

| Column | Content |
|--------|---------|
| Order ID | `order.orderId` |
| Customer | `order.customer.name` |
| Phone | `order.customer.phone` |
| Items | Comma-joined `item.shortName x qty` |
| Total | `₹ order.total` formatted |
| Payment | Badge: green=paid, yellow=COD, gray=demo |
| Date | `createdAt` formatted as DD MMM YYYY |
| Status | Badge: Pending / Fulfilled |
| Fulfill | Checkbox — on check → `PATCH /api/orders/:id/fulfill` |

**Behavior:**
- Rows with `fulfilled: false` render with a subtle orange-left-border highlight
- Checking the checkbox immediately flips the row's status (optimistic update) and calls the API
- Unchecking is allowed (toggle)
- Low-effort sort: default order is newest first

---

#### `ProductsPage.tsx` — Product Management

**Toolbar:**
- "Add Product" button (orange, top-right) → opens `ProductFormModal` in create mode
- Search input: filters by name or brand (client-side)
- Category filter dropdown

**Product table columns:**

| Column | Content |
|--------|---------|
| Image | 48×48px thumbnail |
| Name | `product.name` |
| Brand | `product.brand` |
| Category | `product.category` |
| Price | Lowest variant price |
| Stock | Total stock across all variants. If any variant ≤ 5 → show `LowStockBadge` |
| Active | Toggle checkbox → `PATCH /api/products/:id/active` |
| Out of Stock | Toggle checkbox → `PATCH /api/products/:id/stock` (sets all variant stock to 0) |
| Actions | Edit icon → opens `ProductFormModal` in edit mode. Delete icon → opens `ConfirmDialog` |

**Behavior:**
- Inactive products (`isActive: false`) render with 40% opacity row
- Out-of-stock products get a gray "OUT OF STOCK" pill in the Name column
- Both toggles are optimistic — update local state first, revert on API error

---

### 2.4 Components

#### `ProductFormModal.tsx` — Add / Edit Product

**Fields:**

```
Name*               [text input]
Brand*              [text input]
Category*           [select: whey-protein | creatine | mass-gainers | vitamins | pre-workout | amino-acids]
Goal                [select: muscle-gain | weight-loss | endurance]
Description*        [textarea]
Badges              [multi-checkbox: LAB TESTED | BEST SELLER | NEW | SALE]
Color theme         [select: orange | dark | blue | green | red | yellow]
Image*              [Cloudinary Upload Widget button → fills imageUrl field]
Variants            [dynamic list — each row: Flavour | Size | Price | MRP | Stock | Remove]
                    [+ Add Variant button]
```

**Cloudinary Upload Widget integration:**

```tsx
// Load widget script once in index.html:
// <script src="https://upload-widget.cloudinary.com/global/all.js"></script>

function openCloudinaryWidget(onSuccess: (url: string) => void) {
  window.cloudinary.openUploadWidget(
    {
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
      uploadPreset: 'bodynation_products',   // create unsigned preset in Cloudinary dashboard
      sources: ['local', 'url', 'camera'],
      cropping: true,
      croppingAspectRatio: 1,               // force square for product images
      maxFileSize: 2000000,                 // 2MB
      folder: 'bodynation/products',
    },
    (error, result) => {
      if (!error && result.event === 'success') {
        onSuccess(result.info.secure_url);
      }
    }
  );
}
```

No backend file handling. Cloudinary returns a CDN URL directly to the browser.

**Submit behavior:**
- Create mode → `POST /api/products`
- Edit mode → `PUT /api/products/:id`
- On success → close modal + refresh product list + show success toast

#### `ConfirmDialog.tsx`

- Generic modal: "Are you sure you want to delete [product name]? This cannot be undone."
- Two buttons: Cancel (ghost) + Delete (red)
- On confirm → `DELETE /api/products/:id` → refresh list + toast

#### `LowStockBadge.tsx`

```tsx
// Renders: 🔴 Low Stock (N left) — red pill
// Threshold: any variant with stock > 0 but ≤ 5
```

#### `Toast.tsx`

- Fixed bottom-right notification
- Auto-dismisses after 3 seconds
- Types: `success` (green) | `error` (red) | `info` (blue)

---

### 2.5 Routing (`App.tsx`)

```
/login              → LoginPage (public)
/                   → DashboardPage (private)
/orders             → OrdersPage (private)
/products           → ProductsPage (private)
*                   → redirect to /
```

### 2.6 Layout (`Layout.tsx`)

```
┌─────────────────────────────────────────────────────┐
│  [BN logo]   Body Nation Admin          [Logout]    │  ← Topbar
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ Dashboard│                                          │
│ Orders   │         <page content>                   │
│ Products │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
  ← Sidebar (collapsible on mobile)
```

- Sidebar uses `--surface: #2f4fa2` (brand blue)
- Active link: `--primary: #FF6600` left border + slight bg tint
- Topbar: white with bottom border
- Content area: `--bg-light: #F7F4F0`

---

## Phase 3 — Environment & Dev Setup

### `admin/vite.config.ts`

```ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:4000'   // proxy to backend during dev
    }
  }
})
```

### `admin/.env`

```
VITE_API_BASE=http://localhost:4000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

---

## Implementation Order for a Coding Agent

Execute strictly in this order. Each step is independently testable before moving on.

### Step 1 — Backend: Auth & Middleware
1. Add `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` to `.env`
2. Create `middleware/auth.js` with `requireAdmin`
3. Create `routes/admin.js` with `POST /api/admin/login`
4. Register route in `server.js`
5. Test: `POST /api/admin/login` with correct creds returns token; wrong creds returns 401

### Step 2 — Backend: Order Extensions
1. Add `fulfilled` and `fulfilledAt` fields to `Order` model (with migration default false)
2. Add `GET /api/orders` (protected) — returns all orders sorted by `createdAt` desc
3. Add `PATCH /api/orders/:id/fulfill` — toggles `fulfilled`, sets/clears `fulfilledAt`
4. Test both routes with Postman/curl using JWT

### Step 3 — Backend: Product Extensions
1. Confirm `isActive` field exists in `Product` model (add with default `true` if missing)
2. Add `POST /api/products` (protected)
3. Add `PUT /api/products/:id` (protected)
4. Add `DELETE /api/products/:id` (protected)
5. Add `PATCH /api/products/:id/active` — toggles `isActive`
6. Add `PATCH /api/products/:id/stock` — sets all variant stock to 0 / restores to 1 (toggle)
7. Test all routes

### Step 4 — Backend: Stats Endpoint
1. Add `GET /api/admin/stats` (protected)
2. Implement with MongoDB aggregation: totalOrders, totalRevenue, pendingFulfillments, todayOrders
3. Test endpoint

### Step 5 — Admin Frontend: Project Scaffold
1. `npm create vite@latest admin -- --template react-ts`
2. Install: `axios react-router-dom`
3. Copy CSS token variables from `frontend/css/style.css` into `admin/src/styles/admin.css`
4. Create `vite.config.ts` with proxy config
5. Create `src/api/client.ts` Axios instance
6. Verify dev server starts on `:5174`

### Step 6 — Admin Frontend: Auth
1. Create `AuthContext.tsx` with login/logout/isAuthenticated
2. Create `LoginPage.tsx` — form, submit handler, error display
3. Create `<PrivateRoute>` component
4. Set up `App.tsx` routing with private route guard
5. Test: unauthenticated visit redirects to `/login`; login with correct creds lands on `/`

### Step 7 — Admin Frontend: Layout Shell
1. Create `Layout.tsx` — sidebar + topbar + `<Outlet>`
2. Create `StatCard.tsx` — reusable KPI component
3. Create `Toast.tsx` — notification component with auto-dismiss
4. Create stub pages for Dashboard, Orders, Products (just `<h1>` placeholders)
5. Test navigation between pages

### Step 8 — Admin Frontend: Dashboard Page
1. Create `src/api/orders.ts` — `fetchStats()` call
2. Implement `DashboardPage.tsx` — fetch stats on mount, render 4 StatCards
3. Add quick-action tiles
4. Test with real backend stats endpoint

### Step 9 — Admin Frontend: Orders Page
1. Create `src/hooks/useOrders.ts` — fetch + local state
2. Create `OrderRow.tsx` — single row with fulfill checkbox
3. Implement `OrdersPage.tsx` — table + toolbar filters (all client-side filtering)
4. Wire `PATCH /api/orders/:id/fulfill` on checkbox change with optimistic update
5. Test full flow: new order appears unfulfilled → check → row updates

### Step 10 — Admin Frontend: Products Page (display + toggles)
1. Create `src/api/products.ts` — fetchProducts, deleteProduct, toggleActive, toggleStock
2. Create `src/hooks/useProducts.ts`
3. Create `LowStockBadge.tsx`
4. Create `ProductRow.tsx` — with active/stock toggles + edit/delete icons
5. Create `ConfirmDialog.tsx`
6. Implement `ProductsPage.tsx` — table + toolbar + delete flow
7. Test active toggle, stock toggle, delete

### Step 11 — Admin Frontend: Product Form Modal
1. Add Cloudinary Upload Widget script to `admin/index.html`
2. Create `ProductFormModal.tsx` — all fields, dynamic variant list, Cloudinary button
3. Wire create mode: `POST /api/products`
4. Wire edit mode: `PUT /api/products/:id` (pre-fill form from existing product)
5. Test: add product → appears in list; edit product → changes persist

### Step 12 — Polish & Edge Cases
1. Add loading skeletons on all tables (CSS-only, 3-line shimmer)
2. Add empty states for Orders (no orders yet) and Products (empty catalog)
3. Handle API errors gracefully — show error toast, do not crash
4. Test on mobile — sidebar should collapse to hamburger menu
5. Confirm low-stock threshold (≤ 5) highlights correctly in product table

---

## API Reference Summary

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/api/admin/login` | Public | Get JWT token |
| GET | `/api/admin/stats` | Admin | Dashboard KPIs |
| GET | `/api/orders` | Admin | List all orders |
| PATCH | `/api/orders/:id/fulfill` | Admin | Toggle fulfilled |
| GET | `/api/products` | Public | List products (already exists) |
| POST | `/api/products` | Admin | Add product |
| PUT | `/api/products/:id` | Admin | Edit product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| PATCH | `/api/products/:id/active` | Admin | Show / hide product |
| PATCH | `/api/products/:id/stock` | Admin | Out-of-stock toggle |

---

## Key Decisions & Rationale

| Decision | Reason |
|----------|--------|
| Separate `admin/` Vite project (not a route in the storefront) | Admin bundle never ships to customers; different auth context; cleaner separation |
| JWT in localStorage (not httpOnly cookie) | Admin-only tool on a known machine; simpler to implement; not a public-facing auth flow |
| No UI library (Tailwind, MUI, etc.) | Stays consistent with the storefront's custom CSS approach; avoids adding a heavy dependency |
| Cloudinary Upload Widget (unsigned preset) | Zero backend file handling; widget returns CDN URL directly; 2-minute setup in Cloudinary dashboard |
| Client-side filtering on orders/products | Data volume is small (hundreds of orders/products max at this stage); no need for server-side pagination yet |
| Single admin user via env vars | Fastest path to working auth; can be replaced with a proper users collection later without changing any frontend code |
| Low stock threshold hardcoded at 5 | Easy to change to a constant later; no DB config table needed yet |