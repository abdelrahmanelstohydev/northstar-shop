# Store frontend (Angular 21)

1. Start the backend first (`npm run dev` in the backend folder, port 3000).
2. In this folder run:
   - `npm install`
   - `npm start`
3. Open http://localhost:4200

Shop: http://localhost:4200
Manager: http://localhost:4200/admin/login

The backend address is set in `src/app/core/config.ts`.

## Languages

The site supports Arabic (RTL) and English. Use the language button in the header (shop), sidebar (admin) or top corner (login). The choice is remembered in the browser. All UI texts are in `src/app/core/translations.ts`.

## Online payment

Checkout offers *Cash on delivery* and, when enabled in `backend/.env`, *Pay online by card* (Stripe). See `backend/API.md`, section "Online payment".
