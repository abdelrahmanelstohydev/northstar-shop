# API Documentation (Sprint 01)

Backend: Node + Express (MVC) + MongoDB. Frontend: Angular.
Base URL (development): `http://localhost:3000`

## General rules

- Public endpoints start with `/api`.
- Manager endpoints start with `/api/admin` and need a token (except login).
- Auth header for manager endpoints: `Authorization: Bearer <token>`
- All request and response bodies are JSON, except item create/update, which use `multipart/form-data` (image upload).
- IDs are strings (`_id`).
- Error shape is always: `{ "message": "..." }`
- Public item responses **never** include `quantity`.
- Images are served as static files: `http://localhost:3000/<image>` (e.g. `/img/uploads/shoe.jpg`).

### Status codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Bad input (missing or invalid field, invalid ID) |
| 401 | Not logged in, invalid token, or wrong login |
| 404 | Not found |
| 500 | Server error |

---


## Languages (Arabic + English)

Every user-facing text stored in the database is an object with both languages:
`{ "ar": "...", "en": "..." }`. This applies to `category.name`, `item.name`, `item.description`
and the item `name` saved inside each order line. The API always returns both; the frontend shows the one
that matches the language switch.

- **Create/update category** (JSON): `{ "name": { "ar": "أحذية", "en": "Shoes" } }` - both languages are required (max 60 chars).
- **Create/update item** (multipart): send `name_ar`, `name_en`, `description_ar`, `description_en` (all required) plus `price`, `quantity`, `categoryId`, and optional `image`.
- Existing databases: run `npm run migrate:i18n` once. Sample data gets real Arabic text; your own items get their current text copied into both languages (edit them in the admin panel to add Arabic). It is safe to run more than once.
- New databases: `npm run seed` then `npm run seed:data` already create bilingual documents.
- Stock errors also include `itemName: { ar, en }` so the frontend can show the message in the current language.


## Online payment (Stripe Hosted Checkout)

Card details are typed on Stripe's own page; this server never sees them. No Stripe SDK is used (Node `fetch` + `crypto`).

Flow: `POST /api/orders` with `"paymentMethod": "stripe"` -> server creates the order (`paymentStatus: "pending"`, stock reserved) and a Stripe Checkout session -> response contains `checkoutUrl` -> browser goes to Stripe -> Stripe returns to `FRONTEND_URL/checkout?orderId=..&token=..&session_id=..` (or `&cancelled=true`) -> frontend calls the status endpoint -> order becomes `paid`, the confirmation email is sent, the cart is cleared. In parallel Stripe calls the webhook, so the order is also completed if the customer closes the browser.

| Endpoint | Auth | Purpose |
|---|---|---|
| `GET /api/payment-methods` | public | `{ "methods": ["cod","stripe"], "stripeTestMode": false }` - `stripe` only appears when enabled |
| `POST /api/orders` | public | body adds `"paymentMethod": "cod" \| "stripe"` (default `cod`). For `stripe` the `201` also returns `checkoutUrl` and `token` |
| `GET /api/orders/:id/status?token=` | token | asks Stripe if the order was paid; returns `{ orderId, paymentMethod, paymentStatus, total }` |
| `POST /api/orders/:id/cancel-payment` | token (body) | customer pressed back on Stripe: marks `failed`, releases the reserved stock |
| `POST /api/stripe/webhook` | Stripe signature | handles `checkout.session.completed` / `.expired`; reads the raw body and checks the HMAC-SHA256 signature |

- `token` is a random secret stored on the order and returned only to the customer who created it; it is never shown in admin responses.
- Order fields added: `paymentMethod` (`cod`/`stripe`), `paymentStatus` (`pending`/`paid`/`failed`), `stripeDetails { sessionId, paymentIntentId, customerEmail }`, `lang`, `paidAt`.
- Totals are always calculated on the server from database prices (the browser only sends ids and quantities).
- Unpaid online orders are released automatically (Stripe session expires after ~31 min; a cleanup job runs every 10 min and puts the stock back).
- Online orders get the confirmation email only after payment is confirmed. Cash-on-delivery orders get it immediately.

`.env` settings: `ENABLE_STRIPE`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CURRENCY` (default `egp`), `FRONTEND_URL`.
If `ENABLE_STRIPE=true` but `STRIPE_SECRET_KEY` is empty, a **fake test gateway** is used (development only, disabled when `NODE_ENV=production`): the "payment page" is skipped and the order is marked paid on return.

## 1. Manager

### POST /api/admin/login
Public.

Body:
```json
{ "username": "manager", "password": "123456" }
```
Success `200`:
```json
{ "token": "eyJhbGciOi..." }
```
Errors: `400` missing field, `401` `{ "message": "Invalid username or password" }` (same message for unknown user and wrong password).

---

## 2. Categories

Category object:
```json
{ "_id": "6542ab...", "name": { "ar": "أحذية", "en": "Shoes" } }
```

### GET /api/categories
Public. Success `200`: `[ Category, ... ]`

### GET /api/categories/:id
Public. Success `200`: `Category`
Errors: `400` invalid id, `404` `{ "message": "Category not found" }`.

### POST /api/admin/categories
Manager.

Body: `{ "name": "Shoes" }`
Success `201`: `Category`
Errors: `400` name missing, `401`.

### PUT /api/admin/categories/:id
Manager.

Body: `{ "name": "Sneakers" }`
Success `200`: `{ "message": "Updated" }`
Errors: `400` name missing or invalid id, `401`, `404`.

### DELETE /api/admin/categories/:id
Manager.

Success `200`: `{ "message": "Deleted" }`
Errors: `400` invalid id, `401`, `404`.
Note: decide whether deleting a category that still has items is allowed (suggestion: reject with `400`).

---

## 3. Items

Public item object (no quantity):
```json
{
  "_id": "6542ac...",
  "name": "Running Shoes",
  "description": "Light shoes for daily running",
  "price": 49.99,
  "image": "img/uploads/running-shoes.jpg",
  "categoryId": "6542ab..."
}
```
Manager item object: same fields **plus** `"quantity": 20`.

### GET /api/items
Public. Optional query: `?category=<categoryId>`
Success `200`: `[ PublicItem, ... ]`
Errors: `400` invalid category id.

### GET /api/items/:id
Public. Success `200`: `PublicItem`
Errors: `400` invalid id, `404`.

### POST /api/items/cart
Public. Used by cart and favorites pages: localStorage keeps only IDs, this returns their current data.

Body: `{ "ids": ["6542ac...", "6542ad..."] }`
Success `200`: `[ PublicItem, ... ]` (IDs that no longer exist are simply left out; the frontend removes them from localStorage).

### GET /api/admin/items
Manager. Optional query: `?category=<categoryId>`
Success `200`: `[ ManagerItem, ... ]`
Errors: `401`.

### POST /api/admin/items
Manager. `multipart/form-data`

Fields: `name`, `description`, `price`, `quantity`, `categoryId`, `image` (file)
Success `201`: `ManagerItem`
Errors: `400` missing or invalid field (price and quantity must be numbers >= 0, category must exist), `401`.

### PUT /api/admin/items/:id
Manager. `multipart/form-data`, same fields as create. `image` is optional: if not sent, the old image stays.

Success `200`: `{ "message": "Updated" }`
Errors: `400`, `401`, `404`.

### DELETE /api/admin/items/:id
Manager. Success `200`: `{ "message": "Deleted" }`
Errors: `400` invalid id, `401`, `404`.

---

## 4. Orders

Order object:
```json
{
  "_id": "6542ae...",
  "customer": {
    "name": "Ali Hassan",
    "phone": "01012345678",
    "address": "12 Main St, Tanta"
  },
  "items": [
    { "itemId": "6542ac...", "name": "Running Shoes", "price": 49.99, "quantity": 2 }
  ],
  "total": 99.98,
  "status": "opened",
  "notes": [
    { "text": "Called the customer", "createdAt": "2026-10-30T14:05:00.000Z" }
  ],
  "createdAt": "2026-10-30T12:30:00.000Z"
}
```
Status is `"opened"` or `"closed"`. Delivery and payment are arranged by phone call.

### POST /api/orders
Public (buy page). The browser sends **only IDs and quantities**. The backend reads names and prices from the database, checks stock, calculates the total, and sets `status` to `"opened"`.

Body:
```json
{
  "customer": { "name": "Ali Hassan", "phone": "01012345678", "email": "ali@example.com", "address": "12 Main St, Tanta" },
  "items": [ { "itemId": "6542ac...", "quantity": 2 } ],
  "lang": "ar"
}
```
`customer.email` is required. `lang` (`"ar"` or `"en"`, default `"ar"`) is the language of the confirmation email.
Success `201`: `{ "orderId": "6542ae...", "total": 99.98 }`
After the order is saved, a confirmation email is sent to the customer (local testing: Mailpit, inbox at http://localhost:8025). A mail failure never fails the order.
Errors:
- `400` missing customer field, empty items, invalid id, or quantity not a positive integer
- `404` an item does not exist
- `400` `{ "message": "Not enough stock for <item name>" }`

Stock rule (assumption, change if you decide otherwise): stock is checked and decreased when the order is created.

### GET /api/admin/orders
Manager. Optional query: `?status=opened` or `?status=closed`
Success `200`: `[ Order, ... ]` (newest first)
Errors: `400` invalid status, `401`.

### GET /api/admin/orders/:id
Manager. Success `200`: `Order`
Errors: `400` invalid id, `401`, `404`.

### PATCH /api/admin/orders/:id/status
Manager.

Body: `{ "status": "closed" }`
Success `200`: `{ "message": "Updated" }`
Errors: `400` status not `opened` or `closed`, `401`, `404`.

### POST /api/admin/orders/:id/notes
Manager. Adds one note to the order. Notes are never replaced: every call adds a new note with its own date. Notes in the order object are listed oldest first.

Body: `{ "text": "Customer asked for evening delivery" }`
Success `201`: `{ "text": "Customer asked for evening delivery", "createdAt": "2026-10-30T14:05:00.000Z" }`
Errors: `400` text missing, empty or longer than 1000 characters (or invalid id), `401`, `404`.

---

## Endpoint summary

| Method | URL | Access | Controller |
|---|---|---|---|
| POST | /api/admin/login | public | login |
| GET | /api/categories | public | getCategories |
| GET | /api/categories/:id | public | getCategory |
| POST | /api/admin/categories | manager | createCategory |
| PUT | /api/admin/categories/:id | manager | updateCategory |
| DELETE | /api/admin/categories/:id | manager | deleteCategory |
| GET | /api/items | public | getPublicItems |
| GET | /api/items/:id | public | getPublicItem |
| POST | /api/items/cart | public | getPublicItemsByIds |
| GET | /api/admin/items | manager | getAllItems |
| POST | /api/admin/items | manager | createItem |
| PUT | /api/admin/items/:id | manager | updateItem |
| DELETE | /api/admin/items/:id | manager | deleteItem |
| POST | /api/orders | public | createOrder |
| GET | /api/admin/orders | manager | getOrders |
| GET | /api/admin/orders/:id | manager | getOrder |
| PATCH | /api/admin/orders/:id/status | manager | setOrderStatus |
| POST | /api/admin/orders/:id/notes | manager | addOrderNote |
