# Body Nation Run Guide

This guide walks through the project from first setup to a full local test run.

## 1. What Is In This Repo

- `frontend/`
  Public storefront app running on `http://localhost:5173`
- `admin/`
  Admin dashboard app running on `http://localhost:5174`
- `backend/`
  Express + MongoDB API running on `http://localhost:4000`

## 2. Prerequisites

Make sure these are ready before you start:

- Node.js `v20+`
- npm
- A live MongoDB URI in `backend/.env`
- Valid Razorpay keys in `backend/.env` if you want prepaid checkout to work
- Valid admin credentials in `backend/.env`
- A Cloudinary unsigned preset named `bodynation_products`

## 3. Environment Files

### Backend

The backend reads `backend/.env`.

Required keys:

```env
MONGODB_URI=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
OWNER_EMAIL=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
ADMIN_EMAIL=
ADMIN_PASSWORD=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PORT=4000
```

Notes:

- `PORT` should stay `4000`
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` are used to log into the admin panel
- `JWT_SECRET` should be a long random string

### Admin

The admin reads `admin/.env`.

Required keys:

```env
VITE_API_BASE=http://localhost:4000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=bodynation_products
```

### Frontend

The storefront currently works without a dedicated `.env` file because it defaults to `/api`-style endpoints in code, but during local development it expects the backend to be available on `http://localhost:4000`.

## 4. Install Dependencies

Run these commands once from the repo root:

```powershell
cd backend
npm install
```

```powershell
cd admin
npm install
```

```powershell
cd frontend
npm install
```

## 5. Start The Apps

Open 3 terminals.

### Terminal 1: Backend

```powershell
cd backend
npm run dev
```

Expected result:

- backend starts on `http://localhost:4000`
- you should see:

```text
MongoDB connected
Server running on port 4000
```

On the very first successful boot, if the products collection is empty, the backend seeds MongoDB using `frontend/js/data.js`.

Expected first-boot seed log:

```text
Seeded 8 products from frontend/js/data.js
```

Expected later boots:

```text
Products collection already populated (8 items)
```

### Terminal 2: Storefront

```powershell
cd frontend
npm run dev
```

Expected result:

- storefront starts on `http://localhost:5173`

### Terminal 3: Admin

```powershell
cd admin
npm run dev
```

Expected result:

- admin starts on `http://localhost:5174`

## 6. Quick Health Checks

### Backend health

Open:

```text
http://localhost:4000/health
```

Expected response:

```json
{ "ok": true }
```

### Public products

Open:

```text
http://localhost:4000/api/products
```

Expected result:

- returns the active product catalog from MongoDB

## 7. Admin Login Flow

Open:

```text
http://localhost:5174
```

Log in using:

- `ADMIN_EMAIL` from `backend/.env`
- `ADMIN_PASSWORD` from `backend/.env`

After login you should be able to:

- view dashboard stats
- view all orders
- create/edit/delete products
- hide/show products
- zero out stock and restore stock

## 8. Full End-To-End Test Flow

Use this exact order if you want to understand the whole system.

### Step 1: Confirm product seeding worked

- open `http://localhost:4000/api/products`
- confirm products are returned

### Step 2: Check storefront

- open `http://localhost:5173`
- browse products
- open a product detail page
- add an item to cart

### Step 3: Test COD order flow

- go to checkout in the storefront
- choose `Cash on Delivery`
- place the order

Expected behavior:

- frontend should redirect to order success
- backend should create an order in MongoDB through `POST /api/orders`

### Step 4: Check the order in admin

- open `http://localhost:5174`
- go to `Orders`
- confirm the new order appears
- toggle fulfillment on/off

### Step 5: Test product visibility

- in admin, hide a product
- refresh the storefront product listing
- confirm the hidden product no longer appears publicly

### Step 6: Test product creation

- in admin, open `Products`
- click `Add Product`
- upload an image using Cloudinary
- save the product
- confirm it appears in admin
- confirm it appears in the storefront if `isActive` is enabled

## 9. Important Runtime Rules

### CORS

The backend only allows browser requests from:

- `http://localhost:5173`
- `http://localhost:5174`

Any other browser origin should be rejected.

### Product seed behavior

- seeding only happens when the `products` collection is empty
- it does not overwrite existing products
- it does not duplicate on restart

### Public vs admin product access

- `GET /api/products` returns only active products
- admin product routes return all products, including hidden ones

## 10. Useful Commands

### Run backend in dev mode

```powershell
cd backend
npm run dev
```

### Run backend in normal mode

```powershell
cd backend
npm start
```

### Build admin

```powershell
cd admin
npm run build
```

### Build storefront

```powershell
cd frontend
npm run build
```

## 11. Common Problems

### Backend hangs and never starts

Usually means one of these:

- `MONGODB_URI` is invalid
- MongoDB is unreachable
- `.env` values are missing or malformed

### Admin login fails

Check:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `JWT_SECRET`

### Cloudinary upload button does nothing

Check:

- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`
- preset must exist and be unsigned

### Prepaid checkout fails

Check:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- backend must be running

## 12. Recommended Daily Workflow

For normal development:

1. Start backend
2. Start storefront
3. Start admin
4. Test changes in the browser
5. Use admin to manage products and orders

If you want a very quick sanity check each time:

1. Visit `http://localhost:4000/health`
2. Visit `http://localhost:5173`
3. Visit `http://localhost:5174`
4. Log into admin

